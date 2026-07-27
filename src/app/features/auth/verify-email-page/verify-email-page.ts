import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import {
  ArrowRight,
  CircleCheckBig,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  Mail,
  TriangleAlert,
} from 'lucide-angular';

import { NotificationService } from '@core/services/notification.service';
import { controlValidators, messageFor } from '@shared/validations';
import { AuthRepository } from '../auth.repository';
import { ResendVerificationFormModel } from './verify-email-page.model';

type VerifyState = 'verifying' | 'verified' | 'failed' | 'awaiting';

/**
 * Lands from the link in the welcome email (`/auth/verify-email?token=…`) and completes
 * registration. Without this step a new account cannot sign in at all, so this page is the
 * front door for every Individual user.
 *
 * Reached without a token (e.g. from a "check your inbox" prompt) it shows the resend form
 * instead of an error.
 */
@Component({
  selector: 'app-verify-email-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './verify-email-page.html',
  styleUrl: './verify-email-page.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        CircleCheckBig,
        TriangleAlert,
        Mail,
        ArrowRight,
      }),
    },
  ],
})
export class VerifyEmailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly repository = inject(AuthRepository);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly state = signal<VerifyState>('awaiting');
  readonly sending = signal(false);
  readonly resent = signal(false);

  private readonly rules = controlValidators(ResendVerificationFormModel);

  readonly resendForm = this.fb.nonNullable.group({
    email: ['', this.rules['email']],
  });

  constructor() {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (token) {
      this.verify(token);
    }
  }

  fieldError(property: string): string | null {
    return messageFor(this.resendForm, property);
  }

  private verify(token: string): void {
    this.state.set('verifying');

    this.repository.verifyEmail(token).subscribe({
      next: () => this.state.set('verified'),
      // The interceptor already toasts the server message; the page shows the
      // recovery path (resend) rather than a dead end.
      error: () => this.state.set('failed'),
    });
  }

  resend(): void {
    if (this.resendForm.invalid) {
      this.resendForm.markAllAsTouched();
      return;
    }

    this.sending.set(true);

    this.repository.resendVerification(this.resendForm.getRawValue().email).subscribe({
      next: () => {
        this.sending.set(false);
        this.resent.set(true);
        this.notification.success('If that address needs verifying, a new link is on its way.');
      },
      error: () => this.sending.set(false),
    });
  }
}
