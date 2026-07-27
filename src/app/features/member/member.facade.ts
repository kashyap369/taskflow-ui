import { Injectable, computed, inject, signal } from '@angular/core';

import { resetOnSessionChange } from '@core/auth/session-reset';
import { NotificationService } from '@core/services/notification.service';
import { OrganizationInvitation, isExpired } from '@shared/models/invitation.model';

import {
  CreatePersonalTaskPayload,
  PersonalTaskReport,
  SubTask,
  TaskListItem,
  UpdatePersonalTaskPayload,
  WorkLog,
} from './member.models';
import { MemberRepository } from './member.repository';

/**
 * Application layer for the Member (Individual) portal. It owns two things:
 *
 * 1. The **invitee's** side of the organization-invitation flow.
 * 2. The **personal workspace** — tasks with no organization, their subtasks, time tracking and the
 *    personal report. Unblocked by backend Phase 9 (`POST /task/personal`, `GET /report/me`).
 *
 * Pages read the signals and call `init()`; they never touch the repository.
 */
@Injectable({ providedIn: 'root' })
export class MemberFacade {
  private readonly repository = inject(MemberRepository);
  private readonly notification = inject(NotificationService);

  // ── State ──
  private readonly _invitations = signal<OrganizationInvitation[]>([]);
  private readonly _loading = signal(false);
  private readonly _loaded = signal(false);
  private readonly _saving = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly invitations = this._invitations.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly saving = this._saving.asReadonly();
  readonly error = this._error.asReadonly();

  /** Everything `GET /mine` returns is pending, but some may have run past their expiry date. */
  readonly actionable = computed(() => this._invitations().filter((i) => !isExpired(i)));
  readonly expired = computed(() => this._invitations().filter((i) => isExpired(i)));

  /** Drives the nav badge — only invitations the user can actually act on. */
  readonly pendingCount = computed(() => this.actionable().length);
  readonly hasInvitations = computed(() => this._invitations().length > 0);

  constructor() {
    // Invitations are addressed to a person and personal tasks belong to one — neither may survive
    // into another account's session. `init()` won't refetch once `_loaded` is true.
    resetOnSessionChange(() => this.resetForNewSession());
  }

  /** Drop every signal this facade owns, so the next `init()` starts from scratch. */
  private resetForNewSession(): void {
    this._invitations.set([]);
    this._loaded.set(false);
    this._loading.set(false);
    this._saving.set(false);
    this._error.set(null);
    this._tasks.set([]);
    this._tasksLoaded.set(false);
    this._tasksLoading.set(false);
    this._report.set(null);
    this._reportLoading.set(false);
    this._openSubTaskTaskId.set(null);
    this._subTasks.set([]);
    this._openWorkLogTaskId.set(null);
    this._workLogs.set([]);
  }

  /** Load the invitation list once. Call from member pages' constructors. */
  init(): void {
    if (this._loaded() || this._loading()) {
      return;
    }
    this.loadInvitations();
  }

  loadInvitations(): void {
    this._loading.set(true);
    this._error.set(null);
    this.repository.getMyInvitations().subscribe({
      next: (invitations) => {
        this._invitations.set(invitations);
        this._loaded.set(true);
        this._loading.set(false);
      },
      error: () => {
        this._error.set('Could not load your invitations.');
        this._loading.set(false);
      },
    });
  }

  /** Force a refresh (bypasses the once-only guard). */
  refresh(): void {
    this._loaded.set(false);
    this.loadInvitations();
  }

  /**
   * Accept an invitation → the API creates the membership. Can fail with 400 (expired) or 409
   * (already a member); the error interceptor surfaces those, and we reload either way so a
   * stale row disappears from the list.
   */
  accept(invitation: OrganizationInvitation): void {
    this._saving.set(true);
    this.repository.acceptInvitation(invitation.id).subscribe({
      next: () => {
        this._saving.set(false);
        this.notification.success(`You've joined ${invitation.organizationName}.`);
        this.refresh();
      },
      error: () => {
        this._saving.set(false);
        this.refresh();
      },
    });
  }

