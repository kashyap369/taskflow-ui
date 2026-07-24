import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

import { DonutChartMolecule } from './donut-chart-molecule';

echarts.use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer]);

describe('DonutChartMolecule', () => {
  let component: DonutChartMolecule;
  let fixture: ComponentFixture<DonutChartMolecule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonutChartMolecule],
      providers: [provideEchartsCore({ echarts })],
    }).compileComponents();

    fixture = TestBed.createComponent(DonutChartMolecule);
    component = fixture.componentInstance;
    component.config = {
      title: 'Project health',
      subtitle: '4 active projects',
      segments: [
        { name: 'On Track', value: 5, color: '#10B981' },
        { name: 'At Risk', value: 1, color: '#F59E0B' },
        { name: 'Delayed', value: 1, color: '#F43F5E' },
        { name: 'Completed', value: 1, color: '#4F6EF7' },
      ],
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute the total of all segments', () => {
    expect(component.total()).toBe(8);
  });

  it('should compute legend percentages', () => {
    const onTrack = component.legendItems().find((i) => i.name === 'On Track');
    expect(onTrack?.percent).toBe(63);
  });

  it('should emit the segment name on click', () => {
    let emitted: string | undefined;
    component.segmentClick.subscribe((name) => (emitted = name));

    component.onSegmentClick('At Risk');

    expect(emitted).toBe('At Risk');
  });
});
