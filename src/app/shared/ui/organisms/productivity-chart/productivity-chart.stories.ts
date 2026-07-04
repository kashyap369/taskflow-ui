import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';

import { provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

import { ProductivityChart } from './productivity-chart';

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

const meta: Meta<ProductivityChart> = {
  title: 'Organisms/ProductivityChart',
  component: ProductivityChart,
  decorators: [
    applicationConfig({
      providers: [provideEchartsCore({ echarts })],
    }),
  ],
};

export default meta;
type Story = StoryObj<ProductivityChart>;

export const Default: Story = {};
