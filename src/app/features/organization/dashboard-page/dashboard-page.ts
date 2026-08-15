import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ArrowRight,
  Building2,
  CheckCheck,
  CircleCheckBig,
  Clock,
  FolderKanban,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  Plus,
  Sparkles,
  TriangleAlert,
  Users,
} from 'lucide-angular';

import { AccountType } from '@core/auth/roles.enum';
import { Skeleton } from '@shared/ui/atoms/skeletons/skeleton/skeleton';
import { controlValidators, messageFor } from '@shared/validations';
import {
  HealthSegment,
  ProjectHealthChart,
} from '@shared/ui/organisms/project-health-chart/project-health-chart';
import { OrganizationFormModel } from '../organization.form-models';
import { projectStatusMeta } from '../organization.models';
import { OrganizationFacade } from '../organization.facade';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LucideAngularModule,
    ProjectHealthChart,
    Skeleton,
  ],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        Sparkles,
        Plus,
        ArrowRight,
        FolderKanban,
        CheckCheck,
        CircleCheckBig,
        TriangleAlert,
        Users,
        Clock,
        Building2,
      }),
    },
  ],
})
export class DashboardPage {
  private readonly facade = inject(OrganizationFacade);
  private readonly fb = inject(FormBuilder);

  readonly loading = this.facade.loading;
  readonly saving = this.facade.saving;
  readonly needsOrganization = this.facade.needsOrganization;
  readonly currentOrg = this.facade.currentOrg;
  readonly summary = this.facade.summary;
  readonly projects = this.facade.projects;
  readonly user = this.facade.user;
  readonly isIndividualAccount = computed(
    () => this.user()?.accountType === AccountType.Individual,
  );

  readonly projectStatusMeta = projectStatusMeta;

  /** First name for the greeting, falling back gracefully. */
  readonly firstName = computed(() => this.user()?.fullName?.split(' ')[0] ?? 'there');

  /** Up to 5 most recent projects for the overview list. */
  readonly recentProjects = computed(() => this.projects().slice(0, 5));

  /** Placeholder tiles/rows rendered before the dashboard summary arrives. */
  readonly loadingTiles = [0, 1, 2, 3];

  /** Real task-status donut fed from the dashboard summary. */
  readonly taskSegments = computed<HealthSegment[]>(() => {
    const s = this.summary();
    if (!s) {
      return [];
    }
    return [
      { name: 'To do', value: s.todoTasks, color: '#94A3B8' },
      { name: 'In progress', value: s.inProgressTasks, color: '#4F6EF7' },
      { name: 'Completed', value: s.completedTasks, color: '#10B981' },
    ];
  });

  /**
   * Priority donut — the counterpart to the status one above. Both read the same summary DTO, but
   * they slice every task a different way, so their totals match while their segments don't.
   */
  readonly prioritySegments = computed<HealthSegment[]>(() => {
    const s = this.summary();
    if (!s) {
      return [];
    }
    return [
      { name: 'Low', value: s.lowPriorityTasks, color: '#94A3B8' },
      { name: 'Medium', value: s.mediumPriorityTasks, color: '#4F6EF7' },
      { name: 'High', value: s.highPriorityTasks, color: '#F59E0B' },
      { name: 'Critical', value: s.criticalPriorityTasks, color: '#F43F5E' },
    ];
  });

  /** Per-control validators derived from `OrganizationFormModel`'s decorators. */
  private readonly rules = controlValidators(OrganizationFormModel);

  readonly createOrgForm = this.fb.nonNullable.group({
    name: ['', this.rules['name']],
    description: ['', this.rules['description']],
  });

  /** Touched-gated message for a field, straight from the decorator that failed. */
  fieldError(property: string): string | null {
    return messageFor(this.createOrgForm, property);
  }

  constructor() {
    this.facade.init();
  }

  createOrganization(): void {
    if (this.createOrgForm.invalid) {
      this.createOrgForm.markAllAsTouched();
      return;
    }
    const { name, description } = this.createOrgForm.getRawValue();
    this.facade.createOrganization(name, description);
  }
}
