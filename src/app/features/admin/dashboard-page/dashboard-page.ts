import { Component, inject } from '@angular/core';

import { AuthService } from '@core/auth/auth.service';
import { RevealDirective } from '@shared/directives/reveal.directive';

/** Placeholder home for the platform Admin portal — real admin features come later. */
@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class AdminDashboardPage {
  private readonly auth = inject(AuthService);

  readonly user = this.auth.user;

  stats = [
    { value: '1,284', label: 'Total users' },
    { value: '96', label: 'Organizations' },
    { value: '12', label: 'Pending reviews' },
  ];
}
