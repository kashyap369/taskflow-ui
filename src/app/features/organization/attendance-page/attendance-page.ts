import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EChartsOption } from 'echarts';
import { NgxEchartsDirective } from 'ngx-echarts';
import {
  ArrowRight,
  BatteryLow,
  Building2,
  CalendarDays,
  Camera,
  Clock,
  History as HistoryIcon,
  Lock,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  Locate,
  MapPin,
  Navigation,
  RefreshCw,
  Route,
  Settings2,
  TriangleAlert,
  Users,
  X,
} from 'lucide-angular';

import { PermissionLockDirective } from '@shared/directives/permission-lock.directive';
import { Skeleton } from '@shared/ui/atoms/skeletons/skeleton/skeleton';
import {
  RouteLine,
  RouteMap,
  RouteMapData,
  RouteMarker,
} from '@shared/ui/organisms/route-map/route-map';
import { AttendanceFacade } from '../attendance.facade';
import {
  AttendanceDay,
  AttendanceRoster,
  AttendanceRosterStatus,
  AttendanceSession,
  AttendanceSessionStatus,
  AttendedMember,
  FieldTrackingDay,
  FieldTrackingPoints,
  FieldTrackingSettings,
  LiveFieldMember,
  LiveFieldTracking,
  PunchDetail,
  RecordedPoint,
  TrackedSegmentKind,
  TrackedSession,
  dayStatusMeta,
  decodePolyline,
  formatMinutes,
  localIsoDate,
  rosterStatusMeta,
  sessionStatusLabel,
} from '../attendance.models';

type Tab = 'today' | 'live' | 'routes' | 'history' | 'settings';
interface Load<T> {
  state: 'idle' | 'loading' | 'loaded' | 'error';
  data: T | null;
  error: string | null;
}

const TABS: Tab[] = ['today', 'live', 'routes', 'history', 'settings'];
const LIVE_REFRESH_MS = 30_000;
/** A tracked person not heard from for this long is shown as stale on the live map. */
const STALE_AFTER_MS = 10 * 60_000;

function idle<T>(): Load<T> {
  return { state: 'idle', data: null, error: null };
}

function errorText(error: unknown): string {
  const body = (error as { error?: { message?: string } })?.error;
  return body?.message ?? 'Something went wrong. Try again.';
}

/**
 * The organization's attendance section: who is in today, live positions of tracked field staff,
 * a member's route for a day, attendance history with selfies and corrections, and settings.
 * Every tab is visible to everyone; what a member may not use is locked with the permission it
 * needs (CONVENTIONS — lock, don't hide). The API checks every permission again.
 */
