import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';

import { ProjectHealthChart } from './project-health-chart';

describe('ProjectHealthChart', () => {
  let component: ProjectHealthChart;
  let fixture: ComponentFixture<ProjectHealthChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectHealthChart],
      providers: [provideEchartsCore({ echarts })],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectHealthChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
