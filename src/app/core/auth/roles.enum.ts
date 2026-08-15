/**
 * Auth vocabulary shared across guards, the session store, and features.
 *
 * The API models two orthogonal things:
 *  - **System role** (JWT claim / login response): `Admin` | `Manager` | `User`.
 *  - **Account type** (from `/user/me`): `Individual` | `Organization`.
 *
 * A user's **portal** (which layout they land in) is derived from both. See docs/DESIGN.md and
 * ARCHITECTURE.md §8.
 */

/** System roles — the exact strings the API returns in the login response / JWT. */
export type SystemRole = 'Admin' | 'Manager' | 'User';

export const SYSTEM_ROLE = {
  Admin: 'Admin',
  Manager: 'Manager',
  User: 'User',
} as const;

/** Account type — the API sends an int (Individual = 1, Organization = 2); we model it as a union. */
export enum AccountType {
  Individual = 'Individual',
  Organization = 'Organization',
}

/** A portal = one layout + one guarded route branch. */
export type Portal = 'admin' | 'organization' | 'member';

/** Landing route for each portal. */
export const PORTAL_HOME: Record<Portal, string> = {
  admin: '/admin',
  organization: '/organization',
  member: '/member',
};

/**
 * Resolve which portal a principal belongs to.
 * Admin role wins; otherwise route by account type (Organization → org, Individual → member).
 */
export function resolvePortal(roles: SystemRole[], accountType: AccountType): Portal {
  if (roles.includes('Admin')) {
    return 'admin';
  }

  if (accountType === AccountType.Organization) {
    return 'organization';
  }

  return 'member';
}

/**
 * Portal access is intentionally broader than the default landing portal. Individual accounts
 * keep the personal portal as home, but may also enter organization workspaces they have joined.
 * Organization accounts do not get a separate personal-task workspace, and admins stay isolated
 * in the administration portal.
 */
export function canAccessPortal(primaryPortal: Portal, requestedPortal: Portal): boolean {
  if (primaryPortal === 'member') {
    return requestedPortal === 'member' || requestedPortal === 'organization';
  }

  return primaryPortal === requestedPortal;
}
