import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  ArrowLeft,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  Mail,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-angular';

import { LottiePlayer } from '@shared/ui/atoms/animations/lottie-player/lottie-player';
import { OrganizationMember, TeamMember } from '../organization.models';
import { OrganizationFacade } from '../organization.facade';

@Component({
  selector: 'app-team-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, LottiePlayer],
  templateUrl: './team-detail-page.html',
  styleUrl: './team-detail-page.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ ArrowLeft, Users, UserPlus, Trash2, Mail, X }),
    },
  ],
})
export class TeamDetailPage {
  private readonly facade = inject(OrganizationFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = this.facade.loading;
  readonly saving = this.facade.saving;
  readonly team = this.facade.teamDetail;
  private readonly members = this.facade.members;

  private readonly teamId = Number(this.route.snapshot.paramMap.get('id'));

  readonly showAdd = signal(false);

  readonly hasMembers = computed(() => (this.team()?.members.length ?? 0) > 0);

  /** Active org members not already on this team — the add-member picker. */
  readonly availableMembers = computed<OrganizationMember[]>(() => {
    const onTeam = new Set(this.team()?.members.map((m) => m.userId) ?? []);
    return this.members().filter((m) => m.isActive && !onTeam.has(m.userId));
  });

  constructor() {
    this.facade.init();
    this.facade.loadTeamDetail(this.teamId);
    this.destroyRef.onDestroy(() => this.facade.clearTeamDetail());
  }

  openAdd(): void {
    this.showAdd.set(true);
  }

  closeAdd(): void {
    this.showAdd.set(false);
  }

  add(member: OrganizationMember): void {
    this.facade.addTeamMember(member.userId);
    this.closeAdd();
  }

  remove(member: TeamMember): void {
    this.facade.removeTeamMember(member.userId);
  }

  initials(fullName: string): string {
    return fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');
  }
}