  decline(invitation: OrganizationInvitation): void {
    this._saving.set(true);
    this.repository.rejectInvitation(invitation.id).subscribe({
      next: () => {
        this._saving.set(false);
        this.notification.success(`Invitation from ${invitation.organizationName} declined.`);
        this.refresh();
      },
      error: () => {
        this._saving.set(false);
        this.refresh();
      },
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // Personal workspace
  // ══════════════════════════════════════════════════════════════════

  private readonly _tasks = signal<TaskListItem[]>([]);
  private readonly _tasksLoading = signal(false);
  private readonly _tasksLoaded = signal(false);
  private readonly _report = signal<PersonalTaskReport | null>(null);
  private readonly _reportLoading = signal(false);

  /** Subtask drawer state — which task is open, and its subtasks. */
  private readonly _openSubTaskTaskId = signal<number | null>(null);
  private readonly _subTasks = signal<SubTask[]>([]);

  /** Time-tracking drawer state. */
  private readonly _openWorkLogTaskId = signal<number | null>(null);
  private readonly _workLogs = signal<WorkLog[]>([]);

  readonly tasks = this._tasks.asReadonly();
  readonly tasksLoading = this._tasksLoading.asReadonly();
  readonly report = this._report.asReadonly();
  readonly reportLoading = this._reportLoading.asReadonly();
  readonly openSubTaskTaskId = this._openSubTaskTaskId.asReadonly();
  readonly subTasks = this._subTasks.asReadonly();
  readonly openWorkLogTaskId = this._openWorkLogTaskId.asReadonly();
  readonly workLogs = this._workLogs.asReadonly();

  /** Derived counts for the dashboard, so it never shows invented numbers. */
  readonly totalTasks = computed(() => this._tasks().length);
  readonly todoCount = computed(() => this._tasks().filter((t) => t.status === 1).length);
  readonly inProgressCount = computed(() => this._tasks().filter((t) => t.status === 2).length);
  readonly completedCount = computed(() => this._tasks().filter((t) => t.status === 3).length);
  readonly overdueCount = computed(() => {
    const now = Date.now();
    return this._tasks().filter(
      (t) =>
        t.status !== 3 &&
        t.expectedCompletionDate !== null &&
        new Date(t.expectedCompletionDate).getTime() < now,
    ).length;
  });

  /** The running timer across the open task's logs, if any. */
  readonly runningLog = computed<WorkLog | null>(
    () => this._workLogs().find((l) => l.isRunning) ?? null,
  );

  readonly totalTrackedMinutes = computed(() =>
    this._workLogs().reduce((sum, l) => sum + l.durationMinutes, 0),
  );

  /** Load the personal task list once. */
  initTasks(): void {
    if (this._tasksLoaded() || this._tasksLoading()) {
      return;
    }
    this.loadTasks();
  }

  loadTasks(): void {
    this._tasksLoading.set(true);
    this.repository.getMyPersonalTasks().subscribe({
      next: (tasks) => {
        this._tasks.set(tasks);
        this._tasksLoaded.set(true);
        this._tasksLoading.set(false);
      },
      error: () => this._tasksLoading.set(false),
    });
  }

  createTask(payload: CreatePersonalTaskPayload): void {
    this._saving.set(true);
    this.repository.createPersonalTask(payload).subscribe({
      next: () => {
        this._saving.set(false);
        this.notification.success('Task created.');
        this.loadTasks();
      },
      error: () => this._saving.set(false),
    });
  }

  /**
   * The list DTO has no `description`, but the update command **requires** one — filling an edit
   * form from a row and saving would blank it. Callers fetch the detail first (see the page).
   */
  loadTaskForEdit(taskId: number, onLoaded: (detail: { id: number; description: string | null }) => void): void {
    this.repository.getTask(taskId).subscribe({
      next: (detail) => onLoaded(detail),
    });
  }

  updateTask(payload: UpdatePersonalTaskPayload): void {
    this._saving.set(true);
    this.repository.updateTask(payload).subscribe({
      next: () => {
        this._saving.set(false);
        this.notification.success('Task updated.');
        this.loadTasks();
      },
      error: () => this._saving.set(false),
    });
  }

  deleteTask(taskId: number): void {
    this.repository.deleteTask(taskId).subscribe({
      next: () => {
        this.notification.success('Task deleted.');
        this.loadTasks();
      },
    });
  }

  startTask(taskId: number): void {
    this.repository.startTask(taskId).subscribe({ next: () => this.loadTasks() });
  }

  completeTask(taskId: number): void {
    this.repository.completeTask(taskId).subscribe({ next: () => this.loadTasks() });
  }

  /** Backend Phase 9 (§4.6) — a completed task can go back to To do. */
  reopenTask(taskId: number): void {
    this.repository.reopenTask(taskId).subscribe({
      next: () => {
        this.notification.success('Task reopened.');
        this.loadTasks();
      },
    });
  }

  // ── Subtasks ──

  openSubTasks(taskId: number): void {
    this._openSubTaskTaskId.set(taskId);
    this._subTasks.set([]);
    this.loadSubTasks(taskId);
  }

  closeSubTasks(): void {
    this._openSubTaskTaskId.set(null);
    this._subTasks.set([]);
  }

  private loadSubTasks(taskId: number): void {
    this.repository.getSubTasks(taskId).subscribe({
      next: (subTasks) => this._subTasks.set(subTasks),
    });
  }

  /** Every subtask change can move the parent's status, so reload both. */
  private afterSubTaskChange(): void {
    const taskId = this._openSubTaskTaskId();
    if (taskId !== null) {
      this.loadSubTasks(taskId);
    }
    this.loadTasks();
  }

  addSubTask(title: string): void {
    const taskId = this._openSubTaskTaskId();
    if (taskId === null) {
      return;
    }
    this._saving.set(true);
    this.repository.createSubTask(taskId, title).subscribe({
      next: () => {
        this._saving.set(false);
        this.afterSubTaskChange();
      },
      error: () => this._saving.set(false),
    });
  }

  renameSubTask(subTaskId: number, title: string): void {
    this._saving.set(true);
    this.repository.renameSubTask(subTaskId, title).subscribe({
      next: () => {
        this._saving.set(false);
        this.notification.success('Subtask renamed.');
        this.afterSubTaskChange();
      },
      error: () => this._saving.set(false),
    });
  }

  toggleSubTask(subTask: SubTask): void {
    const call =
      subTask.status === 3
        ? this.repository.reopenSubTask(subTask.id)
        : this.repository.completeSubTask(subTask.id);

    call.subscribe({ next: () => this.afterSubTaskChange() });
  }

  deleteSubTask(subTaskId: number): void {
    this.repository.deleteSubTask(subTaskId).subscribe({
      next: () => this.afterSubTaskChange(),
    });
  }

  // ── Time tracking ──

  openWorkLogs(taskId: number): void {
    this._openWorkLogTaskId.set(taskId);
    this._workLogs.set([]);
    this.loadWorkLogs(taskId);
  }

  closeWorkLogs(): void {
    this._openWorkLogTaskId.set(null);
    this._workLogs.set([]);
  }

  private loadWorkLogs(taskId: number): void {
    this.repository.getTaskWorkLogs(taskId).subscribe({
      next: (logs) => this._workLogs.set(logs),
    });
  }

  private afterWorkLogChange(): void {
    const taskId = this._openWorkLogTaskId();
    if (taskId !== null) {
      this.loadWorkLogs(taskId);
    }
    this.loadReport();
  }

  startTimer(notes: string | null): void {
    const taskId = this._openWorkLogTaskId();
    if (taskId === null) {
      return;
    }
    this._saving.set(true);
    this.repository.startTimer(taskId, notes).subscribe({
      next: () => {
        this._saving.set(false);
        this.afterWorkLogChange();
      },
      error: () => this._saving.set(false),
    });
  }

  stopTimer(workLogId: number, notes: string | null): void {
    this._saving.set(true);
    this.repository.stopTimer(workLogId, notes).subscribe({
      next: () => {
        this._saving.set(false);
        this.afterWorkLogChange();
      },
      error: () => this._saving.set(false),
    });
  }

  logManualWork(startedAt: string, endedAt: string, notes: string | null): void {
    const taskId = this._openWorkLogTaskId();
    if (taskId === null) {
      return;
    }
    this._saving.set(true);
    this.repository.logManualWork(taskId, startedAt, endedAt, notes).subscribe({
      next: () => {
        this._saving.set(false);
        this.notification.success('Work logged.');
        this.afterWorkLogChange();
      },
      error: () => this._saving.set(false),
    });
  }

  deleteWorkLog(workLogId: number): void {
    this.repository.deleteWorkLog(workLogId).subscribe({
      next: () => this.afterWorkLogChange(),
    });
  }

  // ── Personal report ──

  /**
   * Window defaults to the last 30 days. **`from`/`to` are required by the API** — without them it
   * binds `0001-01-01` and silently returns zeros, which reads as "no data" rather than "no window".
   */
  loadReport(from?: string, to?: string): void {
    const toDate = to ?? new Date().toISOString();
    const fromDate =
      from ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    this._reportLoading.set(true);
    this.repository.getMyReport(fromDate, toDate).subscribe({
      next: (report) => {
        this._report.set(report);
        this._reportLoading.set(false);
      },
      error: () => this._reportLoading.set(false),
    });
  }
}
