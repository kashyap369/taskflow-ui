import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  CircleCheckBig,
  Clock,
  LUCIDE_ICONS,
  ListChecks,
  LucideAngularModule,
  LucideIconProvider,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
} from 'lucide-angular';

import { DialogService } from '@core/services/dialog.service';
import { DialogDirective } from '@shared/directives/dialog.directive';
import { Skeleton } from '@shared/ui/atoms/skeletons/skeleton/skeleton';
import { Pagination } from '@shared/ui/molecules/pagination/pagination';
import { createPagination } from '@shared/utils/pagination';
import { controlValidators, messageFor } from '@shared/validations';
import { MemberFacade } from '../member.facade';
import {
  ManualWorkLogFormModel,
  PersonalTaskFormModel,
  SubTaskFormModel,
  TimerNotesFormModel,
} from '../member.form-models';
import {
  SubTask,
  TaskListItem,
  TaskPriority,
  TaskStatus,
  taskPriorityMeta,
  taskStatusMeta,
} from '../member.models';

interface Option {
  value: number;
  label: string;
}

/**
 * The Individual account's personal workspace: tasks with no organization, their subtasks and
 * their time logs. Mirrors the organization tasks page, but personal projects are creator-owned and
 * there are no assignees, teams, or organization settings.
 */
@Component({
  selector: 'app-my-tasks-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LucideAngularModule,
    DialogDirective,
    Skeleton,
    Pagination,
  ],
  templateUrl: './my-tasks-page.html',
  styleUrl: './my-tasks-page.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        Plus,
        X,
        Play,
        CircleCheckBig,
        RotateCcw,
        ListChecks,
        Clock,
        Pencil,
        Trash2,
        Search,
      }),
    },
  ],
})
export class MyTasksPage {
  private readonly facade = inject(MemberFacade);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(DialogService);
  private readonly route = inject(ActivatedRoute);

  readonly loading = this.facade.tasksLoading;
  readonly saving = this.facade.saving;
  readonly tasks = this.facade.tasks;
  readonly projects = this.facade.projects;
  readonly selectedProjectId = signal<number | null>(this.readProjectId());
  readonly selectedProject = computed(
    () => this.projects().find((project) => project.id === this.selectedProjectId()) ?? null,
  );

  readonly taskStatusMeta = taskStatusMeta;
  readonly taskPriorityMeta = taskPriorityMeta;
  readonly TaskStatus = TaskStatus;

  readonly hasTasks = computed(() => {
    const projectId = this.selectedProjectId();
    return this.tasks().some((task) => projectId === null || task.projectId === projectId);
  });
  readonly loadingRows = [0, 1, 2, 3, 4];

  // ── Create / edit drawer ──
  readonly showDrawer = signal(false);
  readonly editing = signal<TaskListItem | null>(null);
  readonly isEditing = computed(() => this.editing() !== null);

  // ── Filters + paging (client-side: the API returns the whole list) ──
  readonly search = signal('');
  readonly statusFilter = signal<'' | TaskStatus>('');
  readonly priorityFilter = signal<'' | TaskPriority>('');

  readonly statusOptions: Option[] = [
    { value: TaskStatus.Todo, label: 'To do' },
    { value: TaskStatus.InProgress, label: 'In progress' },
    { value: TaskStatus.Completed, label: 'Completed' },
    { value: TaskStatus.Blocked, label: 'Blocked' },
    { value: TaskStatus.Cancelled, label: 'Cancelled' },
  ];

  readonly priorityOptions: Option[] = [
    { value: TaskPriority.Low, label: 'Low' },
    { value: TaskPriority.Medium, label: 'Medium' },
    { value: TaskPriority.High, label: 'High' },
    { value: TaskPriority.Critical, label: 'Critical' },
  ];

  readonly filteredTasks = computed(() => {
    const term = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    const priority = this.priorityFilter();
    const projectId = this.selectedProjectId();
    return this.tasks().filter((t) => {
      const matchesProject = projectId === null || t.projectId === projectId;
      const matchesTerm = !term || t.title.toLowerCase().includes(term);
      const matchesStatus = status === '' || t.status === status;
      const matchesPriority = priority === '' || t.priority === priority;
      return matchesProject && matchesTerm && matchesStatus && matchesPriority;
    });
  });

