import { MeetingAccessLevel, MeetingAccessLinkMode, MeetingParticipantState } from '@features/organization/meetings.models';

export interface MeetingGuestAccess {
  title: string; description: string | null; scheduledStartUtc: string | null; timeZone: string;
  hostName: string; mode: MeetingAccessLinkMode; lockedEmailHint: string | null;
  accessLevel: MeetingAccessLevel; badgeLabel: string | null; loggedInEmailMatches: boolean;
}
export interface MeetingGuestSession {
  meetingId: number; participantId: number; title: string; description: string | null;
  scheduledStartUtc: string | null; timeZone: string; hostName: string; displayName: string;
  email: string; accessLevel: MeetingAccessLevel; badgeLabel: string | null;
  state: MeetingParticipantState; expiresAtUtc: string;
}
export interface VerifiedMeetingGuest { sessionToken: string; expiresAtUtc: string; session: MeetingGuestSession; }
