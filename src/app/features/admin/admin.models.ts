// ============================================================
// Admin (platform) feature — DTOs + enums + label/tone helpers.
// The API returns raw values (NO ApiResponse<T> envelope) for every
// controller except Auth, so these types are the bare response shapes.
// ============================================================

import { Tone } from '@shared/models/tone.model';

// ── Enums (exact API int values, mirroring TaskFlow.Domain.Enums.Identity) ──
export enum UserStatus {
  Active = 1,
  Inactive = 2,
  Suspended = 3,
  PendingVerification = 4,
}

export enum AccountType {
  Individual = 1,
  Organization = 2,
}

// ── Response DTOs (mirror the API query DTOs) ─────────────

/** `GET /user` (AdminOnly) → UserListItemDto[] */
export interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  status: UserStatus;
  accountType: AccountType;
}

/** `GET /user/{id}` → UserDetailDto */
export interface AdminUserDetail {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  status: UserStatus;
  accountType: AccountType;
  isEmailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

// ── UI label / tone helpers ───────────────────────────────

/** A tone maps to the design-system color families used by badges/cards (see `@shared/models`). */
export type { Tone };

export const USER_STATUS_META: Record<UserStatus, { label: string; tone: Tone }> = {
  [UserStatus.Active]: { label: 'Active', tone: 'success' },
  [UserStatus.Inactive]: { label: 'Inactive', tone: 'neutral' },
  [UserStatus.Suspended]: { label: 'Suspended', tone: 'danger' },
  [UserStatus.PendingVerification]: { label: 'Pending', tone: 'warning' },
};

export const ACCOUNT_TYPE_META: Record<AccountType, { label: string; tone: Tone }> = {
  [AccountType.Individual]: { label: 'Individual', tone: 'info' },
  [AccountType.Organization]: { label: 'Organization', tone: 'purple' },
};

export function userStatusMeta(status: UserStatus): { label: string; tone: Tone } {
  return USER_STATUS_META[status] ?? { label: 'Unknown', tone: 'neutral' };
}

export function accountTypeMeta(accountType: AccountType): { label: string; tone: Tone } {
  return ACCOUNT_TYPE_META[accountType] ?? { label: 'Unknown', tone: 'neutral' };
}
