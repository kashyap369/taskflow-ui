import { Component, computed, input } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';

export interface HealthSegment {
  name: string;
  value: number;
  color: string;
}

const DEFAULT_SEGMENTS: HealthSegment[] = [
  { name: 'On Track', value: 5, color: '#10B981' },
  { name: 'At Risk', value: 1, color: '#F59E0B' },
  { name: 'Delayed', value: 1, color: '#F43F5E' },
  { name: 'Completed', value: 1, color: '#4F6EF7' },
];

/**
 * Donut breakdown organism. Input-driven: feed it any set of labelled/coloured segments
 * (e.g. real task-status counts). Falls back to sample data when no input is provided.
 */
@Component({
  selector: 'app-project-health-chart',
  standalone: true,
  imports: [NgxEchartsDirective],
  templateUrl: './project-health-chart.html',
  styleUrl: './project-health-chart.scss',
})
export class ProjectHealthChart {
  readonly title = input('Project health');
  readonly subtitle = input('4 active projects');
  readonly segments = input<HealthSegment[]>(DEFAULT_SEGMENTS);

  /** Only segments with a value > 0, so an empty status doesn't clutter the legend. */
  readonly status = computed(() => this.segments().filter((s) => s.value > 0));

  readonly chartOption = computed<EChartsOption>(() => {
    const data = this.status();

    return {
      color: data.map((x) => x.color),
      tooltip: { trigger: 'item' },
      legend: { show: false },
      series: [
        {
          type: 'pie',
          radius: ['60%', '82%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: false,
          label: { show: false },
          labelLine: { show: false },
          itemStyle: { borderWidth: 4, borderColor: 'transparent' },
          data: data.map((x) => ({ name: x.name, value: x.value })),
        },
      ],
    };
  });
}
