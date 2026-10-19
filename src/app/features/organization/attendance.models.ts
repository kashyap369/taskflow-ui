/**
 * Attendance + field tracking DTOs, mirroring the API's `Features/Attendance` records
 * (camelCase JSON, enums as numbers, instants in UTC, work dates as `yyyy-MM-dd`).
 */

export enum AttendanceRosterStatus {
  In = 1,
  Out = 2,
  NotIn = 3,
  OnLeave = 4,
  Holiday = 5,
}

export enum AttendanceSessionStatus {
  Open = 1,
  Closed = 2,
  /** Closed by the system because the punch-out was forgotten; counts as 0 minutes worked. */
  AutoClosed = 3,
  Adjusted = 4,
}

export enum AttendanceDayStatus {
  NoRecord = 0,
  Present = 1,
  Incomplete = 2,
  OnLeave = 3,
  Holiday = 4,
}

export enum TrackedSegmentKind {
  Recorded = 1,
  /** A gap bridged by the server's guess — always drawn dashed, never as if recorded. */
  Inferred = 2,
}

export interface AttendanceRosterRow {
  userId: number;
  fullName: string;
  email: string;
  roleName: string;
  status: AttendanceRosterStatus;
  firstPunchInUtc: string | null;
  lastPunchOutUtc: string | null;
  workedMinutes: number;
  openSessionId: number | null;
}

export interface AttendanceRoster {
  workDate: string;
  timeZone: string;
  members: AttendanceRosterRow[];
}

export interface AttendanceSession {
  id: number;
  userId: number;
  workDate: string;
  punchInAtUtc: string;
  punchOutAtUtc: string | null;
  status: AttendanceSessionStatus;
  punchInNote: string | null;
  punchOutNote: string | null;
  hasPunchInPhoto: boolean;
  hasPunchOutPhoto: boolean;
  workedMinutes: number;
  adjustmentReason: string | null;
  originalPunchInAtUtc: string | null;
  originalPunchOutAtUtc: string | null;
}

export interface AttendanceDay {
  workDate: string;
  status: AttendanceDayStatus;
  firstPunchInUtc: string | null;
  lastPunchOutUtc: string | null;
  workedMinutes: number;
  calendarNote: string | null;
  sessions: AttendanceSession[];
}

export interface AttendanceSettings {
  organizationId: number;
  timeZone: string;
  autoCloseAfterHours: number;
  photoRetentionDays: number;
  selfieRequired: boolean;
}

export interface UpdateAttendanceSettingsPayload {
  timeZone: string;
  autoCloseAfterHours: number;
  photoRetentionDays: number;
}

export interface AdjustAttendancePayload {
  punchInAtUtc: string;
  punchOutAtUtc: string;
  reason: string;
}

export interface FieldTrackingRole {
  organizationRoleId: number;
  name: string;
  isTracked: boolean;
  memberCount: number;
}

export interface FieldTrackingSettings {
  organizationId: number;
  trackingEnabled: boolean;
  locationRetentionDays: number;
  policyVersion: number;
  roadMatchingAvailable: boolean;
  roles: FieldTrackingRole[];
}

export interface UpdateFieldTrackingSettingsPayload {
  trackingEnabled: boolean;
  locationRetentionDays: number;
  trackedRoleIds: number[];
}

export interface LiveFieldMember {
  userId: number;
  fullName: string;
  roleName: string;
  attendanceSessionId: number;
  punchInAtUtc: string;
  latitude: number | null;
  longitude: number | null;
  accuracyMeters: number | null;
  lastSeenAtUtc: string | null;
  batteryPercent: number | null;
  isCharging: boolean | null;
  isMock: boolean;
  /** No GPS fix yet: the position shown is where they punched in. */
  fromPunchLocation: boolean;
}

export interface LiveFieldTracking {
  generatedAtUtc: string;
  members: LiveFieldMember[];
}

export interface TrackedSegment {
  sequence: number;
  kind: TrackedSegmentKind;
  startedAtUtc: string;
  endedAtUtc: string;
  /** Encoded polyline, precision 6 (Valhalla's format). */
  encodedPolyline: string;
  distanceMeters: number;
  /** False when road matching was unavailable and the cleaned GPS track is shown instead. */
  isSnapped: boolean;
}

export interface TrackStop {
  latitude: number;
  longitude: number;
  arrivedAtUtc: string;
  leftAtUtc: string;
  minutes: number;
}

export interface TrackPoint {
  recordedAtUtc: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
  isMock: boolean;
}

/** One member who punched in on a chosen day — the map tabs' member picker. */
export interface AttendedMember {
  userId: number;
  fullName: string;
  roleName: string;
  sessionCount: number;
  firstPunchInUtc: string;
  lastPunchOutUtc: string | null;
  isStillIn: boolean;
  wasTracked: boolean;
}

export interface AttendedMembers {
  workDate: string;
  timeZone: string;
  members: AttendedMember[];
}

/**
 * What a punch pin shows when it is clicked. The selfie is not here: the photo endpoint is
 * authenticated, so `hasPhoto` says whether to fetch one. `batteryPercent` is the nearest
 * recorded fix within ten minutes of the punch, and is null when there was none.
 */
