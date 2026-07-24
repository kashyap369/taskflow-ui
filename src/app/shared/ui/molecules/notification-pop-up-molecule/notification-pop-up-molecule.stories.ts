import type { Meta, StoryObj } from '@storybook/angular';
import { NotificationPopUpMolecule } from './notification-pop-up-molecule';

const meta: Meta<NotificationPopUpMolecule> = {
  title: 'Molecules/NotificationPopUpMolecule',
  component: NotificationPopUpMolecule,
  argTypes: {
    config: { control: 'object' },
    open: { control: 'boolean' },
    itemClick: { action: 'itemClick' },
    markAllRead: { action: 'markAllRead' },
    viewAll: { action: 'viewAll' },
  },
};

export default meta;

type Story = StoryObj<NotificationPopUpMolecule>;

const notifications = [
  { title: 'Avery mentioned you', description: 'in Audit color tokens', time: '5m', type: 'mention' as const, unread: true },
  { title: 'Task overdue', description: 'Stripe webhook reconciliation', time: '1h', type: 'overdue' as const, unread: true },
  { title: 'Project milestone reached', description: 'Q3 Marketing Launch — 80% complete', time: '3h', type: 'milestone' as const, unread: true },
  { title: 'New comment', description: 'on Investor demo prep', time: 'Yesterday', type: 'comment' as const },
  { title: 'Weekly report ready', description: 'Productivity up 12% week over week', time: '2d', type: 'report' as const },
];

/* ------------------------------------------------------------------ */
/* Default — the reference image                                        */
/* ------------------------------------------------------------------ */

export const Default: Story = {
  args: {
    open: true,
    config: {
      title: 'Notifications',
      markAllLabel: 'Mark all read',
      footerLabel: 'View all notifications',
      items: notifications,
    },
  },
};

/* ------------------------------------------------------------------ */
/* All read (no unread dots)                                            */
/* ------------------------------------------------------------------ */

export const AllRead: Story = {
  args: {
    open: true,
    config: {
      title: 'Notifications',
      items: notifications.map(({ unread, ...rest }) => rest),
    },
  },
};

/* ------------------------------------------------------------------ */
/* Empty state                                                          */
/* ------------------------------------------------------------------ */

export const Empty: Story = {
  args: {
    open: true,
    config: {
      title: 'Notifications',
      emptyText: 'You’re all caught up 🎉',
      items: [],
    },
  },
};

/* ------------------------------------------------------------------ */
/* Minimal — no header action, no footer                               */
/* ------------------------------------------------------------------ */

export const Minimal: Story = {
  args: {
    open: true,
    config: {
      title: 'Alerts',
      showMarkAll: false,
      showFooter: false,
      items: notifications.slice(0, 3),
    },
  },
};

/* ------------------------------------------------------------------ */
/* Closed (open = false renders nothing)                               */
/* ------------------------------------------------------------------ */

export const Closed: Story = {
  args: {
    open: false,
    config: {
      title: 'Notifications',
      items: notifications,
    },
  },
};
