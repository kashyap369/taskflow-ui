import { Component } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'app-productivity-chart',
  standalone: true,
  imports: [NgxEchartsDirective],
  templateUrl: './productivity-chart.html',
  styleUrl: './productivity-chart.scss',
})
export class ProductivityChart {
  selectedView = 'Week';

  chartOption: EChartsOption = {
    color: ['#4F6EF7', '#00A3FF'],

    tooltip: {
      trigger: 'axis',
    },

    legend: {
      show: false,
    },

    grid: {
      left: 20,
      right: 20,
      top: 20,
      bottom: 20,
      containLabel: true,
    },

    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],

      axisLine: {
        show: false,
      },

      axisTick: {
        show: false,
      },
    },

    yAxis: {
      type: 'value',

      min: 0,

      max: 28,

      interval: 7,

      axisLine: {
        show: false,
      },

      axisTick: {
        show: false,
      },

      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#E8ECF4',
        },
      },
    },

    series: [
      {
        name: 'Created',

        type: 'line',

        smooth: true,

        symbol: 'none',

        lineStyle: {
          width: 3,
        },

        areaStyle: {
          opacity: 0.15,
        },

        data: [12, 18, 9, 22, 27, 6, 4],
      },

      {
        name: 'Completed',

        type: 'line',

        smooth: true,

        symbol: 'none',

        lineStyle: {
          width: 3,
        },

        areaStyle: {
          opacity: 0.12,
        },

        data: [16, 14, 12, 18, 20, 4, 3],
      },
    ],
  };
}
