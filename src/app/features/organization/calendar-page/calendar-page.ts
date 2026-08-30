import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CalendarOptions, FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/angular/daygrid';
import listPlugin from '@fullcalendar/angular/list';
import classicTheme from '@fullcalendar/angular/themes/classic';
import timeGridPlugin from '@fullcalendar/angular/timegrid';
import { EventClickInfo, EventDropInfo, EventResizeDoneInfo } from 'fullcalendar';
import {
  ArrowRight,
  AlertCircle,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Gauge,
  FolderKanban,
  LUCIDE_ICONS,
  ListChecks,
  LucideAngularModule,
  LucideIconProvider,
  UserRound,
  Users,
  Plus,
} from 'lucide-angular';

import { OrganizationFacade } from '../organization.facade';
import { MeetingsFacade } from '../meetings.facade';
import { CalendarEntry, CalendarEntryPayload, CapacityRow, TaskListItem, TaskStatus } from '../organization.models';
import {
  CalendarFilters,
  CalendarItem,
  DEFAULT_CALENDAR_FILTERS,
  buildCalendarItems,
  filterCalendarItems,
  inclusiveEnd,
  toScheduleEvents,
  toTimelineTasks,
} from './calendar-page.model';
import { CalendarDetailDrawer } from './calendar-detail-drawer';
import { CalendarEntryDrawer } from './calendar-entry-drawer';

type CalendarTab = 'schedule' | 'timeline' | 'capacity';
interface CalendarDateRange { start: Date; end: Date; }

@Component({
  selector: 'app-calendar-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FullCalendarModule, LucideAngularModule, CalendarDetailDrawer, CalendarEntryDrawer],
  templateUrl: './calendar-page.html',
  styleUrls: ['./calendar-page.scss', './calendar-capacity.scss'],
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        ArrowRight,
        AlertCircle,
        Building2,
        CalendarDays,
        CheckCircle2,
        Clock3,
        Gauge,
        FolderKanban,
        ListChecks,
        UserRound,
        Users,
        Plus,
      }),
    },
  ],
})
export class CalendarPage implements OnDestroy {
  private readonly facade = inject(OrganizationFacade);
  private readonly meetingsFacade = inject(MeetingsFacade);

  @ViewChild('ganttHost') private ganttHost?: ElementRef<HTMLElement>;

  readonly currentOrg = this.facade.currentOrg;
  readonly needsOrganization = this.facade.needsOrganization;
  readonly loading = computed(() => this.facade.loading() || this.meetingsFacade.loading());
  readonly loadError = computed(() => this.facade.loadError() || this.meetingsFacade.error());
  /** Filter during an organization switch so the previous workspace never flashes in this one. */
  readonly projects = computed(() => {
    const organizationId = this.currentOrg()?.id;
    return organizationId == null
      ? []
      : this.facade.projects().filter((project) => project.organizationId === organizationId);
  });
  readonly teams = computed(() =>
    this.facade.teams().filter((team) => team.organizationId === this.currentOrg()?.id),
  );
  readonly members = computed(() =>
    this.facade.members().filter((member) => member.organizationId === this.currentOrg()?.id),
  );
  readonly priorityOptions = [
    { value: 1, label: 'Low' },
    { value: 2, label: 'Medium' },
    { value: 3, label: 'High' },
    { value: 4, label: 'Critical' },
  ];
  readonly activeTab = signal<CalendarTab>('schedule');
  readonly selectedProjectId = signal<number | null>(null);
  readonly selectedItem = signal<CalendarItem | null>(null);
  readonly entryDrawerOpen = signal(false);
  readonly editingEntry = signal<CalendarEntry | null>(null);
  readonly timelineLoading = signal(false);
  readonly scheduleError = signal<string | null>(null);
  readonly filters = signal<CalendarFilters>({ ...DEFAULT_CALENDAR_FILTERS });
  readonly canManageTasks = this.facade.canManageTasks;
  readonly saving = this.facade.saving;
  readonly canManageMembers = this.facade.canManageMembers;
  readonly canManageCalendar = this.facade.canManageCalendar;
  readonly capacity = this.facade.capacity;
  readonly capacityLoading = this.facade.capacityLoading;
  readonly capacityWeekStart = signal(this.currentMonday());
  readonly capacityWeeks = computed(() => {
    const seen = new Map<string, string>();
    for (const row of this.capacity()) {
      seen.set(row.weekStart, row.weekEnd);
    }
    return [...seen].map(([start, end]) => ({ start, end }));
  });
  readonly capacityMembers = computed(() =>
    this.members().filter((member) => member.isActive),
  );
  readonly capacityLookup = computed(() => {
    const lookup = new Map<string, CapacityRow>();
    for (const row of this.capacity()) {
      lookup.set(`${row.userId}:${row.weekStart}`, row);
    }
    return lookup;
  });
  readonly capacityWindowTasks = computed(() => {
    const start = this.capacityWeekStart();
    const end = this.addDays(start, 42);
    return this.facade.tasks().filter((task) => {
      const planningDate = (task.expectedCompletionDate ?? task.startDate).slice(0, 10);
      return (
        task.organizationId === this.currentOrg()?.id &&
        task.assignedToUserId != null &&
        task.status !== TaskStatus.Completed &&
        task.status !== TaskStatus.Cancelled &&
        planningDate >= start &&
        planningDate < end
      );
    });
  });
  readonly tasksMissingEstimates = computed(() =>
    this.capacityWindowTasks().filter((task) => task.estimateMinutes == null),
  );

