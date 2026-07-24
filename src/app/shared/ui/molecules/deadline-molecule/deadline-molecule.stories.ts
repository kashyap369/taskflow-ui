import type { Meta, StoryObj } from '@storybook/angular';
import { DeadlineMolecule } from './deadline-molecule';

const meta: Meta<DeadlineMolecule> = {
  title: 'Molecules/DeadlineMolecule',
  component: DeadlineMolecule,
  argTypes: {
    config: { control: 'object' },
    itemClick: { action: 'itemClick' },
    actionClick: { action: 'actionClick' },
  },
};

export default meta;

type Story = StoryObj<DeadlineMolecule>;

const deadlines = [
  { title: 'Audit color tokens across web app', due: 'Due in 2d', status: 'upcoming' as const },
  { title: 'Implement offline sync queue', due: 'Due in 1d', status: 'soon' as const },
  { title: 'Draft launch blog post', due: 'Due in 3d', status: 'upcoming' as const },
  { title: 'Stripe webhook reconciliation', due: 'Overdue by 2d', status: 'overdue' as const },
  { title: 'Component a11y audit', due: 'Due in 6d', status: 'upcoming' as const },
];

/* ------------------------------------------------------------------ */
/* Default — the reference image                                        */
/* ------------------------------------------------------------------ */

export const Default: Story = {
  args: {
    config: {
      title: 'Upcoming deadlines',
      actionLabel: 'Calendar',
      items: deadlines,
    },
  },
};

/* ------------------------------------------------------------------ */
/* No header action link                                                */
/* ------------------------------------------------------------------ */

export const NoActionLink: Story = {
  args: {
    config: {
      title: 'Deadlines',
      showAction: false,
      items: deadlines.slice(0, 4),
    },
  },
};

/* ------------------------------------------------------------------ */
/* All statuses (including done)                                        */
/* ------------------------------------------------------------------ */

export const AllStatuses: Story = {
  args: {
    config: {
      title: 'This week',
      actionLabel: 'Calendar',
      items: [
        { title: 'Kickoff planning doc', due: 'Completed', status: 'done' },
        { title: 'Implement offline sync queue', due: 'Due in 1d', status: 'soon' },
        { title: 'Audit color tokens across web app', due: 'Due in 2d', status: 'upcoming' },
        { title: 'Stripe webhook reconciliation', due: 'Overdue by 2d', status: 'overdue' },
      ],
    },
  },
};

/* ------------------------------------------------------------------ */
/* Short list                                                           */
/* ------------------------------------------------------------------ */

export const ShortList: Story = {
  args: {
    config: {
      title: 'Upcoming deadlines',
      items: deadlines.slice(0, 2),
    },
  },
};
