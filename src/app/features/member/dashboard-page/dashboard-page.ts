import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ArrowRight,
  CircleCheckBig,
  Clock,
  LUCIDE_ICONS,
  ListChecks,
  LucideAngularModule,
  LucideIconProvider,
  Mail,
  Plus,
  TriangleAlert,
} from 'lucide-angular';

import { AuthService } from '@core/auth/auth.service';
import { RevealDirective } from '@shared/directives/reveal.directive';
import { Skeleton } from '@shared/ui/atoms/skeletons/skeleton/skeleton';
import { MemberFacade } from '../member.facade';

type Preset = 'week' | 'month' | 'year';

/**
 * Home for the Member (Individual) portal. Every number here is real: the task counts come from
 * the personal task list, the tracked hours and throughput from `GET /report/me`. Nothing is
 * hardcoded — an empty workspace shows zeros and an invitation to create something.
 */
@Component({
  selector: 'app-member-dashboard-page',
  standalone: true,
  imports: [CommonModule, RevealDirective, RouterLink, LucideAngularModule, Skeleton],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        Mail,
        ArrowRight,
        ListChecks,
        CircleCheckBig,
        Clock,
        TriangleAlert,
        Plus,
      }),
    },
  ],
})
export class MemberDashboardPage {
  private readonly auth = inject(AuthService);
  private readonly facade = inject(MemberFacade);

  readonly user = this.auth.user;
  readonly pendingInvitations = this.facade.pendingCount;

  // Live personal-task counts.
  readonly tasksLoading = this.facade.tasksLoading;
  readonly totalTasks = this.facade.totalTasks;
  readonly todoCount = this.facade.todoCount;
  readonly inProgressCount = this.facade.inProgressCount;
  readonly completedCount = this.facade.completedCount;
  readonly overdueCount = this.facade.overdueCount;

  readonly report = this.facade.report;
  readonly reportLoading = this.facade.reportLoading;

  readonly hasTasks = computed(() => this.totalTasks() > 0);
  readonly activeCount = computed(() => this.todoCount() + this.inProgressCount());

  /** Report window — the API requires from/to, so there is always one selected. */
  readonly preset = signal<Preset>('month');

  readonly presets: { value: Preset; label: string }[] = [
    { value: 'week', label: 'This week' },
    { value: 'month', label: 'This month' },
    { value: 'year', label: 'This year' },
  ];

  readonly loadingTiles = [0, 1, 2, 3];

  constructor() {
    this.facade.init();
    this.facade.initTasks();
    this.loadReport();
  }

  selectPreset(preset: Preset): void {
    this.preset.set(preset);
    this.loadReport();
  }

  private loadReport(): void {
    const to = new Date();
    const from = new Date();

    switch (this.preset()) {
      case 'week':
        from.setDate(to.getDate() - 7);
        break;
      case 'year':
        from.setFullYear(to.getFullYear() - 1);
        break;
      default:
        from.setMonth(to.getMonth() - 1);
    }

    this.facade.loadReport(from.toISOString(), to.toISOString());
  }
}
