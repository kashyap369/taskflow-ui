import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ArrowRight,
  Building2,
  Check,
  CheckSquare,
  CircleCheckBig,
  Clock,
  ListChecks,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Search,
  Square,
  Trash2,
  User,
  X,
} from 'lucide-angular';

import {
  SubTask,
  TaskListItem,
  TaskPriority,
  TaskStatus,
  WorkLog,
  taskPriorityMeta,
  taskStatusMeta,
} from '../organization.models';
import { DialogService } from '@core/services/dialog.service';
import { DialogDirective } from '@shared/directives/dialog.directive';
import { Skeleton } from '@shared/ui/atoms/skeletons/skeleton/skeleton';
import { Pagination } from '@shared/ui/molecules/pagination/pagination';
import { createPagination } from '@shared/utils/pagination';
import { controlValidators, messageFor } from '@shared/validations';
import {
  ManualWorkLogFormModel,
  SubTaskFormModel,
  TaskFormModel,
  TimerNotesFormModel,
} from '../organization.form-models';
import { OrganizationFacade } from '../organization.facade';

interface Option {
  value: number;
  label: string;
}

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LucideAngularModule,
    Skeleton,
    DialogDirective,
    Pagination,
  ],
  templateUrl: './tasks-page.html',
  styleUrl: './tasks-page.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        Plus,
        X,
        CheckSquare,
        Play,
        CircleCheckBig,
        User,
        ArrowRight,
        Building2,
        ListChecks,
        Check,
        RotateCcw,
        Trash2,
        Clock,
        Square,
        Search,
        Pencil,
      }),
    },
  ],
})
export class TasksPage {
  private readonly facade = inject(OrganizationFacade);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(DialogService);

  readonly loading = this.facade.loading;
  readonly saving = this.facade.saving;
  readonly tasks = this.facade.tasks;
  readonly projects = this.facade.projects;
  readonly members = this.facade.members;
  readonly currentOrg = this.facade.currentOrg;
  readonly needsOrganization = this.facade.needsOrganization;

  // Subtasks
  readonly subTasks = this.facade.subTasks;
  readonly activeTask = signal<TaskListItem | null>(null);

  // Work logs (time tracking)
  readonly workLogs = this.facade.workLogs;
  readonly timeTask = signal<TaskListItem | null>(null);

  readonly taskStatusMeta = taskStatusMeta;
  readonly taskPriorityMeta = taskPriorityMeta;
  readonly TaskStatus = TaskStatus;

  /** One drawer serves create and edit; `editing` holds the row being edited (null = create). */
  readonly showDrawer = signal(false);
  readonly editing = signal<TaskListItem | null>(null);
  readonly isEditing = computed(() => this.editing() !== null);

  readonly hasTasks = computed(() => this.tasks().length > 0);

  /** Placeholder rows rendered while tasks load. */
  readonly loadingRows = [0, 1, 2, 3, 4, 5];

  // ── Filters + paging (client-side: the API returns the whole org list) ──
  readonly search = signal('');
  /** '' = all, otherwise a TaskStatus int. */
  readonly statusFilter = signal<'' | TaskStatus>('');
  /** '' = all, otherwise a TaskPriority int. */
  readonly priorityFilter = signal<'' | TaskPriority>('');

  readonly statusOptions: Option[] = [
    { value: TaskStatus.Todo, label: 'To do' },
    { value: TaskStatus.InProgress, label: 'In progress' },
    { value: TaskStatus.Completed, label: 'Completed' },
    { value: TaskStatus.Blocked, label: 'Blocked' },
    { value: TaskStatus.Cancelled, label: 'Cancelled' },
  ];

  readonly filteredTasks = computed(() => {
    const term = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    const priority = this.priorityFilter();
    return this.tasks().filter((t) => {
      const matchesTerm = !term || t.title.toLowerCase().includes(term);
      const matchesStatus = status === '' || t.status === status;
      const matchesPriority = priority === '' || t.priority === priority;
      return matchesTerm && matchesStatus && matchesPriority;
    });
  });

  readonly pager = createPagination(this.filteredTasks, { pageSize: 10 });

  /** Per-control validators derived from the decorated form models. */
  private readonly subTaskRules = controlValidators(SubTaskFormModel);
  private readonly taskRules = controlValidators(TaskFormModel);
  private readonly manualRules = controlValidators(ManualWorkLogFormModel);
  private readonly timerRules = controlValidators(TimerNotesFormModel);

  readonly subTaskForm = this.fb.nonNullable.group({
    title: ['', this.subTaskRules['title']],
  });

  /** The subtask being renamed inline (null = none); its own form so the Add box is unaffected. */
  readonly editingSubTaskId = signal<number | null>(null);
  readonly subTaskEditForm = this.fb.nonNullable.group({
    title: ['', this.subTaskRules['title']],
  });

