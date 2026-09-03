import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ArrowRight,
  Building2,
  CalendarDays,
  FolderKanban,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  Pencil,
  Plus,
  Download,
  Upload,
  FileSpreadsheet,
  Search,
  Trash2,
  X,
} from 'lucide-angular';

import { DialogService } from '@core/services/dialog.service';
import { DialogDirective } from '@shared/directives/dialog.directive';
import { Skeleton } from '@shared/ui/atoms/skeletons/skeleton/skeleton';
import { Pagination } from '@shared/ui/molecules/pagination/pagination';
import { createPagination } from '@shared/utils/pagination';
import {
  downloadProjectPlanTemplate,
  parseProjectPlanFile,
  ProjectPlanPreview,
} from '@shared/utils/project-plan-csv';
import { controlValidators, messageFor } from '@shared/validations';
import { ProjectFormModel } from '../organization.form-models';
import { Project, ProjectStatus, projectStatusMeta } from '../organization.models';
import { OrganizationFacade } from '../organization.facade';

@Component({
  selector: 'app-projects-page',
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
  templateUrl: './projects-page.html',
  styleUrl: './projects-page.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        Plus,
        X,
        FolderKanban,
        CalendarDays,
        ArrowRight,
        Building2,
        Search,
        Pencil,
        Trash2,
        Download,
        Upload,
        FileSpreadsheet,
      }),
    },
  ],
})
export class ProjectsPage {
  private readonly facade = inject(OrganizationFacade);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(DialogService);

  readonly loading = this.facade.loading;
  readonly saving = this.facade.saving;
  readonly projects = this.facade.projects;
  readonly currentOrg = this.facade.currentOrg;
  readonly needsOrganization = this.facade.needsOrganization;

  readonly projectStatusMeta = projectStatusMeta;

  /** One drawer serves create and edit; `editing` holds the row being edited (null = create). */
  readonly showDrawer = signal(false);
  readonly showImportDrawer = signal(false);
  readonly planPreview = signal<ProjectPlanPreview | null>(null);
  readonly planError = signal<string | null>(null);
  readonly editing = signal<Project | null>(null);
  readonly isEditing = computed(() => this.editing() !== null);

  readonly hasProjects = computed(() => this.projects().length > 0);

  /** Placeholder cards rendered while projects load. */
  readonly loadingCards = [0, 1, 2, 3, 4, 5];

  // ── Filters + paging (client-side: the API returns the whole org list) ──
  readonly search = signal('');
  /** '' = all, otherwise a ProjectStatus int. */
  readonly statusFilter = signal<'' | ProjectStatus>('');

  readonly statusOptions: { value: ProjectStatus; label: string }[] = [
    { value: ProjectStatus.Draft, label: 'Draft' },
    { value: ProjectStatus.Active, label: 'Active' },
    { value: ProjectStatus.OnHold, label: 'On hold' },
    { value: ProjectStatus.Completed, label: 'Completed' },
    { value: ProjectStatus.Archived, label: 'Archived' },
    { value: ProjectStatus.Cancelled, label: 'Cancelled' },
  ];

  readonly filteredProjects = computed(() => {
    const term = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    return this.projects().filter((p) => {
      const matchesTerm =
        !term ||
        p.title.toLowerCase().includes(term) ||
        (p.description ?? '').toLowerCase().includes(term);
      return matchesTerm && (status === '' || p.status === status);
    });
  });

  readonly pager = createPagination(this.filteredProjects, { pageSize: 9, pageSizes: [9, 18, 36] });

  /** Per-control validators derived from `ProjectFormModel`'s decorators. */
  private readonly rules = controlValidators(ProjectFormModel);

  readonly createForm = this.fb.nonNullable.group({
    title: ['', this.rules['title']],
    description: ['', this.rules['description']],
    startDate: [this.today(), this.rules['startDate']],
    expectedCompletionDate: [''],
  });

  /** Touched-gated message for a field, straight from the decorator that failed. */
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
    this.statusFilter.set(value === '' ? '' : (Number(value) as ProjectStatus));
  }

  clearFilters(): void {
    this.search.set('');
    this.statusFilter.set('');
  }

  openCreate(): void {
    this.editing.set(null);
    this.createForm.reset({ title: '', description: '', startDate: this.today(), expectedCompletionDate: '' });
    this.showDrawer.set(true);
  }

  downloadPlanTemplate(): void {
    downloadProjectPlanTemplate(false);
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
      this.planPreview.set(await parseProjectPlanFile(file));
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
    this.createForm.reset({
      title: project.title,
      description: project.description ?? '',
      startDate: this.toDateInput(project.startDate),
      expectedCompletionDate: project.expectedCompletionDate
        ? this.toDateInput(project.expectedCompletionDate)
        : '',
    });
    this.showDrawer.set(true);
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

    const { title, description, startDate, expectedCompletionDate } = this.createForm.getRawValue();
    const target = expectedCompletionDate ? this.toIso(expectedCompletionDate) : null;
    const editing = this.editing();

    if (editing) {
      this.facade.updateProject({
        projectId: editing.id,
        title,
        description,
        expectedCompletionDate: target,
      });
    } else {
      this.facade.createProject({
        title,
        description,
        startDate: this.toIso(startDate),
        expectedCompletionDate: target,
      });
    }

    this.closeDrawer();
  }

  async remove(project: Project): Promise<void> {
    const ok = await this.dialog.confirmDelete(
      'Delete project?',
      `"${project.title}" and its ${project.taskCount} task(s) will be deleted.`,
      'Delete project',
    );
    if (ok) {
      this.facade.deleteProject(project.id);
    }
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  /** API ISO timestamp → the `YYYY-MM-DD` a date input expects. */
  private toDateInput(iso: string): string {
    return iso.slice(0, 10);
  }

  /** `YYYY-MM-DD` from a date input → a UTC ISO string the API can bind to DateTime. */
  private toIso(date: string): string {
    return new Date(`${date}T00:00:00Z`).toISOString();
  }
}
