import { Injectable, computed, inject, signal } from '@angular/core';

import { resetOnSessionChange } from '@core/auth/session-reset';
import { NotificationService } from '@core/services/notification.service';

import { AdminRepository } from './admin.repository';
import {
  AccountType,
  AdminOrganization,
  AdminUser,
  AdminUserDetail,
  OrganizationStatus,
  PlatformSettings,
  UpdatePlatformSettingsPayload,
  UserStatus,
} from './admin.models';

/**
 * Application layer for the platform Admin portal. Owns the three AdminOnly reads — the platform
 * user list (`GET /user`), every organization (`GET /admin/organizations`) and the platform
 * settings singleton (`GET /admin/settings`) — and derives the overview stats from them. Pages read
 * the signals and call `init()`; they never touch the repository directly.
 */
@Injectable({ providedIn: 'root' })
export class AdminFacade {
  private readonly repository = inject(AdminRepository);
  private readonly notification = inject(NotificationService);

  // ── State ──
  private readonly _users = signal<AdminUser[]>([]);
  private readonly _selectedUser = signal<AdminUserDetail | null>(null);
  private readonly _selectedUserId = signal<number | null>(null);
  private readonly _loading = signal(false);
  private readonly _loaded = signal(false);
  private readonly _error = signal<string | null>(null);

  private readonly _organizations = signal<AdminOrganization[]>([]);
  private readonly _organizationsLoading = signal(false);
  private readonly _organizationsLoaded = signal(false);
  private readonly _organizationsError = signal<string | null>(null);

  private readonly _settings = signal<PlatformSettings | null>(null);
  private readonly _settingsLoading = signal(false);
  private readonly _settingsSaving = signal(false);

  readonly users = this._users.asReadonly();
  readonly selectedUser = this._selectedUser.asReadonly();
  readonly selectedUserId = this._selectedUserId.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly organizations = this._organizations.asReadonly();
  readonly organizationsLoading = this._organizationsLoading.asReadonly();
  readonly organizationsError = this._organizationsError.asReadonly();

  readonly settings = this._settings.asReadonly();
  readonly settingsLoading = this._settingsLoading.asReadonly();
  readonly settingsSaving = this._settingsSaving.asReadonly();

  /** The detail request is in flight — the id is known and the DTO isn't back yet. */
  readonly detailLoading = computed(
    () => this._selectedUserId() !== null && this._selectedUser() === null,
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

  // ── Derived platform stats (from the organization list) ──
  readonly totalOrganizations = computed(() => this._organizations().length);
  readonly activeOrganizations = computed(
    () => this._organizations().filter((o) => o.status === OrganizationStatus.Active).length,
  );
  readonly totalProjects = computed(() =>
    this._organizations().reduce((sum, o) => sum + o.projectCount, 0),
  );
  readonly totalTasks = computed(() =>
    this._organizations().reduce((sum, o) => sum + o.taskCount, 0),
  );

  constructor() {
    // `init()` won't refetch once `_loaded` is true, so a new session must start from empty.
    resetOnSessionChange(() => this.resetForNewSession());
  }

  /** Drop every signal this facade owns, so the next `init()` starts from scratch. */
  private resetForNewSession(): void {
    this._users.set([]);
    this.clearSelectedUser();
    this._loaded.set(false);
    this._loading.set(false);
    this._error.set(null);
    this._organizations.set([]);
    this._organizationsLoaded.set(false);
    this._organizationsLoading.set(false);
    this._organizationsError.set(null);
    this._settings.set(null);
    this._settingsLoading.set(false);
    this._settingsSaving.set(false);
  }

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
   * `EnsureUserAsync` used to permit only yourself or someone sharing an organization with you,
   * which refused a platform admin outright; backend Phase 10 added an Admin short-circuit, so any
   * row opens. A failure here is now an ordinary error (the interceptor toasts it) — close the
   * drawer rather than leaving it on a skeleton forever.
   */
  selectUser(userId: number): void {
    this._selectedUserId.set(userId);
    this._selectedUser.set(null);
    this.repository.getUser(userId).subscribe({
      next: (user) => this._selectedUser.set(user),
      error: () => this.clearSelectedUser(),
    });
  }

  clearSelectedUser(): void {
    this._selectedUser.set(null);
    this._selectedUserId.set(null);
  }

  /** Force a refresh (bypasses the once-only guard). */
  refresh(): void {
    this._loaded.set(false);
    this.loadUsers();
    this.notification.info('Refreshing users…');
  }

  // ── Organizations (GET /admin/organizations) ──

  /** Load every organization on the platform once. Call from the organizations page constructor. */
  initOrganizations(): void {
    if (this._organizationsLoaded() || this._organizationsLoading()) {
      return;
    }
    this.loadOrganizations();
  }

  loadOrganizations(): void {
    this._organizationsLoading.set(true);
    this._organizationsError.set(null);
    this.repository.getOrganizations().subscribe({
      next: (organizations) => {
        this._organizations.set(organizations);
        this._organizationsLoaded.set(true);
        this._organizationsLoading.set(false);
      },
      error: () => {
        this._organizationsError.set('Could not load organizations.');
        this._organizationsLoading.set(false);
      },
    });
  }

  refreshOrganizations(): void {
    this._organizationsLoaded.set(false);
    this.loadOrganizations();
    this.notification.info('Refreshing organizations…');
  }

  // ── Platform settings (GET / PUT /admin/settings) ──

  /**
   * Load the settings singleton. Unlike the two lists this always re-fetches: the form fills from
   * it, and stale values here would be saved straight back over whatever changed elsewhere.
   */
  loadSettings(): void {
    this._settingsLoading.set(true);
    this.repository.getSettings().subscribe({
      next: (settings) => {
        this._settings.set(settings);
        this._settingsLoading.set(false);
      },
      error: () => this._settingsLoading.set(false),
    });
  }

  /**
   * `PUT /admin/settings` → 204. The command takes all five editable fields, so the caller must send
   * the whole shape — a partial save would blank whatever it omitted. Re-reads on success so the
   * form settles on the server's values (incl. the new `updatedAt`).
   */
  updateSettings(payload: UpdatePlatformSettingsPayload): void {
    this._settingsSaving.set(true);
    this.repository.updateSettings(payload).subscribe({
      next: () => {
        this._settingsSaving.set(false);
        this.notification.success('Platform settings saved.');
        this.loadSettings();
      },
      error: () => this._settingsSaving.set(false),
    });
  }
}
