import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
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
import { AuthFacade } from '../auth.facade';
import { RegisterRequest } from '../auth.models';

/** Cross-field validator: confirmPassword must equal password. */
function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { passwordsMismatch: true } : null;
}

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

  registerForm = this.fb.nonNullable.group(
    {
      accountType: [AccountType.Individual as AccountType, Validators.required],
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
      phoneNumber: [
        '',
        [Validators.required, Validators.minLength(10), Validators.maxLength(20)],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
        ],
      ],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, Validators.requiredTrue],
    },
    { validators: passwordsMatch },
  );

  /** Whether the Organization account type is currently selected. */
  readonly isOrganization = computed(() => this.selectedType() === AccountType.Organization);

  private readonly selectedType = signal<AccountType>(AccountType.Individual);

  selectAccountType(type: AccountType): void {
    this.selectedType.set(type);
    this.registerForm.controls.accountType.setValue(type);
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
