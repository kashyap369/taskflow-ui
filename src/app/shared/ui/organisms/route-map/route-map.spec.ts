import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteMap } from './route-map';

describe('RouteMap', () => {
  let component: RouteMap;
  let fixture: ComponentFixture<RouteMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [RouteMap] }).compileComponents();
    fixture = TestBed.createComponent(RouteMap);
    fixture.componentRef.setInput('tileUrl', 'about:blank#{z}/{x}/{y}');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('accepts route data', () => {
    fixture.componentRef.setInput('data', {
      lines: [{ kind: 'recorded', points: [[19.07, 72.88], [19.08, 72.89]] }],
      markers: [{ id: 'a', latitude: 19.07, longitude: 72.88, tone: 'primary', tooltip: 'Start' }],
    });
    fixture.detectChanges();
    expect(component.data().lines.length).toBe(1);
  });
});
