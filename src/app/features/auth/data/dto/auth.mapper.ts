import { Role } from '@core/auth/roles.enum';
import { User } from '@core/models/user.model';

import { LoginResponse } from './login-response';

/**
 * Anti-corruption mapping: auth API DTO -> domain/session model.
 * Roles are not yet returned by the API, so we default to MEMBER;
 * adjust once the backend includes role claims.
 */
export function toUser(response: LoginResponse): User {
  return {
    id: response.userId,
    fullName: response.fullName,
    email: response.email,
    roles: [Role.Member],
  };
}
