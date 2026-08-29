import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CalendarDetailDrawer } from './calendar-detail-drawer';

describe('CalendarDetailDrawer', () => {
  let fixture: ComponentFixture<CalendarDetailDrawer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarDetailDrawer],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarDetailDrawer);
    fixture.componentRef.setInput('item', {
      id: 'task-18', sourceId: 18, kind: 'task', title: 'Calendar integration',
      start: '2026-08-29', end: '2026-09-01', status: 'In progress · High',
      assignee: 'Ada', team: 'Platform', projectId: 7, projectTitle: 'TaskFlow', progress: 40,
      overdue: false, completed: false, statusKey: 'task-2', priority: 3,
      priorityLabel: 'High', teamId: 4, assignedToUserId: 12,
    });
    fixture.detectChanges();
  });

  it('renders the shared read-only details and existing task actions', () => {
    expect(fixture.nativeElement.textContent).toContain('Calendar integration');
    expect(fixture.nativeElement.textContent).toContain('Open task actions');
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).not.toBeNull();
  });
});
