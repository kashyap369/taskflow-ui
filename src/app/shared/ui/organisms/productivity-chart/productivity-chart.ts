import { Component, computed, output, signal } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';

export type ProductivityView = 'Week' | 'Month' | 'Quarter';

/** Axis labels + series for each range. Demo data — swap for a facade feed when wired to the API. */
const SERIES: Record<ProductivityView, { axis: string[]; created: number[]; completed: number[] }> = {
  Week: {
    axis: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    created: [12, 18, 9, 22, 27, 6, 4],
    completed: [16, 14, 12, 18, 20, 4, 3],
  },
  Month: {
    axis: ['W1', 'W2', 'W3', 'W4'],
    created: [64, 71, 58, 80],
    completed: [59, 66, 61, 74],
  },
  Quarter: {
    axis: ['Jan', 'Feb', 'Mar'],
    created: [212, 245, 268],
    completed: [198, 231, 254],
  },
};

@Component({
  selector: 'app-productivity-chart',
  standalone: true,
  imports: [NgxEchartsDirective],
  templateUrl: './productivity-chart.html',
  styleUrl: './productivity-chart.scss',
})
export class ProductivityChart {
  /**
   * The Week/Month/Quarter buttons were inert — no handler, no output, and `selectedView` never
   * changed. They now actually switch the range and report it. Phase 6.
   */
  readonly selectedView = signal<ProductivityView>('Week');
  readonly viewChange = output<ProductivityView>();

  readonly views: ProductivityView[] = ['Week', 'Month', 'Quarter'];

  selectView(view: ProductivityView): void {
    this.selectedView.set(view);
    this.viewChange.emit(view);
  }

  /**
   * ECharts is canvas-rendered, so it cannot read CSS variables itself — the palette has to be
   * resolved in TS. These were hardcoded hex (`#4F6EF7` / `#00A3FF` / `#E8ECF4`), which Phase 2's
   * sweep missed because design-lint only scans SCSS. They now come from the theme tokens.
   */
  private token(name: string, fallback: string): string {
    if (typeof getComputedStyle !== 'function') return fallback;
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  }

  readonly chartOption = computed<EChartsOption>(() => {
    const data = SERIES[this.selectedView()];

    return {
      color: [this.token('--primary', '#7c3aed'), this.token('--secondary', '#3b82f6')],
      tooltip: { trigger: 'axis' },
      legend: { show: false },
      grid: { left: 20, right: 20, top: 20, bottom: 20, containLabel: true },

      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.axis,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: this.token('--text-muted', '#5b6172') },
      },

      yAxis: {
        type: 'value',
        min: 0,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: this.token('--text-muted', '#5b6172') },
        splitLine: {
          lineStyle: { type: 'dashed', color: this.token('--border', '#e9ecf2') },
        },
      },

      series: [
        {
          name: 'Created',
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 3 },
          areaStyle: { opacity: 0.15 },
          data: data.created,
        },
        {
          name: 'Completed',
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 3 },
          areaStyle: { opacity: 0.12 },
          data: data.completed,
        },
      ],
    };
  });
}
