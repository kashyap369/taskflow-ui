export enum MeetingStatus { Draft = 1, Scheduled = 2, Live = 3, Ended = 4, Cancelled = 5 }
export enum MeetingAccessLevel { Host = 1, CoHost = 2, Participant = 3, Viewer = 4 }
export enum MeetingParticipantState { Invited = 1, Admitted = 2, Revoked = 3 }

export interface MeetingBadgeInput { label: string; color: string; icon: string | null; }
export interface MeetingBadge extends MeetingBadgeInput { id: number; }
export interface MeetingListItem {
  id: number; organizationId: number; title: string; description: string | null;
  status: MeetingStatus; scheduledStartUtc: string | null; scheduledEndUtc: string | null;
  timeZone: string; actualStartUtc: string | null; actualEndUtc: string | null;
  createdByUserId: number; creatorName: string; participantCount: number;
}
export interface MeetingPage { items: MeetingListItem[]; total: number; skip: number; take: number; }
export interface MeetingParticipant {
  id: number; userId: number | null; displayName: string | null; email: string | null;
  accessLevel: MeetingAccessLevel; badgeDefinitionId: number | null; state: MeetingParticipantState;
}
export interface MeetingDetail extends MeetingListItem {
  lobbyEnabled: boolean; guestsAllowed: boolean; participantsCanPublish: boolean;
  participantsCanShareScreen: boolean; participantsCanEditNote: boolean; viewersCanChat: boolean;
  retentionDays: number; canManage: boolean; badges: MeetingBadge[]; participants: MeetingParticipant[];
}
export interface MeetingPayload {
  organizationId?: number; title: string; description: string | null;
  scheduledStartUtc: string | null; scheduledEndUtc: string | null; timeZone: string;
  lobbyEnabled: boolean; guestsAllowed: boolean; participantsCanPublish: boolean;
  participantsCanShareScreen: boolean; participantsCanEditNote: boolean; viewersCanChat: boolean;
  retentionDays: number; badges?: MeetingBadgeInput[]; participantUserIds?: number[];
}
export interface MeetingListQuery {
  fromUtc: string; toUtc: string; status?: MeetingStatus; search?: string; skip?: number; take?: number;
}

export const meetingStatusMeta = (status: MeetingStatus): { label: string; tone: string } => ({
  [MeetingStatus.Draft]: { label: 'Ready anytime', tone: 'neutral' },
  [MeetingStatus.Scheduled]: { label: 'Scheduled', tone: 'info' },
  [MeetingStatus.Live]: { label: 'Live', tone: 'success' },
  [MeetingStatus.Ended]: { label: 'Ended', tone: 'neutral' },
  [MeetingStatus.Cancelled]: { label: 'Cancelled', tone: 'danger' },
}[status]);

export const accessLevelLabel = (level: MeetingAccessLevel): string => ({
  [MeetingAccessLevel.Host]: 'Host', [MeetingAccessLevel.CoHost]: 'Co-host',
  [MeetingAccessLevel.Participant]: 'Participant', [MeetingAccessLevel.Viewer]: 'Viewer',
}[level]);
