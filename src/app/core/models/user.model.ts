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
}
