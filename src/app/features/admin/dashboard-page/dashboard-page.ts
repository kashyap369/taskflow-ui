import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  ArrowRight,
  Building2,
  Clock,
  Users,
} from 'lucide-angular';

import { AuthService } from '@core/auth/auth.service';
import { RevealDirective } from '@shared/directives/reveal.directive';
import { AdminFacade } from '../admin.facade';

/** Home for the platform Admin portal — live platform overview derived from the user list. */
@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [RevealDirective, RouterLink, LucideAngularModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ Users, Building2, Clock, ArrowRight }),
    },
  ],
})
export class AdminDashboardPage {
  private readonly auth = inject(AuthService);
  private readonly facade = inject(AdminFacade);

  readonly user = this.auth.user;
  readonly loading = this.facade.loading;

  readonly stats = computed(() => [
    { value: this.facade.totalUsers(), label: 'Total users', icon: 'Users' },
    { value: this.facade.organizationAccounts(), label: 'Organization accounts', icon: 'Building2' },
    { value: this.facade.activeUsers(), label: 'Active users', icon: 'Users' },
    { value: this.facade.pendingUsers(), label: 'Pending verification', icon: 'Clock' },
  ]);

  constructor() {
    this.facade.init();
  }
}
