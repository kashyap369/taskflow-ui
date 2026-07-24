import type { Meta, StoryObj } from '@storybook/angular';
import { TaskDetailModalMolecule } from './task-detail-modal-molecule';

const meta: Meta<TaskDetailModalMolecule> = {
  title: 'Molecules/TaskDetailModalMolecule',
  component: TaskDetailModalMolecule,
  argTypes: {
    config: { control: 'object' },
    open: { control: 'boolean' },
    closed: { action: 'closed' },
    subtaskToggle: { action: 'subtaskToggle' },
    commentSubmit: { action: 'commentSubmit' },
    attach: { action: 'attach' },
  },
};

export default meta;

type Story = StoryObj<TaskDetailModalMolecule>;

/* ------------------------------------------------------------------ */
/* Default — the reference image                                        */
/* ------------------------------------------------------------------ */

export const Default: Story = {
  args: {
    open: true,
    config: {
      project: { name: 'Q3 Marketing Launch', color: '#EC4899' },
      title: 'Draft launch blog post',
      description: 'Announce v3 with key feature highlights.',
      subtasks: [
        { title: 'Outline', done: true },
        { title: 'First draft', done: true },
        { title: 'Edit pass' },
      ],
      comments: [
        { author: 'Avery Mitchell', text: 'Add a section on privacy.', time: '1d ago', background: '#E5E7FB' },
      ],
      status: 'Review',
      priority: { label: 'Medium', color: '#8B5CF6', background: '#F3EEFF' },
      dueDate: 'Wed, Jul 8',
      assignees: [{ name: 'Mia', background: '#E0F2FE' }],
      tags: ['#content'],
    },
  },
};

/* ------------------------------------------------------------------ */
/* High priority, multiple assignees & tags                            */
/* ------------------------------------------------------------------ */

export const HighPriority: Story = {
  args: {
    open: true,
    config: {
      project: { name: 'Billing Migration', color: '#F97316' },
      title: 'Stripe webhook reconciliation',
      description: 'Ensure all webhook events reconcile against ledger entries.',
      subtasks: [
        { title: 'Map event types', done: true },
        { title: 'Idempotency keys' },
        { title: 'Backfill script' },
        { title: 'QA in staging' },
      ],
      comments: [
        { author: 'Ethan Brooks', text: 'Watch out for duplicate charge.succeeded events.', time: '3h ago', background: '#E7F8F1' },
        { author: 'Sofia Reyes', text: 'Staging creds are in 1Password.', time: '1h ago', background: '#FDE7EF' },
      ],
      status: 'In Progress',
      priority: { label: 'High', color: '#F59E0B', background: '#FEF3E2' },
      dueDate: 'Fri, Jul 3',
      assignees: [
        { name: 'Ethan', background: '#E5E7FB' },
        { name: 'Sofia', background: '#FDE7EF' },
      ],
      tags: ['#billing', '#urgent'],
    },
  },
};

/* ------------------------------------------------------------------ */
/* Minimal — title + details only, no attach button                    */
/* ------------------------------------------------------------------ */

export const Minimal: Story = {
  args: {
    open: true,
    config: {
      title: 'Component a11y audit',
      status: 'To Do',
      priority: { label: 'Low', color: '#10B981', background: '#E7F8F1' },
      dueDate: 'Mon, Jul 11',
      showAttach: false,
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
      title: 'Draft launch blog post',
      status: 'Review',
    },
  },
};
