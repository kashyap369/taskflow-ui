import type { Meta, StoryObj } from '@storybook/angular';
import { MeetingCollaborationPanel } from './meeting-collaboration-panel';
const meta: Meta<MeetingCollaborationPanel> = { title: 'Organisms/Meeting Collaboration Panel', component: MeetingCollaborationPanel, args: { meetingId: 41, guestSessionToken: null, live: true, compact: false } };
export default meta; type Story = StoryObj<MeetingCollaborationPanel>;
export const Live: Story = {}; export const Compact: Story = { args: { compact: true } };
