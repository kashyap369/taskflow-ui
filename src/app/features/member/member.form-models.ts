import { MaxLength, Required } from '@shared/validations';

/**
 * Declarative validation models for the Member (Individual) portal, built on the
 * `shared/validations` decorator engine. Lengths mirror the backend command validators.
 *
 * These are separate from `organization.form-models.ts` on purpose: a personal task has no
 * project and no assignee, and the create route (`POST /task/personal`) rejects both — so sharing
 * the org model would invite fields the API refuses.
 */

/** `POST /task/personal` and `PUT /task` for a personal task. */
export class PersonalTaskFormModel {
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

/** `POST /subtask` and the inline rename. */
export class SubTaskFormModel {
  @Required('A subtask title is required.')
  @MaxLength(200, 'Title is too long (max 200).')
  title = '';
}

/** `POST /worklog/manual`. */
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
