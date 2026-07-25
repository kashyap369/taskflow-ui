import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { getRules, ModelCtor, validatedProperties } from '../metadata/validation-registry';
import {
  ValidatableModel,
  ValidationFailure,
  ValidationResult,
} from '../models/validation-types';

// ============================================================
// The runtime. Two ways to use the declared rules:
//   1. `validate(Model, obj)`      → pure check, returns a ValidationResult.
//   2. Angular adapters:
//        `controlValidators(Model)`  → per-property ValidatorFns for a reactive form.
//        `crossFieldValidator(Model)`→ one group-level ValidatorFn for cross-field rules.
//        `fieldMessage(control)`     → the message a control/group currently carries.
// The Angular validators are pure functions (they never call setErrors),
// so they can't cause the recursive-update pitfall.
// ============================================================

/** Error key both adapters write, so `fieldMessage` can read either. */
const ERROR_KEY = 'validation';

/**
 * Run every declared rule against a model instance (or plain object) and collect the failures.
 * Accepts any object — class instances don't carry an index signature, so we read through a cast.
 */
export function validate(model: ModelCtor, value: object): ValidationResult {
  const rules = getRules(model);
  const obj = value as ValidatableModel;
  const failures: ValidationFailure[] = [];

  for (const [property, propertyRules] of rules) {
    for (const r of propertyRules) {
      if (!r.validate(obj[property], obj)) {
        failures.push({ property, rule: r.rule, message: r.message });
      }
    }
  }

  return new ValidationResult(failures);
}

/** Shape written under the `validation` error key. */
interface ValidationError {
  rule: string;
  message: string;
  property: string;
}

/**
 * Build one `ValidatorFn` per property carrying `field`-scoped rules. Spread the result into a
 * `FormBuilder` group so each control validates itself and shows `.ng-invalid` naturally.
 * Cross-field (`model`-scoped) rules are handled by `crossFieldValidator`.
 */
export function controlValidators(model: ModelCtor): Record<string, ValidatorFn> {
  const rules = getRules(model);
  const validators: Record<string, ValidatorFn> = {};

  for (const property of validatedProperties(model)) {
    const fieldRules = (rules.get(property) ?? []).filter((r) => r.scope === 'field');
    if (fieldRules.length === 0) {
      continue;
    }

    validators[property] = (control: AbstractControl): ValidationErrors | null => {
      for (const r of fieldRules) {
        // `field` rules depend only on the control's own value.
        if (!r.validate(control.value, {})) {
          const error: ValidationError = { rule: r.rule, message: r.message, property };
          return { [ERROR_KEY]: error };
        }
      }
      return null;
    };
  }

  return validators;
}

/**
 * Build a single group-level `ValidatorFn` covering all `model`-scoped (cross-field) rules
 * (e.g. `@Matches`). Attach it to the `FormGroup`. Returns the first cross-field failure, tagged
 * with the property it belongs to, so `fieldMessage` can surface it under the right field.
 */
export function crossFieldValidator(model: ModelCtor): ValidatorFn {
  const rules = getRules(model);

  const crossRules = [...rules].flatMap(([property, propertyRules]) =>
    propertyRules.filter((r) => r.scope === 'model').map((r) => ({ property, ...r })),
  );

  return (group: AbstractControl): ValidationErrors | null => {
    const value = (group.value ?? {}) as ValidatableModel;
    for (const r of crossRules) {
      if (!r.validate(value[r.property], value)) {
        const error: ValidationError = { rule: r.rule, message: r.message, property: r.property };
        return { [ERROR_KEY]: error };
      }
    }
    return null;
  };
}

/** Read the message a control (or group) currently carries under the `validation` key, if any. */
export function fieldMessage(control: AbstractControl | null | undefined): string | null {
  const error = control?.errors?.[ERROR_KEY] as ValidationError | undefined;
  return error?.message ?? null;
}

/**
 * The message to show for `property` in a form validated by this engine: prefer the control's own
 * (field) error, then fall back to a cross-field error on the group that targets this property.
 * Returns `null` unless the control is touched (so pristine fields stay quiet).
 */
export function messageFor(group: AbstractControl, property: string): string | null {
  const control = group.get(property);
  if (!control || !(control.touched || control.dirty)) {
    return null;
  }

  const own = fieldMessage(control);
  if (own) {
    return own;
  }

  const groupError = group.errors?.[ERROR_KEY] as ValidationError | undefined;
  return groupError?.property === property ? groupError.message : null;
}
