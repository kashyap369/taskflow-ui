import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';

export interface DonutSegment {
  /** Legend / tooltip label. */
  name: string;

  /** Numeric value for this slice. */
  value: number;

  /** Overrides the palette color for this slice. */
  color?: string;
}

export type DonutVariant = 'donut' | 'pie';

export type DonutLegendPosition = 'right' | 'bottom' | 'none';

export interface DonutChartConfig {
  // Header
  title?: string;
  subtitle?: string;

  // Data — all supplied by the caller.
  segments: DonutSegment[];

  // Variant
  variant?: DonutVariant;
  legendPosition?: DonutLegendPosition;
  rounded?: boolean;

  // Center label (donut only)
  showCenterTotal?: boolean;
  centerLabel?: string;
  centerValue?: string;

  // Legend
  showLegendValues?: boolean;
  showLegendPercent?: boolean;

  // Tooltip
  tooltipSuffix?: string;

  // Appearance
  colors?: string[];
  height?: number;
}

const DEFAULT_COLORS = ['#10B981', '#F59E0B', '#F43F5E', '#4F6EF7', '#8B5CF6', '#00A3FF'];

@Component({
  selector: 'app-donut-chart-molecule',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  templateUrl: './donut-chart-molecule.html',
  styleUrl: './donut-chart-molecule.scss',
})
export class DonutChartMolecule {
  private readonly configSignal = signal<DonutChartConfig>({ segments: [] });

  /** The full chart configuration. All data is supplied by the caller. */
  @Input({ required: true })
  set config(value: DonutChartConfig) {
    this.configSignal.set(value ?? { segments: [] });
  }
  get config(): DonutChartConfig {
    return this.configSignal();
  }

  /** Emits the segment name when a slice or legend row is clicked. */
  @Output()
  segmentClick = new EventEmitter<string>();

  readonly height = computed(() => this.configSignal().height ?? 260);

  readonly legendPosition = computed<DonutLegendPosition>(
    () => this.configSignal().legendPosition ?? 'right',
  );

  /** Segments paired with their resolved color, for the legend template. */
  readonly legendItems = computed(() => {
    const cfg = this.configSignal();
    const colors = cfg.colors ?? DEFAULT_COLORS;
    const total = this.total();
    return cfg.segments.map((segment, index) => ({
      name: segment.name,
      value: segment.value,
      color: segment.color ?? colors[index % colors.length],
      percent: total ? Math.round((segment.value / total) * 100) : 0,
    }));
  });

  readonly total = computed(() =>
    this.configSignal().segments.reduce((sum, segment) => sum + segment.value, 0),
  );

  readonly centerValue = computed(() => this.configSignal().centerValue ?? `${this.total()}`);

  readonly showCenter = computed(() => {
    const cfg = this.configSignal();
    return (cfg.variant ?? 'donut') === 'donut' && (cfg.showCenterTotal || !!cfg.centerValue);
  });

  readonly chartOption = computed<EChartsOption>(() => this.buildOption());

  onSegmentClick(name: string): void {
    this.segmentClick.emit(name);
  }

  private buildOption(): EChartsOption {
    const cfg = this.configSignal();
    const colors = cfg.colors ?? DEFAULT_COLORS;
    const isPie = (cfg.variant ?? 'donut') === 'pie';

    return {
      color: colors,

      tooltip: {
        trigger: 'item',
        ...(cfg.tooltipSuffix
          ? { valueFormatter: (value) => `${value}${cfg.tooltipSuffix}` }
          : {}),
      },

      legend: { show: false },

      series: [
        {
          type: 'pie',
          radius: isPie ? ['0%', '82%'] : ['60%', '82%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          label: { show: false },
          labelLine: { show: false },
          itemStyle: {
            borderWidth: cfg.rounded ? 4 : 4,
            borderColor: '#fff',
            borderRadius: cfg.rounded ? 6 : 0,
          },
          emphasis: {
            scaleSize: 6,
          },
          data: cfg.segments.map((segment, index) => ({
            name: segment.name,
            value: segment.value,
            itemStyle: { color: segment.color ?? colors[index % colors.length] },
          })),
        },
      ],
    };
  }
}
