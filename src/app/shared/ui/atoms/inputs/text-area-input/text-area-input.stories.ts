import type { Meta, StoryObj } from '@storybook/angular';
import { TextAreaInput } from './text-area-input';

const meta: Meta<TextAreaInput> = {
  title: 'Atoms/Input/Text Area',
  component: TextAreaInput,

  args: {
    label: 'Description',
    placeholder: 'Write something...',
    rows: 5,
    helperText: 'Maximum 500 characters.',
    showValidation: true,
  },

  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    value: { control: 'text' },
    rows: { control: 'number' },
    helperText: { control: 'text' },
    errorMessage: { control: 'text' },
    successMessage: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    success: { control: 'boolean' },
    showValidation: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<TextAreaInput>;

export const Default: Story = {};

export const Required: Story = {
  args: {
    required: true,
  },
};

export const Success: Story = {
  args: {
    success: true,
    successMessage: 'Description looks good.',
  },
};

export const Error: Story = {
  args: {
    invalid: true,
    errorMessage: 'Description is required.',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Feedback: Story = {
  args: {
    label: 'Feedback',
    placeholder: 'Tell us what you think...',
    helperText: 'Your feedback helps us improve.',
  },
};

export const ProductDescription: Story = {
  args: {
    label: 'Product Description',
    placeholder: 'Enter product description...',
    rows: 8,
  },
};