export interface PunchDetail {
  attendanceSessionId: number;
  kind: 'in' | 'out';
  atUtc: string;
  latitude: number | null;
  longitude: number | null;
  accuracyMeters: number | null;
  hasPhoto: boolean;
  batteryPercent: number | null;
  isCharging: boolean | null;
  note: string | null;
}

/** One stored fix, with every field the phone sent — the map's hover detail. */
export interface RecordedPoint {
  recordedAtUtc: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
  speedMetersPerSecond: number | null;
  headingDegrees: number | null;
  batteryPercent: number | null;
  isCharging: boolean | null;
  isBatterySaverOn: boolean | null;
  isMock: boolean;
}

export interface RecordedPointsSession {
  attendanceSessionId: number;
  punchInAtUtc: string;
  punchOutAtUtc: string | null;
  totalPointCount: number;
  points: RecordedPoint[];
}

/** A day's fixes, sampled by the API: `sampledPointCount` of `totalPointCount` are drawn. */
export interface FieldTrackingPoints {
  userId: number;
  workDate: string;
  timeZone: string;
  totalPointCount: number;
  sampledPointCount: number;
  maxPointsPerSession: number;
  sessions: RecordedPointsSession[];
}

export interface BatterySample {
  recordedAtUtc: string;
  batteryPercent: number;
  isCharging: boolean | null;
}

export interface TrackedSession {
  attendanceSessionId: number;
  punchInAtUtc: string;
  punchOutAtUtc: string | null;
  status: AttendanceSessionStatus;
  isTracked: boolean;
  punchInLatitude: number | null;
  punchInLongitude: number | null;
  punchOutLatitude: number | null;
  punchOutLongitude: number | null;
  segments: TrackedSegment[];
  stops: TrackStop[];
  /** Received but not yet matched to roads (processing runs every few minutes). */
  pendingPoints: TrackPoint[];
  punchIn: PunchDetail;
  /** Null while the session is still open. */
  punchOut: PunchDetail | null;
}

export interface FieldTrackingDay {
  userId: number;
  fullName: string;
  email: string;
  workDate: string;
  timeZone: string;
  distanceMeters: number;
  inferredDistanceMeters: number;
  stopCount: number;
  mockPointCount: number;
  pointCount: number;
  battery: BatterySample[];
  sessions: TrackedSession[];
}

export const rosterStatusMeta: Record<AttendanceRosterStatus, { label: string; tone: string }> = {
  [AttendanceRosterStatus.In]: { label: 'In', tone: 'success' },
  [AttendanceRosterStatus.Out]: { label: 'Out', tone: 'info' },
  [AttendanceRosterStatus.NotIn]: { label: 'Not in', tone: 'neutral' },
  [AttendanceRosterStatus.OnLeave]: { label: 'On leave', tone: 'warning' },
  [AttendanceRosterStatus.Holiday]: { label: 'Holiday', tone: 'warning' },
};

export const dayStatusMeta: Record<AttendanceDayStatus, { label: string; tone: string }> = {
  [AttendanceDayStatus.NoRecord]: { label: 'No record', tone: 'neutral' },
  [AttendanceDayStatus.Present]: { label: 'Present', tone: 'success' },
  [AttendanceDayStatus.Incomplete]: { label: 'Incomplete', tone: 'danger' },
  [AttendanceDayStatus.OnLeave]: { label: 'On leave', tone: 'warning' },
  [AttendanceDayStatus.Holiday]: { label: 'Holiday', tone: 'warning' },
};

export const sessionStatusLabel: Record<AttendanceSessionStatus, string> = {
  [AttendanceSessionStatus.Open]: 'Open',
  [AttendanceSessionStatus.Closed]: 'Closed',
  [AttendanceSessionStatus.AutoClosed]: 'Auto-closed (punch-out forgotten)',
  [AttendanceSessionStatus.Adjusted]: 'Adjusted',
};

/** Decodes an encoded polyline at precision 6 into [lat, lng] pairs. */
export function decodePolyline(encoded: string, precision = 6): [number, number][] {
  const factor = Math.pow(10, precision);
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  const read = (): number => {
    let result = 0;
    let shift = 0;
    let chunk: number;
    do {
      chunk = encoded.charCodeAt(index++) - 63;
      result |= (chunk & 0x1f) << shift;
      shift += 5;
    } while (chunk >= 0x20 && index < encoded.length);
    return result & 1 ? ~(result >> 1) : result >> 1;
  };
  while (index < encoded.length) {
    lat += read();
    if (index >= encoded.length) break;
    lng += read();
    points.push([lat / factor, lng / factor]);
  }
  return points;
}

/** Minutes as "7h 05m". */
export function formatMinutes(minutes: number): string {
  const total = Math.max(0, Math.round(minutes));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h > 0 ? `${h}h ${m.toString().padStart(2, '0')}m` : `${m}m`;
}

/** Today's date as `yyyy-MM-dd` in the browser's zone. */
export function localIsoDate(date = new Date()): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}
