import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { Observable, of, throwError } from 'rxjs';

import { APP_SETTINGS } from '@core/config/app.tokens';
import { AppSettings } from '@core/config/app.settings';
import { OrganizationRepository } from '../organization.repository';
import { OrganizationStatus, ProjectStatus } from '../organization.models';
import { CalendarPage } from './calendar-page';

let scheduleTaskResult: Observable<void> = of(undefined);

const repositoryStub = {
  getMyOrganizations: () =>
    of([{ id: 2, name: 'Northwind Labs', ownerUserId: 1, status: OrganizationStatus.Active }]),
  getDashboard: () => of(null),
  getProjects: () =>
    of([
      {
        id: 7,
        organizationId: 2,
        title: 'Website redesign',
        description: null,
        status: ProjectStatus.Active,
        startDate: '2026-08-01T00:00:00Z',
        expectedCompletionDate: '2026-08-20T00:00:00Z',
        actualCompletionDate: null,
        createdByUserId: 1,
        taskCount: 0,
        completedTaskCount: 0,
        completionPercentage: 0,
      },
    ]),
  getTasks: () => of([]),
  getRoles: () => of([]),
  getMembers: () => of([]),
  getInvitations: () => of([]),
  getTeams: () => of([]),
  getPermissionCatalog: () => of([]),
  getCapacity: () => of([]),
  scheduleTask: () => scheduleTaskResult,
  setTaskEstimate: () => of(undefined),
  setMemberCapacity: () => of(undefined),
};

describe('CalendarPage', () => {
  let component: CalendarPage;
  let fixture: ComponentFixture<CalendarPage>;

  beforeEach(async () => {
    localStorage.clear();
    scheduleTaskResult = of(undefined);
    await TestBed.configureTestingModule({
      imports: [CalendarPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideToastr(),
        provideAnimations(),
        { provide: APP_SETTINGS, useValue: AppSettings },
        { provide: OrganizationRepository, useValue: repositoryStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates a schedule from the organization data', () => {
    expect(component).toBeTruthy();
    expect(component.activeTab()).toBe('schedule');
    expect(component.scheduleCounts()).toEqual({ projects: 1, tasks: 0, overdue: 1 });
    expect(component.scheduleEvents()[0].title).toBe('Website redesign');
  });

  it('exposes accessible schedule and timeline tabs', () => {
    const tabs = fixture.nativeElement.querySelectorAll('.view-tabs [role="tab"]');
    expect(tabs.length).toBe(3);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[1].textContent).toContain('Project timeline');
    expect(tabs[2].textContent).toContain('Team capacity');
  });

  it('opens the server-backed Team Capacity view', () => {
    component.setTab('capacity');
    fixture.detectChanges();

    expect(component.activeTab()).toBe('capacity');
    expect(fixture.nativeElement.querySelector('#capacity-panel')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Workload you can defend');
  });

  it('selects the first project when opening the timeline', () => {
    component.setTab('timeline');
    fixture.detectChanges();

    expect(component.activeTab()).toBe('timeline');
    expect(component.selectedProjectId()).toBe(7);
    expect(fixture.nativeElement.querySelector('#timeline-panel')).not.toBeNull();
  });

  it('keeps the same filters when switching between schedule and timeline', () => {
    component.setTextFilter('kind', 'task');
    component.setBooleanFilter('includeCompleted', false);
    component.setTab('timeline');

    expect(component.filters().kind).toBe('task');
    expect(component.filters().includeCompleted).toBeFalse();

    component.setTab('schedule');
    expect(component.filters().kind).toBe('task');
  });

  it('keeps task events read-only when the role lacks ManageTasks', () => {
    expect(component.canManageTasks()).toBeFalse();
    expect(component.scheduleEvents().every((event) => !event.editable)).toBeTrue();
  });

  it('visibly restores a failed schedule move', () => {
    scheduleTaskResult = throwError(() => new Error('save failed'));
    const revert = jasmine.createSpy('revert');

    component['persistSchedule'](18, '2026-09-03', '2026-09-08', revert);

    expect(revert).toHaveBeenCalled();
    expect(component.scheduleError()).toContain('restored');
  });
});
