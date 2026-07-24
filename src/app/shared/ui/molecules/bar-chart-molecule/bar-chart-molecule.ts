import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption, SeriesOption } from 'echarts';

export type ChartSeriesType = 'line' | 'area' | 'bar';

export interface ChartSeries {
  /** Legend / tooltip name for this series. */
  name: string;

  /** Y values, aligned 1:1 with the dataset's `categories`. */
  data: number[];

  /** Overrides the chart-level default type for this series. */
  type?: ChartSeriesType;

  /** Overrides the palette color for this series. */
  color?: string;

  /** Overrides the chart-level `smooth` for this series. */
  smooth?: boolean;
}

export interface ChartDataset {
  /** X-axis labels (e.g. ['Mon', 'Tue', ...]). */
  categories: string[];

  /** One or more series plotted against `categories`. */
  series: ChartSeries[];
}

export interface ChartFilterOption {
  /** Text shown on the toggle button (e.g. 'Week'). */
  label: string;

  /** Value emitted on click and used to look up `datasetsByFilter`. */
  value: string;
}

export interface BarChartConfig {
  // Header
  title?: string;
  subtitle?: string;

  // Data — either a single dataset, or one dataset per filter value.
  dataset?: ChartDataset;
  datasetsByFilter?: Record<string, ChartDataset>;

  // Filter toggle
  filters?: ChartFilterOption[];
  activeFilter?: string;

  // Axis
  yMin?: number;
  yMax?: number;
  yInterval?: number;
  showYAxis?: boolean;

  // Tooltip — `tooltipSuffix` is appended to each value; `tooltipFormatter`
  // takes full control when you need it (receives raw ECharts params).
  tooltipSuffix?: string;
  tooltipFormatter?: (params: unknown) => string;

  // Appearance
  defaultType?: ChartSeriesType;
  smooth?: boolean;
  colors?: string[];
  height?: number;
}

const DEFAULT_COLORS = ['#6D5DF6', '#00A3FF', '#10B981', '#F59E0B'];

@Component({
  selector: 'app-bar-chart-molecule',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  templateUrl: './bar-chart-molecule.html',
  styleUrl: './bar-chart-molecule.scss',
})
export class BarChartMolecule {
  private readonly configSignal = signal<BarChartConfig>({});

  /** The full chart configuration. All data is supplied by the caller. */
  @Input({ required: true })
  set config(value: BarChartConfig) {
    this.configSignal.set(value ?? {});
    this.selectedFilter.set(value?.activeFilter ?? value?.filters?.[0]?.value ?? '');
  }
  get config(): BarChartConfig {
    return this.configSignal();
  }

  /** Emits the filter `value` whenever the user clicks a toggle button. */
  @Output()
  filterChange = new EventEmitter<string>();

  readonly selectedFilter = signal<string>('');

  readonly height = computed(() => this.configSignal().height ?? 320);

  /** The dataset for the active filter, falling back to the single dataset. */
  private readonly activeDataset = computed<ChartDataset>(() => {
    const cfg = this.configSignal();
    const byFilter = cfg.datasetsByFilter?.[this.selectedFilter()];
    return byFilter ?? cfg.dataset ?? { categories: [], series: [] };
  });

  readonly chartOption = computed<EChartsOption>(() => this.buildOption());

  onFilterClick(value: string): void {
    if (value === this.selectedFilter()) return;
    this.selectedFilter.set(value);
    this.filterChange.emit(value);
  }

  private buildOption(): EChartsOption {
    const cfg = this.configSignal();
    const dataset = this.activeDataset();
    const colors = cfg.colors ?? DEFAULT_COLORS;
    const defaultType: ChartSeriesType = cfg.defaultType ?? 'area';
    const smooth = cfg.smooth ?? true;

    return {
      color: colors,

      tooltip: {
        trigger: 'axis',
        ...(cfg.tooltipFormatter
          ? { formatter: cfg.tooltipFormatter as never }
          : cfg.tooltipSuffix
            ? { valueFormatter: (value) => `${value}${cfg.tooltipSuffix}` }
            : {}),
      },

      legend: { show: false },

      grid: {
        left: 20,
        right: 20,
        top: 20,
        bottom: 20,
        containLabel: true,
      },

      xAxis: {
        type: 'category',
        boundaryGap: defaultType === 'bar',
        data: dataset.categories,
        axisLine: { show: false },
        axisTick: { show: false },
      },

      yAxis: {
        type: 'value',
        show: cfg.showYAxis ?? true,
        min: cfg.yMin ?? 0,
        max: cfg.yMax,
        interval: cfg.yInterval,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          lineStyle: { type: 'dashed', color: '#E8ECF4' },
        },
      },

      series: dataset.series.map((series, index) => {
        const color = series.color ?? colors[index % colors.length];
        const type = series.type ?? defaultType;
        return this.buildSeries(series, type, color, series.smooth ?? smooth);
      }),
    };
  }

  private buildSeries(
    series: ChartSeries,
    type: ChartSeriesType,
    color: string,
    smooth: boolean,
  ): SeriesOption {
    if (type === 'bar') {
      return {
        name: series.name,
        type: 'bar',
        data: series.data,
        barMaxWidth: 28,
        itemStyle: { color, borderRadius: [6, 6, 0, 0] },
      };
    }

    // line + area share the same ECharts 'line' type; area adds a gradient fill.
    return {
      name: series.name,
      type: 'line',
      smooth,
      symbol: 'none',
      data: series.data,
      lineStyle: { width: 3, color },
      ...(type === 'area'
        ? {
            areaStyle: {
              opacity: 0.9,
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: this.withAlpha(color, 0.35) },
                  { offset: 1, color: this.withAlpha(color, 0.02) },
                ],
              },
            },
          }
        : {}),
    };
  }

  /** Converts a #rrggbb hex color to an rgba() string with the given alpha. */
  private withAlpha(hex: string, alpha: number): string {
    const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!match) return hex;
    const r = parseInt(match[1], 16);
    const g = parseInt(match[2], 16);
    const b = parseInt(match[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
