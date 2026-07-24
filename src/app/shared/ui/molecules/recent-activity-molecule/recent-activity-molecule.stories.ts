import type { Meta, StoryObj } from '@storybook/angular';
import { RecentActivityMolecule } from './recent-activity-molecule';

const meta: Meta<RecentActivityMolecule> = {
  title: 'Molecules/RecentActivityMolecule',
  component: RecentActivityMolecule,
  argTypes: {
    config: { control: 'object' },
    itemClick: { action: 'itemClick' },
    actionClick: { action: 'actionClick' },
  },
};

export default meta;

type Story = StoryObj<RecentActivityMolecule>;

const activityFeed = [
  { actor: 'Sofia Reyes', action: 'completed task', target: 'Schema design', time: '12m ago', type: 'completed' as const },
  { actor: 'Liam Chen', action: 'commented on', target: 'Audit color tokens', time: '32m ago', type: 'commented' as const },
  { actor: 'Avery Mitchell', action: 'created project', target: 'AI Insights', time: '1h ago', type: 'created' as const },
  { actor: 'Mia Johansson', action: 'moved task to Review', target: 'Draft launch blog post', time: '2h ago', type: 'moved' as const },
  { actor: 'Noah Patel', action: 'invited', target: 'Zara Khan', time: 'Yesterday', type: 'invited' as const },
  { actor: 'Ethan Brooks', action: 'updated progress on', target: 'Atlas Design System', time: 'Yesterday', type: 'updated' as const },
  { actor: 'Sofia Reyes', action: 'completed task', target: 'Migrate icon library', time: '2d ago', type: 'completed' as const },
];

/* ------------------------------------------------------------------ */
/* Default — the reference image                                        */
/* ------------------------------------------------------------------ */

export const Default: Story = {
  args: {
    config: {
      title: 'Recent activity',
      actionLabel: 'View all',
      items: activityFeed,
    },
  },
};

/* ------------------------------------------------------------------ */
/* Avatar leading (initials instead of type icons)                      */
/* ------------------------------------------------------------------ */

export const WithAvatars: Story = {
  args: {
    config: {
      title: 'Team activity',
      leading: 'avatar',
      items: activityFeed,
    },
  },
};

/* ------------------------------------------------------------------ */
/* No dividers (compact card)                                           */
/* ------------------------------------------------------------------ */

export const NoDividers: Story = {
  args: {
    config: {
      title: 'Recent activity',
      dividers: false,
      items: activityFeed.slice(0, 5),
    },
  },
};

/* ------------------------------------------------------------------ */
/* No header action link                                                */
/* ------------------------------------------------------------------ */

export const NoActionLink: Story = {
  args: {
    config: {
      title: 'Activity',
      showAction: false,
      items: activityFeed.slice(0, 4),
    },
  },
};

/* ------------------------------------------------------------------ */
/* Extra activity types (deleted / starred)                             */
/* ------------------------------------------------------------------ */

export const AllTypes: Story = {
  args: {
    config: {
      title: 'All activity types',
      items: [
        { actor: 'Sofia Reyes', action: 'completed task', target: 'Schema design', time: '12m ago', type: 'completed' },
        { actor: 'Liam Chen', action: 'commented on', target: 'Audit color tokens', time: '32m ago', type: 'commented' },
        { actor: 'Avery Mitchell', action: 'created project', target: 'AI Insights', time: '1h ago', type: 'created' },
        { actor: 'Mia Johansson', action: 'moved task to Review', target: 'Draft blog post', time: '2h ago', type: 'moved' },
        { actor: 'Noah Patel', action: 'invited', target: 'Zara Khan', time: 'Yesterday', type: 'invited' },
        { actor: 'Ethan Brooks', action: 'updated progress on', target: 'Atlas Design System', time: 'Yesterday', type: 'updated' },
        { actor: 'Dana Lee', action: 'deleted task', target: 'Legacy export flow', time: '2d ago', type: 'deleted' },
        { actor: 'Priya Nair', action: 'starred', target: 'Q3 Roadmap', time: '3d ago', type: 'starred' },
      ],
    },
  },
};