  /** The work log currently running on the open task (if any). */
  readonly runningLog = computed<WorkLog | null>(
    () => this.workLogs().find((l) => l.isRunning) ?? null,
  );

  /** Total tracked minutes across the open task's logs. */
  readonly totalTrackedMinutes = computed(() =>
    this.workLogs().reduce((sum, l) => sum + l.durationMinutes, 0),
  );

  readonly timerForm = this.fb.nonNullable.group({
    notes: ['', this.timerRules['notes']],
  });

  readonly manualForm = this.fb.nonNullable.group({
    startedAt: ['', this.manualRules['startedAt']],
    endedAt: ['', this.manualRules['endedAt']],
    notes: ['', this.manualRules['notes']],
  });

  readonly priorityOptions: Option[] = [
    { value: TaskPriority.Low, label: 'Low' },
    { value: TaskPriority.Medium, label: 'Medium' },
    { value: TaskPriority.High, label: 'High' },
    { value: TaskPriority.Critical, label: 'Critical' },
  ];

  readonly projectOptions = computed<Option[]>(() =>
    this.projects().map((p) => ({ value: p.id, label: p.title })),
  );

  readonly createForm = this.fb.nonNullable.group({
    title: ['', this.taskRules['title']],
    description: ['', this.taskRules['description']],
    priority: [TaskPriority.Medium, this.taskRules['priority']],
    startDate: [this.today(), this.taskRules['startDate']],
    expectedCompletionDate: [''],
    projectId: [''],
  });

  /** Touched-gated message for a field on the create/edit task drawer. */
  fieldError(property: string): string | null {
    return messageFor(this.createForm, property);
  }

  constructor() {
    this.facade.init();
  }

  // ── Filters ──

  onSearch(value: string): void {
    this.search.set(value);
  }

  onStatusFilter(value: string): void {
    this.statusFilter.set(value === '' ? '' : (Number(value) as TaskStatus));
  }

  onPriorityFilter(value: string): void {
    this.priorityFilter.set(value === '' ? '' : (Number(value) as TaskPriority));
  }

  clearFilters(): void {
    this.search.set('');
    this.statusFilter.set('');
    this.priorityFilter.set('');
  }

  openCreate(): void {
    this.editing.set(null);
    this.createForm.reset({
      title: '',
      description: '',
      priority: TaskPriority.Medium,
      startDate: this.today(),
      expectedCompletionDate: '',
      projectId: '',
    });
    this.showDrawer.set(true);
  }

  openEdit(task: TaskListItem): void {
    this.editing.set(task);
    this.createForm.reset({
      title: task.title,
      description: '',
      priority: task.priority,
      startDate: this.toDateInput(task.startDate),
      expectedCompletionDate: task.expectedCompletionDate
        ? this.toDateInput(task.expectedCompletionDate)
        : '',
      projectId: task.projectId ? String(task.projectId) : '',
    });
    this.showDrawer.set(true);
    // The row carries no description — pull it from the detail endpoint so saving doesn't blank it.
    this.facade.loadTaskForEdit(task.id, (detail) => {
      if (this.editing()?.id === detail.id) {
        this.createForm.controls.description.setValue(detail.description ?? '');
      }
    });
  }

  closeDrawer(): void {
    this.showDrawer.set(false);
    this.editing.set(null);
  }

  submit(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const v = this.createForm.getRawValue();
    const target = v.expectedCompletionDate ? this.toIso(v.expectedCompletionDate) : null;
    const editing = this.editing();

    if (editing) {
      this.facade.updateTask({
        taskId: editing.id,
        title: v.title,
        description: v.description,
        priority: Number(v.priority) as TaskPriority,
        expectedCompletionDate: target,
      });
    } else {
      this.facade.createTask({
        title: v.title,
        description: v.description,
        priority: Number(v.priority) as TaskPriority,
        startDate: this.toIso(v.startDate),
        expectedCompletionDate: target,
        projectId: v.projectId ? Number(v.projectId) : null,
      });
    }

    this.closeDrawer();
  }

  async remove(task: TaskListItem): Promise<void> {
    const ok = await this.dialog.confirmDelete(
      'Delete task?',
      `"${task.title}" and its subtasks and work logs will be deleted.`,
    );
    if (ok) {
      this.facade.deleteTask(task.id);
    }
  }

  start(task: TaskListItem): void {
    this.facade.startTask(task.id);
  }

  complete(task: TaskListItem): void {
    this.facade.completeTask(task.id);
  }

  onAssignChange(task: TaskListItem, event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (!value) {
      this.facade.unassignTask(task.id);
    } else {
      this.facade.assignTask(task.id, Number(value));
    }
  }

  // ── Subtasks ──

  openSubtasks(task: TaskListItem): void {
    this.activeTask.set(task);
    this.subTaskForm.reset({ title: '' });
    this.facade.loadSubTasks(task.id);
  }

