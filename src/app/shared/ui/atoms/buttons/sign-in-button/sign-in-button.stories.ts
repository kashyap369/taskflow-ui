import type { Meta, StoryObj } from '@storybook/angular';
import { SignInButton } from './sign-in-button';

const meta: Meta<SignInButton> = {
  title: 'Atoms/Button/SignInButton',
  component: SignInButton,
};

export default meta;

type Story = StoryObj<SignInButton>;

export const Default: Story = {};