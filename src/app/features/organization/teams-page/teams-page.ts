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
  Plus,
  Users,
  X,
} from 'lucide-angular';

import { LottiePlayer } from '@shared/ui/atoms/animations/lottie-player/lottie-player';
import { OrganizationFacade } from '../organization.facade';

@Component({
  selector: 'app-teams-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule, LottiePlayer],
  templateUrl: './teams-page.html',
  styleUrl: './teams-page.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ Plus, X, Users, ArrowRight, Building2 }),
    },
  ],
})
export class TeamsPage {
  private readonly facade = inject(OrganizationFacade);
  private readonly fb = inject(FormBuilder);

  readonly loading = this.facade.loading;
  readonly saving = this.facade.saving;
  readonly teams = this.facade.teams;
  readonly currentOrg = this.facade.currentOrg;
  readonly needsOrganization = this.facade.needsOrganization;

  readonly showCreate = signal(false);
  readonly hasTeams = computed(() => this.teams().length > 0);

  readonly createForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
  });

  constructor() {
    this.facade.init();
  }

  openCreate(): void {
    this.createForm.reset({ name: '', description: '' });
    this.showCreate.set(true);
  }

  closeCreate(): void {
    this.showCreate.set(false);
  }

  submit(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    const { name, description } = this.createForm.getRawValue();
    this.facade.createTeam(name, description);
    this.closeCreate();
  }
}
