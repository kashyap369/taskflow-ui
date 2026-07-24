import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { LineChart, BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

import { BarChartMolecule } from './bar-chart-molecule';

echarts.use([LineChart, BarChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

describe('BarChartMolecule', () => {
  let component: BarChartMolecule;
  let fixture: ComponentFixture<BarChartMolecule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarChartMolecule],
      providers: [provideEchartsCore({ echarts })],
    }).compileComponents();

    fixture = TestBed.createComponent(BarChartMolecule);
    component = fixture.componentInstance;
    component.config = {
      title: 'Productivity this week',
      filters: [
        { label: 'Week', value: 'week' },
        { label: 'Month', value: 'month' },
      ],
      activeFilter: 'week',
      dataset: {
        categories: ['Mon', 'Tue', 'Wed'],
        series: [{ name: 'Completed', data: [12, 18, 9] }],
      },
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default the selected filter to the active filter', () => {
    expect(component.selectedFilter()).toBe('week');
  });

  it('should emit the filter value on click', () => {
    let emitted: string | undefined;
    component.filterChange.subscribe((value) => (emitted = value));

    component.onFilterClick('month');

    expect(emitted).toBe('month');
    expect(component.selectedFilter()).toBe('month');
  });
});
