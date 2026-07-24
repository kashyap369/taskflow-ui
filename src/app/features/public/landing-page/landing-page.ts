import { Component } from '@angular/core';

import { LandingFeatureCard } from '@shared/ui/molecules/landing-feature-card/landing-feature-card';
import { PricingCard } from '@shared/ui/molecules/pricing-card/pricing-card';
import { ReviewCard, ReviewCardModel } from '@shared/ui/molecules/review-card/review-card';
import { RevealDirective } from '@shared/directives/reveal.directive';
import {
  ArrowRight,
  Calendar,
  ChartColumn,
  Clock,
  FolderKanban,
  LayoutGrid,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  MessageSquare,
  Paperclip,
  Play,
  Plus,
  Shield,
  Sparkles,
  SquareCheckBig,
  Table2,
  Users,
} from 'lucide-angular';

interface BoardTask {
  tag: string;
  priority: 'High' | 'Medium' | 'Low';
  title: string;
  subtitle: string;
  progress: number;
  color: string;
}

interface BoardColumn {
  title: string;
  count: number;
  dot: string;
  tasks: BoardTask[];
}

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [LandingFeatureCard, PricingCard, ReviewCard, RevealDirective, LucideAngularModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        FolderKanban,
        SquareCheckBig,
        Calendar,
        Users,
        ChartColumn,
        Shield,
        Sparkles,
        ArrowRight,
        Plus,
        Play,
        LayoutGrid,
        Clock,
        Table2,
        Paperclip,
        MessageSquare,
      }),
    },
  ],
})
export class LandingPage {
  // ======================================================
  // Hero
  // ======================================================

  hero = {
    badge: 'AI-assisted task planning is live',
    trialText: 'No credit card required · 14-day Pro trial',
  };

  stats = [
    { value: '12k+', label: 'Teams onboard' },
    { value: '4.9/5', label: 'Average rating' },
    { value: '99.99%', label: 'Uptime SLA' },
  ];

  // ======================================================
  // Trusted Companies
  // ======================================================

  trustedCompanies = ['LINEAR', 'NORTHWIND', 'ACME', 'VERCEL', 'STRIPE', 'NOTION'];

  // ======================================================
  // Hero board mock (resembles the product board)
  // ======================================================

  boardTabs = [
    { label: 'Board', icon: 'LayoutGrid', active: true },
    { label: 'Timeline', icon: 'Clock', active: false },
    { label: 'Spreadsheet', icon: 'Table2', active: false },
    { label: 'Calendar', icon: 'Calendar', active: false },
  ];

  board: BoardColumn[] = [
    {
      title: 'Not Started',
      count: 3,
      dot: '#94a3b8',
      tasks: [
        {
          tag: 'New Design',
          priority: 'Low',
          title: 'Pillo Website and App',
          subtitle: 'New homepage',
          progress: 15,
          color: '#3b82f6',
        },
      ],
    },
    {
      title: 'In Progress',
      count: 4,
      dot: '#f59e0b',
      tasks: [
        {
          tag: 'New Homepage',
          priority: 'High',
          title: 'Orbino Pharmacy Website',
          subtitle: 'New e-commerce',
          progress: 42,
          color: '#f59e0b',
        },
        {
          tag: 'New Project',
          priority: 'Medium',
          title: 'Lambo Consultancy',
          subtitle: 'New homepage',
          progress: 28,
          color: '#7c3aed',
        },
      ],
    },
    {
      title: 'Under Review',
      count: 3,
      dot: '#3b82f6',
      tasks: [
        {
          tag: 'New E-commerce',
          priority: 'Low',
          title: 'Ebay Website Development',
          subtitle: 'Checkout flow',
          progress: 88,
          color: '#3b82f6',
        },
      ],
    },
    {
      title: 'Completed',
      count: 5,
      dot: '#10b981',
      tasks: [
        {
          tag: 'New Design',
          priority: 'Medium',
          title: 'Update Design System',
          subtitle: 'Tokens & motion',
          progress: 100,
          color: '#10b981',
        },
      ],
    },
  ];

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

  workflowProgress = [
    { title: 'Design system v2', progress: 92 },
    { title: 'Onboarding redesign', progress: 64 },
    { title: 'Billing migration', progress: 38 },
    { title: 'Mobile beta', progress: 12 },
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
      buttonVariant: 'outline' as const,
      features: ['Up to 3 projects', 'Unlimited tasks', 'Calendar & reminders', 'Mobile app'],
    },
    {
      title: 'Pro',
      description: 'For growing teams that need more power.',
      price: '$12',
      duration: 'per user / month',
      buttonText: 'Start 14-day trial',
      badge: 'Most popular',
      buttonVariant: 'filled' as const,
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
      buttonVariant: 'outline' as const,
      features: ['SSO & SCIM', 'Audit logs', 'Dedicated CSM', '99.99% SLA', 'Custom contracts'],
    },
  ];

  // ======================================================
  // Reviews
  // ======================================================

  reviews: ReviewCardModel[] = [
    {
      reviewerName: 'Sarah Lin',
      reviewerDesignation: 'VP Engineering',
      reviewerCompany: 'Northwind',
      review:
        'TaskFlow replaced four other tools. Our team moves twice as fast and our roadmap is finally clear.',
      rating: 5,
      avatarText: 'S',
    },
    {
      reviewerName: 'Marcus Reed',
      reviewerDesignation: 'Head of Product',
      reviewerCompany: 'Linearity',
      review:
        "It's the first project tool that designers, engineers, and executives all genuinely love using.",
      rating: 5,
      avatarText: 'M',
    },
    {
      reviewerName: 'Priya Shah',
      reviewerDesignation: 'COO',
      reviewerCompany: 'Acme Inc.',
      review: 'The reporting is gorgeous and the security story made our IT team happy. Win-win.',
      rating: 5,
      avatarText: 'P',
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
