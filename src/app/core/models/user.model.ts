import { AccountType, SystemRole } from '../auth/roles.enum';

/** The authenticated user (domain view of the session principal). */
export interface User {
  id: number;
  fullName: string;
  email: string;

  /** System roles from the JWT / login response. */
  roles: SystemRole[];

  /** Individual (solo) vs Organization — from `/user/me`. */
  accountType: AccountType;

  /**
   * Whether this *account* has been through the first-run welcome, from
   * `/user/me`. Server-side rather than per-browser on purpose: the
   * welcome is a promise about the account, so clearing site data or
   * signing in from a second machine must not replay it.
   *
   * Optional because a session persisted by an older build has no such
   * field. Treat anything but an explicit `false` as "already seen" —
   * showing the welcome to an established user is the failure worth
   * avoiding, not withholding it from one edge case.
   */
  hasCompletedOnboarding?: boolean;
}
