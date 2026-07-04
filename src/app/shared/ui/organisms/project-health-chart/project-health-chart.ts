import { Component } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'app-project-health-chart',
  standalone: true,
  imports: [NgxEchartsDirective],
  templateUrl: './project-health-chart.html',
  styleUrl: './project-health-chart.scss',
})
export class ProjectHealthChart {
  readonly status = [
    { name: 'On Track', value: 5, color: '#10B981' },
    { name: 'At Risk', value: 1, color: '#F59E0B' },
    { name: 'Delayed', value: 1, color: '#F43F5E' },
    { name: 'Completed', value: 1, color: '#4F6EF7' },
  ];

  chartOption: EChartsOption = {
    color: this.status.map((x) => x.color),

    tooltip: {
      trigger: 'item',
    },

    legend: {
      show: false,
    },

    series: [
      {
        type: 'pie',

        radius: ['60%', '82%'],

        center: ['40%', '50%'],

        avoidLabelOverlap: false,

        label: {
          show: false,
        },

        labelLine: {
          show: false,
        },

        itemStyle: {
          borderWidth: 4,
          borderColor: '#fff',
        },

        data: this.status,
      },
    ],
  };
}
