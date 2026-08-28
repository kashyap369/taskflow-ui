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
import { MemberRepository } from '../member.repository';
import { TaskListItem, TaskPriority, TaskStatus } from '../member.models';
import { MyTasksPage } from './my-tasks-page';

const task = (
  id: number,
  title: string,
  status: TaskStatus,
  priority = TaskPriority.Medium,
): TaskListItem => ({
  id,
  title,
  priority,
  status,
  startDate: '2026-07-20T00:00:00Z',
  expectedCompletionDate: null,
  actualCompletionDate: null,
  projectId: null,
  organizationId: null,
  // A personal task can never belong to a team — teams only exist inside organizations.
  teamId: null,
  teamName: null,
  createdByUserId: 4,
  assignedToUserId: null,
  subTaskCount: 0,
  completedSubTaskCount: 0,
});

const TASKS: TaskListItem[] = [
  task(1, 'Renew passport', TaskStatus.Todo, TaskPriority.High),
  task(2, 'Buy groceries', TaskStatus.InProgress),
  task(3, 'File taxes', TaskStatus.Completed),
];

const createPersonalTask = jasmine.createSpy('createPersonalTask').and.returnValue(of(9));
const updateTask = jasmine.createSpy('updateTask').and.returnValue(of(void 0));
const deleteTask = jasmine.createSpy('deleteTask').and.returnValue(of(void 0));
const reopenTask = jasmine.createSpy('reopenTask').and.returnValue(of(void 0));
const getTask = jasmine
  .createSpy('getTask')
  .and.returnValue(of({ ...TASKS[0], description: 'The full description' }));

const repositoryStub = {
  getMyInvitations: () => of([]),
  getMyPersonalTasks: () => of(TASKS),
  getMyPersonalProjects: () => of([]),
  getTask,
  createPersonalTask,
  updateTask,
  deleteTask,
  startTask: () => of(void 0),
  completeTask: () => of(void 0),
  reopenTask,
  getSubTasks: () => of([]),
  getTaskWorkLogs: () => of([]),
  getMyReport: () => of(null),
};

describe('MyTasksPage', () => {
  let component: MyTasksPage;
  let fixture: ComponentFixture<MyTasksPage>;

  beforeEach(async () => {
    createPersonalTask.calls.reset();
    updateTask.calls.reset();
    deleteTask.calls.reset();
    reopenTask.calls.reset();
    getTask.calls.reset();

    await TestBed.configureTestingModule({
      imports: [MyTasksPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideToastr(),
        provideAnimations(),
        { provide: APP_SETTINGS, useValue: AppSettings },
        { provide: MemberRepository, useValue: repositoryStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyTasksPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('lists the personal tasks the API returned', () => {
    expect(component.pager.total()).toBe(3);
  });

  it('filters by title, status and priority, and composes them', () => {
    component.onSearch('passport');
    expect(component.filteredTasks().map((t) => t.id)).toEqual([1]);

    component.clearFilters();
    component.onStatusFilter(String(TaskStatus.Completed));
    expect(component.filteredTasks().map((t) => t.id)).toEqual([3]);

    component.clearFilters();
    component.onPriorityFilter(String(TaskPriority.High));
    expect(component.filteredTasks().map((t) => t.id)).toEqual([1]);

    // A conflicting combination matches nothing.
    component.onStatusFilter(String(TaskStatus.Completed));
    expect(component.pager.total()).toBe(0);
  });

  it('creates a personal task with no organization or project', () => {
    component.openCreate();
    component.createForm.controls.title.setValue('Call the dentist');
    component.submit();

    expect(createPersonalTask).toHaveBeenCalled();
    const payload = createPersonalTask.calls.mostRecent().args[0];
    expect(payload.title).toBe('Call the dentist');
    expect(Object.keys(payload)).not.toContain('organizationId');
    expect(payload.projectId).toBeNull();
  });

  it('fetches the description before editing, so saving cannot blank it', () => {
    component.openEdit(TASKS[0]);

    expect(getTask).toHaveBeenCalledWith(1);
    expect(component.createForm.controls.description.value).toBe('The full description');
  });

  it('surfaces validation messages from the decorated model', () => {
    component.openCreate();
    component.createForm.controls.title.setValue('');
    component.createForm.controls.title.markAsTouched();

    expect(component.fieldError('title')).toBe('A title is required.');
  });

  it('reopens a completed task', () => {
    component.reopen(TASKS[2]);

    expect(reopenTask).toHaveBeenCalledWith(3);
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

  it('rejects a manual work log that ends in the future', () => {
    component.manualForm.setValue({
      startedAt: '2026-07-20T09:00',
      endedAt: '2099-01-01T10:00',
      notes: '',
    });
    component.submitManual();

    expect(component.manualForm.controls.endedAt.hasError('future')).toBeTrue();
  });

  it('formats tracked minutes for humans', () => {
    expect(component.formatMinutes(150)).toBe('2h 30m');
    expect(component.formatMinutes(45)).toBe('45m');
  });
});
