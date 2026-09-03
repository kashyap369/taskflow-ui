import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ArrowRight,
  CalendarDays,
  Download,
  Upload,
  FileSpreadsheet,
  FolderKanban,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-angular';

import { DialogService } from '@core/services/dialog.service';
import { DialogDirective } from '@shared/directives/dialog.directive';
import { Skeleton } from '@shared/ui/atoms/skeletons/skeleton/skeleton';
import { controlValidators, messageFor } from '@shared/validations';
import {
  downloadProjectPlanTemplate,
  parseProjectPlanFile,
  ProjectPlanPreview,
} from '@shared/utils/project-plan-csv';
import { ProjectFormModel } from '@features/organization/organization.form-models';
import { MemberFacade } from '../member.facade';
import { Project, projectStatusMeta } from '../member.models';

@Component({
  selector: 'app-member-projects-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LucideAngularModule,
    DialogDirective,
    Skeleton,
  ],
  templateUrl: './projects-page.html',
  styleUrl: './projects-page.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        ArrowRight,
        CalendarDays,
        FolderKanban,
        Pencil,
        Plus,
        Search,
        ShieldCheck,
        Trash2,
        X,
        Download,
        Upload,
        FileSpreadsheet,
      }),
    },
  ],
})
export class MemberProjectsPage {
  private readonly facade = inject(MemberFacade);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(DialogService);

  readonly projects = this.facade.projects;
  readonly loading = this.facade.projectsLoading;
  readonly saving = this.facade.saving;
  readonly search = signal('');
  readonly showDrawer = signal(false);
  readonly showImportDrawer = signal(false);
  readonly planPreview = signal<ProjectPlanPreview | null>(null);
  readonly planError = signal<string | null>(null);
  readonly editing = signal<Project | null>(null);
  readonly isEditing = computed(() => this.editing() !== null);
  readonly loadingRows = [0, 1, 2, 3];

  readonly filteredProjects = computed(() => {
    const term = this.search().trim().toLowerCase();
    return this.projects().filter(
      (project) =>
        !term ||
        project.title.toLowerCase().includes(term) ||
        (project.description ?? '').toLowerCase().includes(term),
    );
  });

  private readonly rules = controlValidators(ProjectFormModel);
  readonly form = this.fb.nonNullable.group({
    title: ['', this.rules['title']],
    description: ['', this.rules['description']],
    startDate: [this.today(), this.rules['startDate']],
    expectedCompletionDate: [''],
  });

  readonly projectStatusMeta = projectStatusMeta;

  constructor() {
    this.facade.initProjects();
  }

  onSearch(value: string): void {
    this.search.set(value);
  }

  fieldError(property: string): string | null {
    return messageFor(this.form, property);
  }

  openCreate(): void {
    this.editing.set(null);
    this.form.reset({
      title: '',
      description: '',
      startDate: this.today(),
      expectedCompletionDate: '',
    });
    this.showDrawer.set(true);
  }

  downloadPlanTemplate(): void {
    downloadProjectPlanTemplate(true);
  }

  openPlanImport(): void {
    this.planPreview.set(null);
    this.planError.set(null);
    this.showImportDrawer.set(true);
  }

  closePlanImport(): void {
    if (this.saving()) return;
    this.showImportDrawer.set(false);
    this.planPreview.set(null);
    this.planError.set(null);
  }

  async onPlanFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.planPreview.set(null);
    this.planError.set(null);
    if (!file) return;
    try {
      const preview = await parseProjectPlanFile(file);
      const organizationFields = preview.payload.tasks.find(
        (task) => task.teamName || task.assigneeEmail,
      );
      if (organizationFields) {
        throw new Error('Personal project plans cannot include a Team Name or Assignee Email.');
      }
      this.planPreview.set(preview);
    } catch (error) {
      this.planError.set(error instanceof Error ? error.message : 'This project plan could not be read.');
    }
  }

  importPlan(): void {
    const preview = this.planPreview();
    if (!preview) return;
    this.facade.importProjectPlan(preview.payload, () => this.closePlanImport());
  }

  openEdit(project: Project): void {
    this.editing.set(project);
    this.form.reset({
      title: project.title,
      description: project.description ?? '',
      startDate: project.startDate.slice(0, 10),
      expectedCompletionDate: project.expectedCompletionDate?.slice(0, 10) ?? '',
    });
    this.showDrawer.set(true);
  }

  closeDrawer(): void {
    this.showDrawer.set(false);
    this.editing.set(null);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const expectedCompletionDate = value.expectedCompletionDate
      ? this.toIso(value.expectedCompletionDate)
      : null;
    const editing = this.editing();

    if (editing) {
      this.facade.updateProject({
        projectId: editing.id,
        title: value.title,
        description: value.description,
        expectedCompletionDate,
      });
    } else {
      this.facade.createProject({
        title: value.title,
        description: value.description,
        startDate: this.toIso(value.startDate),
        expectedCompletionDate,
      });
    }

    this.closeDrawer();
  }

  async remove(project: Project): Promise<void> {
    const confirmed = await this.dialog.confirmDelete(
      'Delete project?',
      `"${project.title}" will be removed. Its tasks remain in your private task list.`,
      'Delete project',
    );

    if (confirmed) {
      this.facade.deleteProject(project.id);
    }
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private toIso(date: string): string {
    return new Date(`${date}T00:00:00Z`).toISOString();
  }
}
