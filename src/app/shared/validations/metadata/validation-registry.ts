import { RuleScope, ValidationRule } from '../models/validation-types';

// ============================================================
// Rule registry — maps a model class constructor to the rules
// declared on its properties. Property decorators register into
// this store (we don't rely on `emitDecoratorMetadata`, so the
// registry is the single source of truth). Rules are inherited:
// `getRules` walks the prototype chain so a subclass model keeps
// its base class's rules.
// ============================================================

/** A constructor of a decorated model class. */
export type ModelCtor<T extends object = object> = new (...args: never[]) => T;

/** Per-class store: property name → its rules (in decoration order). */
type PropertyRules = Map<string, ValidationRule[]>;

const REGISTRY = new WeakMap<object, PropertyRules>();

function rulesFor(ctor: object): PropertyRules {
  let map = REGISTRY.get(ctor);
  if (!map) {
    map = new Map<string, ValidationRule[]>();
    REGISTRY.set(ctor, map);
  }
  return map;
}

/**
 * Register a rule for a property. Called by the property decorators with the class prototype
 * (`target`) and the property key. Decoration order is preserved so `@Required` before `@MaxLength`
 * reports "required" first.
 */
export function registerRule(
  target: object,
  property: string,
  input: { rule: string; message: string; scope?: RuleScope; validate: ValidationRule['validate'] },
): void {
  const map = rulesFor(target);
  const list = map.get(property) ?? [];
  list.push({
    rule: input.rule,
    message: input.message,
    scope: input.scope ?? 'field',
    validate: input.validate,
  });
  map.set(property, list);
}

/**
 * Collect all rules declared on a model class, keyed by property. Walks the prototype chain so
 * inherited rules are included (base class rules first, then the subclass's).
 */
export function getRules(ctor: ModelCtor): ReadonlyMap<string, ValidationRule[]> {
  const merged = new Map<string, ValidationRule[]>();

  // Collect from the base of the chain downward so subclasses append after their base.
  const chain: object[] = [];
  let proto: object | null = ctor.prototype;
  while (proto && proto !== Object.prototype) {
    chain.unshift(proto);
    proto = Object.getPrototypeOf(proto);
  }

  for (const link of chain) {
    const map = REGISTRY.get(link);
    if (!map) {
      continue;
    }
    for (const [property, rules] of map) {
      merged.set(property, [...(merged.get(property) ?? []), ...rules]);
    }
  }

  return merged;
}

/** The set of properties that carry at least one rule. */
export function validatedProperties(ctor: ModelCtor): string[] {
  return [...getRules(ctor).keys()];
}
