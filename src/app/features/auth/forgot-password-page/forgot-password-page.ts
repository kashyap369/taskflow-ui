import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LUCIDE_ICONS,
  Lock,
  LucideAngularModule,
  LucideIconProvider,
  Mail,
  ShieldCheck,
} from 'lucide-angular';

import { controlValidators, crossFieldValidator, messageFor } from '@shared/validations';
import { AuthFacade } from '../auth.facade';
import { ForgotPasswordFormModel } from './forgot-password-page.model';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './forgot-password-page.html',
  styleUrl: './forgot-password-page.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        ArrowLeft,
        ArrowRight,
        CheckCircle2,
        Eye,
        EyeOff,
        KeyRound,
        Lock,
        Mail,
        ShieldCheck,
      }),
    },
  ],
})
export class ForgotPasswordPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly rules = controlValidators(ForgotPasswordFormModel);

  readonly loading = this.auth.loading;
  readonly error = this.auth.error;
  readonly codeSent = this.auth.recoveryCodeSent;
  readonly passwordReset = this.auth.passwordReset;
  readonly showPassword = signal(false);
  readonly resendSeconds = signal(0);
  private resendTimer: ReturnType<typeof setInterval> | null = null;

  readonly returnPath = this.safeReturnPath(this.route.snapshot.queryParamMap.get('from'));

  readonly form = this.fb.nonNullable.group(
    {
      email: ['', this.rules['email']],
      code: ['', this.rules['code']],
      newPassword: ['', this.rules['newPassword']],
      confirmPassword: ['', this.rules['confirmPassword']],
    },
    { validators: crossFieldValidator(ForgotPasswordFormModel) },
  );

  constructor() {
    this.auth.resetRecoveryFlow();
    effect(() => {
      if (this.codeSent()) this.startResendCooldown();
    });
    this.destroyRef.onDestroy(() => this.clearResendTimer());
  }

  fieldError(property: string): string | null {
    return messageFor(this.form, property);
  }

  submit(): void {
    const value = this.form.getRawValue();
    if (!this.codeSent()) {
      this.form.controls.email.markAsTouched();
      if (this.form.controls.email.invalid) return;
      this.auth.requestPasswordReset(value.email);
      return;
    }

    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.auth.resetPassword({
      email: value.email,
      code: value.code,
      newPassword: value.newPassword,
    });
  }

  resendCode(): void {
    if (this.loading() || this.resendSeconds() > 0) return;
    this.startResendCooldown();
    this.auth.requestPasswordReset(this.form.controls.email.value);
  }

  startOver(): void {
    this.auth.resetRecoveryFlow();
    this.form.reset();
    this.clearResendTimer();
    this.resendSeconds.set(0);
  }

  togglePassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  private safeReturnPath(value: string | null): string {
    return ['/auth/login', '/auth/organization', '/auth/admin'].includes(value ?? '')
      ? value!
      : '/auth/login';
  }

  private startResendCooldown(): void {
    this.clearResendTimer();
    this.resendSeconds.set(60);
    this.resendTimer = setInterval(() => {
      this.resendSeconds.update((seconds) => Math.max(0, seconds - 1));
      if (this.resendSeconds() === 0) this.clearResendTimer();
    }, 1000);
  }

  private clearResendTimer(): void {
    if (this.resendTimer !== null) {
      clearInterval(this.resendTimer);
      this.resendTimer = null;
    }
  }
}