  readonly calendarItems = computed(() =>
    buildCalendarItems(
      this.projects(),
      this.facade
        .tasks()
        .filter((task) => task.organizationId === this.currentOrg()?.id),
      this.facade
        .members()
        .filter((member) => member.organizationId === this.currentOrg()?.id),
      new Date(),
      this.facade.calendarEntries().filter((entry) => entry.organizationId === this.currentOrg()?.id),
      this.meetingsFacade.meetings().filter((meeting) => meeting.organizationId === this.currentOrg()?.id),
    ),
  );
  readonly filteredItems = computed(() => filterCalendarItems(this.calendarItems(), this.filters()));
  readonly scheduleEvents = computed(() =>
    toScheduleEvents(this.filteredItems(), this.canManageTasks()),
  );
  readonly timelineTasks = computed(() => {
    const projectId = this.selectedProjectId();
    return projectId == null ? [] : toTimelineTasks(this.filteredItems(), projectId);
  });

  readonly statusOptions = computed(() => {
    const unique = new Map<string, string>();
    for (const item of this.calendarItems()) {
      unique.set(item.statusKey, item.status.split(' · ')[0]);
    }
    return [...unique].map(([value, label]) => ({ value, label }));
  });

  readonly activeFilterCount = computed(() => {
    const filters = this.filters();
    return [
      filters.projectId,
      filters.teamId,
      filters.memberId,
      filters.kind !== 'all' ? filters.kind : null,
      filters.statusKey || null,
      filters.priority,
      filters.overdueOnly ? true : null,
      !filters.includeCompleted ? true : null,
    ].filter((value) => value != null).length;
  });

  readonly scheduleCounts = computed(() => {
    const items = this.calendarItems();
    return {
      projects: items.filter((item) => item.kind === 'project').length,
      tasks: items.filter((item) => item.kind === 'task').length,
      overdue: items.filter((item) => item.overdue).length,
    };
  });

