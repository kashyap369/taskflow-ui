import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ArrowRight,
  Building2,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  Mail,
  Power,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-angular';

import { LottiePlayer } from '@shared/ui/atoms/animations/lottie-player/lottie-player';
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
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule, LottiePlayer],
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
      }),
    },
  ],
})
export class MembersPage {
  private readonly facade = inject(OrganizationFacade);
  private readonly fb = inject(FormBuilder);

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
  readonly pendingInvitations = computed(() =>
    this.invitations().filter((i) => i.status === InvitationStatus.Pending),
  );
  readonly hasRoles = computed(() => this.roles().length > 0);

  readonly inviteForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    organizationRoleId: [0, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    this.facade.init();
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

  cancelInvite(invitation: OrganizationInvitation): void {
    this.facade.cancelInvitation(invitation.id);
  }

  toggleActive(member: OrganizationMember): void {
    if (member.isActive) {
      this.facade.deactivateMember(member.userId);
    } else {
      this.facade.activateMember(member.userId);
    }
  }

  remove(member: OrganizationMember): void {
    this.facade.removeMember(member.userId);
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
