/**
 * Application roles. Each role maps to a portal (layout + guarded route branch).
 * Kept as string values so they serialize cleanly to/from the API and JWT claims.
 */
export enum Role {
  Admin = 'ADMIN',
  Organization = 'ORG',
  Member = 'MEMBER',
  Guest = 'GUEST',
}