  readonly pager = createPagination(this.filteredTasks, { pageSize: 10 });

  // ── Forms (validated by the @shared/validations engine) ──
  private readonly taskRules = controlValidators(PersonalTaskFormModel);
  private readonly subTaskRules = controlValidators(SubTaskFormModel);
  private readonly manualRules = controlValidators(ManualWorkLogFormModel);
  private readonly timerRules = controlValidators(TimerNotesFormModel);

  readonly createForm = this.fb.nonNullable.group({
    title: ['', this.taskRules['title']],
    description: ['', this.taskRules['description']],
    priority: [TaskPriority.Medium, this.taskRules['priority']],
    startDate: [this.today(), this.taskRules['startDate']],
    expectedCompletionDate: [''],
  });

  readonly subTaskForm = this.fb.nonNullable.group({
    title: ['', this.subTaskRules['title']],
  });

  readonly editingSubTaskId = signal<number | null>(null);
  readonly subTaskEditForm = this.fb.nonNullable.group({
    title: ['', this.subTaskRules['title']],
  });

  readonly timerForm = this.fb.nonNullable.group({
    notes: ['', this.timerRules['notes']],
  });

  readonly manualForm = this.fb.nonNullable.group({
    startedAt: ['', this.manualRules['startedAt']],
    endedAt: ['', this.manualRules['endedAt']],
    notes: ['', this.manualRules['notes']],
  });

  // ── Subtask + time-tracking drawers (state lives in the facade) ──
  readonly openSubTaskTaskId = this.facade.openSubTaskTaskId;
  readonly subTasks = this.facade.subTasks;
  readonly openWorkLogTaskId = this.facade.openWorkLogTaskId;
  readonly workLogs = this.facade.workLogs;
  readonly runningLog = this.facade.runningLog;
  readonly totalTrackedMinutes = this.facade.totalTrackedMinutes;

  /** Latest allowed manual end time — the API refuses a future one. */
  readonly maxDateTime = this.toDateTimeLocal(new Date());

  constructor() {
    this.facade.initTasks();
    this.facade.initProjects();

    effect(() => {
      const selectedId = this.selectedProjectId();
      if (
        !this.facade.projectsLoading() &&
        selectedId !== null &&
        !this.projects().some((project) => project.id === selectedId)
      ) {
        this.selectedProjectId.set(null);
      }
    });

    this.route.queryParamMap.subscribe(() => {
      this.selectedProjectId.set(this.readProjectId());
      this.clearFilters();
    });
  }

