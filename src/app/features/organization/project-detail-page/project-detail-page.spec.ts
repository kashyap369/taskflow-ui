import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideLottieOptions } from 'ngx-lottie';
import { of } from 'rxjs';

import { APP_SETTINGS } from '@core/config/app.tokens';
import { AppSettings } from '@core/config/app.settings';
import { OrganizationRepository } from '../organization.repository';
import {
  OrganizationStatus,
  Project,
  ProjectStatus,
  TaskListItem,
  TaskPriority,
  TaskStatus,
} from '../organization.models';
import { ProjectDetailPage } from './project-detail-page';

const PROJECT: Project = {
  id: 1,
  organizationId: 2,
  title: 'Website Redesign',
  description: 'The marketing site',
  status: ProjectStatus.Active,
  startDate: '2026-07-01T00:00:00Z',
  expectedCompletionDate: null,
  actualCompletionDate: null,
  createdByUserId: 1,
  taskCount: 3,
  completedTaskCount: 1,
  completionPercentage: 33,
};

const task = (id: number, title: string, status: TaskStatus): TaskListItem => ({
  id,
  title,
  priority: TaskPriority.Medium,
  status,
  startDate: '2026-07-01T00:00:00Z',
  expectedCompletionDate: null,
  actualCompletionDate: null,
  projectId: 1,
  organizationId: 2,
  createdByUserId: 1,
  assignedToUserId: null,
  subTaskCount: 0,
  completedSubTaskCount: 0,
});

const TASKS: TaskListItem[] = [
  task(1, 'Build the responsive nav bar', TaskStatus.InProgress),
  task(2, 'Write the copy', TaskStatus.Todo),
  task(3, 'Ship the hero section', TaskStatus.Completed),
];

const loadTaskForEdit = jasmine
  .createSpy('getTask')
  .and.returnValue(of({ ...TASKS[0], description: 'The full description' }));

/** Stubs both the org-wide `init()` fan-out and the project-detail forkJoin. */
const repositoryStub = {
  getMyOrganizations: () =>
    of([{ id: 2, name: 'Northwind Labs', ownerUserId: 1, status: OrganizationStatus.Active }]),
  getDashboard: () => of(null),
  getProjects: () => of([PROJECT]),
  getTasks: () => of(TASKS),
  getRoles: () => of([]),
  getMembers: () => of([]),
  getInvitations: () => of([]),
  getTeams: () => of([]),
  getPermissionCatalog: () => of([]),
  getProject: () => of(PROJECT),
  getProjectTasks: () => of(TASKS),
  getTask: loadTaskForEdit,
};

describe('ProjectDetailPage', () => {
  let component: ProjectDetailPage;
  let fixture: ComponentFixture<ProjectDetailPage>;

  beforeEach(async () => {
    loadTaskForEdit.calls.reset();

    await TestBed.configureTestingModule({
      imports: [ProjectDetailPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideToastr(),
        provideAnimations(),
        provideLottieOptions({ player: () => import('lottie-web') }),
        { provide: APP_SETTINGS, useValue: AppSettings },
        { provide: OrganizationRepository, useValue: repositoryStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filters the project tasks by title and by status', () => {
    expect(component.pager.total()).toBe(3);

    component.onSearch('nav');
    expect(component.filteredTasks().map((t) => t.id)).toEqual([1]);

    component.clearFilters();
    component.onStatusFilter(String(TaskStatus.Completed));
    expect(component.filteredTasks().map((t) => t.id)).toEqual([3]);

    // Search and filter compose — this combination matches nothing.
    component.onSearch('nav');
    expect(component.pager.total()).toBe(0);

    component.clearFilters();
    expect(component.pager.total()).toBe(3);
  });

  it('fills the description from GET /task/{id} when editing, so saving cannot blank it', () => {
    component.openEditTask(TASKS[0]);

    expect(loadTaskForEdit).toHaveBeenCalledWith(1);
    expect(component.createForm.controls.description.value).toBe('The full description');
  });

  it('reports validation messages from the decorated task and project models', () => {
    component.openCreate();
    component.createForm.controls.title.setValue('');
    component.createForm.controls.title.markAsTouched();
    expect(component.taskFieldError('title')).toBe('A title is required.');

    component.editProject(PROJECT);
    component.projectForm.controls.title.setValue('');
    component.projectForm.controls.title.markAsTouched();
    expect(component.projectFieldError('title')).toBe('A title is required.');
  });
});
