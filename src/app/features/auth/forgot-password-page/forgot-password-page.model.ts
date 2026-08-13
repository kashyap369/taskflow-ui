import { Email, Matches, MaxLength, MinLength, Pattern, Required } from '@shared/validations';

export class ForgotPasswordFormModel {
  @Required('Email is required.')
  @Email('Enter a valid email address.')
  @MaxLength(256, 'Email is too long.')
  email = '';

  @Required('Enter the 6-digit code from your email.')
  @Pattern(/^\d{6}$/, 'Code must contain exactly 6 digits.')
  code = '';

  @Required('New password is required.')
  @MinLength(8, 'Use at least 8 characters.')
  @Pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, 'Include an uppercase letter, a lowercase letter, and a number.')
  newPassword = '';

  @Required('Please confirm your new password.')
  @Matches('newPassword', "Passwords don't match.")
  confirmPassword = '';
}
