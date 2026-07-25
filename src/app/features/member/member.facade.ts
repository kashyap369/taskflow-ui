import { Injectable, computed, inject, signal } from '@angular/core';

import { NotificationService } from '@core/services/notification.service';
import { OrganizationInvitation, isExpired } from '@shared/models/invitation.model';

import { MemberRepository } from './member.repository';

/**
 * Application layer for the Member (Individual) portal. Today it owns the **invitee's** side of the
 * organization-invitation flow: the invitations addressed to this user's email, and accepting or
 * declining them. Pages read the signals and call `init()`; they never touch the repository.
 *
 * Personal tasks are not here yet — the API has no endpoint to create a task without an
 * `OrganizationId` (see PHASES.md), so that half of the portal stays backend-blocked.
 */
@Injectable({ providedIn: 'root' })
export class MemberFacade {
  private readonly repository = inject(MemberRepository);
  private readonly notification = inject(NotificationService);

  // ── State ──
  private readonly _invitations = signal<OrganizationInvitation[]>([]);
  private readonly _loading = signal(false);
  private readonly _loaded = signal(false);
  private readonly _saving = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly invitations = this._invitations.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly saving = this._saving.asReadonly();
  readonly error = this._error.asReadonly();

  /** Everything `GET /mine` returns is pending, but some may have run past their expiry date. */
  readonly actionable = computed(() => this._invitations().filter((i) => !isExpired(i)));
  readonly expired = computed(() => this._invitations().filter((i) => isExpired(i)));

  /** Drives the nav badge — only invitations the user can actually act on. */
  readonly pendingCount = computed(() => this.actionable().length);
  readonly hasInvitations = computed(() => this._invitations().length > 0);

  /** Load the invitation list once. Call from member pages' constructors. */
  init(): void {
    if (this._loaded() || this._loading()) {
      return;
    }
    this.loadInvitations();
  }

  loadInvitations(): void {
    this._loading.set(true);
    this._error.set(null);
    this.repository.getMyInvitations().subscribe({
      next: (invitations) => {
        this._invitations.set(invitations);
        this._loaded.set(true);
        this._loading.set(false);
      },
      error: () => {
        this._error.set('Could not load your invitations.');
        this._loading.set(false);
      },
    });
  }

  /** Force a refresh (bypasses the once-only guard). */
  refresh(): void {
    this._loaded.set(false);
    this.loadInvitations();
  }

  /**
   * Accept an invitation → the API creates the membership. Can fail with 400 (expired) or 409
   * (already a member); the error interceptor surfaces those, and we reload either way so a
   * stale row disappears from the list.
   */
  accept(invitation: OrganizationInvitation): void {
    this._saving.set(true);
    this.repository.acceptInvitation(invitation.id).subscribe({
      next: () => {
        this._saving.set(false);
        this.notification.success(`You've joined ${invitation.organizationName}.`);
        this.refresh();
      },
      error: () => {
        this._saving.set(false);
        this.refresh();
      },
    });
  }

  decline(invitation: OrganizationInvitation): void {
    this._saving.set(true);
    this.repository.rejectInvitation(invitation.id).subscribe({
      next: () => {
        this._saving.set(false);
        this.notification.success(`Invitation from ${invitation.organizationName} declined.`);
        this.refresh();
      },
      error: () => {
        this._saving.set(false);
        this.refresh();
      },
    });
  }
}
