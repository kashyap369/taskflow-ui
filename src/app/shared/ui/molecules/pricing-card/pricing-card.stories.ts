import type { Meta, StoryObj } from '@storybook/angular';

import { PricingCard, PricingPlan } from './pricing-card';

const samplePlan: PricingPlan = {
  title: 'Pro',
  description: 'For growing teams that need more power.',
  price: '$12',
  duration: 'per user / month',
  buttonText: 'Start 14-day trial',
  popular: true,
  features: ['Unlimited projects', 'Advanced reports', 'Custom workflows', 'Priority support'],
};

const meta: Meta<PricingCard> = {
  title: 'Molecules/PricingCard',
  component: PricingCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<PricingCard>;

export const Popular: Story = {
  args: { plan: samplePlan },
};

export const Outline: Story = {
  args: {
    plan: {
      ...samplePlan,
      title: 'Starter',
      price: '$0',
      duration: 'forever',
      popular: false,
      outlineButton: true,
      buttonText: 'Start free',
    },
  },
};
