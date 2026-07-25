import { Injectable, computed, inject, signal } from '@angular/core';

import { NotificationService } from '@core/services/notification.service';

import { AdminRepository } from './admin.repository';
import { AccountType, AdminUser, UserStatus } from './admin.models';

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
  private readonly _loading = signal(false);
  private readonly _loaded = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly users = this._users.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

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

  /** Force a refresh (bypasses the once-only guard). */
  refresh(): void {
    this._loaded.set(false);
    this.loadUsers();
    this.notification.info('Refreshing users…');
  }
}
