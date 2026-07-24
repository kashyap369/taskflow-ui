import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { LineChart, BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

import { BarChartMolecule } from './bar-chart-molecule';

echarts.use([LineChart, BarChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

const meta: Meta<BarChartMolecule> = {
  title: 'Molecules/Charts/BarChartMolecule',
  component: BarChartMolecule,
  decorators: [
    applicationConfig({
      providers: [provideEchartsCore({ echarts })],
    }),
  ],
  argTypes: {
    config: { control: 'object' },
    filterChange: { action: 'filterChange' },
  },
};

export default meta;

type Story = StoryObj<BarChartMolecule>;

/* ------------------------------------------------------------------ */
/* Productivity — the smooth area chart from the reference image        */
/* ------------------------------------------------------------------ */

export const ProductivityAreaChart: Story = {
  args: {
    config: {
      title: 'Productivity this week',
      subtitle: 'Tasks completed vs. created · focus score',
      filters: [
        { label: 'Week', value: 'week' },
        { label: 'Month', value: 'month' },
        { label: 'Quarter', value: 'quarter' },
      ],
      activeFilter: 'week',
      yMin: 0,
      yMax: 28,
      yInterval: 7,
      tooltipSuffix: ' tasks',
      colors: ['#6D5DF6', '#00A3FF'],
      datasetsByFilter: {
        week: {
          categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          series: [
            { name: 'Created', data: [12, 18, 9, 22, 27, 6, 4] },
            { name: 'Completed', data: [16, 14, 12, 18, 20, 4, 3] },
          ],
        },
        month: {
          categories: ['W1', 'W2', 'W3', 'W4'],
          series: [
            { name: 'Created', data: [72, 88, 65, 94] },
            { name: 'Completed', data: [60, 70, 58, 80] },
          ],
        },
        quarter: {
          categories: ['Jan', 'Feb', 'Mar'],
          series: [
            { name: 'Created', data: [220, 260, 240] },
            { name: 'Completed', data: [200, 230, 215] },
          ],
        },
      },
    },
  },
};

/* ------------------------------------------------------------------ */
/* Bar chart variant                                                    */
/* ------------------------------------------------------------------ */

export const BarChartVariant: Story = {
  args: {
    config: {
      title: 'Tasks completed',
      subtitle: 'Per day this week',
      defaultType: 'bar',
      tooltipSuffix: ' tasks',
      colors: ['#6D5DF6'],
      filters: [
        { label: 'Week', value: 'week' },
        { label: 'Month', value: 'month' },
        { label: 'Year', value: 'year' },
      ],
      activeFilter: 'week',
      datasetsByFilter: {
        week: {
          categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          series: [{ name: 'Completed', data: [16, 14, 12, 18, 20, 8, 5] }],
        },
        month: {
          categories: ['W1', 'W2', 'W3', 'W4'],
          series: [{ name: 'Completed', data: [60, 70, 58, 80] }],
        },
        year: {
          categories: ['Q1', 'Q2', 'Q3', 'Q4'],
          series: [{ name: 'Completed', data: [640, 720, 690, 810] }],
        },
      },
    },
  },
};

/* ------------------------------------------------------------------ */
/* Grouped bars (multi-series)                                          */
/* ------------------------------------------------------------------ */

export const GroupedBars: Story = {
  args: {
    config: {
      title: 'Created vs. completed',
      subtitle: 'Weekly comparison',
      defaultType: 'bar',
      colors: ['#6D5DF6', '#00A3FF'],
      tooltipSuffix: ' tasks',
      dataset: {
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        series: [
          { name: 'Created', data: [12, 18, 9, 22, 27] },
          { name: 'Completed', data: [16, 14, 12, 18, 20] },
        ],
      },
    },
  },
};

/* ------------------------------------------------------------------ */
/* Single line, no filter toggle                                        */
/* ------------------------------------------------------------------ */

export const SingleLineNoFilter: Story = {
  args: {
    config: {
      title: 'Focus score',
      subtitle: 'Rolling 7-day average',
      defaultType: 'line',
      colors: ['#10B981'],
      tooltipSuffix: ' pts',
      dataset: {
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        series: [{ name: 'Focus', data: [72, 80, 68, 85, 90, 60, 55] }],
      },
    },
  },
};

/* ------------------------------------------------------------------ */
/* Mixed series types (bar + line overlay)                              */
/* ------------------------------------------------------------------ */

export const MixedBarAndLine: Story = {
  args: {
    config: {
      title: 'Throughput & focus',
      subtitle: 'Tasks as bars, focus score as line',
      colors: ['#6D5DF6', '#F59E0B'],
      dataset: {
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        series: [
          { name: 'Tasks', type: 'bar', data: [16, 14, 12, 18, 20] },
          { name: 'Focus', type: 'line', data: [22, 18, 15, 24, 27] },
        ],
      },
    },
  },
};
