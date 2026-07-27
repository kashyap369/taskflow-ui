import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  ArrowRight,
  Building2,
  Clock,
  Settings,
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
      useValue: new LucideIconProvider({ Users, Building2, Clock, Settings, ArrowRight }),
    },
  ],
})
export class AdminDashboardPage {
  private readonly auth = inject(AuthService);
  private readonly facade = inject(AdminFacade);

  readonly user = this.auth.user;

  /** Both lists feed the tiles, so hold the dashes until neither is still in flight. */
  readonly loading = computed(() => this.facade.loading() || this.facade.organizationsLoading());

  readonly stats = computed(() => [
    { value: this.facade.totalUsers(), label: 'Total users', icon: 'Users' },
    // The real workspace count from `GET /admin/organizations` — not the number of *accounts*
    // registered as Organization type, which is a different (and usually larger) number.
    { value: this.facade.totalOrganizations(), label: 'Organizations', icon: 'Building2' },
    { value: this.facade.activeUsers(), label: 'Active users', icon: 'Users' },
    { value: this.facade.pendingUsers(), label: 'Pending verification', icon: 'Clock' },
  ]);

  constructor() {
    this.facade.init();
    this.facade.initOrganizations();
  }
}