  closeSubtasks(): void {
    this.activeTask.set(null);
    this.cancelRenameSubtask();
    this.facade.clearSubTasks();
  }

  addSubtask(): void {
    const task = this.activeTask();
    if (!task || this.subTaskForm.invalid) {
      this.subTaskForm.markAllAsTouched();
      return;
    }
    this.facade.addSubTask(task.id, this.subTaskForm.getRawValue().title);
    this.subTaskForm.reset({ title: '' });
  }

  /** Swap a subtask row into inline-edit mode, pre-filled with its current title. */
  startRenameSubtask(sub: SubTask): void {
    this.editingSubTaskId.set(sub.id);
    this.subTaskEditForm.reset({ title: sub.title });
  }

  cancelRenameSubtask(): void {
    this.editingSubTaskId.set(null);
  }

  saveRenameSubtask(): void {
    const task = this.activeTask();
    const subTaskId = this.editingSubTaskId();
    if (!task || subTaskId === null || this.subTaskEditForm.invalid) {
      this.subTaskEditForm.markAllAsTouched();
      return;
    }
    this.facade.renameSubTask(task.id, subTaskId, this.subTaskEditForm.getRawValue().title);
    this.cancelRenameSubtask();
  }

  toggleSubtask(sub: SubTask): void {
    const task = this.activeTask();
    if (!task) {
      return;
    }
    if (sub.status === TaskStatus.Completed) {
      this.facade.reopenSubTask(task.id, sub.id);
    } else {
      this.facade.completeSubTask(task.id, sub.id);
    }
  }

  async deleteSubtask(sub: SubTask): Promise<void> {
    const task = this.activeTask();
    if (!task) {
      return;
    }
    const ok = await this.dialog.confirmDelete('Delete subtask?', `"${sub.title}" will be deleted.`);
    if (ok) {
      this.facade.deleteSubTask(task.id, sub.id);
    }
  }

  isDone(sub: SubTask): boolean {
    return sub.status === TaskStatus.Completed;
  }

  // ── Work logs (time tracking) ──

  openTime(task: TaskListItem): void {
    this.timeTask.set(task);
    this.timerForm.reset({ notes: '' });
    this.manualForm.reset({ startedAt: '', endedAt: '', notes: '' });
    this.facade.loadWorkLogs(task.id);
  }

  closeTime(): void {
    this.timeTask.set(null);
    this.facade.clearWorkLogs();
  }

  startTimer(): void {
    const task = this.timeTask();
    if (!task) {
      return;
    }
    const notes = this.timerForm.getRawValue().notes.trim();
    this.facade.startWorkLog(task.id, notes || null);
    this.timerForm.reset({ notes: '' });
  }

  stopTimer(): void {
    const task = this.timeTask();
    const running = this.runningLog();
    if (!task || !running) {
      return;
    }
    this.facade.stopWorkLog(task.id, running.id, null);
  }

  logManual(): void {
    const task = this.timeTask();
    if (!task || this.manualForm.invalid) {
      this.manualForm.markAllAsTouched();
      return;
    }
    const v = this.manualForm.getRawValue();
    const startedAt = new Date(v.startedAt);
    const endedAt = new Date(v.endedAt);
    if (endedAt <= startedAt) {
      this.manualForm.controls.endedAt.setErrors({ order: true });
      return;
    }
    // The API rejects an end time in the future; guard here so it never 500s.
    if (endedAt.getTime() > Date.now()) {
      this.manualForm.controls.endedAt.setErrors({ future: true });
      return;
    }
    this.facade.logManualWork(
      task.id,
      startedAt.toISOString(),
      endedAt.toISOString(),
      v.notes.trim() || null,
    );
    this.manualForm.reset({ startedAt: '', endedAt: '', notes: '' });
  }

  /** `now` as a `datetime-local` value (local time, no seconds) for input `max`. */
  nowLocal(): string {
    const now = new Date();
    const off = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - off).toISOString().slice(0, 16);
  }

  async deleteLog(log: WorkLog): Promise<void> {
    const task = this.timeTask();
    if (!task) {
      return;
    }
    const ok = await this.dialog.confirmDelete(
      'Delete work log?',
      `This ${this.formatDuration(log.durationMinutes)} entry will be deleted.`,
    );
    if (ok) {
      this.facade.deleteWorkLog(task.id, log.id);
    }
  }

  /** "2h 15m" / "45m" / "0m" from a minutes value. */
  formatDuration(minutes: number): string {
    const total = Math.round(minutes);
    const h = Math.floor(total / 60);
    const m = total % 60;
    if (h > 0) {
      return `${h}h ${m}m`;
    }
    return `${m}m`;
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  /** API ISO timestamp → the `YYYY-MM-DD` a date input expects. */
  private toDateInput(iso: string): string {
    return iso.slice(0, 10);
  }

  private toIso(date: string): string {
    return new Date(`${date}T00:00:00Z`).toISOString();
  }
}
