import {
  Email,
  IsTrue,
  Matches,
  MaxLength,
  MinLength,
  Pattern,
  Required,
} from '@shared/validations';

/**
 * Declarative validation model for the register form — the first consumer of the
 * `shared/validations` engine. Rules mirror the backend `RegisterUserCommandValidator`
 * (names ≤ 100, email, phone 10–20, password ≥ 8 with upper/lower/digit) plus the client-only
 * confirm-password match and terms acceptance. The `register-page` builds its reactive form's
 * validators from these decorators via `controlValidators` + `crossFieldValidator`.
 */
export class RegisterFormModel {
  @Required('First name is required.')
  @MaxLength(100, 'First name is too long (max 100).')
  firstName = '';

  @Required('Last name is required.')
  @MaxLength(100, 'Last name is too long (max 100).')
  lastName = '';

  @Required('Email is required.')
  @Email('Enter a valid email address.')
  @MaxLength(256, 'Email is too long.')
  email = '';

  @Required('Phone number is required.')
  @MinLength(10, 'Enter a valid phone number (at least 10 digits).')
  @MaxLength(20, 'Phone number is too long (max 20).')
  phoneNumber = '';

  @Required('Password is required.')
  @MinLength(8, 'Min 8 chars with an uppercase, a lowercase, and a number.')
  @Pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, 'Min 8 chars with an uppercase, a lowercase, and a number.')
  password = '';

  @Required('Please confirm your password.')
  @Matches('password', "Passwords don't match.")
  confirmPassword = '';

  @IsTrue('Please accept the Terms of Service to continue.')
  acceptTerms = false;
}
