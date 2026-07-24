import { Component, inject } from '@angular/core';

import { AuthService } from '@core/auth/auth.service';
import { RevealDirective } from '@shared/directives/reveal.directive';

/** Placeholder home for the Member (Individual) portal — real personal-task features come later. */
@Component({
  selector: 'app-member-dashboard-page',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class MemberDashboardPage {
  private readonly auth = inject(AuthService);

  readonly user = this.auth.user;

  stats = [
    { value: '8', label: 'Active tasks' },
    { value: '23', label: 'Completed this week' },
    { value: '3', label: 'Due today' },
  ];
}
