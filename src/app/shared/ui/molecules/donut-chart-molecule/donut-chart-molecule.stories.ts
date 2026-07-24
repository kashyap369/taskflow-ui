import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

import { DonutChartMolecule } from './donut-chart-molecule';

echarts.use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer]);

const meta: Meta<DonutChartMolecule> = {
  title: 'Molecules/Charts/DonutChartMolecule',
  component: DonutChartMolecule,
  decorators: [
    applicationConfig({
      providers: [provideEchartsCore({ echarts })],
    }),
  ],
  argTypes: {
    config: { control: 'object' },
    segmentClick: { action: 'segmentClick' },
  },
};

export default meta;

type Story = StoryObj<DonutChartMolecule>;

const projectHealth = [
  { name: 'On Track', value: 5, color: '#10B981' },
  { name: 'At Risk', value: 1, color: '#F59E0B' },
  { name: 'Delayed', value: 1, color: '#F43F5E' },
  { name: 'Completed', value: 1, color: '#4F6EF7' },
];

/* ------------------------------------------------------------------ */
/* Project health — the reference image                                 */
/* ------------------------------------------------------------------ */

export const ProjectHealth: Story = {
  args: {
    config: {
      title: 'Project health',
      subtitle: '4 active projects',
      segments: projectHealth,
    },
  },
};

/* ------------------------------------------------------------------ */
/* Donut with a total in the center                                     */
/* ------------------------------------------------------------------ */

export const WithCenterTotal: Story = {
  args: {
    config: {
      title: 'Project health',
      subtitle: '8 projects total',
      segments: projectHealth,
      showCenterTotal: true,
      centerLabel: 'Projects',
    },
  },
};

/* ------------------------------------------------------------------ */
/* Legend with percentages                                              */
/* ------------------------------------------------------------------ */

export const WithPercentages: Story = {
  args: {
    config: {
      title: 'Task status',
      subtitle: 'Distribution this sprint',
      segments: [
        { name: 'Done', value: 42, color: '#10B981' },
        { name: 'In Progress', value: 18, color: '#4F6EF7' },
        { name: 'To Do', value: 24, color: '#94A3B8' },
        { name: 'Blocked', value: 6, color: '#F43F5E' },
      ],
      showCenterTotal: true,
      centerLabel: 'Tasks',
      showLegendPercent: true,
      tooltipSuffix: ' tasks',
    },
  },
};

/* ------------------------------------------------------------------ */
/* Rounded segments                                                     */
/* ------------------------------------------------------------------ */

export const RoundedSegments: Story = {
  args: {
    config: {
      title: 'Time allocation',
      subtitle: 'This week',
      segments: [
        { name: 'Development', value: 60, color: '#6D5DF6' },
        { name: 'Meetings', value: 20, color: '#00A3FF' },
        { name: 'Review', value: 12, color: '#10B981' },
        { name: 'Admin', value: 8, color: '#F59E0B' },
      ],
      rounded: true,
      showLegendPercent: true,
      showCenterTotal: true,
      centerLabel: 'Hours',
    },
  },
};

/* ------------------------------------------------------------------ */
/* Full pie variant                                                     */
/* ------------------------------------------------------------------ */

export const PieVariant: Story = {
  args: {
    config: {
      title: 'Traffic sources',
      subtitle: 'Last 30 days',
      variant: 'pie',
      segments: [
        { name: 'Organic', value: 48, color: '#10B981' },
        { name: 'Direct', value: 28, color: '#4F6EF7' },
        { name: 'Referral', value: 14, color: '#F59E0B' },
        { name: 'Social', value: 10, color: '#F43F5E' },
      ],
      showLegendPercent: true,
    },
  },
};

/* ------------------------------------------------------------------ */
/* Legend below the chart                                               */
/* ------------------------------------------------------------------ */

export const LegendBottom: Story = {
  args: {
    config: {
      title: 'Priority breakdown',
      subtitle: 'Open tasks',
      segments: [
        { name: 'High', value: 8, color: '#F43F5E' },
        { name: 'Medium', value: 15, color: '#F59E0B' },
        { name: 'Low', value: 22, color: '#10B981' },
      ],
      legendPosition: 'bottom',
      showCenterTotal: true,
      centerLabel: 'Open',
    },
  },
};

/* ------------------------------------------------------------------ */
/* No legend                                                            */
/* ------------------------------------------------------------------ */

export const NoLegend: Story = {
  args: {
    config: {
      title: 'Completion',
      subtitle: 'Sprint 24',
      segments: [
        { name: 'Complete', value: 78, color: '#10B981' },
        { name: 'Remaining', value: 22, color: '#EEF1F6' },
      ],
      legendPosition: 'none',
      showCenterTotal: false,
      centerValue: '78%',
      centerLabel: 'Done',
    },
  },
};
