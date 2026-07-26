import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ArrowRight,
  Building2,
  Check,
  KeyRound,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-angular';

import { DialogService } from '@core/services/dialog.service';
import { DialogDirective } from '@shared/directives/dialog.directive';
import { LottiePlayer } from '@shared/ui/atoms/animations/lottie-player/lottie-player';
import { Skeleton } from '@shared/ui/atoms/skeletons/skeleton/skeleton';
import { Pagination } from '@shared/ui/molecules/pagination/pagination';
import { createPagination } from '@shared/utils/pagination';
import { controlValidators, messageFor } from '@shared/validations';
import { RoleFormModel } from '../organization.form-models';
import { OrganizationRole } from '../organization.models';
import { OrganizationFacade } from '../organization.facade';

@Component({
  selector: 'app-roles-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LucideAngularModule,
    LottiePlayer,
    DialogDirective,
    Skeleton,
    Pagination,
  ],
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
        Pencil,
        Trash2,
        Search,
      }),
    },
  ],
})
export class RolesPage {
  private readonly facade = inject(OrganizationFacade);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(DialogService);

  readonly loading = this.facade.loading;
  readonly saving = this.facade.saving;
  readonly roles = this.facade.roles;
  readonly catalog = this.facade.permissionCatalog;
  readonly selectedRole = this.facade.selectedRole;
  readonly currentOrg = this.facade.currentOrg;
  readonly needsOrganization = this.facade.needsOrganization;

  /** One drawer serves create and edit; `editing` holds the role being edited (null = create). */
  readonly showDrawer = signal(false);
  readonly editing = signal<OrganizationRole | null>(null);
  readonly isEditing = computed(() => this.editing() !== null);

  readonly hasRoles = computed(() => this.roles().length > 0);

  /** Placeholder cards rendered while roles load. */
  readonly loadingCards = [0, 1, 2, 3, 4, 5];

  // ── Filters + paging (client-side: the API returns the whole org list) ──
  readonly search = signal('');

  readonly filteredRoles = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) return this.roles();
    return this.roles().filter(
      (r) =>
        r.name.toLowerCase().includes(term) || (r.description ?? '').toLowerCase().includes(term),
    );
  });

  readonly pager = createPagination(this.filteredRoles, { pageSize: 9, pageSizes: [9, 18, 36] });

  /** Per-control validators derived from `RoleFormModel`'s decorators. */
  private readonly rules = controlValidators(RoleFormModel);

  readonly createForm = this.fb.nonNullable.group({
    name: ['', this.rules['name']],
    description: ['', this.rules['description']],
  });

  /** Touched-gated message for a field, straight from the decorator that failed. */
  fieldError(property: string): string | null {
    return messageFor(this.createForm, property);
  }

  constructor() {
    this.facade.init();
  }

  // ── Filters ──

  onSearch(value: string): void {
    this.search.set(value);
  }

  clearFilters(): void {
    this.search.set('');
  }

  openCreate(): void {
    this.editing.set(null);
    this.createForm.reset({ name: '', description: '' });
    this.showDrawer.set(true);
  }

  openEdit(role: OrganizationRole): void {
    this.editing.set(role);
    this.createForm.reset({ name: role.name, description: role.description ?? '' });
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
      this.facade.updateRole({ roleId: editing.id, name, description });
    } else {
      this.facade.createRole(name, description);
    }
    this.closeDrawer();
  }

  async remove(role: OrganizationRole): Promise<void> {
    const ok = await this.dialog.confirmDelete(
      'Delete role?',
      `"${role.name}" and its granted permissions will be deleted. Members on this role will need a new one.`,
      'Delete role',
    );
    if (ok) {
      this.facade.deleteRole(role.id);
    }
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
