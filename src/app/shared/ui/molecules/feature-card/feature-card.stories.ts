import type { Meta, StoryObj } from '@storybook/angular';
import { FeatureCard } from './feature-card';

import { FolderKanban, Calendar, Shield, ChartColumn, Users, SquareCheckBig } from 'lucide-angular';

const meta: Meta<FeatureCard> = {
  title: 'Molecules/Cards/Feature Card',
  component: FeatureCard,

  argTypes: {
    title: {
      control: 'text',
    },

    description: {
      control: 'text',
    },

    iconBackground: {
      control: 'color',
    },

    cardBackground: {
      control: 'color',
    },

    borderColor: {
      control: 'color',
    },

    borderRadius: {
      control: {
        type: 'number',
      },
    },

    iconSize: {
      control: {
        type: 'number',
      },
    },

    hoverable: {
      control: 'boolean',
    },

    icon: {
      control: false,
    },
  },

  args: {
    cardBackground: '#ffffff',
    borderColor: '#e9edf5',
    borderRadius: 22,
    iconSize: 22,
    hoverable: true,
  },
};

export default meta;

type Story = StoryObj<FeatureCard>;

export const Projects: Story = {
  args: {
    title: 'Projects, organized',
    description:
      'Group work by team or initiative. Track progress, deadlines, and ownership at a glance.',
    icon: FolderKanban,
    iconBackground: '#6D5DF6',
  },
};

export const TaskTracking: Story = {
  args: {
    title: 'Powerful task tracking',
    description:
      'Kanban, list, and timeline views. Subtasks, comments, attachments, priorities — everything in sync.',
    icon: SquareCheckBig,
    iconBackground: '#10B981',
  },
};

export const CalendarView: Story = {
  args: {
    title: 'Smart calendars',
    description: 'Schedule deadlines and meetings with month, week and day views.',
    icon: Calendar,
    iconBackground: '#3B82F6',
  },
};

export const Team: Story = {
  args: {
    title: 'Team collaboration',
    description: 'Invite teammates, assign roles and watch workload balance itself.',
    icon: Users,
    iconBackground: '#F97316',
  },
};

export const Analytics: Story = {
  args: {
    title: 'Beautiful analytics',
    description: 'Productivity scores, completion trends and forecasts.',
    icon: ChartColumn,
    iconBackground: '#A855F7',
  },
};

export const Security: Story = {
  args: {
    title: 'Enterprise-grade security',
    description: 'SSO, SCIM, audit logs, and granular permissions for organizations.',
    icon: Shield,
    iconBackground: '#1E293B',
  },
};

export const CustomCard: Story = {
  args: {
    title: 'Custom Feature',
    description: 'This story demonstrates all customizable properties of the feature card.',
    icon: FolderKanban,
    iconBackground: '#EC4899',
    cardBackground: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderRadius: 30,
    iconSize: 30,
    hoverable: false,
  },
};