  readonly calendarOptions: CalendarOptions = {
    plugins: [classicTheme, dayGridPlugin, timeGridPlugin, listPlugin],
    initialView:
      typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
        ? 'listWeek'
        : 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,listWeek',
    },
    todayText: 'Today',
    monthText: 'Month',
    weekTextLong: 'Week',
    listText: 'List',
    height: 'auto',
    dayMaxEvents: true,
    navLinks: true,
    nowIndicator: true,
    editable: true,
    selectable: false,
    eventClick: (argument) => this.onScheduleEventClick(argument),
    eventDrop: (argument) => this.onScheduleEventMove(argument),
    eventResize: (argument) => this.onScheduleEventMove(argument),
    datesSet: (argument) => this.onDatesSet(argument),
  };

  constructor() {
    this.facade.init();

    // Keep the third-party renderer at the edge: any org/project/task signal change rebuilds the
    // read-only chart from our adapter, while Schedule remains a normal Angular input binding.
    effect(() => {
      const organizationId = this.currentOrg()?.id;
      if (organizationId != null) {
        this.meetingsFacade.load(organizationId);
        const now = new Date();
        this.loadCalendarWindow(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 6, 1)),
          new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 6, 1)));
      }
    });

    effect(() => {
      if (this.activeTab() === 'timeline') {
        this.selectedProjectId();
        this.timelineTasks();
        this.canManageTasks();
        this.scheduleTimelineRender();
      }
    });

    effect(() => {
      const organizationId = this.currentOrg()?.id;
      const weekStart = this.capacityWeekStart();
      if (this.activeTab() === 'capacity' && organizationId != null) {
        this.facade.loadCapacity(weekStart, 6);
      }
    });

    effect(() => {
      const organizationId = this.currentOrg()?.id;
      if (organizationId == null) {
        return;
      }
      const saved = localStorage.getItem(this.filterStorageKey(organizationId));
      if (!saved) {
        this.filters.set({ ...DEFAULT_CALENDAR_FILTERS });
        return;
      }
      try {
        this.filters.set({ ...DEFAULT_CALENDAR_FILTERS, ...JSON.parse(saved) });
      } catch {
        this.filters.set({ ...DEFAULT_CALENDAR_FILTERS });
      }
    });

    effect(() => {
      const organizationId = this.currentOrg()?.id;
      const filters = this.filters();
      if (organizationId != null) {
        localStorage.setItem(this.filterStorageKey(organizationId), JSON.stringify(filters));
      }
    });

    effect(() => {
      if (this.activeTab() !== 'timeline') {
        return;
      }
      const projects = this.projects();
      const selected = this.selectedProjectId();
      if (!projects.some((project) => project.id === selected)) {
        this.selectedProjectId.set(projects[0]?.id ?? null);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.ganttScheduleTimer) {
      clearTimeout(this.ganttScheduleTimer);
    }
  }

  setTab(tab: CalendarTab): void {
    this.activeTab.set(tab);
    this.selectedItem.set(null);
    if (tab === 'timeline') {
      const current = this.selectedProjectId();
      const projects = this.projects();
      if (current == null || !projects.some((project) => project.id === current)) {
        this.selectedProjectId.set(projects[0]?.id ?? null);
      }
      this.scheduleTimelineRender();
    }
  }

  onTabKeydown(event: KeyboardEvent): void {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }
    event.preventDefault();
    const tabs: CalendarTab[] = ['schedule', 'timeline', 'capacity'];
    const currentIndex = tabs.indexOf(this.activeTab());
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    this.setTab(tabs[(currentIndex + direction + tabs.length) % tabs.length]);
    const target = event.currentTarget as HTMLElement;
    queueMicrotask(() =>
      target.parentElement?.querySelector<HTMLElement>('[aria-selected="true"]')?.focus(),
    );
  }

  selectProject(value: string): void {
    const projectId = Number(value);
    this.selectedProjectId.set(Number.isFinite(projectId) ? projectId : null);
    this.selectedItem.set(null);
    this.scheduleTimelineRender();
  }

  closeDetails(): void {
    this.selectedItem.set(null);
  }

  openNewEntry(): void { this.editingEntry.set(null); this.entryDrawerOpen.set(true); }
  editEntry(entry: CalendarEntry): void { this.selectedItem.set(null); this.editingEntry.set(entry); this.entryDrawerOpen.set(true); }
  closeEntryDrawer(): void { this.entryDrawerOpen.set(false); this.editingEntry.set(null); }
  saveEntry(payload: CalendarEntryPayload): void {
    this.facade.saveCalendarEntry(payload, () => { this.closeEntryDrawer(); this.reloadCalendarWindow(); });
  }
  deleteEntry(id: number): void {
    this.facade.deleteCalendarEntry(id, () => { this.closeEntryDrawer(); this.reloadCalendarWindow(); });
  }

  setNumericFilter(
    field: 'projectId' | 'teamId' | 'memberId' | 'priority',
    value: string,
  ): void {
    const parsed = Number(value);
    this.filters.update((filters) => ({
      ...filters,
      [field]: value && Number.isFinite(parsed) ? parsed : null,
    }));
    if (field === 'projectId' && value) {
      this.selectedProjectId.set(parsed);
    }
  }

  setTextFilter(field: 'kind' | 'statusKey', value: string): void {
    this.filters.update((filters) => ({ ...filters, [field]: value }));
  }

  setBooleanFilter(field: 'overdueOnly' | 'includeCompleted', checked: boolean): void {
    this.filters.update((filters) => ({ ...filters, [field]: checked }));
  }

  clearFilters(): void {
    this.filters.set({ ...DEFAULT_CALENDAR_FILTERS });
  }

  retryLoad(): void {
    this.facade.loadOrganizations();
    const organizationId = this.currentOrg()?.id;
    if (organizationId != null) this.meetingsFacade.load(organizationId);
  }

  capacityCell(userId: number, weekStart: string): CapacityRow | undefined {
    return this.capacityLookup().get(`${userId}:${weekStart}`);
  }

  moveCapacityWindow(weeks: number): void {
    this.capacityWeekStart.set(this.addDays(this.capacityWeekStart(), weeks * 7));
  }

  resetCapacityWindow(): void {
    this.capacityWeekStart.set(this.currentMonday());
  }

  saveMemberCapacity(userId: number, hoursValue: string): void {
    if (!this.canManageMembers() || this.saving()) {
      return;
    }
    const minutes = this.hoursToMinutes(hoursValue);
    if (minutes === undefined) {
      return;
    }
    this.facade.setMemberCapacity(userId, minutes, () => this.refreshCapacity());
  }

  saveTaskEstimate(taskId: number, hoursValue: string): void {
    if (!this.canManageTasks() || this.saving()) {
      return;
    }
    const minutes = this.hoursToMinutes(hoursValue);
    if (minutes === undefined) {
      return;
    }
    this.facade.setTaskEstimate(taskId, minutes, () => this.refreshCapacity());
  }

  formatMinutes(minutes: number | null | undefined): string {
    if (minutes == null) {
      return '—';
    }
    const hours = minutes / 60;
    return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`;
  }

  memberName(task: TaskListItem): string {
    return (
      this.members().find((member) => member.userId === task.assignedToUserId)?.userFullName ??
      'Unassigned'
    );
  }

  private refreshCapacity(): void {
    this.facade.loadCapacity(this.capacityWeekStart(), 6);
  }

  private hoursToMinutes(value: string): number | null | undefined {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    const hours = Number(trimmed);
    if (!Number.isFinite(hours) || hours < 0 || hours > 168) {
      this.scheduleError.set('Enter hours between 0 and 168, or leave the field blank to clear it.');
      return undefined;
    }
    this.scheduleError.set(null);
    return Math.round(hours * 60);
  }

  private currentMonday(): string {
    const now = new Date();
    const localDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const offset = (localDate.getUTCDay() + 6) % 7;
    localDate.setUTCDate(localDate.getUTCDate() - offset);
    return localDate.toISOString().slice(0, 10);
  }

  private addDays(dateKey: string, days: number): string {
    const date = new Date(`${dateKey}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
  }

  private onScheduleEventClick(argument: EventClickInfo): void {
    this.selectedItem.set(argument.event.extendedProps['item'] as CalendarItem);
  }

  private visibleCalendarWindow?: { from: string; to: string };
  private onDatesSet(argument: CalendarDateRange): void { this.loadCalendarWindow(argument.start, argument.end); }
  private loadCalendarWindow(from: Date, to: Date): void {
    this.visibleCalendarWindow = { from: from.toISOString(), to: to.toISOString() };
    this.facade.loadCalendarEntries(this.visibleCalendarWindow.from, this.visibleCalendarWindow.to);
  }
  private reloadCalendarWindow(): void {
    if (this.visibleCalendarWindow) this.facade.loadCalendarEntries(this.visibleCalendarWindow.from, this.visibleCalendarWindow.to);
  }

  private onScheduleEventMove(argument: EventDropInfo | EventResizeDoneInfo): void {
    const item = argument.event.extendedProps['item'] as CalendarItem;
    if (item.kind !== 'task' || !this.canManageTasks() || this.saving()) {
      argument.revert();
      return;
    }

    const startDate = argument.event.startStr.slice(0, 10);
    const endDate = argument.event.endStr
      ? inclusiveEnd(argument.event.endStr.slice(0, 10))
      : startDate;
    this.persistSchedule(item.sourceId, startDate, endDate, argument.revert);
  }

  private persistSchedule(
    taskId: number,
    startDate: string,
    endDate: string,
    revert: () => void,
  ): void {
    this.scheduleError.set(null);
    this.facade.scheduleTask(
      {
        taskId,
        startDate: `${startDate}T00:00:00Z`,
        expectedCompletionDate: `${endDate}T00:00:00Z`,
      },
      () => {
        this.closeDetails();
        this.scheduleTimelineRender();
      },
      () => {
        revert();
        this.scheduleError.set(
          'That schedule change was not saved. The task has been restored to its previous dates.',
        );
        this.scheduleTimelineRender();
      },
    );
  }

  private filterStorageKey(organizationId: number): string {
    return `tf_calendar_filters_${organizationId}`;
  }

  private scheduleTimelineRender(): void {
    const renderToken = Symbol('timeline-render');
    this.pendingRender = renderToken;
    queueMicrotask(() => {
      requestAnimationFrame(() => {
        if (this.pendingRender === renderToken) {
          void this.renderTimeline();
        }
      });
    });
  }

  private pendingRender?: symbol;
  private ganttScheduleTimer?: ReturnType<typeof setTimeout>;

  private queueGanttSchedule(item: CalendarItem, start: Date, end: Date): void {
    if (this.ganttScheduleTimer) {
      clearTimeout(this.ganttScheduleTimer);
    }
    const toDateKey = (value: Date) =>
      new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()))
        .toISOString()
        .slice(0, 10);
    this.ganttScheduleTimer = setTimeout(() => {
      this.ganttScheduleTimer = undefined;
      this.persistSchedule(
        item.sourceId,
        toDateKey(start),
        toDateKey(end),
        () => this.scheduleTimelineRender(),
      );
    }, 400);
  }

  private async renderTimeline(): Promise<void> {
    const host = this.ganttHost?.nativeElement;
    const tasks = this.timelineTasks();
    if (!host || this.activeTab() !== 'timeline' || tasks.length === 0) {
      return;
    }

    this.timelineLoading.set(true);
    try {
      const { default: Gantt } = await import('frappe-gantt');
      host.replaceChildren();
      new Gantt(host, tasks.map((task) => ({ ...task })), {
        view_mode: 'Week',
        view_modes: ['Week', 'Day', 'Month'],
        view_mode_select: true,
        readonly: !this.canManageTasks(),
        readonly_dates: !this.canManageTasks(),
        readonly_progress: true,
        popup: false,
        on_click: (task) => {
          const item = task.calendarItem as CalendarItem | undefined;
          if (item) {
            this.selectedItem.set(item);
          }
        },
        on_date_change: (task, start, end) => {
          const item = task.calendarItem as CalendarItem | undefined;
          if (!item || !this.canManageTasks()) {
            this.scheduleTimelineRender();
            return;
          }
          this.queueGanttSchedule(item, start, end);
        },
      });
    } finally {
      this.timelineLoading.set(false);
    }
  }
}
