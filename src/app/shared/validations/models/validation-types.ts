// ============================================================
// Core types for the FluentValidation-style validation engine.
// The engine is decorator-driven: rules are declared on a plain
// model class with property decorators, collected in a registry,
// and run by the engine either as a pure check or as Angular
// reactive-form ValidatorFns. See ../README-style notes in
// docs/CONVENTIONS.md "Forms".
// ============================================================

/** A model is any object keyed by string. Decorated model classes are validated as instances. */
export type ValidatableModel = Record<string, unknown>;

/**
 * Scope tells the engine where a rule runs:
 *  - `field`  → depends only on the property's own value (maps to a per-control ValidatorFn).
 *  - `model`  → depends on other properties too (cross-field, e.g. `@Matches`); runs at the group level.
 */
export type RuleScope = 'field' | 'model';

/**
 * A single validation rule attached to one property.
 * `validate` returns `true` when the value is VALID. It receives the property value and the whole
 * model (so cross-field rules can compare siblings).
 */
export interface ValidationRule {
  /** Stable rule name (e.g. `required`, `maxLength`) — surfaced as the error key. */
  readonly rule: string;
  /** Human-readable message shown when the rule fails. */
  readonly message: string;
  /** `true` = valid. */
  readonly validate: (value: unknown, model: ValidatableModel) => boolean;
  readonly scope: RuleScope;
}

/** One failed rule for one property. */
export interface ValidationFailure {
  readonly property: string;
  readonly rule: string;
  readonly message: string;
}

/** The outcome of validating a whole model. Immutable; query it with the helper methods. */
export class ValidationResult {
  constructor(readonly failures: readonly ValidationFailure[]) {}

  get isValid(): boolean {
    return this.failures.length === 0;
  }

  /** All failure messages for a property, in declaration order. */
  errorsFor(property: string): string[] {
    return this.failures.filter((f) => f.property === property).map((f) => f.message);
  }

  /** The first failure message for a property, or `null` if it has none. */
  firstError(property: string): string | null {
    return this.failures.find((f) => f.property === property)?.message ?? null;
  }

  /** `true` if the property has at least one failure. */
  hasError(property: string): boolean {
    return this.failures.some((f) => f.property === property);
  }
}
