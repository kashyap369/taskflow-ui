import { Tone } from './tone.model';

/**
 * An organization's lifecycle status (exact API int values, mirroring
 * `TaskFlow.Domain.Enums.Organizations.OrganizationStatus`).
 *
 * Lives in `shared` because two features classify it: the **organization** portal renders it on its
 * own settings page, and the **admin** portal renders it for every organization on the platform
 * (`GET /admin/organizations`). Same enum, same badge — one definition, per the `Tone` /
 * `InvitationStatus` precedent.
 */
export enum OrganizationStatus {
  Active = 1,
  Inactive = 2,
  Suspended = 3,
}

export const ORGANIZATION_STATUS_META: Record<OrganizationStatus, { label: string; tone: Tone }> = {
  [OrganizationStatus.Active]: { label: 'Active', tone: 'success' },
  [OrganizationStatus.Inactive]: { label: 'Inactive', tone: 'neutral' },
  [OrganizationStatus.Suspended]: { label: 'Suspended', tone: 'danger' },
};

export function organizationStatusMeta(status: OrganizationStatus): { label: string; tone: Tone } {
  return ORGANIZATION_STATUS_META[status] ?? { label: 'Unknown', tone: 'neutral' };
}
