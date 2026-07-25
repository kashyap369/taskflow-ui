import { Tone } from './tone.model';

/**
 * Organization invitations, shared by both sides of the flow:
 * - the **inviter** (organization portal) lists/cancels them via `GET /organizationinvitation/organization/{id}`
 * - the **invitee** (member portal) lists/accepts/rejects their own via `GET /organizationinvitation/mine`
 *
 * Both endpoints return the same raw `OrganizationInvitationDto`, hence one model in `shared`.
 */
export enum InvitationStatus {
  Pending = 1,
  Accepted = 2,
  Rejected = 3,
  Expired = 4,
  Cancelled = 5,
}

export interface OrganizationInvitation {
  id: number;
  organizationId: number;
  organizationName: string;
  email: string;
  organizationRoleId: number;
  roleName: string;
  status: InvitationStatus;
  expiryDate: string;
  createdAt: string;
}

export const INVITATION_STATUS_META: Record<InvitationStatus, { label: string; tone: Tone }> = {
  [InvitationStatus.Pending]: { label: 'Pending', tone: 'warning' },
  [InvitationStatus.Accepted]: { label: 'Accepted', tone: 'success' },
  [InvitationStatus.Rejected]: { label: 'Rejected', tone: 'danger' },
  [InvitationStatus.Expired]: { label: 'Expired', tone: 'neutral' },
  [InvitationStatus.Cancelled]: { label: 'Cancelled', tone: 'neutral' },
};

export function invitationStatusMeta(status: InvitationStatus): { label: string; tone: Tone } {
  return INVITATION_STATUS_META[status] ?? { label: 'Unknown', tone: 'neutral' };
}

/** `GET /mine` only returns pending invitations, but they can still be past their expiry date. */
export function isExpired(invitation: OrganizationInvitation, now: Date = new Date()): boolean {
  return new Date(invitation.expiryDate).getTime() < now.getTime();
}
