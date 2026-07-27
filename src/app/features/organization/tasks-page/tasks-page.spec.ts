import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { APP_SETTINGS } from '@core/config/app.tokens';
import { AppSettings } from '@core/config/app.settings';
import { DialogService } from '@core/services/dialog.service';
import { OrganizationRepository } from '../organization.repository';
import {
  OrganizationStatus,
  TaskListItem,
  TaskPriority,
  TaskStatus,
} from '../organization.models';
import { TasksPage } from './tasks-page';

const task = (id: number, title: string, status: TaskStatus, priority: TaskPriority): TaskListItem => ({
  id,
  title,
  priority,
  status,
  startDate: '2026-07-01T00:00:00Z',
  expectedCompletionDate: null,
  actualCompletionDate: null,
  projectId: null,
  organizationId: 2,
  teamId: null,
  teamName: null,
  createdByUserId: 1,
  assignedToUserId: null,
  subTaskCount: 0,
  completedSubTaskCount: 0,
});

const TASKS: TaskListItem[] = [
  task(1, 'Build the responsive nav bar', TaskStatus.InProgress, TaskPriority.High),
  task(2, 'Write the release notes', TaskStatus.Todo, TaskPriority.Low),
  ...Array.from({ length: 12 }, (_, i) =>
    task(100 + i, `Filler task ${i + 1}`, TaskStatus.Todo, TaskPriority.Medium),
  ),
];

const createTask = jasmine.createSpy('createTask').and.returnValue(of(9));
const updateTask = jasmine.createSpy('updateTask').and.returnValue(of(void 0));
const deleteTask = jasmine.createSpy('deleteTask').and.returnValue(of(void 0));
/** `GET /task/{id}` — the only shape that carries the description. */
const getTask = jasmine.createSpy('getTask').and.callFake((taskId: number) =>
  of({ ...task(taskId, 'Build the responsive nav bar', TaskStatus.InProgress, TaskPriority.High), description: 'Sticky, collapses at 768px' }),
);

const SUBTASKS = [
  { id: 5, taskId: 1, title: 'Sketch the mobile menu', status: TaskStatus.Todo, createdDate: '2026-07-02T00:00:00Z', completedDate: null },
];
const getSubTasks = jasmine.createSpy('getSubTasks').and.returnValue(of(SUBTASKS));
const updateSubTask = jasmine.createSpy('updateSubTask').and.returnValue(of(void 0));

/** Stubs every call `OrganizationFacade.init()` fans out to, so the page gets real signal data. */
const repositoryStub = {
  getMyOrganizations: () =>
    of([{ id: 2, name: 'Northwind Labs', ownerUserId: 1, status: OrganizationStatus.Active }]),
  getDashboard: () => of(null),
  getProjects: () => of([]),
  getTasks: () => of(TASKS),
  getRoles: () => of([]),
  getMembers: () => of([]),
  getInvitations: () => of([]),
  getTeams: () => of([]),
  getPermissionCatalog: () => of([]),
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getSubTasks,
  updateSubTask,
};

