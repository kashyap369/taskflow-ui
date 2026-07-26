import { Injectable, computed, inject, signal } from '@angular/core';

import { NotificationService } from '@core/services/notification.service';

import { AdminRepository } from './admin.repository';
import { AccountType, AdminUser, AdminUserDetail, UserStatus } from './admin.models';

/**
 * Application layer for the platform Admin portal. Owns the platform user list (the AdminOnly
 * `GET /user`) and derives the platform-overview stats from it. Pages read the signals and call
 * `init()`; they never touch the repository directly.
 */
@Injectable({ providedIn: 'root' })
export class AdminFacade {
  private readonly repository = inject(AdminRepository);
  private readonly notification = inject(NotificationService);

  // ── State ──
  private readonly _users = signal<AdminUser[]>([]);
  private readonly _selectedUser = signal<AdminUserDetail | null>(null);
  private readonly _selectedUserId = signal<number | null>(null);
  private readonly _selectedUserDenied = signal(false);
  private readonly _loading = signal(false);
  private readonly _loaded = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly users = this._users.asReadonly();
  readonly selectedUser = this._selectedUser.asReadonly();
  readonly selectedUserId = this._selectedUserId.asReadonly();
  /** The detail request was refused — see `selectUser` for why an Admin hits this. */
  readonly selectedUserDenied = this._selectedUserDenied.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  /** The detail request is in flight — the id is known, and neither the DTO nor a refusal is back. */
  readonly detailLoading = computed(
    () =>
      this._selectedUserId() !== null &&
      this._selectedUser() === null &&
      !this._selectedUserDenied(),
  );

  // ── Derived platform stats (from the user list) ──
  readonly totalUsers = computed(() => this._users().length);
  readonly activeUsers = computed(
    () => this._users().filter((u) => u.status === UserStatus.Active).length,
  );
  readonly pendingUsers = computed(
    () => this._users().filter((u) => u.status === UserStatus.PendingVerification).length,
  );
  readonly organizationAccounts = computed(
    () => this._users().filter((u) => u.accountType === AccountType.Organization).length,
  );

  /** Load the user list once. Call from admin pages' constructors. */
  init(): void {
    if (this._loaded() || this._loading()) {
      return;
    }
    this.loadUsers();
  }

  /** (Re)load the platform user list. */
  loadUsers(): void {
    this._loading.set(true);
    this._error.set(null);
    this.repository.getUsers().subscribe({
      next: (users) => {
        this._users.set(users);
        this._loaded.set(true);
        this._loading.set(false);
      },
      error: () => {
        this._error.set('Could not load users.');
        this._loading.set(false);
      },
    });
  }

  /**
   * Load one account's full detail for the user-detail drawer. `UserListItemDto` (the table row)
   * carries only id/name/email/status/type — phone, email-verified, last-login and created-at come
   * only from `GET /user/{id}`.
   *
   * That endpoint is guarded by `EnsureUserAsync`, which permits **yourself or someone who shares an
   * organization with you — with no Admin bypass**. A platform admin who belongs to no organization
   * can therefore list every account but open none, so a refusal is an expected outcome here and the
   * drawer explains it in place rather than just flashing an error toast.
   */
  selectUser(userId: number): void {
    this._selectedUserId.set(userId);
    this._selectedUser.set(null);
    this._selectedUserDenied.set(false);
    this.repository.getUser(userId).subscribe({
      next: (user) => this._selectedUser.set(user),
      error: () => this._selectedUserDenied.set(true),
    });
  }

  clearSelectedUser(): void {
    this._selectedUser.set(null);
    this._selectedUserId.set(null);
    this._selectedUserDenied.set(false);
  }

  /** Force a refresh (bypasses the once-only guard). */
  refresh(): void {
    this._loaded.set(false);
    this.loadUsers();
    this.notification.info('Refreshing users…');
  }
}
