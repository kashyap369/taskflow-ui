import type { Meta, StoryObj } from '@storybook/angular';
import {
  Medal,
  Sparkles,
  Target,
  Activity,
  CircleCheck,
  Briefcase,
  Clock,
  TrendingUp,
  Palette,
  Smartphone,
  Megaphone,
} from 'lucide-angular';
import { MasterCard } from './master-card';

const meta: Meta<MasterCard> = {
  title: 'Molecules/Cards/MasterCard',
  component: MasterCard,
  argTypes: {
    config: {
      control: 'object',
    },
  },
};

export default meta;

type Story = StoryObj<MasterCard>;

/* ------------------------------------------------------------------ */
/* Achievement cards                                                   */
/* ------------------------------------------------------------------ */

export const AchievementPowerUser: Story = {
  args: {
    config: {
      variant: 'achievement',
      icon: Medal,
      iconBackground: 'linear-gradient(135deg, #F97316, #FB923C)',
      title: 'Power User',
      subtitle: 'Completed 200+ tasks',
    },
  },
};

export const AchievementTeamPlayer: Story = {
  args: {
    config: {
      variant: 'achievement',
      icon: Sparkles,
      iconBackground: 'linear-gradient(135deg, #A855F7, #E879F9)',
      title: 'Team Player',
      subtitle: '30+ collaborations this quarter',
    },
  },
};

export const AchievementOnTimeHero: Story = {
  args: {
    config: {
      variant: 'achievement',
      icon: Target,
      iconBackground: 'linear-gradient(135deg, #059669, #10B981)',
      title: 'On-time Hero',
      subtitle: '98% on-time delivery rate',
    },
  },
};

export const AchievementStreakMaster: Story = {
  args: {
    config: {
      variant: 'achievement',
      icon: Activity,
      iconBackground: 'linear-gradient(135deg, #3B82F6, #6366F1)',
      title: 'Streak Master',
      subtitle: '45-day activity streak',
    },
  },
};

/* ------------------------------------------------------------------ */
/* Stat cards                                                          */
/* ------------------------------------------------------------------ */

export const StatTasksCompleted: Story = {
  args: {
    config: {
      variant: 'stat',
      label: 'Tasks Completed',
      value: '248',
      trend: '+12% this month',
      trendColor: '#10B981',
      icon: CircleCheck,
      iconBackground: '#10B981',
    },
  },
};

export const StatActiveProjects: Story = {
  args: {
    config: {
      variant: 'stat',
      label: 'Active Projects',
      value: '9',
      trend: '3 high priority',
      trendColor: '#8B5CF6',
      icon: Briefcase,
      iconBackground: '#6366F1',
    },
  },
};

export const StatFocusHours: Story = {
  args: {
    config: {
      variant: 'stat',
      label: 'Focus Hours',
      value: '142h',
      trend: '+8h vs last wk',
      trendColor: '#8B5CF6',
      icon: Clock,
      iconBackground: '#8B5CF6',
    },
  },
};

export const StatProductivity: Story = {
  args: {
    config: {
      variant: 'stat',
      label: 'Productivity',
      value: '92%',
      trend: 'Top 5% in team',
      trendColor: '#3B82F6',
      icon: TrendingUp,
      iconBackground: '#3B82F6',
    },
  },
};

/* ------------------------------------------------------------------ */
/* Task cards                                                          */
/* ------------------------------------------------------------------ */

export const TaskMediumPriority: Story = {
  args: {
    config: {
      variant: 'task',
      badge: {
        text: 'Medium',
        color: '#8B5CF6',
        background: '#F3EEFF',
      },
      project: 'Atlas Design System',
      title: 'Settings page redesign',
      date: 'Jul 17',
      avatars: [
        { initials: 'AK', background: '#818CF8' },
        { initials: 'MJ', background: '#F472B6' },
      ],
    },
  },
};

export const TaskHighPriority: Story = {
  args: {
    config: {
      variant: 'task',
      badge: {
        text: 'High',
        color: '#F59E0B',
        background: '#FEF3E2',
      },
      project: 'Billing Migration',
      title: 'Stripe webhook reconciliation',
      date: 'Jul 3',
      avatars: [
        { initials: 'RS', background: '#60A5FA' },
      ],
    },
  },
};

export const TaskA11yAudit: Story = {
  args: {
    config: {
      variant: 'task',
      badge: {
        text: 'High',
        color: '#F59E0B',
        background: '#FEF3E2',
      },
      project: 'Atlas Design System',
      title: 'Component a11y audit',
      date: 'Jul 11',
      avatars: [
        { initials: 'MJ', background: '#F472B6' },
      ],
    },
  },
};

/* ------------------------------------------------------------------ */
/* Project cards                                                       */
/* ------------------------------------------------------------------ */

export const ProjectOnTrack: Story = {
  args: {
    config: {
      variant: 'project',
      icon: Palette,
      iconBackground: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
      title: 'Atlas Design System',
      subtitle: 'Unified component library across web and mobile.',
      status: {
        text: 'On Track',
        color: '#059669',
        background: '#E7F8F1',
        dot: true,
      },
      date: 'Aug 14, 2026',
      progress: 68,
      progressText: '57/84 tasks',
      avatars: [
        { initials: 'AK', background: '#818CF8' },
        { initials: 'MJ', background: '#F472B6' },
        { initials: 'RS', background: '#60A5FA' },
      ],
      membersText: '3 members',
      showMenu: true,
    },
  },
};

export const ProjectAtRisk: Story = {
  args: {
    config: {
      variant: 'project',
      icon: Smartphone,
      iconBackground: '#0EA5E9',
      title: 'Mobile App v3',
      subtitle: 'Native rewrite with offline-first sync.',
      status: {
        text: 'At Risk',
        color: '#F59E0B',
        background: '#FEF3E2',
        dot: true,
      },
      date: 'Jul 30, 2026',
      progress: 42,
      progressText: '51/122 tasks',
      avatars: [
        { initials: 'TW', background: '#818CF8' },
        { initials: 'DK', background: '#34D399' },
        { initials: 'LP', background: '#FB7185' },
      ],
      membersText: '3 members',
      showMenu: true,
    },
  },
};

export const ProjectMarketing: Story = {
  args: {
    config: {
      variant: 'project',
      icon: Megaphone,
      iconBackground: '#EC4899',
      title: 'Q3 Marketing Launch',
      subtitle: 'Multi-channel campaign for fall release.',
      status: {
        text: 'On Track',
        color: '#059669',
        background: '#E7F8F1',
        dot: true,
      },
      date: 'Jul 12, 2026',
      progress: 81,
      progressText: '29/36 tasks',
      avatars: [
        { initials: 'NC', background: '#A78BFA' },
        { initials: 'SB', background: '#F9A8D4' },
        { initials: 'JV', background: '#93C5FD' },
      ],
      membersText: '3 members',
      showMenu: true,
    },
  },
};
