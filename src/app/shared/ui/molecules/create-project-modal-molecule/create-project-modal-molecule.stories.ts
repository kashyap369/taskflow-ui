import type { Meta, StoryObj } from '@storybook/angular';
import { CreateProjectModalMolecule } from './create-project-modal-molecule';

const meta: Meta<CreateProjectModalMolecule> = {
  title: 'Molecules/CreateProjectModalMolecule',
  component: CreateProjectModalMolecule,
  argTypes: {
    config: { control: 'object' },
    open: { control: 'boolean' },
    closed: { action: 'closed' },
    create: { action: 'create' },
  },
};

export default meta;

type Story = StoryObj<CreateProjectModalMolecule>;

const team = [
  { name: 'Avery', background: '#E5E7FB' },
  { name: 'Liam', background: '#E5E7FB' },
  { name: 'Sofia', background: '#111827' },
  { name: 'Noah', background: '#FDE7EF' },
  { name: 'Mia', background: '#E0F2FE' },
  { name: 'Ethan', background: '#E5E7FB' },
  { name: 'Zara', background: '#E5E7FB' },
  { name: 'Diego', background: '#E5E7FB' },
];

/* ------------------------------------------------------------------ */
/* Default — the reference image                                        */
/* ------------------------------------------------------------------ */

export const Default: Story = {
  args: {
    open: true,
    config: {
      title: 'Create new project',
      statusOptions: [
        { label: 'On Track', value: 'on-track' },
        { label: 'At Risk', value: 'at-risk' },
        { label: 'Delayed', value: 'delayed' },
        { label: 'Completed', value: 'completed' },
      ],
      initialStatus: 'at-risk',
      teamOptions: team,
    },
  },
};

/* ------------------------------------------------------------------ */
/* Custom accent palette + preselected accent                          */
/* ------------------------------------------------------------------ */

export const CustomPalette: Story = {
  args: {
    open: true,
    config: {
      title: 'New workspace',
      accentColors: ['#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
      initialAccent: '#10B981',
      confirmLabel: 'Create workspace',
      teamOptions: team.slice(0, 4),
    },
  },
};

/* ------------------------------------------------------------------ */
/* No team selector                                                    */
/* ------------------------------------------------------------------ */

export const NoTeam: Story = {
  args: {
    open: true,
    config: {
      title: 'Create new project',
      teamOptions: [],
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
      title: 'Create new project',
      teamOptions: team,
    },
  },
};
