import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
  Play,
  Plus,
  RotateCcw,
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
import { OrganizationFacade } from '../organization.facade';

interface Option {
  value: number;
  label: string;
}

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
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
      }),
    },
  ],
})
export class TasksPage {
  private readonly facade = inject(OrganizationFacade);
  private readonly fb = inject(FormBuilder);

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

  readonly showCreate = signal(false);
  readonly hasTasks = computed(() => this.tasks().length > 0);

  readonly subTaskForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
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
    notes: ['', [Validators.maxLength(1000)]],
  });

  readonly manualForm = this.fb.nonNullable.group({
    startedAt: ['', [Validators.required]],
    endedAt: ['', [Validators.required]],
    notes: ['', [Validators.maxLength(1000)]],
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
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', [Validators.maxLength(1000)]],
    priority: [TaskPriority.Medium, [Validators.required]],
    startDate: [this.today(), [Validators.required]],
    expectedCompletionDate: [''],
    projectId: [''],
  });

  constructor() {
    this.facade.init();
  }

  openCreate(): void {
    this.createForm.reset({
      title: '',
      description: '',
      priority: TaskPriority.Medium,
      startDate: this.today(),
      expectedCompletionDate: '',
      projectId: '',
    });
    this.showCreate.set(true);
  }

  closeCreate(): void {
    this.showCreate.set(false);
  }

  submit(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const v = this.createForm.getRawValue();

    this.facade.createTask({
      title: v.title,
      description: v.description,
      priority: Number(v.priority) as TaskPriority,
      startDate: this.toIso(v.startDate),
      expectedCompletionDate: v.expectedCompletionDate ? this.toIso(v.expectedCompletionDate) : null,
      projectId: v.projectId ? Number(v.projectId) : null,
    });

    this.closeCreate();
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

  deleteSubtask(sub: SubTask): void {
    const task = this.activeTask();
    if (!task) {
      return;
    }
    this.facade.deleteSubTask(task.id, sub.id);
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

  deleteLog(log: WorkLog): void {
    const task = this.timeTask();
    if (!task) {
      return;
    }
    this.facade.deleteWorkLog(task.id, log.id);
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

  private toIso(date: string): string {
    return new Date(`${date}T00:00:00Z`).toISOString();
  }
}
