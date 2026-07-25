import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  Building2,
  Check,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  Mail,
  RefreshCw,
  ShieldCheck,
  X,
} from 'lucide-angular';

import { DialogService } from '@core/services/dialog.service';
import { OrganizationInvitation } from '@shared/models/invitation.model';
import { Skeleton } from '@shared/ui/atoms/skeletons/skeleton/skeleton';
import { MemberFacade } from '../member.facade';

/**
 * The **invitee's** side of the organization-invitation flow: invitations addressed to this
 * account's email, with Accept / Decline. Accepting is what turns an Individual account into a
 * member of an organization.
 */
@Component({
  selector: 'app-member-invitations-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, Skeleton],
  templateUrl: './invitations-page.html',
  styleUrl: './invitations-page.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        Building2,
        Mail,
        ShieldCheck,
        Check,
        X,
        RefreshCw,
      }),
    },
  ],
})
export class MemberInvitationsPage {
  private readonly facade = inject(MemberFacade);
  private readonly dialog = inject(DialogService);

  readonly loading = this.facade.loading;
  readonly saving = this.facade.saving;
  readonly error = this.facade.error;
  readonly invitations = this.facade.invitations;
  readonly actionable = this.facade.actionable;
  readonly expired = this.facade.expired;
  readonly hasInvitations = this.facade.hasInvitations;

  /** Placeholder cards rendered while invitations load. */
  readonly loadingCards = [0, 1];

  constructor() {
    this.facade.init();
  }

  refresh(): void {
    this.facade.refresh();
  }

  accept(invitation: OrganizationInvitation): void {
    this.facade.accept(invitation);
  }

  /** Declining is irreversible from this side (the org would have to re-invite), so confirm. */
  async decline(invitation: OrganizationInvitation): Promise<void> {
    const ok = await this.dialog.confirm(
      'Decline invitation?',
      `${invitation.organizationName} would need to invite you again.`,
      'Decline',
      'Keep it',
    );
    if (ok) {
      this.facade.decline(invitation);
    }
  }

  initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }
}
