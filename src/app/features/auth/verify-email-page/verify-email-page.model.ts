import { Email, MaxLength, Required } from '@shared/validations';

/** The resend form — one field, but it goes through the same engine as every other form. */
export class ResendVerificationFormModel {
  @Required('Enter the email you registered with.')
  @Email('Enter a valid email address.')
  @MaxLength(256, 'Email is too long.')
  email = '';
}
