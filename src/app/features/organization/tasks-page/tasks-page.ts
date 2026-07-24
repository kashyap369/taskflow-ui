import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ArrowRight,
  Building2,
  CheckSquare,
  CircleCheckBig,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  Play,
  Plus,
  User,
  X,
} from 'lucide-angular';

import {
  TaskListItem,
  TaskPriority,
  TaskStatus,
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

  readonly taskStatusMeta = taskStatusMeta;
  readonly taskPriorityMeta = taskPriorityMeta;
  readonly TaskStatus = TaskStatus;

  readonly showCreate = signal(false);
  readonly hasTasks = computed(() => this.tasks().length > 0);

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

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private toIso(date: string): string {
    return new Date(`${date}T00:00:00Z`).toISOString();
  }
}