  fieldError(property: string): string | null {
    return messageFor(this.createForm, property);
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

  // ── Create / edit ──

  openCreate(): void {
    this.editing.set(null);
    this.createForm.reset({
      title: '',
      description: '',
      priority: TaskPriority.Medium,
      startDate: this.today(),
      expectedCompletionDate: '',
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
    });
    this.showDrawer.set(true);
    // The row carries no description but the update command requires one —
    // fetch the detail so saving cannot silently blank it.
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
        priority: Number(v.priority),
        expectedCompletionDate: target,
      });
    } else {
      this.facade.createTask({
        title: v.title,
        description: v.description,
        priority: Number(v.priority),
        startDate: this.toIso(v.startDate),
        expectedCompletionDate: target,
        projectId: this.selectedProjectId(),
      });
    }
    this.closeDrawer();
  }

  async remove(task: TaskListItem): Promise<void> {
    const ok = await this.dialog.confirmDelete(
      'Delete task?',
      `"${task.title}" and its ${task.subTaskCount} subtask(s) will be deleted.`,
      'Delete task',
    );
    if (ok) {
      this.facade.deleteTask(task.id);
    }
  }

  // ── Lifecycle ──

  start(task: TaskListItem): void {
    this.facade.startTask(task.id);
  }

  complete(task: TaskListItem): void {
    this.facade.completeTask(task.id);
  }

  /** Only reachable on a completed task — the API sends it back to To do. */
  reopen(task: TaskListItem): void {
    this.facade.reopenTask(task.id);
  }

  // ── Subtasks ──

  openSubTasks(task: TaskListItem): void {
    this.subTaskForm.reset({ title: '' });
    this.cancelSubTaskEdit();
    this.facade.openSubTasks(task.id);
  }

  closeSubTasks(): void {
    this.cancelSubTaskEdit();
    this.facade.closeSubTasks();
  }

  addSubTask(): void {
    if (this.subTaskForm.invalid) {
      this.subTaskForm.markAllAsTouched();
      return;
    }
    this.facade.addSubTask(this.subTaskForm.getRawValue().title);
    this.subTaskForm.reset({ title: '' });
  }

  startSubTaskEdit(subTask: SubTask): void {
    this.editingSubTaskId.set(subTask.id);
    this.subTaskEditForm.reset({ title: subTask.title });
  }

  cancelSubTaskEdit(): void {
    this.editingSubTaskId.set(null);
  }

  saveSubTaskEdit(): void {
    const id = this.editingSubTaskId();
    if (id === null || this.subTaskEditForm.invalid) {
      this.subTaskEditForm.markAllAsTouched();
      return;
    }
    this.facade.renameSubTask(id, this.subTaskEditForm.getRawValue().title);
    this.cancelSubTaskEdit();
  }

  toggleSubTask(subTask: SubTask): void {
    this.facade.toggleSubTask(subTask);
  }

  async removeSubTask(subTask: SubTask): Promise<void> {
    const ok = await this.dialog.confirmDelete(
      'Delete subtask?',
      `"${subTask.title}" will be deleted.`,
    );
    if (ok) {
      this.facade.deleteSubTask(subTask.id);
    }
  }

  // ── Time tracking ──

  openTime(task: TaskListItem): void {
    this.timerForm.reset({ notes: '' });
    this.manualForm.reset({ startedAt: '', endedAt: '', notes: '' });
    this.facade.openWorkLogs(task.id);
  }

  closeTime(): void {
    this.facade.closeWorkLogs();
  }

  toggleTimer(): void {
    const running = this.runningLog();
    const notes = this.timerForm.getRawValue().notes || null;

    if (running) {
      this.facade.stopTimer(running.id, notes);
    } else {
      this.facade.startTimer(notes);
    }
    this.timerForm.reset({ notes: '' });
  }

  submitManual(): void {
    if (this.manualForm.invalid) {
      this.manualForm.markAllAsTouched();
      return;
    }
    const { startedAt, endedAt, notes } = this.manualForm.getRawValue();

    if (new Date(endedAt) <= new Date(startedAt)) {
      this.manualForm.controls.endedAt.setErrors({ order: true });
      return;
    }
    // The API rejects a future end time; guard here so it never 400s.
    if (new Date(endedAt).getTime() > Date.now()) {
      this.manualForm.controls.endedAt.setErrors({ future: true });
      return;
    }

    this.facade.logManualWork(
      new Date(startedAt).toISOString(),
      new Date(endedAt).toISOString(),
      notes || null,
    );
    this.manualForm.reset({ startedAt: '', endedAt: '', notes: '' });
  }

  async removeWorkLog(workLogId: number): Promise<void> {
    const ok = await this.dialog.confirmDelete(
      'Delete this entry?',
      'The tracked time will be removed from your reports.',
    );
    if (ok) {
      this.facade.deleteWorkLog(workLogId);
    }
  }

  /** "2h 30m" from a minute count. */
  formatMinutes(minutes: number): string {
    const rounded = Math.round(minutes);
    const h = Math.floor(rounded / 60);
    const m = rounded % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  // ── Date helpers ──

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private toDateInput(iso: string): string {
    return iso.slice(0, 10);
  }

  private toIso(date: string): string {
    return new Date(`${date}T00:00:00Z`).toISOString();
  }

  private toDateTimeLocal(date: Date): string {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  }

  private readProjectId(): number | null {
    const raw = this.route.snapshot.queryParamMap.get('projectId');
    const value = raw === null ? Number.NaN : Number(raw);
    return Number.isInteger(value) && value > 0 ? value : null;
  }
}
