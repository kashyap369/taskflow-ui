import type { Meta, StoryObj } from '@storybook/angular';
import { ProjectOverviewMolecule } from './project-overview-molecule';

const meta: Meta<ProjectOverviewMolecule> = {
  title: 'Molecules/ProjectOverviewMolecule',
  component: ProjectOverviewMolecule,
  argTypes: {
    config: { control: 'object' },
    projectClick: { action: 'projectClick' },
    actionClick: { action: 'actionClick' },
  },
};

export default meta;

type Story = StoryObj<ProjectOverviewMolecule>;

const projects = [
  {
    name: 'Atlas Design System',
    meta: '57/84 tasks · due Aug 14',
    progress: 68,
    status: 'on-track' as const,
    color: '#7C6FF0',
    members: [
      { initials: 'AK', background: '#818CF8' },
      { initials: 'MJ', background: '#F472B6' },
      { initials: 'RS', background: '#60A5FA' },
    ],
  },
  {
    name: 'Mobile App v3',
    meta: '51/122 tasks · due Jul 30',
    progress: 42,
    status: 'at-risk' as const,
    color: '#3B82F6',
    members: [
      { initials: 'TW', background: '#818CF8' },
      { initials: 'DK', background: '#34D399' },
    ],
  },
  {
    name: 'Q3 Marketing Launch',
    meta: '29/36 tasks · due Jul 12',
    progress: 81,
    status: 'on-track' as const,
    color: '#EC4899',
    members: [
      { initials: 'NC', background: '#A78BFA' },
      { initials: 'SB', background: '#F9A8D4' },
      { initials: 'JV', background: '#93C5FD' },
    ],
  },
  {
    name: 'Billing Migration',
    meta: '13/48 tasks · due Jun 28',
    progress: 28,
    status: 'delayed' as const,
    color: '#F97316',
    members: [
      { initials: 'RS', background: '#60A5FA' },
      { initials: 'EB', background: '#34D399' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Default — the reference image                                        */
/* ------------------------------------------------------------------ */

export const Default: Story = {
  args: {
    config: {
      title: 'Project health overview',
      actionLabel: 'All projects',
      items: projects,
    },
  },
};

/* ------------------------------------------------------------------ */
/* Without avatars                                                      */
/* ------------------------------------------------------------------ */

export const NoAvatars: Story = {
  args: {
    config: {
      title: 'Project health overview',
      items: projects.map(({ members, ...rest }) => rest),
    },
  },
};

/* ------------------------------------------------------------------ */
/* Overflow avatars (+N)                                                */
/* ------------------------------------------------------------------ */

export const ManyMembers: Story = {
  args: {
    config: {
      title: 'Project health overview',
      maxAvatars: 3,
      items: [
        {
          ...projects[0],
          members: [
            { initials: 'AK', background: '#818CF8' },
            { initials: 'MJ', background: '#F472B6' },
            { initials: 'RS', background: '#60A5FA' },
            { initials: 'TW', background: '#34D399' },
            { initials: 'DK', background: '#FB7185' },
          ],
        },
      ],
    },
  },
};

/* ------------------------------------------------------------------ */
/* Completed status + no header action                                  */
/* ------------------------------------------------------------------ */

export const CompletedNoAction: Story = {
  args: {
    config: {
      title: 'Delivered this quarter',
      showAction: false,
      items: [
        { name: 'Design tokens v2', meta: '40/40 tasks · shipped Jun 1', progress: 100, status: 'completed', color: '#4F6EF7' },
        { name: 'Onboarding revamp', meta: '32/32 tasks · shipped Jun 9', progress: 100, status: 'completed', color: '#10B981' },
      ],
    },
  },
};

/* ------------------------------------------------------------------ */
/* Custom gradient                                                      */
/* ------------------------------------------------------------------ */

export const CustomGradient: Story = {
  args: {
    config: {
      title: 'Project health overview',
      progressGradient: 'linear-gradient(90deg, #10B981, #34D399)',
      items: projects.slice(0, 3),
    },
  },
};
