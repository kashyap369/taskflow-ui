import type { Meta, StoryObj } from '@storybook/angular';
import { PricingCard, PricingPlan } from './pricing-card';

import {
  CircleCheck,
  Rocket,
} from 'lucide-angular';

const samplePlan: PricingPlan = {
  title: 'Pro',
  description: 'For growing teams that need more power.',

  price: '$12',
  duration: 'per user / month',

  buttonText: 'Start 14-day trial',

  badge: 'MOST POPULAR',
  badgeColor: '#6D5DF6',

  buttonVariant: 'filled',

  borderColor: '#6D5DF6',

  cardBackground: '#FFFFFF',

  borderRadius: 24,

  hoverable: true,

  shadow: true,

  featureIcon: Rocket,

  features: [
    'Unlimited projects',
    'Advanced reports',
    'Custom workflows',
    'Priority support',
  ],
};

const meta: Meta<PricingCard> = {
  title: 'Molecules/Cards/Pricing Card',
  component: PricingCard,
  tags: ['autodocs'],

  argTypes: {
    plan: {
      control: 'object',
    },
  },
};

export default meta;

type Story = StoryObj<PricingCard>;

export const Popular: Story = {
  args: {
    plan: samplePlan,
  },
};

export const Starter: Story = {
  args: {
    plan: {
      ...samplePlan,

      title: 'Starter',

      description: 'Perfect for individuals getting started.',

      price: '$0',

      duration: 'Forever',

      badge: undefined,

      badgeColor: undefined,

      buttonText: 'Start Free',

      buttonVariant: 'outline',

      borderColor: '#E5E7EB',

      featureIcon: CircleCheck,

      features: [
        '3 Projects',
        'Unlimited Tasks',
        'Basic Analytics',
        'Community Support',
      ],
    },
  },
};

export const Enterprise: Story = {
  args: {
    plan: {
      title: 'Enterprise',

      description:
        'Advanced security and dedicated enterprise support.',

      price: 'Custom',

      buttonText: 'Contact Sales',

      badge: 'ENTERPRISE',

      badgeColor: '#111827',

      buttonVariant: 'outline',

      borderColor: '#CBD5E1',

      cardBackground: '#FFFFFF',

      borderRadius: 24,

      hoverable: true,

      shadow: true,

      featureIcon: CircleCheck,

      features: [
        'Unlimited Projects',
        'Unlimited Team Members',
        'SSO & SAML',
        'Audit Logs',
        'Dedicated Support',
        'Custom Integrations',
      ],
    },
  },
};

export const Custom: Story = {
  args: {
    plan: {
      title: 'Premium',

      description: 'Customize every property using Storybook controls.',

      price: '$29',

      duration: 'per month',

      buttonText: 'Upgrade Now',

      badge: 'BEST VALUE',

      badgeColor: '#F59E0B',

      buttonVariant: 'filled',

      borderColor: '#FCD34D',

      cardBackground: '#FFFDF7',

      borderRadius: 30,

      hoverable: false,

      shadow: false,

      featureIcon: Rocket,

      features: [
        'Unlimited Projects',
        'AI Assistant',
        'Automation',
        'Priority Support',
      ],
    },
  },
};