import type { Meta, StoryObj } from '@storybook/angular';

import { Pagination } from './pagination';

const meta: Meta<Pagination> = {
  title: 'Molecules/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  argTypes: {
    page: { control: { type: 'number', min: 1 } },
    pageSize: { control: { type: 'number', min: 1 } },
    total: { control: { type: 'number', min: 0 } },
    pageSizes: { control: 'object' },
    itemLabel: { control: 'text' },
    ariaLabel: { control: 'text' },
    maxPageButtons: { control: { type: 'number', min: 5, max: 15 } },
  },
  args: {
    page: 1,
    pageSize: 10,
    total: 42,
    pageSizes: [10, 25, 50, 100],
    itemLabel: 'users',
  },
};
export default meta;

type Story = StoryObj<Pagination>;

/** Short list — every page gets its own button. */
export const Default: Story = {};

/** Long list — the middle collapses to `1 … 5 6 7 … 12`. */
export const ManyPages: Story = {
  args: { page: 6, total: 120, itemLabel: 'tasks' },
};

/** Last page: the next button is disabled and the range closes on the total. */
export const LastPage: Story = {
  args: { page: 5, total: 42 },
};

/** A single page still shows the summary, but no page buttons. */
export const SinglePage: Story = {
  args: { total: 7 },
};

/** Nothing matched the filters. */
export const Empty: Story = {
  args: { total: 0, itemLabel: 'members' },
};

/** Without a rows-per-page choice the select is hidden. */
export const NoPageSizeSelect: Story = {
  args: { pageSizes: [] },
};
