import type { Meta, StoryObj } from '@storybook/angular';
import { Button } from './button';

const meta: Meta<Button> = {
  title: 'Atoms/Button',
  component: Button,
  argTypes: {
    text: {
      control: 'text',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    loading: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    iconLeft: {
      control: false,
    },
    iconRight: {
      control: false,
    },
  },
};

export default meta;

type Story = StoryObj<Button>;

export const Primary: Story = {
  args: {
    text: 'Button',
    variant: 'primary',
    size: 'md',
  },
};

export const Secondary: Story = {
  args: {
    text: 'View Demo',
    variant: 'secondary',
  },
};

export const Danger: Story = {
  args: {
    text: 'Delete',
    variant: 'danger',
  },
};

export const Loading: Story = {
  args: {
    text: 'Saving',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    text: 'Disabled',
    disabled: true,
  },
};
