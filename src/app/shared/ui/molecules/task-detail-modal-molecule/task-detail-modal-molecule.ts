import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { LucideAngularModule, X, Check, Flag, Paperclip } from 'lucide-angular';

export interface TaskSubtask {
  /** Unique id; falls back to `title` when omitted. */
  id?: string;
  title: string;
  done?: boolean;
}

export interface TaskComment {
  author: string;
  text: string;
  time: string;
  initials?: string;
  image?: string;
  background?: string;
}

export interface TaskAssignee {
  name: string;
  initials?: string;
  image?: string;
  background?: string;
}

export interface TaskPriority {
  label: string;
  color?: string;
  background?: string;
}

export interface TaskProjectRef {
  name: string;
  color?: string;
}

export interface TaskDetailConfig {
  // Header
  project?: TaskProjectRef;
  title: string;
  description?: string;

  // Left column
  subtasksLabel?: string;
  subtasks?: TaskSubtask[];

  commentsLabel?: string;
  comments?: TaskComment[];
  commentPlaceholder?: string;
  commentButtonLabel?: string;

  // Right column (details)
  statusLabel?: string;
  status?: string;

  priorityLabel?: string;
  priority?: TaskPriority;

  dueDateLabel?: string;
  dueDate?: string;

  assigneesLabel?: string;
  assignees?: TaskAssignee[];

  tagsLabel?: string;
  tags?: string[];

  attachLabel?: string;
  showAttach?: boolean;
}

export interface SubtaskToggleEvent {
  subtask: TaskSubtask;
  done: boolean;
}

@Component({
  selector: 'app-task-detail-modal-molecule',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './task-detail-modal-molecule.html',
  styleUrl: './task-detail-modal-molecule.scss',
})
export class TaskDetailModalMolecule {
  private readonly configSignal = signal<TaskDetailConfig>({ title: '' });

  /** The full modal configuration. All data is supplied by the caller. */
  @Input({ required: true })
  set config(value: TaskDetailConfig) {
    const cfg = value ?? { title: '' };
    this.configSignal.set(cfg);
    const done = new Set<string>();
    (cfg.subtasks ?? []).forEach((task) => {
      if (task.done) done.add(this.subtaskId(task));
    });
    this.doneSubtasks.set(done);
  }
  get config(): TaskDetailConfig {
    return this.configSignal();
  }

  /** Controls visibility so a parent can open/close the modal. */
  @Input()
  open = true;

  /** Closes the modal via the backdrop or the X button. */
  @Output()
  closed = new EventEmitter<void>();

  /** Emits when a subtask checkbox is toggled. */
  @Output()
  subtaskToggle = new EventEmitter<SubtaskToggleEvent>();

  /** Emits the comment text when the Comment button is clicked. */
  @Output()
  commentSubmit = new EventEmitter<string>();

  /** Emits when 'Attach file' is clicked. */
  @Output()
  attach = new EventEmitter<void>();

  readonly commentDraft = signal('');
  private readonly doneSubtasks = signal<Set<string>>(new Set());

  readonly subtasks = computed(() =>
    (this.configSignal().subtasks ?? []).map((task) => ({
      ...task,
      isDone: this.doneSubtasks().has(this.subtaskId(task)),
    })),
  );

  protected readonly closeIcon = X;
  protected readonly checkIcon = Check;
  protected readonly flagIcon = Flag;
  protected readonly attachIcon = Paperclip;

  subtaskId(task: TaskSubtask): string {
    return task.id ?? task.title;
  }

  toggleSubtask(task: TaskSubtask): void {
    const next = new Set(this.doneSubtasks());
    const id = this.subtaskId(task);
    const done = !next.has(id);
    done ? next.add(id) : next.delete(id);
    this.doneSubtasks.set(next);
    this.subtaskToggle.emit({ subtask: task, done });
  }

  initials(person: { name: string; initials?: string }): string {
    if (person.initials) return person.initials;
    return person.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  onBackdropClick(): void {
    this.closed.emit();
  }

  onClose(): void {
    this.closed.emit();
  }

  onSubmitComment(): void {
    const text = this.commentDraft().trim();
    if (!text) return;
    this.commentSubmit.emit(text);
    this.commentDraft.set('');
  }

  onAttach(): void {
    this.attach.emit();
  }
}
