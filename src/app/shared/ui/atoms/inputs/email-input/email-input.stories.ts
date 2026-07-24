import type { Meta, StoryObj } from '@storybook/angular';
import { EmailInput } from './email-input';

const meta: Meta<EmailInput> = {
  title: 'Atoms/Input/Email Input',
  component: EmailInput,
};

export default meta;

type Story = StoryObj<EmailInput>;

export const Default: Story = {};
