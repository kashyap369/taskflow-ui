import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectHealthChart } from './project-health-chart';

describe('ProjectHealthChart', () => {
  let component: ProjectHealthChart;
  let fixture: ComponentFixture<ProjectHealthChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectHealthChart]
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
