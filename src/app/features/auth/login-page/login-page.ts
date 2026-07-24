import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
} from 'lucide-angular';

import { RevealDirective } from '@shared/directives/reveal.directive';
import { AuthFacade } from '../auth.facade';
import { LoginRequest } from '../auth.models';

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
      }),
    },
  ],
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthFacade);
  private readonly route = inject(ActivatedRoute);

  readonly loading = this.auth.loading;
  readonly error = this.auth.error;

  readonly variant: LoginVariant =
    (this.route.snapshot.data['variant'] as LoginVariant) ?? 'solo';

  readonly config = VARIANTS[this.variant];

  showPassword = signal(false);

  // Pointer parallax for the showcase scene
  px = signal(0);
  py = signal(0);

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [true],
  });

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
