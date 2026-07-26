import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ArrowRight,
  Building2,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  Mail,
  Power,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-angular';

import { DialogService } from '@core/services/dialog.service';
import { DialogDirective } from '@shared/directives/dialog.directive';
import { LottiePlayer } from '@shared/ui/atoms/animations/lottie-player/lottie-player';
import { Skeleton } from '@shared/ui/atoms/skeletons/skeleton/skeleton';
import { Pagination } from '@shared/ui/molecules/pagination/pagination';
import { createPagination } from '@shared/utils/pagination';
import { controlValidators, messageFor } from '@shared/validations';
import { InviteFormModel } from '../organization.form-models';
import {
  InvitationStatus,
  OrganizationInvitation,
  OrganizationMember,
  invitationStatusMeta,
} from '../organization.models';
import { OrganizationFacade } from '../organization.facade';

@Component({
  selector: 'app-members-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LucideAngularModule,
    LottiePlayer,
    Skeleton,
    DialogDirective,
    Pagination,
  ],
  templateUrl: './members-page.html',
  styleUrl: './members-page.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        UserPlus,
        X,
        Users,
        Mail,
        Power,
        Trash2,
        ArrowRight,
        Building2,
        Search,
      }),
    },
  ],
})
export class MembersPage {
  private readonly facade = inject(OrganizationFacade);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(DialogService);

  readonly loading = this.facade.loading;
  readonly saving = this.facade.saving;
  readonly members = this.facade.members;
  readonly invitations = this.facade.invitations;
  readonly roles = this.facade.roles;
  readonly currentOrg = this.facade.currentOrg;
  readonly needsOrganization = this.facade.needsOrganization;

  readonly invitationStatusMeta = invitationStatusMeta;
  readonly InvitationStatus = InvitationStatus;

  readonly showInvite = signal(false);
  readonly hasMembers = computed(() => this.members().length > 0);

  /** Placeholder rows rendered while members load. */
  readonly loadingRows = [0, 1, 2, 3, 4];
  readonly pendingInvitations = computed(() =>
    this.invitations().filter((i) => i.status === InvitationStatus.Pending),
  );
  readonly hasRoles = computed(() => this.roles().length > 0);

  // ── Filters + paging (client-side: the API returns the whole member list) ──
  readonly search = signal('');
  /** '' = all, 'active' / 'inactive' = membership state. */
  readonly activeFilter = signal<'' | 'active' | 'inactive'>('');

  readonly filteredMembers = computed(() => {
    const term = this.search().trim().toLowerCase();
    const state = this.activeFilter();
    return this.members().filter((m) => {
      const matchesTerm =
        !term ||
        m.userFullName.toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term);
      const matchesState =
        state === '' || (state === 'active' ? m.isActive : !m.isActive);
      return matchesTerm && matchesState;
    });
  });

  readonly pager = createPagination(this.filteredMembers, { pageSize: 10 });

  /** The invitations panel gets its own pager (no filters — it's a short, single-purpose list). */
  readonly invitePager = createPagination(this.pendingInvitations, { pageSize: 5 });

  /** Per-control validators derived from `InviteFormModel`'s decorators. */
  private readonly rules = controlValidators(InviteFormModel);

  readonly inviteForm = this.fb.nonNullable.group({
    email: ['', this.rules['email']],
    organizationRoleId: [0, this.rules['organizationRoleId']],
  });

  /** Touched-gated message for a field, straight from the decorator that failed. */
  fieldError(property: string): string | null {
    return messageFor(this.inviteForm, property);
  }

  constructor() {
    this.facade.init();
  }

  // ── Filters ──

  onSearch(value: string): void {
    this.search.set(value);
  }

  onActiveFilter(value: string): void {
    this.activeFilter.set(value === 'active' || value === 'inactive' ? value : '');
  }

  clearFilters(): void {
    this.search.set('');
    this.activeFilter.set('');
  }

  openInvite(): void {
    this.inviteForm.reset({ email: '', organizationRoleId: this.roles()[0]?.id ?? 0 });
    this.showInvite.set(true);
  }

  closeInvite(): void {
    this.showInvite.set(false);
  }

  submitInvite(): void {
    if (this.inviteForm.invalid) {
      this.inviteForm.markAllAsTouched();
      return;
    }
    const { email, organizationRoleId } = this.inviteForm.getRawValue();
    this.facade.invite(email, Number(organizationRoleId));
    this.closeInvite();
  }

  async cancelInvite(invitation: OrganizationInvitation): Promise<void> {
    const ok = await this.dialog.confirm(
      'Cancel invitation?',
      `The invitation to ${invitation.email} will be withdrawn.`,
      'Cancel invitation',
      'Keep it',
    );
    if (ok) {
      this.facade.cancelInvitation(invitation.id);
    }
  }

  toggleActive(member: OrganizationMember): void {
    if (member.isActive) {
      this.facade.deactivateMember(member.userId);
    } else {
      this.facade.activateMember(member.userId);
    }
  }

  /**
   * NOTE: the API's `RemoveMember` and `DeactivateMember` handlers are identical — both just
   * deactivate the membership, so the row stays in this list as **Inactive** rather than
   * disappearing. The copy says so instead of promising a deletion the backend doesn't perform.
   */
  async remove(member: OrganizationMember): Promise<void> {
    const ok = await this.dialog.confirmDelete(
      'Remove member?',
      `${member.userFullName} will lose access to this organization. They stay listed as Inactive and can be reactivated later.`,
      'Remove',
    );
    if (ok) {
      this.facade.removeMember(member.userId);
    }
  }

  changeRole(member: OrganizationMember, event: Event): void {
    const roleId = Number((event.target as HTMLSelectElement).value);
    if (roleId && roleId !== member.organizationRoleId) {
      this.facade.changeMemberRole(member.userId, roleId);
    }
  }

  initials(fullName: string): string {
    return fullName
      .split(' ')
      .map((p) => p.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}
