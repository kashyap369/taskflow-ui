import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ArrowLeft,
  CalendarDays,
  CircleCheckBig,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  Pencil,
  Play,
  Plus,
  Trash2,
  User,
  X,
} from 'lucide-angular';

import { DialogService } from '@core/services/dialog.service';
import { DialogDirective } from '@shared/directives/dialog.directive';
import { LottiePlayer } from '@shared/ui/atoms/animations/lottie-player/lottie-player';
import {
  Project,
  TaskListItem,
  TaskPriority,
  TaskStatus,
  projectStatusMeta,
  taskPriorityMeta,
  taskStatusMeta,
} from '../organization.models';
import { OrganizationFacade } from '../organization.facade';

@Component({
  selector: 'app-project-detail-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule, LottiePlayer, DialogDirective],
  templateUrl: './project-detail-page.html',
  styleUrl: './project-detail-page.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        ArrowLeft,
        Plus,
        X,
        CalendarDays,
        Play,
        CircleCheckBig,
        User,
        Pencil,
        Trash2,
      }),
    },
  ],
})
export class ProjectDetailPage {
  private readonly facade = inject(OrganizationFacade);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = this.facade.loading;
  readonly saving = this.facade.saving;
  readonly project = this.facade.projectDetail;
  readonly tasks = this.facade.projectTasks;
  readonly members = this.facade.members;

  readonly projectStatusMeta = projectStatusMeta;
  readonly taskStatusMeta = taskStatusMeta;
  readonly taskPriorityMeta = taskPriorityMeta;
  readonly TaskStatus = TaskStatus;

  private readonly projectId = Number(this.route.snapshot.paramMap.get('id'));

  /** Task drawer: one drawer for create + edit (`editingTask` null = create). */
  readonly showDrawer = signal(false);
  readonly editingTask = signal<TaskListItem | null>(null);
  readonly isEditingTask = computed(() => this.editingTask() !== null);

  /** Separate drawer for editing the project itself. */
  readonly showProjectDrawer = signal(false);

  readonly hasTasks = computed(() => this.tasks().length > 0);

  readonly priorityOptions = [
    { value: TaskPriority.Low, label: 'Low' },
    { value: TaskPriority.Medium, label: 'Medium' },
    { value: TaskPriority.High, label: 'High' },
    { value: TaskPriority.Critical, label: 'Critical' },
  ];

  readonly createForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', [Validators.maxLength(1000)]],
    priority: [TaskPriority.Medium, [Validators.required]],
    startDate: [this.today(), [Validators.required]],
    expectedCompletionDate: [''],
  });

  readonly projectForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', [Validators.maxLength(2000)]],
    expectedCompletionDate: [''],
  });

  constructor() {
    this.facade.init();
    this.facade.loadProjectDetail(this.projectId);
    this.destroyRef.onDestroy(() => this.facade.clearProjectDetail());
  }

  openCreate(): void {
    this.editingTask.set(null);
    this.createForm.reset({
      title: '',
      description: '',
      priority: TaskPriority.Medium,
      startDate: this.today(),
      expectedCompletionDate: '',
    });
    this.showDrawer.set(true);
  }

  openEditTask(task: TaskListItem): void {
    this.editingTask.set(task);
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
    // The row has no description — fill it from the detail endpoint so saving doesn't blank it.
    this.facade.loadTaskForEdit(task.id, (detail) => {
      if (this.editingTask()?.id === detail.id) {
        this.createForm.controls.description.setValue(detail.description ?? '');
      }
    });
  }

  closeDrawer(): void {
    this.showDrawer.set(false);
    this.editingTask.set(null);
  }

  submit(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    const v = this.createForm.getRawValue();
    const target = v.expectedCompletionDate ? this.toIso(v.expectedCompletionDate) : null;
    const editing = this.editingTask();

    if (editing) {
      this.facade.updateTask({
        taskId: editing.id,
        title: v.title,
        description: v.description,
        priority: Number(v.priority) as TaskPriority,
        expectedCompletionDate: target,
      });
    } else {
      this.facade.createProjectTask(this.projectId, {
        title: v.title,
        description: v.description,
        priority: Number(v.priority) as TaskPriority,
        startDate: this.toIso(v.startDate),
        expectedCompletionDate: target,
      });
    }
    this.closeDrawer();
  }

  async removeTask(task: TaskListItem): Promise<void> {
    const ok = await this.dialog.confirmDelete('Delete task?', `"${task.title}" will be deleted.`);
    if (ok) {
      this.facade.deleteTask(task.id);
    }
  }

  // ── The project itself ──

  editProject(project: Project): void {
    this.projectForm.reset({
      title: project.title,
      description: project.description ?? '',
      expectedCompletionDate: project.expectedCompletionDate
        ? this.toDateInput(project.expectedCompletionDate)
        : '',
    });
    this.showProjectDrawer.set(true);
  }

  closeProjectDrawer(): void {
    this.showProjectDrawer.set(false);
  }

  submitProject(): void {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }
    const v = this.projectForm.getRawValue();
    this.facade.updateProject({
      projectId: this.projectId,
      title: v.title,
      description: v.description,
      expectedCompletionDate: v.expectedCompletionDate ? this.toIso(v.expectedCompletionDate) : null,
    });
    this.closeProjectDrawer();
  }

  async removeProject(project: Project): Promise<void> {
    const ok = await this.dialog.confirmDelete(
      'Delete project?',
      `"${project.title}" and its ${project.taskCount} task(s) will be deleted.`,
      'Delete project',
    );
    if (ok) {
      this.facade.deleteProject(project.id, () =>
        this.router.navigate(['/organization/projects']),
      );
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
