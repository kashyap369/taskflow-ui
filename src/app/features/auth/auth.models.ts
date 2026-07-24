import { AccountType, SystemRole } from '@core/auth/roles.enum';
import { User } from '@core/models/user.model';

// ── Requests ──────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

// ── Responses (mirror the API DTOs) ───────────────────────

/** Mirrors `LoginUserResponseDto`. Roles are system roles; account type is NOT here. */
export interface LoginResponse {
  userId: number;
  fullName: string;
  email: string;
  token: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  roles: string[];
}

/** Mirrors `UserDetailDto` from `GET /user/me`. `accountType` is the API enum int (1/2). */
export interface UserProfileResponse {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  status: number;
  accountType: number;
  isEmailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

// ── Mappers (anti-corruption: API DTO → session model) ────

const KNOWN_ROLES: readonly SystemRole[] = ['Admin', 'Manager', 'User'];

/** Keep only roles the frontend understands, typed as `SystemRole`. */
export function mapSystemRoles(roles: string[] | undefined): SystemRole[] {
  return (roles ?? []).filter((r): r is SystemRole =>
    (KNOWN_ROLES as readonly string[]).includes(r),
  );
}

/** API sends AccountType as an int: Individual = 1, Organization = 2. */
export function mapAccountType(value: number): AccountType {
  return value === 2 ? AccountType.Organization : AccountType.Individual;
}

/** Build the session principal from the login response (roles/identity) + profile (account type). */
export function toUser(login: LoginResponse, profile: UserProfileResponse): User {
  return {
    id: login.userId,
    fullName: login.fullName || profile.fullName,
    email: login.email || profile.email,
    roles: mapSystemRoles(login.roles),
    accountType: mapAccountType(profile.accountType),
  };
}
