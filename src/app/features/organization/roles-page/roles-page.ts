import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ArrowRight,
  Building2,
  Check,
  KeyRound,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  Plus,
  ShieldCheck,
  X,
} from 'lucide-angular';

import { LottiePlayer } from '@shared/ui/atoms/animations/lottie-player/lottie-player';
import { OrganizationFacade } from '../organization.facade';

@Component({
  selector: 'app-roles-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule, LottiePlayer],
  templateUrl: './roles-page.html',
  styleUrl: './roles-page.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        Plus,
        X,
        ShieldCheck,
        KeyRound,
        Check,
        ArrowRight,
        Building2,
      }),
    },
  ],
})
export class RolesPage {
  private readonly facade = inject(OrganizationFacade);
  private readonly fb = inject(FormBuilder);

  readonly loading = this.facade.loading;
  readonly saving = this.facade.saving;
  readonly roles = this.facade.roles;
  readonly catalog = this.facade.permissionCatalog;
  readonly selectedRole = this.facade.selectedRole;
  readonly currentOrg = this.facade.currentOrg;
  readonly needsOrganization = this.facade.needsOrganization;

  readonly showCreate = signal(false);
  readonly hasRoles = computed(() => this.roles().length > 0);

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
    this.facade.createRole(name, description);
    this.closeCreate();
  }

  manage(roleId: number): void {
    this.facade.selectRole(roleId);
  }

  closeManage(): void {
    this.facade.clearSelectedRole();
  }

  hasPermission(name: string): boolean {
    return this.selectedRole()?.permissions.includes(name) ?? false;
  }

  togglePermission(permissionName: string, event: Event): void {
    const role = this.selectedRole();
    if (!role) {
      return;
    }
    const grant = (event.target as HTMLInputElement).checked;
    this.facade.togglePermission(role.id, permissionName, grant);
  }
}
