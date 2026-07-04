import { Component } from '@angular/core';

import { LandingFeatureCard } from '@shared/ui/molecules/landing-feature-card/landing-feature-card';
import { PricingCard } from '@shared/ui/molecules/pricing-card/pricing-card';
import { ReviewCard } from '@shared/ui/molecules/review-card/review-card';
import { Calendar, ChartColumn, FolderKanban, LUCIDE_ICONS, LucideIconProvider, Shield, SquareCheckBig, Users } from 'lucide-angular';

@Component({
  selector: 'app-public-landing-page',
  standalone: true,
  imports: [LandingFeatureCard, PricingCard, ReviewCard],
  templateUrl: './public-landing-page.html',
  styleUrl: './public-landing-page.scss',
  providers: [
    {
      provide:LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({FolderKanban, SquareCheckBig, Calendar, Users, ChartColumn, Shield})
    }
  ],
})
export class PublicLandingPage {
  // ======================================================
  // Hero
  // ======================================================

  hero = {
    badge: 'New • AI-assisted task planning is live',

    title: 'The premium workspace',

    highlight: 'great teams ship',

    description:
      'TaskFlow brings projects, tasks, calendars, and team collaboration into one beautifully designed enterprise-grade platform — built for organizations who care about the details.',

    primaryButton: 'Start for free',

    secondaryButton: 'View live demo',

    trialText: 'No credit card required • 14-day Pro trial',
  };

  // ======================================================
  // Trusted Companies
  // ======================================================

  trustedCompanies = ['LINEAR', 'NORTHWIND', 'ACME', 'VERCEL', 'STRIPE', 'NOTION'];

  // ======================================================
  // Features
  // ======================================================

  features = [
    {
      title: 'Projects, organized',

      description:
        'Group work by team or initiative. Track progress, deadlines, and ownership at a glance.',

      icon: 'FolderKanban',

      iconBackground: 'linear-gradient(135deg,#6366F1,#7C3AED)',
    },

    {
      title: 'Powerful task tracking',

      description:
        'Kanban, list, and timeline views. Subtasks, comments, attachments, priorities — everything in sync.',

      icon: 'SquareCheckBig',

      iconBackground: 'linear-gradient(135deg,#10B981,#059669)',
    },

    {
      title: 'Smart calendars',

      description:
        'Schedule deadlines and meetings with month, week and day views shared across your team.',

      icon: 'Calendar',

      iconBackground: 'linear-gradient(135deg,#3B82F6,#4F46E5)',
    },

    {
      title: 'Team collaboration',

      description:
        'Invite teammates, assign roles, and watch workload balance itself with built-in reporting.',

      icon: 'Users',

      iconBackground: 'linear-gradient(135deg,#EF4444,#F59E0B)',
    },

    {
      title: 'Beautiful analytics',

      description:
        'Productivity scores, completion trends, and forecasts — designed for executives and managers alike.',

      icon: 'ChartColumn',

      iconBackground: 'linear-gradient(135deg,#9333EA,#C026D3)',
    },

    {
      title: 'Enterprise-grade security',

      description:
        'SSO, SCIM, audit logs, and granular permissions — ready for organizations of every size.',

      icon: 'Shield',

      iconBackground: 'linear-gradient(135deg,#1E293B,#111827)',
    },
  ];

  // ======================================================
  // Workflow
  // ======================================================

  workflowSteps = [
    {
      number: '01',

      title: 'Plan',

      description: 'Capture projects and break them into clear, actionable tasks.',
    },

    {
      number: '02',

      title: 'Execute',

      description: 'Move work across boards with assignees, priorities and due dates.',
    },

    {
      number: '03',

      title: 'Reflect',

      description: 'Spot bottlenecks, celebrate wins, and forecast the next sprint.',
    },
  ];

  // ======================================================
  // Workflow Progress
  // ======================================================

  workflowProgress = [
    {
      title: 'Design system v2',

      progress: 90,

      color: '#7C3AED',
    },

    {
      title: 'Onboarding redesign',

      progress: 64,

      color: '#7C3AED',
    },

    {
      title: 'Billing migration',

      progress: 39,

      color: '#7C3AED',
    },

    {
      title: 'Mobile beta',

      progress: 12,

      color: '#7C3AED',
    },
  ];

  // ======================================================
  // Pricing
  // ======================================================

  plans = [
    {
      title: 'Starter',

      description: 'For individuals getting their work in order.',

      price: '$0',

      duration: 'forever',

      buttonText: 'Start free',

      outlineButton: true,

      features: ['Up to 3 projects', 'Unlimited tasks', 'Calendar & reminders', 'Mobile app'],
    },

    {
      title: 'Pro',

      description: 'For growing teams that need more power.',

      price: '$12',

      duration: 'per user / month',

      buttonText: 'Start 14-day trial',

      popular: true,

      features: [
        'Unlimited projects',
        'Advanced reports',
        'Custom workflows',
        'Priority support',
        'Integrations',
      ],
    },

    {
      title: 'Enterprise',

      description: 'For organizations with security and scale.',

      price: 'Custom',

      duration: 'talk to sales',

      buttonText: 'Contact sales',

      outlineButton: true,

      features: ['SSO & SCIM', 'Audit logs', 'Dedicated CSM', '99.99% SLA', 'Custom contracts'],
    },
  ];

  // ======================================================
  // Reviews
  // ======================================================

  reviews = [
    {
      name: 'Sarah Lin',

      designation: 'VP Engineering',

      company: 'Northwind',

      review:
        'TaskFlow replaced four other tools. Our team moves twice as fast and our roadmap is finally clear.',

      rating: 5,

      avatar: 'S',
    },

    {
      name: 'Marcus Reed',

      designation: 'Head of Product',

      company: 'Linearity',

      review:
        "It's the first project tool that designers, engineers, and executives all genuinely love using.",

      rating: 5,

      avatar: 'M',
    },

    {
      name: 'Priya Shah',

      designation: 'COO',

      company: 'Acme Inc.',

      review: 'The reporting is gorgeous and the security story made our IT team happy. Win-win.',

      rating: 5,

      avatar: 'P',
    },
  ];

  // ======================================================
  // CTA
  // ======================================================

  cta = {
    title: 'Ready to ship better, together?',

    description:
      'Join thousands of teams using TaskFlow to plan, execute, and reflect. Free for 14 days. No credit card.',

    primaryButton: 'Get started free',

    secondaryButton: 'Sign in',
  };
}
