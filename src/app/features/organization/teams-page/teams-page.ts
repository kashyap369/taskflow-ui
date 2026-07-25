import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ArrowRight,
  Building2,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  Pencil,
  Plus,
  Trash2,
  Users,
  X,
} from 'lucide-angular';

import { DialogService } from '@core/services/dialog.service';
import { DialogDirective } from '@shared/directives/dialog.directive';
import { LottiePlayer } from '@shared/ui/atoms/animations/lottie-player/lottie-player';
import { Team } from '../organization.models';
import { OrganizationFacade } from '../organization.facade';

@Component({
  selector: 'app-teams-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule, LottiePlayer, DialogDirective],
  templateUrl: './teams-page.html',
  styleUrl: './teams-page.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ Plus, X, Users, ArrowRight, Building2, Pencil, Trash2 }),
    },
  ],
})
export class TeamsPage {
  private readonly facade = inject(OrganizationFacade);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(DialogService);

  readonly loading = this.facade.loading;
  readonly saving = this.facade.saving;
  readonly teams = this.facade.teams;
  readonly currentOrg = this.facade.currentOrg;
  readonly needsOrganization = this.facade.needsOrganization;

  /** One drawer serves create and edit; `editing` holds the team being edited (null = create). */
  readonly showDrawer = signal(false);
  readonly editing = signal<Team | null>(null);
  readonly isEditing = computed(() => this.editing() !== null);

  readonly hasTeams = computed(() => this.teams().length > 0);

  readonly createForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
  });

  constructor() {
    this.facade.init();
  }

  openCreate(): void {
    this.editing.set(null);
    this.createForm.reset({ name: '', description: '' });
    this.showDrawer.set(true);
  }

  openEdit(team: Team): void {
    this.editing.set(team);
    this.createForm.reset({ name: team.name, description: team.description ?? '' });
    this.showDrawer.set(true);
  }

  closeDrawer(): void {
    this.showDrawer.set(false);
    this.editing.set(null);
  }

  submit(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    const { name, description } = this.createForm.getRawValue();
    const editing = this.editing();

    if (editing) {
      this.facade.updateTeam({ teamId: editing.id, name, description });
    } else {
      this.facade.createTeam(name, description);
    }
    this.closeDrawer();
  }

  async remove(team: Team): Promise<void> {
    const ok = await this.dialog.confirmDelete(
      'Delete team?',
      `"${team.name}" will be deleted. Its ${team.memberCount} member(s) stay in the organization.`,
      'Delete team',
    );
    if (ok) {
      this.facade.deleteTeam(team.id);
    }
  }
}
