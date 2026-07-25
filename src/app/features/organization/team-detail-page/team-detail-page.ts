import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ArrowLeft,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  Mail,
  Pencil,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-angular';

import { DialogService } from '@core/services/dialog.service';
import { DialogDirective } from '@shared/directives/dialog.directive';
import { LottiePlayer } from '@shared/ui/atoms/animations/lottie-player/lottie-player';
import { OrganizationMember, TeamMember } from '../organization.models';
import { OrganizationFacade } from '../organization.facade';

@Component({
  selector: 'app-team-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LucideAngularModule,
    LottiePlayer,
    DialogDirective,
  ],
  templateUrl: './team-detail-page.html',
  styleUrl: './team-detail-page.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ ArrowLeft, Users, UserPlus, Trash2, Mail, X, Pencil }),
    },
  ],
})
export class TeamDetailPage {
  private readonly facade = inject(OrganizationFacade);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(DialogService);

  readonly loading = this.facade.loading;
  readonly saving = this.facade.saving;
  readonly team = this.facade.teamDetail;
  private readonly members = this.facade.members;

  private readonly teamId = Number(this.route.snapshot.paramMap.get('id'));

  readonly showAdd = signal(false);
  readonly showEdit = signal(false);

  readonly editForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
  });

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

  // ── The team itself ──

  openEdit(): void {
    const team = this.team();
    if (!team) {
      return;
    }
    this.editForm.reset({ name: team.name, description: team.description ?? '' });
    this.showEdit.set(true);
  }

  closeEdit(): void {
    this.showEdit.set(false);
  }

  submitEdit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    const { name, description } = this.editForm.getRawValue();
    this.facade.updateTeam({ teamId: this.teamId, name, description });
    this.closeEdit();
  }

  async removeTeam(): Promise<void> {
    const team = this.team();
    if (!team) {
      return;
    }
    const ok = await this.dialog.confirmDelete(
      'Delete team?',
      `"${team.name}" will be deleted. Its ${team.members.length} member(s) stay in the organization.`,
      'Delete team',
    );
    if (ok) {
      this.facade.deleteTeam(team.id, () => this.router.navigate(['/organization/teams']));
    }
  }

  async remove(member: TeamMember): Promise<void> {
    const ok = await this.dialog.confirmDelete(
      'Remove from team?',
      `${member.fullName} will be removed from ${this.team()?.name ?? 'this team'}.`,
      'Remove',
    );
    if (ok) {
      this.facade.removeTeamMember(member.userId);
    }
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
