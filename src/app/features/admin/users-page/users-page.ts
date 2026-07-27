import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  Clock,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  Mail,
  Phone,
  RefreshCw,
  Search,
  ShieldOff,
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
import {
  AccountType,
  AdminUser,
  UserStatus,
  accountTypeMeta,
  userStatusMeta,
} from '../admin.models';

/** Platform user management — the AdminOnly `GET /user` list with search + status/type filters. */
@Component({
  selector: 'app-admin-users-page',
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
  templateUrl: './users-page.html',
  styleUrl: './users-page.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        Users,
        User,
        Building2,
        Search,
        RefreshCw,
        X,
        Mail,
        Phone,
        BadgeCheck,
        ShieldOff,
        Clock,
        CalendarDays,
      }),
    },
  ],
})
export class AdminUsersPage {
  private readonly facade = inject(AdminFacade);

  readonly loading = this.facade.loading;
  readonly error = this.facade.error;
  readonly users = this.facade.users;
  readonly totalUsers = this.facade.totalUsers;
  readonly activeUsers = this.facade.activeUsers;
  readonly pendingUsers = this.facade.pendingUsers;
  readonly organizationAccounts = this.facade.organizationAccounts;
  readonly selectedUser = this.facade.selectedUser;
  readonly selectedUserId = this.facade.selectedUserId;
  readonly detailLoading = this.facade.detailLoading;

  readonly userStatusMeta = userStatusMeta;
  readonly accountTypeMeta = accountTypeMeta;

  // ── Filters ──
  readonly search = signal('');
  /** '' = all, otherwise a UserStatus int as a string. */
  readonly statusFilter = signal<'' | UserStatus>('');
  /** '' = all, otherwise an AccountType int as a string. */
  readonly typeFilter = signal<'' | AccountType>('');

  readonly statusOptions: { value: UserStatus; label: string }[] = [
    { value: UserStatus.Active, label: 'Active' },
    { value: UserStatus.Inactive, label: 'Inactive' },
    { value: UserStatus.Suspended, label: 'Suspended' },
    { value: UserStatus.PendingVerification, label: 'Pending' },
  ];

  readonly typeOptions: { value: AccountType; label: string }[] = [
    { value: AccountType.Individual, label: 'Individual' },
    { value: AccountType.Organization, label: 'Organization' },
  ];

  readonly filteredUsers = computed(() => {
    const term = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    const type = this.typeFilter();
    return this.users().filter((u) => {
      const matchesTerm =
        !term ||
        u.fullName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term);
      const matchesStatus = status === '' || u.status === status;
      const matchesType = type === '' || u.accountType === type;
      return matchesTerm && matchesStatus && matchesType;
    });
  });

  /** Client-side pager over the filtered rows (the API has no paging yet). */
  readonly pager = createPagination(this.filteredUsers, { pageSize: 10 });

  readonly hasUsers = computed(() => this.users().length > 0);

  /** Placeholder rows rendered while the user list loads. */
  readonly loadingRows = [0, 1, 2, 3, 4];

  constructor() {
    this.facade.init();
  }

  onSearch(value: string): void {
    this.search.set(value);
  }

  onStatusFilter(value: string): void {
    this.statusFilter.set(value === '' ? '' : (Number(value) as UserStatus));
  }

  onTypeFilter(value: string): void {
    this.typeFilter.set(value === '' ? '' : (Number(value) as AccountType));
  }

  clearFilters(): void {
    this.search.set('');
    this.statusFilter.set('');
    this.typeFilter.set('');
  }

  refresh(): void {
    this.facade.refresh();
  }

  /** Open the detail drawer for a row. The row DTO is short — the drawer needs `GET /user/{id}`. */
  openUser(user: AdminUser): void {
    this.facade.selectUser(user.id);
  }

  closeUser(): void {
    this.facade.clearSelectedUser();
  }

  initials(fullName: string): string {
    return fullName
      .split(' ')
      .map((p) => p.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  trackById(_index: number, user: AdminUser): number {
    return user.id;
  }
}
