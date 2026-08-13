import { Email, MaxLength, Pattern, Required } from '@shared/validations';

/**
 * Declarative validation model for the sign-in form. Deliberately thin: the API decides whether a
 * credential pair is valid, so the client only checks that both fields are present and that the
 * email is well-formed — a password *policy* here would reject legitimate older passwords.
 */
export class LoginFormModel {
  @Required('Email is required.')
  @Email('Enter a valid email address.')
  @MaxLength(256, 'Email is too long.')
  email = '';

  @Required('Password is required.')
  password = '';
}

export class LoginCodeFormModel {
  @Required('Email is required.')
  @Email('Enter a valid email address.')
  @MaxLength(256, 'Email is too long.')
  email = '';

  @Required('Enter the 6-digit code from your email.')
  @Pattern(/^\d{6}$/, 'Code must contain exactly 6 digits.')
  code = '';
}
