import type { Meta, StoryObj } from '@storybook/angular';
import { ViewProjectModalMolecule } from './view-project-modal-molecule';

const meta: Meta<ViewProjectModalMolecule> = {
  title: 'Molecules/ViewProjectModalMolecule',
  component: ViewProjectModalMolecule,
  argTypes: {
    config: { control: 'object' },
    open: { control: 'boolean' },
    closed: { action: 'closed' },
    confirm: { action: 'confirm' },
  },
};

export default meta;

type Story = StoryObj<ViewProjectModalMolecule>;

/* ------------------------------------------------------------------ */
/* Default — the reference image                                        */
/* ------------------------------------------------------------------ */

export const Default: Story = {
  args: {
    open: true,
    config: {
      title: 'Atlas Design System',
      subtitle: 'Unified component library across web and mobile.',
      color: '#7C6FF0',
      progress: 68,
      stats: [
        { label: 'PROGRESS', value: '68%' },
        { label: 'STATUS', value: 'On Track' },
        { label: 'TASKS', value: '57/84' },
        { label: 'DUE', value: '8/14/2026' },
      ],
      teamLabel: 'TEAM',
      team: [
        { name: 'Avery Mitchell', background: '#E5E7FB' },
        { name: 'Ethan Brooks', background: '#E5E7FB' },
        { name: 'Liam Chen', background: '#E5E7FB' },
      ],
      cancelLabel: 'Close',
      confirmLabel: 'Open project',
    },
  },
};

/* ------------------------------------------------------------------ */
/* At-risk project, custom gradient                                     */
/* ------------------------------------------------------------------ */

export const AtRiskProject: Story = {
  args: {
    open: true,
    config: {
      title: 'Mobile App v3',
      subtitle: 'Native rewrite with offline-first sync.',
      color: '#3B82F6',
      progress: 42,
      progressGradient: 'linear-gradient(90deg, #F59E0B, #F97316)',
      stats: [
        { label: 'PROGRESS', value: '42%' },
        { label: 'STATUS', value: 'At Risk' },
        { label: 'TASKS', value: '51/122' },
        { label: 'DUE', value: '7/30/2026' },
      ],
      team: [
        { name: 'Tara West' },
        { name: 'Dan Kim' },
      ],
      confirmLabel: 'Open project',
    },
  },
};

/* ------------------------------------------------------------------ */
/* Minimal — no team, no progress, single action                       */
/* ------------------------------------------------------------------ */

export const Minimal: Story = {
  args: {
    open: true,
    config: {
      title: 'Q3 Marketing Launch',
      subtitle: 'Multi-channel campaign for fall release.',
      color: '#EC4899',
      stats: [
        { label: 'STATUS', value: 'On Track' },
        { label: 'DUE', value: '7/12/2026' },
      ],
      showCancel: false,
      confirmLabel: 'View details',
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
      title: 'Atlas Design System',
      subtitle: 'Unified component library across web and mobile.',
      progress: 68,
    },
  },
};
