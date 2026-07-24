import type { Meta, StoryObj } from '@storybook/angular';
import { LottiePlayer } from './lottie-player';

const meta: Meta<LottiePlayer> = {
  title: 'Atoms/LottiePlayer',
  component: LottiePlayer,
  tags: ['autodocs'],
  argTypes: {
    src: { control: 'text' },
    width: { control: 'number' },
    height: { control: 'number' },
    loop: { control: 'boolean' },
    ariaLabel: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<LottiePlayer>;

export const Loading: Story = {
  args: {
    src: '/lottie/loading-dots.json',
    width: 100,
    height: 40,
    loop: true,
    ariaLabel: 'Loading',
  },
};

export const Empty: Story = {
  args: {
    src: '/lottie/empty.json',
    width: 160,
    height: 160,
    loop: true,
    ariaLabel: 'Nothing here yet',
  },
};
