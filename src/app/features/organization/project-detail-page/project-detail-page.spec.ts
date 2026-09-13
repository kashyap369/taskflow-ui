import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideLottieOptions } from 'ngx-lottie';
import { of } from 'rxjs';

import { AuthStore } from '@core/auth/auth.store';
import { AccountType } from '@core/auth/roles.enum';
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
  teamId: null,
  teamName: null,
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

const SUBTASKS = [
  { id: 11, title: 'Sketch the layout', status: TaskStatus.Completed, taskId: 1 },
  { id: 12, title: 'Build the markup', status: TaskStatus.Todo, taskId: 1 },
];

const getSubTasks = jasmine.createSpy('getSubTasks').and.returnValue(of(SUBTASKS));
const createSubTask = jasmine.createSpy('createSubTask').and.returnValue(of(13));
const completeSubTask = jasmine.createSpy('completeSubTask').and.returnValue(of(void 0));

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
  getSubTasks,
  createSubTask,
  completeSubTask,
};

/**
 * Signs a user in so `canManageTasks` can resolve. The stubbed organization is owned by user 1,
 * and an owner holds every permission — so 1 is the permitted case and anyone else is not.
 */
function signIn(userId: number): void {
  TestBed.inject(AuthStore).setUser({
    id: userId,
    fullName: 'Nadia Owens',
    email: 'nadia.owens+org1@taskflow.test',
    roles: ['User'],
    accountType: AccountType.Organization,
  });
}

describe('ProjectDetailPage', () => {
  let component: ProjectDetailPage;
  let fixture: ComponentFixture<ProjectDetailPage>;

  beforeEach(async () => {
    loadTaskForEdit.calls.reset();
    getSubTasks.calls.reset();
    createSubTask.calls.reset();
    completeSubTask.calls.reset();

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
    signIn(1);
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

  it('expands a task in place to show its subtasks, and collapses it again', () => {
    expect(component.isExpanded(TASKS[0])).toBeFalse();

    component.toggleSubtasks(TASKS[0]);
    expect(getSubTasks).toHaveBeenCalledWith(1);
    expect(component.isExpanded(TASKS[0])).toBeTrue();
    expect(component.subTasks().map((s) => s.title)).toEqual([
      'Sketch the layout',
      'Build the markup',
    ]);

    component.toggleSubtasks(TASKS[0]);
    expect(component.isExpanded(TASKS[0])).toBeFalse();
    expect(component.subTasks()).toEqual([]);
  });

  it('renders the expanded checklist and its add box in the table', () => {
    component.toggleSubtasks(TASKS[0]);
    fixture.detectChanges();

    const panel: HTMLElement = fixture.nativeElement.querySelector('.subtask-panel');
    expect(panel).withContext('the expanded row renders').toBeTruthy();
    expect(panel.textContent).toContain('Sketch the layout');
    expect(panel.querySelector('.subtask-add input')).toBeTruthy();
  });

  it('locks the checklist write controls for a user without ManageTasks', () => {
    // The facade drops its state when the session changes, and that runs in an effect — so let it
    // flush against the old fixture first, then build the page fresh for this user. Creating the
    // component before the flush would have its data wiped a moment after it loaded.
    signIn(99); // not the owner, and no role grants the permission
    fixture.detectChanges();

    fixture = TestBed.createComponent(ProjectDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.toggleSubtasks(TASKS[0]);
    fixture.detectChanges();

    const panel: HTMLElement = fixture.nativeElement.querySelector('.subtask-panel');
    expect(panel.textContent)
      .withContext('the checklist itself stays readable')
      .toContain('Sketch the layout');
    // The write controls stay on screen but read as locked, so the member can see the action
    // exists and why it is unavailable — see PermissionLockDirective.
    const addButton = panel.querySelector('.subtask-add button[type="submit"]')!;
    expect(addButton.classList).toContain('is-permission-locked');
    expect(addButton.querySelector('.permission-lock-badge')).toBeTruthy();
    expect(panel.querySelector<HTMLInputElement>('.subtask-add input')!.disabled).toBeTrue();

    const deleteButton = panel.querySelector('.mini-btn.danger')!;
    expect(deleteButton.classList).toContain('is-permission-locked');
    expect(deleteButton.getAttribute('aria-disabled')).toBe('true');

    // The done/undone toggle has its own read-only rendering, so it is still absent.
    expect(panel.querySelector('button.check')).toBeNull();
  });

  it('adds a subtask to the expanded task and clears the box', () => {
    component.toggleSubtasks(TASKS[0]);
    component.subTaskForm.controls.title.setValue('Review with design');
    component.addSubtask(TASKS[0]);

    expect(createSubTask).toHaveBeenCalledWith(1, 'Review with design');
    expect(component.subTaskForm.controls.title.value).toBe('');
  });

  it('refuses to add an empty subtask', () => {
    component.toggleSubtasks(TASKS[0]);
    component.subTaskForm.controls.title.setValue('');
    component.addSubtask(TASKS[0]);

    expect(createSubTask).not.toHaveBeenCalled();
    expect(component.subTaskFieldError()).toBeTruthy();
  });

  it('completes an open subtask from the row', () => {
    component.toggleSubtasks(TASKS[0]);
    component.toggleSubtaskDone(TASKS[0], component.subTasks()[1]);

    expect(completeSubTask).toHaveBeenCalledWith(12);
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
