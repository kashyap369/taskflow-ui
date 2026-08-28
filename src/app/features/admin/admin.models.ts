// ============================================================
// Admin (platform) feature — DTOs + enums + label/tone helpers.
// The API returns raw values (NO ApiResponse<T> envelope) for every
// controller except Auth, so these types are the bare response shapes.
// ============================================================

import { Tone } from '@shared/models/tone.model';
import { OrganizationStatus } from '@shared/models/organization-status.model';
export type { PlannerTemplate, PlannerTemplateDefinition } from '@core/models/planner-template.model';

// Organization status is the same enum the organization portal renders, so it lives in
// `shared/models`. Re-exported so `admin.models` stays the one import for admin pages.
export {
  ORGANIZATION_STATUS_META,
  OrganizationStatus,
  organizationStatusMeta,
} from '@shared/models/organization-status.model';

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

/**
 * `GET /admin/organizations` (AdminOnly) → AdminOrganizationListItemDto[].
 *
 * Distinct from `GET /organization/mine`, which returns only the caller's own — a platform admin
 * belongs to no organization, so `/mine` is always empty for them. This is the only route that
 * sees every workspace, and the only one carrying the owner and the three counts.
 */
export interface AdminOrganization {
  id: number;
  name: string;
  description: string | null;
  ownerUserId: number;
  ownerFullName: string;
  ownerEmail: string;
  status: OrganizationStatus;
  memberCount: number;
  projectCount: number;
  taskCount: number;
  createdAt: string;
}

/**
 * `GET /admin/settings` → PlatformSettingDto (a singleton row).
 *
 * Both flags are really enforced by the API — `registrationOpen: false` makes `POST /auth/register`
 * return **403 `REGISTRATION_CLOSED`**, and `maintenanceMode: true` makes every non-admin request
 * return **503 `MAINTENANCE_MODE`** carrying `maintenanceMessage`. Nothing here is cosmetic.
 */
export interface PlatformSettings {
  id: number;
  applicationName: string;
  supportEmail: string | null;
  registrationOpen: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  createdAt: string;
  updatedAt: string | null;
}

/** `PUT /admin/settings` → UpdatePlatformSettingsCommand (all five editable fields, returns 204). */
export interface UpdatePlatformSettingsPayload {
  applicationName: string;
  supportEmail: string | null;
  registrationOpen: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
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
