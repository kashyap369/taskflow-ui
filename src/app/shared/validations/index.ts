// Public surface of the FluentValidation-style validation engine.
// Import from `@shared/validations` — never reach into subfolders.

export * from './models/validation-types';
export {
  Required,
  IsTrue,
  MinLength,
  MaxLength,
  Email,
  Pattern,
  Min,
  Max,
  Matches,
  Custom,
} from './decorators/validation-decorators';
export type { ModelCtor } from './metadata/validation-registry';
export { getRules, validatedProperties } from './metadata/validation-registry';
export {
  validate,
  controlValidators,
  crossFieldValidator,
  fieldMessage,
  messageFor,
} from './engine/validation-engine';
