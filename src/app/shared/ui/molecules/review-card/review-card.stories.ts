import type { Meta, StoryObj } from '@storybook/angular';
import { ReviewCard, ReviewCardModel } from './review-card';

const meta: Meta<ReviewCard> = {
  title: 'Molecules/Cards/Review Card',
  component: ReviewCard,
  tags: ['autodocs'],

  argTypes: {
    review: {
      control: 'object',
    },
  },
};

export default meta;

type Story = StoryObj<ReviewCard>;

const defaultReview: ReviewCardModel = {
  title: 'Excellent Project Management',

  review:
    'TaskFlow replaced four other tools. Our team moves twice as fast and our roadmap is finally clear.',

  rating: 5,

  reviewerName: 'Sarah Lin',

  reviewerDesignation: 'VP Engineering',

  reviewerCompany: 'Northwind',

  avatarText: 'S',

  avatarBackground: '#7C4DFF',

  verified: true,
};

export const Default: Story = {
  args: {
    review: defaultReview,
  },
};

export const Designer: Story = {
  args: {
    review: {
      title: 'Loved by Designers',

      review:
        "It's the first project tool that designers, engineers and executives all genuinely enjoy using.",

      rating: 5,

      reviewerName: 'Marcus Reed',

      reviewerDesignation: 'Head of Product',

      reviewerCompany: 'Linearity',

      avatarText: 'M',

      avatarBackground: '#8B5CF6',

      verified: true,
    },
  },
};

export const Enterprise: Story = {
  args: {
    review: {
      title: 'Enterprise Ready',

      review: 'The reporting is gorgeous and the security story made our IT team happy. Win-win.',

      rating: 5,

      reviewerName: 'Priya Shah',

      reviewerDesignation: 'COO',

      reviewerCompany: 'Acme Inc.',

      avatarText: 'P',

      avatarBackground: '#6366F1',

      verified: true,
    },
  },
};

export const FourStars: Story = {
  args: {
    review: {
      title: 'Very Good',

      review:
        'Excellent experience overall. A few features could be improved, but it has been a huge productivity boost.',

      rating: 4,

      reviewerName: 'John Carter',

      reviewerDesignation: 'Product Manager',

      reviewerCompany: 'TechNova',

      avatarText: 'J',

      avatarBackground: '#10B981',

      verified: false,
    },
  },
};

export const WithAvatarImage: Story = {
  args: {
    review: {
      title: 'Outstanding Support',

      review: 'The onboarding experience and customer support exceeded all expectations.',

      rating: 5,

      reviewerName: 'Emily Watson',

      reviewerDesignation: 'CEO',

      reviewerCompany: 'Vision Studio',

      avatarImage: 'https://i.pravatar.cc/150?img=47',

      verified: true,
    },
  },
};

export const Custom: Story = {
  args: {
    review: {
      title: 'Custom Review',

      review:
        'Modify this object using Storybook controls to preview different review combinations.',

      rating: 5,

      reviewerName: 'Alex Johnson',

      reviewerDesignation: 'Software Architect',

      reviewerCompany: 'SugguUI',

      avatarText: 'A',

      avatarBackground: '#F97316',

      verified: true,
    },
  },
};
