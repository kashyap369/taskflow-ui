import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';

import { APP_SETTINGS } from '@core/config/app.tokens';
import { AppSettings } from '@core/config/app.settings';
import { AttendancePage } from './attendance-page';
import {
  AttendanceSessionStatus,
  AttendedMember,
  FieldTrackingDay,
  PunchDetail,
  TrackedSession,
} from '../attendance.models';

function attended(userId: number, fullName: string): AttendedMember {
  return {
    userId,
    fullName,
    roleName: 'Sales',
    sessionCount: 1,
    firstPunchInUtc: '2026-06-15T04:00:00Z',
    lastPunchOutUtc: '2026-06-15T12:00:00Z',
    isStillIn: false,
    wasTracked: true,
  };
}

function punch(kind: 'in' | 'out'): PunchDetail {
  return {
    attendanceSessionId: 42,
    kind,
    atUtc: kind === 'in' ? '2026-06-15T04:00:00Z' : '2026-06-15T12:00:00Z',
    latitude: 19.07,
    longitude: 72.88,
    accuracyMeters: 14,
    hasPhoto: true,
    batteryPercent: kind === 'in' ? 98 : 31,
    isCharging: false,
    note: null,
  };
}

function session(): TrackedSession {
  return {
    attendanceSessionId: 42,
    punchInAtUtc: '2026-06-15T04:00:00Z',
    punchOutAtUtc: '2026-06-15T12:00:00Z',
    status: AttendanceSessionStatus.Closed,
    isTracked: true,
    punchInLatitude: 19.07,
    punchInLongitude: 72.88,
    punchOutLatitude: 19.11,
    punchOutLongitude: 72.91,
    segments: [],
    stops: [],
    pendingPoints: [],
    punchIn: punch('in'),
    punchOut: punch('out'),
  };
}

function day(): FieldTrackingDay {
  return {
    userId: 7,
    fullName: 'Ben Shah',
    email: 'ben@example.test',
    workDate: '2026-06-15',
    timeZone: 'UTC',
    distanceMeters: 1_000,
    inferredDistanceMeters: 0,
    stopCount: 0,
    mockPointCount: 0,
    pointCount: 10,
    battery: [],
    sessions: [session()],
  };
}

describe('AttendancePage', () => {
  let component: AttendancePage;
  let fixture: ComponentFixture<AttendancePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendancePage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideToastr(),
        provideAnimations(),
        provideEchartsCore({ echarts }),
        { provide: APP_SETTINGS, useValue: AppSettings },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AttendancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts on the Today tab', () => {
    expect(component.tab()).toBe('today');
  });

  it('offers nobody when nobody punched in, so the picker can be left empty', () => {
    component.attended.set({ state: 'loaded', data: [], error: null });

    expect(component.routePeople()).toEqual([]);
  });

  it('never falls back to the whole member list when the list was refused', () => {
    // A member holding neither permission is refused the list; only "Me" is added back, and this
    // harness has no signed-in session, so nothing is. What must not happen is everyone reappearing.
    component.attended.set({ state: 'error', data: null, error: 'PERMISSION_DENIED' });

    expect(component.routePeople().every((p) => p.name === 'Me')).toBeTrue();
  });

  it('offers only the members who punched in on the chosen day', () => {
    component.attended.set({ state: 'loaded', data: [attended(7, 'Ben Shah')], error: null });

    expect(component.routePeople().map((p) => p.userId)).toEqual([7]);
    expect(component.routePeople()[0].absent).toBeFalse();
  });

  it('keeps a member chosen from elsewhere in the list, marked as away', () => {
    // Arriving from the Today tab or a link: the choice must not vanish silently.
    component.routeUserId.set(99);
    component.attended.set({ state: 'loaded', data: [attended(7, 'Ben Shah')], error: null });

    expect(component.routePeople().map((p) => p.userId)).toEqual([99, 7]);
    expect(component.routeMemberWasAway()).toBeTrue();
  });

  it('opens the punch a pin belongs to, and closes on anything else', () => {
    component.routeDay.set({ state: 'loaded', data: day(), error: null });

    component.onRouteMarker('in-42');
    expect(component.selectedPunch()?.punch.kind).toBe('in');
    expect(component.selectedPunch()?.punch.batteryPercent).toBe(98);

    component.onRouteMarker('out-42');
    expect(component.selectedPunch()?.punch.kind).toBe('out');

    component.onRouteMarker('stop-42-0');
    expect(component.selectedPunch()).toBeNull();
  });

  it('draws a badged pin for each punch, with no selfie until one is fetched', () => {
    component.routeDay.set({ state: 'loaded', data: day(), error: null });

    const pins = component.routeMap().markers.filter((m) => m.badge);
    expect(pins.map((m) => m.badge)).toEqual(['IN', 'OUT']);
    expect(pins.every((m) => m.avatarUrl === undefined)).toBeTrue();

    component.photos.set({ '42-in': 'blob:http://localhost/selfie' });
    expect(component.routeMap().markers.find((m) => m.badge === 'IN')!.avatarUrl).toBe(
      'blob:http://localhost/selfie',
    );
  });

  it('adds a hoverable marker per recorded fix only when fixes are switched on', () => {
    component.routeDay.set({ state: 'loaded', data: day(), error: null });
    component.routePoints.set({
      state: 'loaded',
      data: {
        userId: 7,
        workDate: '2026-06-15',
        timeZone: 'UTC',
        totalPointCount: 2_880,
        sampledPointCount: 1,
        maxPointsPerSession: 400,
        sessions: [
          {
            attendanceSessionId: 42,
            punchInAtUtc: '2026-06-15T04:00:00Z',
            punchOutAtUtc: '2026-06-15T12:00:00Z',
            totalPointCount: 2_880,
            points: [
              {
                recordedAtUtc: '2026-06-15T04:00:00Z',
                latitude: 19.071_23,
                longitude: 72.881_23,
                accuracyMeters: 8.4,
                speedMetersPerSecond: 2.5,
                headingDegrees: 95.2,
                batteryPercent: 97,
                isCharging: false,
                isBatterySaverOn: true,
                isMock: false,
              },
            ],
          },
        ],
      },
      error: null,
    });

    expect(component.routeMap().markers.some((m) => m.id.startsWith('point-'))).toBeFalse();

    component.showPoints.set(true);
    const fix = component.routeMap().markers.find((m) => m.id.startsWith('point-'));
    expect(fix).toBeTruthy();
    expect(fix!.size).toBe('xs');
    // The hover is the point of the feature: time, battery and coordinates at the very least.
    expect(fix!.tooltip).toContain('19.07123, 72.88123');
    expect(fix!.tooltip).toContain('Battery 97%');
    expect(fix!.tooltip).toContain('saver on');
    expect(fix!.tooltip).toContain('±8 m');
    expect(fix!.tooltip).toContain('9.0 km/h');
  });
});
