import { RuleScope, ValidatableModel } from '../models/validation-types';
import { registerRule } from '../metadata/validation-registry';

// ============================================================
// Property decorators — the fluent, declarative surface of the
// engine. Each returns a `PropertyDecorator` that registers a
// rule for the decorated property. They rely on legacy decorators
// (`experimentalDecorators: true`), so `target` is the class
// prototype and `property` is the key.
//
// Convention: every rule EXCEPT `@Required`/`@IsTrue` PASSES on an
// empty value, so an optional field isn't flagged by `@MaxLength`
// etc. until `@Required` is also present — exactly like
// FluentValidation's `.NotEmpty()` + `.MaximumLength()` chaining.
// ============================================================

/** Empty = null / undefined / empty-or-whitespace string. */
function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
}

/** Shared factory: build a `PropertyDecorator` that registers one rule. */
function rule(input: {
  rule: string;
  message: string;
  scope?: RuleScope;
  validate: (value: unknown, model: ValidatableModel) => boolean;
}): PropertyDecorator {
  return (target, property) => {
    registerRule(target, String(property), input);
  };
}

/** Value must be present (non-empty). */
export function Required(message = 'This field is required.'): PropertyDecorator {
  return rule({ rule: 'required', message, validate: (value) => !isEmpty(value) });
}

/** Boolean value must be exactly `true` (e.g. an "accept terms" checkbox). */
export function IsTrue(message = 'This must be accepted.'): PropertyDecorator {
  return rule({ rule: 'isTrue', message, validate: (value) => value === true });
}

/** String length ≥ `min`. Passes when empty. */
export function MinLength(min: number, message?: string): PropertyDecorator {
  return rule({
    rule: 'minLength',
    message: message ?? `Must be at least ${min} characters.`,
    validate: (value) => isEmpty(value) || String(value).length >= min,
  });
}

/** String length ≤ `max`. Passes when empty. */
export function MaxLength(max: number, message?: string): PropertyDecorator {
  return rule({
    rule: 'maxLength',
    message: message ?? `Must be at most ${max} characters.`,
    validate: (value) => isEmpty(value) || String(value).length <= max,
  });
}

/** Basic email shape. Passes when empty. */
export function Email(message = 'Enter a valid email address.'): PropertyDecorator {
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return rule({
    rule: 'email',
    message,
    validate: (value) => isEmpty(value) || EMAIL.test(String(value)),
  });
}

/** Value must match a regular expression. Passes when empty. */
export function Pattern(pattern: RegExp, message = 'Invalid format.'): PropertyDecorator {
  return rule({
    rule: 'pattern',
    message,
    // Reset lastIndex so a global-flag regex stays stateless across calls.
    validate: (value) => {
      if (isEmpty(value)) {
        return true;
      }
      pattern.lastIndex = 0;
      return pattern.test(String(value));
    },
  });
}

/** Numeric value ≥ `min`. Passes when empty. */
export function Min(min: number, message?: string): PropertyDecorator {
  return rule({
    rule: 'min',
    message: message ?? `Must be ${min} or more.`,
    validate: (value) => isEmpty(value) || Number(value) >= min,
  });
}

/** Numeric value ≤ `max`. Passes when empty. */
export function Max(max: number, message?: string): PropertyDecorator {
  return rule({
    rule: 'max',
    message: message ?? `Must be ${max} or less.`,
    validate: (value) => isEmpty(value) || Number(value) <= max,
  });
}

/**
 * Cross-field rule: this property must equal the value of `otherProperty`
 * (e.g. `confirmPassword` matches `password`). Runs at the model/group level.
 * Passes when this value is empty (let `@Required` own the empty case).
 */
export function Matches(otherProperty: string, message?: string): PropertyDecorator {
  return rule({
    rule: 'matches',
    scope: 'model',
    message: message ?? `Must match ${otherProperty}.`,
    validate: (value, model) => isEmpty(value) || value === model[otherProperty],
  });
}

/**
 * Escape hatch for a bespoke predicate. `scope` defaults to `field`; pass `model` when the
 * predicate reads sibling properties.
 */
export function Custom(
  ruleName: string,
  message: string,
  predicate: (value: unknown, model: ValidatableModel) => boolean,
  scope: RuleScope = 'field',
): PropertyDecorator {
  return rule({ rule: ruleName, message, scope, validate: predicate });
}
