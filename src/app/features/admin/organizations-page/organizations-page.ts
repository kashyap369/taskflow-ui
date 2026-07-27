import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Building2,
  CalendarDays,
  FolderKanban,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  Mail,
  RefreshCw,
  Search,
  SquareCheckBig,
  User,
  Users,
  X,
} from 'lucide-angular';

import { DialogDirective } from '@shared/directives/dialog.directive';
import { LottiePlayer } from '@shared/ui/atoms/animations/lottie-player/lottie-player';
import { Skeleton } from '@shared/ui/atoms/skeletons/skeleton/skeleton';
import { Pagination } from '@shared/ui/molecules/pagination/pagination';
import { createPagination } from '@shared/utils/pagination';
import { AdminFacade } from '../admin.facade';
import { AdminOrganization, OrganizationStatus, organizationStatusMeta } from '../admin.models';

/**
 * Every organization on the platform — the AdminOnly `GET /admin/organizations`.
 *
 * This is deliberately **read-only**. `AdminController` exposes no write route for an organization,
 * and the ones on `OrganizationController` are owner-gated (`EnsureOrganizationOwnerAsync`), so an
 * admin who owns nothing would get a 403 from every one of them.
 */
@Component({
  selector: 'app-admin-organizations-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    LottiePlayer,
    Skeleton,
    Pagination,
    DialogDirective,
  ],
  templateUrl: './organizations-page.html',
  styleUrl: './organizations-page.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        Building2,
        Users,
        User,
        Mail,
        Search,
        RefreshCw,
        X,
        FolderKanban,
        SquareCheckBig,
        CalendarDays,
      }),
    },
  ],
})
export class AdminOrganizationsPage {
  private readonly facade = inject(AdminFacade);

  readonly loading = this.facade.organizationsLoading;
  readonly error = this.facade.organizationsError;
  readonly organizations = this.facade.organizations;
  readonly totalOrganizations = this.facade.totalOrganizations;
  readonly activeOrganizations = this.facade.activeOrganizations;
  readonly totalProjects = this.facade.totalProjects;
  readonly totalTasks = this.facade.totalTasks;

  readonly organizationStatusMeta = organizationStatusMeta;

  // ── Filters ──
  readonly search = signal('');
  /** '' = all, otherwise an OrganizationStatus int. */
  readonly statusFilter = signal<'' | OrganizationStatus>('');

  readonly statusOptions: { value: OrganizationStatus; label: string }[] = [
    { value: OrganizationStatus.Active, label: 'Active' },
    { value: OrganizationStatus.Inactive, label: 'Inactive' },
    { value: OrganizationStatus.Suspended, label: 'Suspended' },
  ];

  readonly filteredOrganizations = computed(() => {
    const term = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    return this.organizations().filter((o) => {
      const matchesTerm =
        !term ||
        o.name.toLowerCase().includes(term) ||
        o.ownerFullName.toLowerCase().includes(term) ||
        o.ownerEmail.toLowerCase().includes(term);
      const matchesStatus = status === '' || o.status === status;
      return matchesTerm && matchesStatus;
    });
  });

  /** Client-side pager over the filtered rows (the API has no paging yet). */
  readonly pager = createPagination(this.filteredOrganizations, { pageSize: 10 });

  readonly hasOrganizations = computed(() => this.organizations().length > 0);

  /** The row opened in the detail drawer. The list DTO carries everything, so there's no extra GET. */
  readonly selected = signal<AdminOrganization | null>(null);

  /** Placeholder rows rendered while the list loads. */
  readonly loadingRows = [0, 1, 2, 3, 4];

  constructor() {
    this.facade.initOrganizations();
  }

  onSearch(value: string): void {
    this.search.set(value);
  }

  onStatusFilter(value: string): void {
    this.statusFilter.set(value === '' ? '' : (Number(value) as OrganizationStatus));
  }

  clearFilters(): void {
    this.search.set('');
    this.statusFilter.set('');
  }

  refresh(): void {
    this.facade.refreshOrganizations();
  }

  open(organization: AdminOrganization): void {
    this.selected.set(organization);
  }

  close(): void {
    this.selected.set(null);
  }

  initials(name: string): string {
    return name
      .split(' ')
      .map((p) => p.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  trackById(_index: number, organization: AdminOrganization): number {
    return organization.id;
  }
}
