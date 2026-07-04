import { Role } from '../auth/roles.enum';

/** The authenticated user (domain view of the session principal). */
export interface User {
  id: number;
  fullName: string;
  email: string;
  roles: Role[];
}
