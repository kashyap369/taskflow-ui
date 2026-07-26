import { Email, Min, MaxLength, Required } from '@shared/validations';

/**
 * Declarative validation models for every form in the organization portal, built on the
 * `shared/validations` decorator engine (see CONVENTIONS.md § Forms).
 *
 * They live at the **feature** level rather than as per-page `*.model.ts` files because several
 * pages open the same form: the task drawer exists on both `tasks-page` and `project-detail-page`,
 * and the team drawer on both `teams-page` and `team-detail-page`. One model per *concept* keeps
 * the two copies from drifting.
 *
 * Every length mirrors the backend command validator for that endpoint — where they differ
 * (organization create vs. update), the difference is the API's, not ours.
 */

/** `CreateOrganizationCommand` — the onboarding form on the dashboard. */
export class OrganizationFormModel {
  @Required('An organization name is required.')
  @MaxLength(150, 'Name is too long (max 150).')
  name = '';

  @MaxLength(500, 'Description is too long (max 500).')
  description = '';
}

/** `UpdateOrganizationCommand` — the settings page. Note the wider limits than create. */
export class OrganizationSettingsFormModel {
  @Required('An organization name is required.')
  @MaxLength(200, 'Name cannot exceed 200 characters.')
  name = '';

  @MaxLength(1000, 'Description cannot exceed 1000 characters.')
  description = '';
}

/** `CreateProjectCommand` / `UpdateProjectCommand`. */
export class ProjectFormModel {
  @Required('A title is required.')
  @MaxLength(200, 'Title is too long (max 200).')
  title = '';

  @MaxLength(1000, 'Description is too long (max 1000).')
  description = '';

  @Required('A start date is required.')
  startDate = '';
}

/** `CreateTaskCommand` / `UpdateTaskCommand`. */
export class TaskFormModel {
  @Required('A title is required.')
  @MaxLength(200, 'Title is too long (max 200).')
  title = '';

  @MaxLength(1000, 'Description is too long (max 1000).')
  description = '';

  @Required('Pick a priority.')
  priority = '';

  @Required('A start date is required.')
  startDate = '';
}

/** `CreateSubTaskCommand` / `UpdateSubTaskCommand` — also used by the inline rename. */
export class SubTaskFormModel {
  @Required('A subtask title is required.')
  @MaxLength(200, 'Title is too long (max 200).')
  title = '';
}

/** `POST /worklog/manual` — a hand-entered time range. */
export class ManualWorkLogFormModel {
  @Required('A start time is required.')
  startedAt = '';

  @Required('An end time is required.')
  endedAt = '';

  @MaxLength(1000, 'Notes are too long (max 1000).')
  notes = '';
}

/** `POST /worklog/start` / `PUT /worklog/stop` — notes only. */
export class TimerNotesFormModel {
  @MaxLength(1000, 'Notes are too long (max 1000).')
  notes = '';
}

/** `CreateTeamCommand` / `UpdateTeamCommand`. */
export class TeamFormModel {
  @Required('A team name is required.')
  @MaxLength(100, 'Name is too long (max 100).')
  name = '';

  @MaxLength(500, 'Description is too long (max 500).')
  description = '';
}

/** `CreateOrganizationRoleCommand` / `UpdateOrganizationRoleCommand`. */
export class RoleFormModel {
  @Required('A role name is required.')
  @MaxLength(100, 'Name is too long (max 100).')
  name = '';

  @MaxLength(500, 'Description is too long (max 500).')
  description = '';
}

/** `InviteMemberCommand` — email + the role to invite into. */
export class InviteFormModel {
  @Required('An email address is required.')
  @Email('Enter a valid email address.')
  @MaxLength(256, 'Email is too long.')
  email = '';

  @Min(1, 'Choose a role for this member.')
  organizationRoleId = 0;
}
