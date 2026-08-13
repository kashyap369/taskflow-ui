import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  KeyRound,
} from 'lucide-angular';

import { RevealDirective } from '@shared/directives/reveal.directive';
import { controlValidators, messageFor } from '@shared/validations';
import { AuthFacade } from '../auth.facade';
import { LoginRequest } from '../auth.models';
import { LoginCodeFormModel, LoginFormModel } from './login-page.model';

type LoginVariant = 'solo' | 'organization' | 'admin';

interface VariantConfig {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: string;
  headline: string;
  headlineAccent: string;
  showcaseTag: string;
}

const VARIANTS: Record<LoginVariant, VariantConfig> = {
  solo: {
    eyebrow: 'Personal workspace',
    title: 'Welcome back',
    subtitle: 'Sign in to continue to your TaskFlow workspace.',
    icon: 'User',
    headline: 'Where personal work actually',
    headlineAccent: 'flows',
    showcaseTag: 'The premium workspace',
  },
  organization: {
    eyebrow: 'Organization workspace',
    title: 'Organization sign-in',
    subtitle: 'Access your company workspace — projects, teams and reports.',
    icon: 'Building2',
    headline: 'Run your whole org, in one',
    headlineAccent: 'flow',
    showcaseTag: 'Built for teams',
  },
  admin: {
    eyebrow: 'Platform administration',
    title: 'Admin sign-in',
    subtitle: 'Restricted access. Manage users, organizations and platform settings.',
    icon: 'ShieldCheck',
    headline: 'Command the whole platform in',
    headlineAccent: 'control',
    showcaseTag: 'Admin console',
  },
};

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule, RevealDirective],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
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
        ShieldCheck,
        KeyRound,
      }),
    },
  ],
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = this.auth.loading;
  readonly error = this.auth.error;
  readonly loginCodeSent = this.auth.loginCodeSent;

  readonly variant: LoginVariant =
    (this.route.snapshot.data['variant'] as LoginVariant) ?? 'solo';

  readonly config = VARIANTS[this.variant];

  showPassword = signal(false);
  signInMethod = signal<'password' | 'code'>('password');
  resendSeconds = signal(0);
  private resendTimer: ReturnType<typeof setInterval> | null = null;

  // Pointer parallax for the showcase scene
  px = signal(0);
  py = signal(0);

  /** Per-control validators derived from `LoginFormModel`'s decorators. */
  private readonly rules = controlValidators(LoginFormModel);
  private readonly codeRules = controlValidators(LoginCodeFormModel);

  loginForm = this.fb.nonNullable.group({
    email: ['', this.rules['email']],
    password: ['', this.rules['password']],
    rememberMe: [true],
  });

  codeForm = this.fb.nonNullable.group({
    email: ['', this.codeRules['email']],
    code: ['', this.codeRules['code']],
    rememberMe: [true],
  });

  constructor() {
    effect(() => {
      if (this.loginCodeSent()) this.startResendCooldown();
    });
    this.destroyRef.onDestroy(() => this.clearResendTimer());
  }

  /** Touched-gated message for a field, straight from the decorator that failed. */
  fieldError(property: string): string | null {
    return messageFor(this.loginForm, property);
  }

  codeFieldError(property: string): string | null {
    return messageFor(this.codeForm, property);
  }

  // Cross-links to the other login variants
  readonly altLinks = computed(() =>
    (['solo', 'organization', 'admin'] as LoginVariant[])
      .filter((v) => v !== this.variant)
      .map((v) => ({
        label: v === 'solo' ? 'Personal' : v === 'organization' ? 'Organization' : 'Admin',
        path: v === 'solo' ? '/auth/login' : `/auth/${v}`,
      })),
  );

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  useSignInMethod(method: 'password' | 'code'): void {
    const email =
      this.signInMethod() === 'password'
        ? this.loginForm.controls.email.value
        : this.codeForm.controls.email.value;
    this.signInMethod.set(method);
    this.auth.resetCodeFlow();
    this.clearResendTimer();
    this.resendSeconds.set(0);
    this.loginForm.controls.email.setValue(email);
    this.codeForm.controls.email.setValue(email);
    this.codeForm.controls.code.reset();
  }

  onShowcaseMove(event: MouseEvent): void {
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    this.px.set(((event.clientX - rect.left) / rect.width - 0.5) * 2);
    this.py.set(((event.clientY - rect.top) / rect.height - 0.5) * 2);
  }

  resetShowcaseMove(): void {
    this.px.set(0);
    this.py.set(0);
  }

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password, rememberMe } = this.loginForm.getRawValue();
    const request: LoginRequest = { email, password };

    this.auth.login(request, rememberMe);
  }

  submitCodeLogin(): void {
    const { email, code, rememberMe } = this.codeForm.getRawValue();
    if (!this.loginCodeSent()) {
      this.codeForm.controls.email.markAsTouched();
      if (this.codeForm.controls.email.invalid) return;
      this.auth.requestLoginCode(email);
      return;
    }

    this.codeForm.markAllAsTouched();
    if (this.codeForm.invalid) return;
    this.auth.loginWithCode({ email, code }, rememberMe);
  }

  resendCode(): void {
    if (this.resendSeconds() > 0 || this.loading()) return;
    this.startResendCooldown();
    this.auth.requestLoginCode(this.codeForm.controls.email.value);
  }

  changeCodeEmail(): void {
    this.auth.resetCodeFlow();
    this.codeForm.controls.code.reset();
    this.clearResendTimer();
    this.resendSeconds.set(0);
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

  get loginPath(): string {
    return this.variant === 'solo' ? '/auth/login' : `/auth/${this.variant}`;
  }

  // Showcase content
  focusTasks = [
    { label: 'Design system audit' },
    { label: 'Ship onboarding flow' },
    { label: 'Review Q3 roadmap' },
    { label: 'Sync with design team' },
  ];

  testimonial = {
    quote:
      'TaskFlow gave our team a single source of truth — clarity, speed, and finally a workspace people actually enjoy opening every day.',
    reviewerName: 'Sarah Lin',
    reviewerRole: 'VP Engineering, Northwind',
    avatarText: 'SL',
  };

  stats = [
    { value: '10k+', label: 'Teams' },
    { value: '99.99%', label: 'Uptime' },
    { value: '4.9/5', label: 'G2 rating' },
  ];
}
