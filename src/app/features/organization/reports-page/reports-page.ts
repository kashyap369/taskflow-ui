import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CircleCheckBig,
  Clock,
  FolderKanban,
  LUCIDE_ICONS,
  ListChecks,
  LucideAngularModule,
  LucideIconProvider,
  TriangleAlert,
  Users,
} from 'lucide-angular';

import { LottiePlayer } from '@shared/ui/atoms/animations/lottie-player/lottie-player';
import { OrganizationFacade } from '../organization.facade';

type Preset = 'week' | 'month' | 'year' | 'all';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LucideAngularModule,
    NgxEchartsDirective,
    LottiePlayer,
  ],
  templateUrl: './reports-page.html',
  styleUrl: './reports-page.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        CalendarDays,
        Users,
        FolderKanban,
        CircleCheckBig,
        TriangleAlert,
        Clock,
        ListChecks,
        ArrowRight,
        Building2,
      }),
    },
  ],
})
export class ReportsPage {
  private readonly facade = inject(OrganizationFacade);

  readonly needsOrganization = this.facade.needsOrganization;
  readonly currentOrg = this.facade.currentOrg;
  readonly reportLoading = this.facade.reportLoading;
  readonly teamReport = this.facade.teamReport;
  readonly memberReport = this.facade.memberReport;
  readonly projectReport = this.facade.projectReport;
  readonly members = this.facade.members;
  readonly projects = this.facade.projects;

  readonly activePreset = signal<Preset>('month');
  readonly from = signal(this.startOfMonth());
  readonly to = signal(this.today());
  readonly selectedMemberId = signal<number | null>(null);
  readonly selectedProjectId = signal<number | null>(null);

  readonly hasTeamData = computed(() => this.teamReport().length > 0);

  /** Grouped bar: assigned vs completed tasks per team. */
  readonly teamChartOption = computed<EChartsOption>(() => {
    const data = this.teamReport();
    return {
      tooltip: { trigger: 'axis' },
      legend: { data: ['Assigned', 'Completed'], bottom: 0 },
      grid: { left: 8, right: 16, top: 16, bottom: 40, containLabel: true },
      xAxis: { type: 'category', data: data.map((t) => t.teamName), axisTick: { show: false } },
      yAxis: { type: 'value', minInterval: 1 },
      series: [
        {
          name: 'Assigned',
          type: 'bar',
          data: data.map((t) => t.tasksAssigned),
          itemStyle: { color: '#c7d2fe', borderRadius: [6, 6, 0, 0] },
          barMaxWidth: 26,
        },
        {
          name: 'Completed',
          type: 'bar',
          data: data.map((t) => t.tasksCompleted),
          itemStyle: { color: '#4f6df5', borderRadius: [6, 6, 0, 0] },
          barMaxWidth: 26,
        },
      ],
    };
  });

  constructor() {
    this.facade.init();

    // Team report reloads when the org resolves or the window changes.
    effect(() => {
      const orgId = this.facade.currentOrgId();
      const from = this.from();
      const to = this.to();
      if (orgId != null) {
        this.facade.loadTeamReport(this.toIsoStart(from), this.toIsoEnd(to));
      }
    });

    // Member report reloads when a member is selected or the window changes.
    effect(() => {
      const orgId = this.facade.currentOrgId();
      const userId = this.selectedMemberId();
      const from = this.from();
      const to = this.to();
      if (orgId != null && userId != null) {
        this.facade.loadMemberReport(userId, this.toIsoStart(from), this.toIsoEnd(to));
      }
    });
  }

  applyPreset(preset: Preset): void {
    this.activePreset.set(preset);
    const today = new Date();
    let start: Date;
    switch (preset) {
      case 'week': {
        start = new Date(today);
        start.setDate(today.getDate() - 6);
        break;
      }
      case 'year':
        start = new Date(today.getFullYear(), 0, 1);
        break;
      case 'all':
        start = new Date(2000, 0, 1);
        break;
      case 'month':
      default:
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
    }
    this.from.set(this.fmt(start));
    this.to.set(this.fmt(today));
  }

  onFromChange(value: string): void {
    this.activePreset.set('all');
    this.from.set(value);
  }

  onToChange(value: string): void {
    this.activePreset.set('all');
    this.to.set(value);
  }

  onMemberChange(value: string): void {
    const id = value ? Number(value) : null;
    this.selectedMemberId.set(id);
    if (id == null) {
      this.facade.clearMemberReport();
    }
  }

  onProjectChange(value: string): void {
    const id = value ? Number(value) : null;
    this.selectedProjectId.set(id);
    if (id == null) {
      this.facade.clearProjectReport();
    } else {
      this.facade.loadProjectReport(id);
    }
  }

  // ── date helpers ──
  private today(): string {
    return this.fmt(new Date());
  }
  private startOfMonth(): string {
    const d = new Date();
    return this.fmt(new Date(d.getFullYear(), d.getMonth(), 1));
  }
  private fmt(d: Date): string {
    return d.toISOString().slice(0, 10);
  }
  private toIsoStart(date: string): string {
    return new Date(`${date}T00:00:00Z`).toISOString();
  }
  private toIsoEnd(date: string): string {
    return new Date(`${date}T23:59:59Z`).toISOString();
  }
}
