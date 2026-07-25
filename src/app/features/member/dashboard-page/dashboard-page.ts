import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ArrowRight,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  Mail,
} from 'lucide-angular';

import { AuthService } from '@core/auth/auth.service';
import { RevealDirective } from '@shared/directives/reveal.directive';
import { MemberFacade } from '../member.facade';

/**
 * Home for the Member (Individual) portal. Personal tasks are still backend-blocked (no endpoint
 * creates a task without an `OrganizationId`), so the only real data here is the user's pending
 * organization invitations — the rest is an honest "coming soon", not placeholder numbers.
 */
@Component({
  selector: 'app-member-dashboard-page',
  standalone: true,
  imports: [RevealDirective, RouterLink, LucideAngularModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ Mail, ArrowRight }),
    },
  ],
})
export class MemberDashboardPage {
  private readonly auth = inject(AuthService);
  private readonly facade = inject(MemberFacade);

  readonly user = this.auth.user;
  readonly pendingInvitations = this.facade.pendingCount;

  constructor() {
    this.facade.init();
  }
}