@Component({
  selector: 'app-attendance-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LucideAngularModule,
    NgxEchartsDirective,
    PermissionLockDirective,
    Skeleton,
    RouteMap,
  ],
  templateUrl: './attendance-page.html',
  styleUrl: './attendance-page.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        ArrowRight,
        BatteryLow,
        Building2,
        CalendarDays,
        Camera,
        Clock,
        History: HistoryIcon,
        Locate,
        Lock,
        MapPin,
        Navigation,
        RefreshCw,
        Route,
        Settings2,
        TriangleAlert,
        Users,
        X,
      }),
    },
  ],
})
export class AttendancePage {
  private readonly facade = inject(AttendanceFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly needsOrganization = this.facade.needsOrganization;
  readonly currentOrg = this.facade.currentOrg;
  readonly canViewAttendance = this.facade.canViewAttendance;
  readonly canManageAttendance = this.facade.canManageAttendance;
  readonly canViewFieldTracking = this.facade.canViewFieldTracking;
  readonly canSeeTrackingSettings = this.facade.canSeeTrackingSettings;
  readonly mapSettings = this.facade.map;

  readonly rosterStatusMeta = rosterStatusMeta;
  readonly dayStatusMeta = dayStatusMeta;
  readonly sessionStatusLabel = sessionStatusLabel;
  readonly formatMinutes = formatMinutes;
  readonly RosterStatus = AttendanceRosterStatus;
  readonly SessionStatus = AttendanceSessionStatus;
  readonly loadingRows = [1, 2, 3, 4, 5];

  readonly viewAttendanceReason = 'Needs the "See the team\'s attendance" (ViewAttendance) permission.';
  readonly manageAttendanceReason = 'Needs the "Correct attendance and change its settings" (ManageAttendance) permission.';
  readonly viewTrackingReason = 'Needs the "See where tracked members are" (ViewFieldTracking) permission.';

  readonly tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'today', label: 'Today', icon: 'Users' },
    { id: 'live', label: 'Live map', icon: 'Navigation' },
    { id: 'routes', label: 'Routes', icon: 'Route' },
    { id: 'history', label: 'History', icon: 'History' },
    { id: 'settings', label: 'Settings', icon: 'Settings2' },
  ];
  readonly tab = signal<Tab>('today');

  /** Members to pick from: the organization's member list, plus the signed-in user. */
  readonly people = computed(() => {
    const list = this.facade
      .members()
      .filter((m) => m.isActive)
      .map((m) => ({ userId: m.userId, name: m.userFullName, role: m.roleName }));
    const me = this.facade.user();
    if (me && !list.some((p) => p.userId === me.id)) {
      list.push({ userId: me.id, name: 'Me', role: '' });
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  });

  // ── Today ──
  readonly rosterDate = signal<string>(localIsoDate());
  readonly roster = signal<Load<AttendanceRoster>>(idle());
  readonly rosterCounts = computed(() => {
    const members = this.roster().data?.members ?? [];
    const count = (status: AttendanceRosterStatus) => members.filter((m) => m.status === status).length;
    return {
      in: count(AttendanceRosterStatus.In),
      out: count(AttendanceRosterStatus.Out),
      notIn: count(AttendanceRosterStatus.NotIn),
      away: count(AttendanceRosterStatus.OnLeave) + count(AttendanceRosterStatus.Holiday),
    };
  });

  // ── Live ──
  readonly live = signal<Load<LiveFieldTracking>>(idle());
  readonly liveSelected = signal<number | null>(null);
  readonly liveMap = computed<RouteMapData>(() => {
    const members = this.live().data?.members ?? [];
    const markers: RouteMarker[] = members
      .filter((m) => m.latitude != null && m.longitude != null)
      .map((m) => ({
        id: String(m.userId),
        latitude: m.latitude!,
        longitude: m.longitude!,
        tone: this.liveTone(m),
        size: 'lg' as const,
        permanentLabel: m.fullName.split(' ')[0] || m.fullName,
        tooltip: this.liveTooltip(m),
      }));
    return { lines: [], markers };
  });
  private liveTimer: ReturnType<typeof setInterval> | null = null;

  // ── Routes ──
  readonly routeUserId = signal<number | null>(null);
  readonly routeDate = signal<string>(localIsoDate());
  readonly routeDay = signal<Load<FieldTrackingDay>>(idle());
  /**
   * The picker offers only the people who punched in on the chosen day — anyone else can only
   * produce an empty map. The API decides who that is; this list is reloaded when the day changes.
   */
  readonly attended = signal<Load<AttendedMember[]>>(idle());
  /** The chosen member stays in the list even with no punches that day, so a link still resolves. */
  readonly routePeople = computed(() => {
    const list = (this.attended().data ?? []).map((m) => ({
      userId: m.userId,
      name: m.fullName,
      role: m.roleName,
      absent: false,
    }));
    const chosen = this.routeUserId();
    if (chosen != null && !list.some((p) => p.userId === chosen)) {
      const known = this.people().find((p) => p.userId === chosen);
      list.unshift({ userId: chosen, name: known?.name ?? 'Chosen member', role: known?.role ?? '', absent: true });
    }
    // A member may always see their own route, but without ViewAttendance or ViewFieldTracking the
    // list above is refused outright — so "Me" is offered only then. On a successful load the list
    // stays exactly "who punched in", which is the point of the feature: a day with nobody in shows
    // an empty, disabled picker rather than names that all resolve to no route.
    const me = this.facade.user();
    if (me && this.attended().state === 'error' && !list.some((p) => p.userId === me.id)) {
      list.push({ userId: me.id, name: 'Me', role: '', absent: true });
    }
    return list;
  });
  readonly routeFitKey = computed(() => `${this.routeUserId()}-${this.routeDate()}`);
  readonly routeMap = computed<RouteMapData>(() => this.buildRouteMap(this.routeDay().data));
  readonly routeHasTrack = computed(() => {
    const day = this.routeDay().data;
    return !!day && day.sessions.some((s) => s.segments.length > 0 || s.pendingPoints.length > 0);
  });
  readonly batteryChart = computed<EChartsOption | null>(() => this.buildBatteryChart(this.routeDay().data));
  /** The punch whose pin was clicked, shown as a detail panel beside the map. */
  readonly selectedPunch = signal<{ session: TrackedSession; punch: PunchDetail } | null>(null);
  /** Recorded fixes are off by default: they are hover detail, not the route. */
  readonly showPoints = signal(false);
  readonly routePoints = signal<Load<FieldTrackingPoints>>(idle());

  // ── History ──
  readonly historyUserId = signal<number | null>(null);
  readonly historyFrom = signal<string>(localIsoDate(new Date(Date.now() - 13 * 86_400_000)));
  readonly historyTo = signal<string>(localIsoDate());
  readonly history = signal<Load<AttendanceDay[]>>(idle());
  readonly photos = signal<Record<string, string | 'loading' | 'error'>>({});
  readonly adjusting = signal<{ session: AttendanceSession; punchIn: string; punchOut: string; reason: string } | null>(null);
  readonly adjustSaving = signal(false);
  readonly adjustError = signal<string | null>(null);

  // ── Settings ──
  readonly attendanceSettings = signal<Load<{ timeZone: string; autoCloseAfterHours: number; photoRetentionDays: number }>>(idle());
  readonly trackingSettings = signal<Load<FieldTrackingSettings>>(idle());
  readonly trackedRoleIds = signal<Set<number>>(new Set());
  readonly trackingEnabled = signal(false);
  readonly retentionDays = signal(30);
  readonly settingsSaving = signal<'attendance' | 'tracking' | null>(null);
  readonly settingsMessage = signal<string | null>(null);
  readonly timeZones = this.supportedTimeZones();

  constructor() {
    const fromUrl = this.route.snapshot.queryParamMap;
    const tab = fromUrl.get('tab') as Tab | null;
    if (tab && TABS.includes(tab)) this.tab.set(tab);
    const user = Number(fromUrl.get('user'));
    if (user > 0) {
      this.routeUserId.set(user);
      this.historyUserId.set(user);
    }
    const date = fromUrl.get('date');
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      this.routeDate.set(date);
      this.rosterDate.set(date);
    }

    // Load the active tab's data when the tab or the organization changes.
    effect(() => {
      const tab = this.tab();
      const org = this.currentOrg();
      untracked(() => {
        this.stopLiveRefresh();
        if (!org) return;
        switch (tab) {
          case 'today':
            if (this.canViewAttendance()) this.loadRoster();
            break;
          case 'live':
            if (this.canViewFieldTracking()) this.startLiveRefresh();
            break;
          case 'routes':
            this.loadAttended();
            if (this.routeUserId() != null) this.loadRoute();
            break;
          case 'history':
            if (this.historyUserId() != null) this.loadHistory();
            break;
          case 'settings':
            this.loadSettings();
            break;
        }
      });
    });

    this.destroyRef.onDestroy(() => {
      this.stopLiveRefresh();
      for (const url of Object.values(this.photos())) {
        if (url !== 'loading' && url !== 'error') URL.revokeObjectURL(url);
      }
    });
  }

  selectTab(tab: Tab): void {
    this.tab.set(tab);
    this.router.navigate([], { relativeTo: this.route, queryParams: { tab }, queryParamsHandling: 'merge', replaceUrl: true });
  }

  tabLocked(tab: Tab): boolean {
    switch (tab) {
      case 'today':
        return !this.canViewAttendance();
      case 'live':
        return !this.canViewFieldTracking();
      default:
        return false;
    }
  }

  // ── Today ──
  loadRoster(): void {
    this.roster.update((r) => ({ ...r, state: 'loading', error: null }));
    const date = this.rosterDate() === localIsoDate() ? null : this.rosterDate();
    this.facade.roster(date).subscribe({
      next: (data) => this.roster.set({ state: 'loaded', data, error: null }),
      error: (e) => this.roster.set({ state: 'error', data: null, error: errorText(e) }),
    });
  }

  onRosterDate(value: string): void {
    this.rosterDate.set(value || localIsoDate());
    this.loadRoster();
  }

  openHistory(userId: number): void {
    this.historyUserId.set(userId);
    this.selectTab('history');
  }

  openRoute(userId: number, date?: string): void {
    this.routeUserId.set(userId);
    if (date) this.routeDate.set(date);
    this.selectTab('routes');
  }

  // ── Live ──
  private startLiveRefresh(): void {
    this.loadLive();
    this.liveTimer = setInterval(() => this.loadLive(), LIVE_REFRESH_MS);
  }

  private stopLiveRefresh(): void {
    if (this.liveTimer) clearInterval(this.liveTimer);
    this.liveTimer = null;
  }

  loadLive(): void {
    // Keep showing the last positions while refreshing, so the map does not blink every 30 s.
    this.live.update((l) => ({ ...l, state: l.data ? 'loaded' : 'loading', error: null }));
    this.facade.live().subscribe({
      next: (data) => this.live.set({ state: 'loaded', data, error: null }),
      error: (e) => this.live.update((l) => ({ state: l.data ? 'loaded' : 'error', data: l.data, error: errorText(e) })),
    });
  }

  onLiveMarker(id: string): void {
    this.liveSelected.set(Number(id));
  }

  isStale(member: LiveFieldMember): boolean {
    return !member.lastSeenAtUtc || Date.now() - new Date(member.lastSeenAtUtc).getTime() > STALE_AFTER_MS;
  }

  private liveTone(member: LiveFieldMember): RouteMarker['tone'] {
    if (member.isMock) return 'danger';
    if (this.isStale(member)) return 'muted';
    if (member.batteryPercent != null && member.batteryPercent <= 15 && !member.isCharging) return 'warning';
    return 'primary';
  }

  private liveTooltip(member: LiveFieldMember): string {
    const parts = [`<strong>${escapeHtml(member.fullName)}</strong>`, escapeHtml(member.roleName)];
    parts.push(member.lastSeenAtUtc ? `Last seen ${new Date(member.lastSeenAtUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'No location yet — punch-in position');
    if (member.batteryPercent != null) parts.push(`Battery ${member.batteryPercent}%${member.isCharging ? ' (charging)' : ''}`);
    if (member.isMock) parts.push('⚠ Location reported by a mock (fake GPS) app');
    return parts.join('<br>');
  }

  // ── Routes ──
  loadAttended(): void {
    this.attended.update((a) => ({ ...a, state: 'loading', error: null }));
    this.facade.attendedMembers(this.routeDate()).subscribe({
      next: (data) => this.attended.set({ state: 'loaded', data: data.members, error: null }),
      error: (e) => this.attended.set({ state: 'error', data: null, error: errorText(e) }),
    });
  }

  loadRoute(): void {
    const userId = this.routeUserId();
    if (userId == null) return;
    this.selectedPunch.set(null);
    this.routePoints.set(idle());
    this.routeDay.update((r) => ({ ...r, state: 'loading', error: null }));
    this.facade.route(userId, this.routeDate()).subscribe({
      next: (data) => {
        this.routeDay.set({ state: 'loaded', data, error: null });
        // The pins carry the selfies, so they are fetched with the day rather than on a click.
        for (const session of data.sessions) {
          if (session.punchIn.hasPhoto) this.showPhoto(session.attendanceSessionId, 'in');
          if (session.punchOut?.hasPhoto) this.showPhoto(session.attendanceSessionId, 'out');
        }
        if (this.showPoints()) this.loadRoutePoints();
      },
      error: (e) => this.routeDay.set({ state: 'error', data: null, error: errorText(e) }),
    });
  }

  onRouteUser(value: number | null): void {
    this.routeUserId.set(value);
    this.loadRoute();
  }

  onRouteDate(value: string): void {
    this.routeDate.set(value || localIsoDate());
    this.loadAttended();
    this.loadRoute();
  }

  /** True when the chosen member has no attendance session on the chosen day. */
  routeMemberWasAway(): boolean {
    return this.routePeople().some((p) => p.userId === this.routeUserId() && p.absent);
  }

  onRouteMarker(id: string): void {
    const day = this.routeDay().data;
    const [kind, sessionId] = id.split('-');
    if (!day || (kind !== 'in' && kind !== 'out')) {
      this.selectedPunch.set(null);
      return;
    }
    const session = day.sessions.find((s) => s.attendanceSessionId === Number(sessionId));
    const punch = kind === 'in' ? session?.punchIn : session?.punchOut;
    this.selectedPunch.set(session && punch ? { session, punch } : null);
  }

  closePunch(): void {
    this.selectedPunch.set(null);
  }

  punchLabel(punch: PunchDetail): string {
    return punch.kind === 'in' ? 'Punched in' : 'Punched out';
  }

  coordinates(latitude: number | null, longitude: number | null): string {
    return latitude == null || longitude == null ? '—' : `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
  }

  togglePoints(show: boolean): void {
    this.showPoints.set(show);
    if (show && this.routePoints().state === 'idle') this.loadRoutePoints();
  }

  loadRoutePoints(): void {
    const userId = this.routeUserId();
    if (userId == null) return;
    this.routePoints.update((p) => ({ ...p, state: 'loading', error: null }));
    this.facade.routePoints(userId, this.routeDate()).subscribe({
      next: (data) => this.routePoints.set({ state: 'loaded', data, error: null }),
      error: (e) => this.routePoints.set({ state: 'error', data: null, error: errorText(e) }),
    });
  }

  km(meters: number): string {
    return (meters / 1000).toFixed(meters >= 10_000 ? 0 : 1);
  }

  private buildRouteMap(day: FieldTrackingDay | null): RouteMapData {
    if (!day) return { lines: [], markers: [] };
    const lines: RouteLine[] = [];
    const markers: RouteMarker[] = [];
    const time = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    for (const session of day.sessions) {
      for (const segment of session.segments) {
        const inferred = segment.kind === TrackedSegmentKind.Inferred;
        lines.push({
          kind: inferred ? 'inferred' : segment.isSnapped ? 'recorded' : 'unsnapped',
          points: decodePolyline(segment.encodedPolyline),
          tooltip: inferred
            ? `No signal ${time(segment.startedAtUtc)}–${time(segment.endedAtUtc)} · likely route, ${this.km(segment.distanceMeters)} km`
            : `${time(segment.startedAtUtc)}–${time(segment.endedAtUtc)} · ${this.km(segment.distanceMeters)} km${segment.isSnapped ? '' : ' · not matched to roads'}`,
        });
      }
      if (session.pendingPoints.length > 1) {
        lines.push({
          kind: 'pending',
          points: session.pendingPoints.map((p) => [p.latitude, p.longitude] as [number, number]),
          tooltip: 'Latest positions — matched to roads within a few minutes',
        });
      }
      session.stops.forEach((stop, i) =>
        markers.push({
          id: `stop-${session.attendanceSessionId}-${i}`,
          latitude: stop.latitude,
          longitude: stop.longitude,
          tone: 'warning',
          size: 'md',
          tooltip: `Stop · ${formatMinutes(stop.minutes)} · ${time(stop.arrivedAtUtc)}–${time(stop.leftAtUtc)}`,
        }),
      );
      for (const punch of [session.punchIn, session.punchOut]) {
        if (!punch || punch.latitude == null || punch.longitude == null) continue;
        markers.push({
          id: `${punch.kind}-${session.attendanceSessionId}`,
          latitude: punch.latitude,
          longitude: punch.longitude,
          tone: punch.kind === 'in' ? 'success' : 'danger',
          badge: punch.kind === 'in' ? 'IN' : 'OUT',
          avatarUrl: this.photoObjectUrl(session.attendanceSessionId, punch.kind),
          tooltip: `${escapeHtml(this.punchLabel(punch))} ${time(punch.atUtc)}<br>Click for details`,
        });
      }
    }
    markers.push(...this.pointMarkers());
    return { lines, markers };
  }

  /** The object URL of an already-fetched selfie, or undefined while it is loading or failed. */
  private photoObjectUrl(sessionId: number, kind: 'in' | 'out'): string | undefined {
    const url = this.photos()[this.photoKey(sessionId, kind)];
    return url && url !== 'loading' && url !== 'error' ? url : undefined;
  }

  /**
   * One small dot per recorded fix, each hovering its stored values. The API has already sampled
   * them (a shift is thousands), and the page says how many of how many are drawn.
   */
  private pointMarkers(): RouteMarker[] {
    if (!this.showPoints()) return [];
    const data = this.routePoints().data;
    if (!data) return [];
    const markers: RouteMarker[] = [];
    for (const session of data.sessions) {
      session.points.forEach((point, i) =>
        markers.push({
          id: `point-${session.attendanceSessionId}-${i}`,
          latitude: point.latitude,
          longitude: point.longitude,
          tone: point.isMock ? 'danger' : 'info',
          size: 'xs',
          tooltip: this.pointTooltip(point),
        }),
      );
    }
    return markers;
  }

  private pointTooltip(point: RecordedPoint): string {
    const at = new Date(point.recordedAtUtc).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const lines = [`<strong>${escapeHtml(at)}</strong>`];
    lines.push(escapeHtml(this.coordinates(point.latitude, point.longitude)));
    lines.push(
      escapeHtml(
        point.batteryPercent != null
          ? `Battery ${point.batteryPercent}%${point.isCharging ? ' · charging' : ''}${point.isBatterySaverOn ? ' · saver on' : ''}`
          : 'Battery not reported',
      ),
    );
    if (point.accuracyMeters != null) lines.push(`Accurate to ±${Math.round(point.accuracyMeters)} m`);
    if (point.speedMetersPerSecond != null) lines.push(`${(point.speedMetersPerSecond * 3.6).toFixed(1)} km/h`);
    if (point.headingDegrees != null) lines.push(`Heading ${Math.round(point.headingDegrees)}°`);
    if (point.isMock) lines.push('⚠ Reported by a mock (fake GPS) app');
    return lines.join('<br>');
  }

  private buildBatteryChart(day: FieldTrackingDay | null): EChartsOption | null {
    if (!day || day.battery.length < 2) return null;
    const css = getComputedStyle(document.documentElement);
    const primary = css.getPropertyValue('--primary').trim();
    const muted = css.getPropertyValue('--text-muted').trim();
    const border = css.getPropertyValue('--border').trim();
    return {
      grid: { left: 36, right: 12, top: 12, bottom: 28 },
      tooltip: { trigger: 'axis', valueFormatter: (v) => `${v}%` },
      xAxis: { type: 'time', axisLabel: { color: muted }, axisLine: { lineStyle: { color: border } } },
      yAxis: { type: 'value', min: 0, max: 100, axisLabel: { color: muted, formatter: '{value}%' }, splitLine: { lineStyle: { color: border } } },
      series: [
        {
          type: 'line',
          name: 'Battery',
          showSymbol: false,
          step: 'end',
          lineStyle: { color: primary, width: 2 },
          itemStyle: { color: primary },
          data: day.battery.map((b) => [b.recordedAtUtc, b.batteryPercent]),
        },
      ],
    };
  }

  // ── History ──
  loadHistory(): void {
    const userId = this.historyUserId();
    if (userId == null) return;
    this.history.update((h) => ({ ...h, state: 'loading', error: null }));
    this.facade.history(userId, this.historyFrom(), this.historyTo()).subscribe({
      next: (data) => this.history.set({ state: 'loaded', data, error: null }),
      error: (e) => this.history.set({ state: 'error', data: null, error: errorText(e) }),
    });
  }

  onHistoryUser(value: number | null): void {
    this.historyUserId.set(value);
    this.loadHistory();
  }

  onHistoryRange(which: 'from' | 'to', value: string): void {
    if (!value) return;
    (which === 'from' ? this.historyFrom : this.historyTo).set(value);
    this.loadHistory();
  }

  photoKey(sessionId: number, kind: 'in' | 'out'): string {
    return `${sessionId}-${kind}`;
  }

  showPhoto(sessionId: number, kind: 'in' | 'out'): void {
    const key = this.photoKey(sessionId, kind);
    if (this.photos()[key]) return;
    this.photos.update((p) => ({ ...p, [key]: 'loading' }));
    this.facade.photoUrl(sessionId, kind).subscribe({
      next: (url) => this.photos.update((p) => ({ ...p, [key]: url })),
      error: () => this.photos.update((p) => ({ ...p, [key]: 'error' })),
    });
  }

  startAdjust(session: AttendanceSession): void {
    this.adjustError.set(null);
    this.adjusting.set({
      session,
      punchIn: toLocalInput(session.punchInAtUtc),
      punchOut: toLocalInput(session.punchOutAtUtc ?? session.punchInAtUtc),
      reason: '',
    });
  }

  cancelAdjust(): void {
    this.adjusting.set(null);
  }

  updateAdjust(field: 'punchIn' | 'punchOut' | 'reason', value: string): void {
    this.adjusting.update((a) => (a ? { ...a, [field]: value } : a));
  }

  saveAdjust(): void {
    const a = this.adjusting();
    if (!a) return;
    if (!a.reason.trim()) {
      this.adjustError.set('A reason is required — it is kept with the record.');
      return;
    }
    const punchIn = new Date(a.punchIn);
    const punchOut = new Date(a.punchOut);
    if (!(punchOut > punchIn)) {
      this.adjustError.set('Punch-out must be after punch-in.');
      return;
    }
    this.adjustSaving.set(true);
    this.facade
      .adjust(a.session.id, { punchInAtUtc: punchIn.toISOString(), punchOutAtUtc: punchOut.toISOString(), reason: a.reason.trim() })
      .subscribe({
        next: () => {
          this.adjustSaving.set(false);
          this.adjusting.set(null);
          this.loadHistory();
        },
        error: (e) => {
          this.adjustSaving.set(false);
          this.adjustError.set(errorText(e));
        },
      });
  }

  // ── Settings ──
  loadSettings(): void {
    this.settingsMessage.set(null);
    this.attendanceSettings.set({ state: 'loading', data: null, error: null });
    this.facade.attendanceSettings().subscribe({
      next: (s) =>
        this.attendanceSettings.set({
          state: 'loaded',
          data: { timeZone: s.timeZone, autoCloseAfterHours: s.autoCloseAfterHours, photoRetentionDays: s.photoRetentionDays },
          error: null,
        }),
      error: (e) => this.attendanceSettings.set({ state: 'error', data: null, error: errorText(e) }),
    });
    if (!this.canSeeTrackingSettings()) return;
    this.trackingSettings.set({ state: 'loading', data: null, error: null });
    this.facade.trackingSettings().subscribe({
      next: (s) => {
        this.trackingSettings.set({ state: 'loaded', data: s, error: null });
        this.trackingEnabled.set(s.trackingEnabled);
        this.retentionDays.set(s.locationRetentionDays);
        this.trackedRoleIds.set(new Set(s.roles.filter((r) => r.isTracked).map((r) => r.organizationRoleId)));
      },
      error: (e) => this.trackingSettings.set({ state: 'error', data: null, error: errorText(e) }),
    });
  }

  updateAttendanceSetting(field: 'timeZone' | 'autoCloseAfterHours' | 'photoRetentionDays', value: string | number): void {
    this.attendanceSettings.update((s) =>
      s.data ? { ...s, data: { ...s.data, [field]: field === 'timeZone' ? String(value) : Number(value) } } : s,
    );
  }

  saveAttendanceSettings(): void {
    const data = this.attendanceSettings().data;
    if (!data) return;
    this.settingsSaving.set('attendance');
    this.settingsMessage.set(null);
    this.facade.saveAttendanceSettings(data).subscribe({
      next: () => {
        this.settingsSaving.set(null);
        this.settingsMessage.set('Attendance settings saved.');
      },
      error: (e) => {
        this.settingsSaving.set(null);
        this.settingsMessage.set(errorText(e));
      },
    });
  }

  toggleRole(roleId: number, tracked: boolean): void {
    this.trackedRoleIds.update((ids) => {
      const next = new Set(ids);
      if (tracked) next.add(roleId);
      else next.delete(roleId);
      return next;
    });
  }

  saveTrackingSettings(): void {
    this.settingsSaving.set('tracking');
    this.settingsMessage.set(null);
    this.facade
      .saveTrackingSettings({
        trackingEnabled: this.trackingEnabled(),
        locationRetentionDays: Number(this.retentionDays()),
        trackedRoleIds: [...this.trackedRoleIds()],
      })
      .subscribe({
        next: () => {
          this.settingsSaving.set(null);
          this.settingsMessage.set('Field tracking settings saved. They apply from each member\'s next punch-in.');
          this.loadSettings();
        },
        error: (e) => {
          this.settingsSaving.set(null);
          this.settingsMessage.set(errorText(e));
        },
      });
  }

  private supportedTimeZones(): string[] {
    const intl = Intl as unknown as { supportedValuesOf?: (key: string) => string[] };
    const zones = intl.supportedValuesOf?.('timeZone') ?? [];
    return zones.length ? ['UTC', ...zones.filter((z) => z !== 'UTC')] : ['UTC', 'Asia/Kolkata'];
  }
}

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
