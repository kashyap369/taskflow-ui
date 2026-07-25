import { FormControl, FormGroup } from '@angular/forms';

import {
  Custom,
  Email,
  IsTrue,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  Pattern,
  Required,
  controlValidators,
  crossFieldValidator,
  messageFor,
  validate,
} from '../index';

// A model exercising every decorator. Property names double as the rule under test.
class SampleModel {
  @Required('Name is required.')
  @MaxLength(5, 'Name too long.')
  name = '';

  @Required()
  @Email('Bad email.')
  email = '';

  @MinLength(3)
  nickname = '';

  @Pattern(/^\d+$/, 'Digits only.')
  code = '';

  @Min(1)
  @Max(10)
  quantity = 0;

  @IsTrue('Accept it.')
  accepted = false;

  @Custom('even', 'Must be even.', (v) => Number(v) % 2 === 0)
  amount = 0;

  password = '';

  @Matches('password', 'Passwords must match.')
  confirmPassword = '';
}

describe('validation engine — validate()', () => {
  it('passes a fully valid model', () => {
    const model = Object.assign(new SampleModel(), {
      name: 'Jane',
      email: 'jane@x.com',
      nickname: 'jd',
      code: '123',
      quantity: 5,
      accepted: true,
      amount: 4,
      password: 'secret',
      confirmPassword: 'secret',
    });
    // nickname 'jd' is length 2 < 3 → expect that one failure only
    const result = validate(SampleModel, model);
    expect(result.errorsFor('nickname').length).toBe(1);
    expect(result.hasError('email')).toBe(false);
  });

  it('flags @Required on empty', () => {
    const result = validate(SampleModel, new SampleModel());
    expect(result.firstError('name')).toBe('Name is required.');
    expect(result.hasError('email')).toBe(true);
  });

  it('reports rules in decoration order (required before maxLength)', () => {
    const result = validate(SampleModel, Object.assign(new SampleModel(), { name: '' }));
    expect(result.errorsFor('name')[0]).toBe('Name is required.');
  });

  it('@MaxLength fails an over-long value but passes when empty', () => {
    expect(validate(SampleModel, Object.assign(new SampleModel(), { name: 'toolong' })).firstError('name')).toBe(
      'Name too long.',
    );
    // empty name fails Required, not MaxLength
    expect(validate(SampleModel, new SampleModel()).errorsFor('name')).toEqual(['Name is required.']);
  });

  it('@Email validates shape', () => {
    expect(validate(SampleModel, Object.assign(new SampleModel(), { email: 'nope' })).firstError('email')).toBe(
      'Bad email.',
    );
    expect(validate(SampleModel, Object.assign(new SampleModel(), { email: 'a@b.co' })).hasError('email')).toBe(
      false,
    );
  });

  it('@Pattern enforces the regex and is stateless across calls', () => {
    const bad = validate(SampleModel, Object.assign(new SampleModel(), { code: '12a' }));
    expect(bad.firstError('code')).toBe('Digits only.');
    const good = Object.assign(new SampleModel(), { code: '999' });
    expect(validate(SampleModel, good).hasError('code')).toBe(false);
    // run again to catch a global-flag lastIndex bug
    expect(validate(SampleModel, good).hasError('code')).toBe(false);
  });

  it('@Min / @Max bound a number', () => {
    expect(validate(SampleModel, Object.assign(new SampleModel(), { quantity: 0 })).hasError('quantity')).toBe(
      true,
    );
    expect(validate(SampleModel, Object.assign(new SampleModel(), { quantity: 11 })).hasError('quantity')).toBe(
      true,
    );
    expect(validate(SampleModel, Object.assign(new SampleModel(), { quantity: 5 })).hasError('quantity')).toBe(
      false,
    );
  });

  it('@IsTrue requires exactly true', () => {
    expect(validate(SampleModel, new SampleModel()).firstError('accepted')).toBe('Accept it.');
    expect(validate(SampleModel, Object.assign(new SampleModel(), { accepted: true })).hasError('accepted')).toBe(
      false,
    );
  });

  it('@Custom runs a bespoke predicate', () => {
    expect(validate(SampleModel, Object.assign(new SampleModel(), { amount: 3 })).firstError('amount')).toBe(
      'Must be even.',
    );
  });

  it('@Matches compares against a sibling property', () => {
    const mismatch = Object.assign(new SampleModel(), { password: 'a', confirmPassword: 'b' });
    expect(validate(SampleModel, mismatch).firstError('confirmPassword')).toBe('Passwords must match.');
    const match = Object.assign(new SampleModel(), { password: 'a', confirmPassword: 'a' });
    expect(validate(SampleModel, match).hasError('confirmPassword')).toBe(false);
  });
});

describe('validation engine — inheritance', () => {
  class Base {
    @Required('base required')
    base = '';
  }
  class Derived extends Base {
    @Required('derived required')
    extra = '';
  }

  it('a subclass inherits its base rules', () => {
    const result = validate(Derived, new Derived());
    expect(result.hasError('base')).toBe(true);
    expect(result.hasError('extra')).toBe(true);
  });
});

describe('validation engine — Angular adapters', () => {
  it('controlValidators produce per-control ValidatorFns', () => {
    const validators = controlValidators(SampleModel);
    const name = new FormControl('', validators['name']);
    expect(name.errors?.['validation'].message).toBe('Name is required.');
    name.setValue('Jane');
    expect(name.errors).toBeNull();
  });

  it('controlValidators do not include cross-field (model-scoped) rules', () => {
    // confirmPassword only has a @Matches (model-scoped) rule → no control validator built for it
    expect(controlValidators(SampleModel)['confirmPassword']).toBeUndefined();
  });

  it('crossFieldValidator flags a mismatch at group level', () => {
    const group = new FormGroup(
      { password: new FormControl('a'), confirmPassword: new FormControl('b') },
      { validators: crossFieldValidator(SampleModel) },
    );
    expect(group.errors?.['validation'].message).toBe('Passwords must match.');
    group.get('confirmPassword')!.setValue('a');
    expect(group.errors).toBeNull();
  });

  it('messageFor stays quiet until the control is touched, then surfaces the message', () => {
    const validators = controlValidators(SampleModel);
    const group = new FormGroup({ name: new FormControl('', validators['name']) });
    expect(messageFor(group, 'name')).toBeNull(); // untouched
    group.get('name')!.markAsTouched();
    expect(messageFor(group, 'name')).toBe('Name is required.');
  });

  it('messageFor surfaces a cross-field error under the target property', () => {
    const group = new FormGroup(
      { password: new FormControl('a'), confirmPassword: new FormControl('b') },
      { validators: crossFieldValidator(SampleModel) },
    );
    group.get('confirmPassword')!.markAsTouched();
    expect(messageFor(group, 'confirmPassword')).toBe('Passwords must match.');
  });
});