describe('TasksPage', () => {
  let component: TasksPage;
  let fixture: ComponentFixture<TasksPage>;

  beforeEach(async () => {
    createTask.calls.reset();
    updateTask.calls.reset();
    deleteTask.calls.reset();
    getTask.calls.reset();
    getSubTasks.calls.reset();
    updateSubTask.calls.reset();

    await TestBed.configureTestingModule({
      imports: [TasksPage],
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

    fixture = TestBed.createComponent(TasksPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filters by title', () => {
    component.onSearch('nav bar');
    expect(component.filteredTasks().length).toBe(1);
    expect(component.filteredTasks()[0].id).toBe(1);
  });

  it('filters by status and priority', () => {
    component.onStatusFilter(String(TaskStatus.InProgress));
    expect(component.filteredTasks().length).toBe(1);

    component.onStatusFilter('');
    component.onPriorityFilter(String(TaskPriority.Low));
    expect(component.filteredTasks().length).toBe(1);
    expect(component.filteredTasks()[0].title).toBe('Write the release notes');
  });

  it('pages the filtered rows', () => {
    expect(component.pager.total()).toBe(14);
    expect(component.pager.totalPages()).toBe(2);
    expect(component.pager.items().length).toBe(10);

    component.pager.setPage(2);
    expect(component.pager.items().length).toBe(4);
  });

  it('falls back to page 1 when a filter shrinks the list', () => {
    component.pager.setPage(2);
    component.onSearch('nav bar');

    expect(component.pager.page()).toBe(1);
    expect(component.pager.items().length).toBe(1);
  });

  it('clears every filter at once', () => {
    component.onSearch('nav');
    component.onStatusFilter(String(TaskStatus.InProgress));
    component.onPriorityFilter(String(TaskPriority.High));

    component.clearFilters();

    expect(component.filteredTasks().length).toBe(14);
  });

  // ── Edit / delete ──

  it('opens the drawer in edit mode pre-filled from the row', () => {
    component.openEdit(TASKS[0]);

    expect(component.isEditing()).toBeTrue();
    const value = component.createForm.getRawValue();
    expect(value.title).toBe('Build the responsive nav bar');
    expect(Number(value.priority)).toBe(TaskPriority.High);
    expect(value.startDate).toBe('2026-07-01');
  });

  it('fills the description from the detail endpoint (the row DTO has none)', () => {
    component.openEdit(TASKS[0]);

    expect(getTask).toHaveBeenCalledWith(1);
    expect(component.createForm.getRawValue().description).toBe('Sticky, collapses at 768px');
  });

  it('submits an update carrying the fetched description, so saving cannot blank it', () => {
    component.openEdit(TASKS[0]);
    component.createForm.controls.title.setValue('Build the nav bar');
    component.submit();

    expect(updateTask).toHaveBeenCalledWith({
      taskId: 1,
      title: 'Build the nav bar',
      description: 'Sticky, collapses at 768px',
      priority: TaskPriority.High,
      expectedCompletionDate: null,
    });
    expect(component.showDrawer()).toBeFalse();
  });

  it('creates instead of updating when the drawer was opened for a new task', () => {
    component.openCreate();
    component.createForm.controls.title.setValue('Brand new');
    component.submit();

    expect(updateTask).not.toHaveBeenCalled();
    expect(createTask).toHaveBeenCalled();
  });

  it('deletes only after the confirm dialog resolves true', async () => {
    const dialog = TestBed.inject(DialogService);
    const confirmSpy = spyOn(dialog, 'confirmDelete').and.resolveTo(false);

    await component.remove(TASKS[0]);
    expect(deleteTask).not.toHaveBeenCalled();

    confirmSpy.and.resolveTo(true);
    await component.remove(TASKS[0]);
    expect(deleteTask).toHaveBeenCalledWith(1);
  });

  // ── Subtask rename (PUT /subtask) ──

  it('starts an inline rename pre-filled with the subtask title', () => {
    component.openSubtasks(TASKS[0]);
    component.startRenameSubtask(component.subTasks()[0]);

    expect(component.editingSubTaskId()).toBe(5);
    expect(component.subTaskEditForm.getRawValue().title).toBe('Sketch the mobile menu');
  });

  it('saves the rename and leaves edit mode', () => {
    component.openSubtasks(TASKS[0]);
    component.startRenameSubtask(component.subTasks()[0]);
    component.subTaskEditForm.controls.title.setValue('Sketch the mobile nav');
    component.saveRenameSubtask();

    expect(updateSubTask).toHaveBeenCalledWith(5, 'Sketch the mobile nav');
    expect(component.editingSubTaskId()).toBeNull();
  });

  it('does not save an empty rename', () => {
    component.openSubtasks(TASKS[0]);
    component.startRenameSubtask(component.subTasks()[0]);
    component.subTaskEditForm.controls.title.setValue('');
    component.saveRenameSubtask();

    expect(updateSubTask).not.toHaveBeenCalled();
    expect(component.editingSubTaskId()).toBe(5);
  });

  it('cancels the rename when the drawer closes', () => {
    component.openSubtasks(TASKS[0]);
    component.startRenameSubtask(component.subTasks()[0]);
    component.closeSubtasks();

    expect(component.editingSubTaskId()).toBeNull();
  });
});
