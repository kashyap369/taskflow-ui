import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  ArrowRight,
  Building2,
  Check,
  Eye,
  EyeOff,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  Lock,
  Mail,
  Phone,
  Sparkles,
  User,
} from 'lucide-angular';

import { AccountType } from '@core/auth/roles.enum';
import { RevealDirective } from '@shared/directives/reveal.directive';
import { controlValidators, crossFieldValidator, messageFor } from '@shared/validations';
import { AuthFacade } from '../auth.facade';
import { RegisterRequest } from '../auth.models';
import { RegisterFormModel } from './register-page.model';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule, RevealDirective],
  templateUrl: './register-page.html',
  styleUrl: './register-page.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        Sparkles,
        Mail,
        Lock,
        Eye,
        EyeOff,
        ArrowRight,
        User,
        Building2,
        Phone,
        Check,
      }),
    },
  ],
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthFacade);

  /** Expose the enum to the template for the account-type toggle. */
  readonly AccountType = AccountType;

  readonly loading = this.auth.loading;
  readonly error = this.auth.error;

  showPassword = signal(false);

  /** Per-control validators derived from `RegisterFormModel`'s decorators (field-scoped rules). */
  private readonly rules = controlValidators(RegisterFormModel);

  registerForm = this.fb.nonNullable.group(
    {
      accountType: [AccountType.Individual as AccountType],
      firstName: ['', this.rules['firstName']],
      lastName: ['', this.rules['lastName']],
      email: ['', this.rules['email']],
      phoneNumber: ['', this.rules['phoneNumber']],
      password: ['', this.rules['password']],
      confirmPassword: ['', this.rules['confirmPassword']],
      acceptTerms: [false, this.rules['acceptTerms']],
    },
    // Cross-field (`@Matches`) rules run at the group level.
    { validators: crossFieldValidator(RegisterFormModel) },
  );

  /** Message to show for a field (own error, then a cross-field error targeting it); touched-gated. */
  fieldError(property: string): string | null {
    return messageFor(this.registerForm, property);
  }

  /** Whether the Organization account type is currently selected. */
  readonly isOrganization = computed(() => this.selectedType() === AccountType.Organization);

  private readonly selectedType = signal<AccountType>(AccountType.Individual);

  selectAccountType(type: AccountType): void {
    this.selectedType.set(type);
    this.registerForm.controls.accountType.setValue(type);
  }

  /**
   * Arrow-key navigation for the account-type radiogroup. A `role="radiogroup"` is expected to move
   * selection with the arrow keys (WAI-ARIA APG) — Tab reaches the group as one stop, arrows choose
   * within it — so claiming the role without this would announce a control that doesn't behave like
   * one. Bound on each radio (which is focusable) rather than the group.
   */
  onAccountTypeKeydown(event: KeyboardEvent): void {
    const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'];
    if (!keys.includes(event.key)) {
      return;
    }
    event.preventDefault();

    // Only two options, so any arrow key moves to the other one.
    this.selectAccountType(
      this.isOrganization() ? AccountType.Individual : AccountType.Organization,
    );

    // Selection follows focus in a radiogroup — move focus onto the newly checked option. The DOM
    // still shows the pre-change aria-checked until Angular renders, so target the sibling directly.
    const current = event.currentTarget as HTMLElement;
    const sibling =
      (current.nextElementSibling as HTMLElement | null) ??
      (current.previousElementSibling as HTMLElement | null);
    sibling?.focus();
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  register(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { accountType, firstName, lastName, email, phoneNumber, password } =
      this.registerForm.getRawValue();

    const request: RegisterRequest = {
      accountType,
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
    };

    this.auth.register(request);
  }

  // Showcase content (mirrors the sign-in scene's language)
  readonly perks = [
    'Unlimited personal tasks & subtasks',
    'Weekly, monthly & yearly tracking',
    'Teams, roles & projects when you grow',
    'A dashboard your whole org will love',
  ];

  readonly stats = [
    { value: '10k+', label: 'Teams' },
    { value: '2 min', label: 'Setup' },
    { value: '4.9/5', label: 'G2 rating' },
  ];
}
