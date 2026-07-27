import { Email, MaxLength, Required } from '@shared/validations';

/**
 * Declarative validation models for the platform Admin portal's forms, built on the
 * `shared/validations` decorator engine (see CONVENTIONS.md § Forms).
 *
 * Every rule mirrors `UpdatePlatformSettingsCommandValidator` on the API.
 */

/** `UpdatePlatformSettingsCommand` — the one editable form in the admin portal. */
export class PlatformSettingsFormModel {
  @Required('An application name is required.')
  @MaxLength(200, 'Application name cannot exceed 200 characters.')
  applicationName = '';

  // Optional on the API (`.When(...)` guards the email rule), and every decorator except
  // `@Required` passes on an empty value — so leaving it blank is valid here too.
  @Email('Enter a valid email address.')
  @MaxLength(256, 'Support email cannot exceed 256 characters.')
  supportEmail = '';

  @MaxLength(1000, 'Maintenance message cannot exceed 1000 characters.')
  maintenanceMessage = '';
}
