import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  ArrowLeft,
  CalendarDays,
  CircleCheckBig,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  Play,
  Plus,
  User,
  X,
} from 'lucide-angular';

import { LottiePlayer } from '@shared/ui/atoms/animations/lottie-player/lottie-player';
import {
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
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule, LottiePlayer],
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
      }),
    },
  ],
})
export class ProjectDetailPage {
  private readonly facade = inject(OrganizationFacade);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
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

  readonly showCreate = signal(false);
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

  constructor() {
    this.facade.init();
    this.facade.loadProjectDetail(this.projectId);
    this.destroyRef.onDestroy(() => this.facade.clearProjectDetail());
  }

  openCreate(): void {
    this.createForm.reset({
      title: '',
      description: '',
      priority: TaskPriority.Medium,
      startDate: this.today(),
      expectedCompletionDate: '',
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
    this.facade.createProjectTask(this.projectId, {
      title: v.title,
      description: v.description,
      priority: Number(v.priority) as TaskPriority,
      startDate: this.toIso(v.startDate),
      expectedCompletionDate: v.expectedCompletionDate ? this.toIso(v.expectedCompletionDate) : null,
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

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }
  private toIso(date: string): string {
    return new Date(`${date}T00:00:00Z`).toISOString();
  }
}
