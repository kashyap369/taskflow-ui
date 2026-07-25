import type { Meta, StoryObj } from '@storybook/angular';

import { Skeleton } from './skeleton';

const meta: Meta<Skeleton> = {
  title: 'Atoms/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  argTypes: {
    circle: { control: 'boolean' },
    width: { control: 'text' },
    height: { control: 'text' },
    radius: { control: 'text' },
    count: { control: { type: 'number', min: 1, max: 8 } },
  },
};
export default meta;

type Story = StoryObj<Skeleton>;

export const Line: Story = {
  args: { width: '240px', height: '1rem', radius: '8px', count: 1 },
};

export const Paragraph: Story = {
  args: { width: '100%', height: '0.85rem', radius: '6px', count: 4 },
};

export const Avatar: Story = {
  args: { circle: true, width: '40px', height: '40px' },
};

export const Card: Story = {
  args: { width: '100%', height: '160px', radius: '18px', count: 1 },
};
