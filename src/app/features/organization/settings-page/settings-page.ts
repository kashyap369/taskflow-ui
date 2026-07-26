import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Info,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  ShieldAlert,
  Trash2,
  Users,
} from 'lucide-angular';

import { DialogService } from '@core/services/dialog.service';
import { Skeleton } from '@shared/ui/atoms/skeletons/skeleton/skeleton';
import { controlValidators, messageFor } from '@shared/validations';
import { OrganizationSettingsFormModel } from '../organization.form-models';
import { OrganizationFacade } from '../organization.facade';
import { organizationStatusMeta } from '../organization.models';

/**
 * Organization settings — rename the workspace and (for its owner) delete it. The last entity in the
 * portal without an edit/delete surface.
 */
@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LucideAngularModule,
    Skeleton,
  ],
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        Building2,
        Users,
        CalendarDays,
        ShieldAlert,
        Trash2,
        Info,
        ArrowRight,
      }),
    },
  ],
})
export class SettingsPage {
  private readonly facade = inject(OrganizationFacade);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(DialogService);
  private readonly router = inject(Router);

  readonly saving = this.facade.saving;
  readonly currentOrg = this.facade.currentOrg;
  readonly orgDetail = this.facade.orgDetail;
  readonly summary = this.facade.summary;
  readonly needsOrganization = this.facade.needsOrganization;
  readonly isOwner = this.facade.isCurrentOrgOwner;

  readonly organizationStatusMeta = organizationStatusMeta;

  /** The detail hasn't arrived yet — show the loading state rather than an empty form. */
  readonly loadingDetail = computed(() => !this.needsOrganization() && this.orgDetail() === null);

  /** Per-control validators derived from `OrganizationSettingsFormModel`'s decorators. */
  private readonly rules = controlValidators(OrganizationSettingsFormModel);

  readonly form = this.fb.nonNullable.group({
    name: ['', this.rules['name']],
    description: ['', this.rules['description']],
  });

  /** Touched-gated message for a field, straight from the decorator that failed. */
  fieldError(property: string): string | null {
    return messageFor(this.form, property);
  }

  constructor() {
    this.facade.init();

    // The org resolves asynchronously (and can change via the switcher), so load its detail
    // reactively rather than once in the constructor.
    effect(() => {
      const orgId = this.facade.currentOrgId();
      if (orgId != null) {
        this.facade.loadOrgDetail(orgId);
      }
    });

    // Refill the form whenever the detail lands — on first load, on an org switch, and after a save
    // (which re-fetches, so the form settles back to pristine on the server's values).
    effect(() => {
      const org = this.orgDetail();
      if (org) {
        this.form.reset({ name: org.name, description: org.description ?? '' });
      }
    });

    // Only the owner administers the workspace. The API does not enforce this (see docs/SESSIONS) —
    // it's a usability gate, so the form is visibly inert rather than failing on submit.
    effect(() => {
      const owner = this.isOwner();
      if (owner && this.form.disabled) {
        this.form.enable();
      } else if (!owner && this.form.enabled) {
        this.form.disable();
      }
    });
  }

  save(): void {
    const org = this.orgDetail();
    if (!org || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, description } = this.form.getRawValue();
    this.facade.updateOrganization({ organizationId: org.id, name, description });
  }

  /** Discard unsaved edits back to the loaded values. */
  reset(): void {
    const org = this.orgDetail();
    if (org) {
      this.form.reset({ name: org.name, description: org.description ?? '' });
    }
  }

  /**
   * Deleting an organization takes its projects, tasks, teams and members with it, so this is
   * type-to-confirm (the org's name) rather than a one-click confirmation.
   */
  async remove(): Promise<void> {
    const org = this.orgDetail();
    if (!org) {
      return;
    }

    const s = this.summary();
    const consequence = s
      ? `${s.projectCount} project(s), ${s.totalTasks} task(s), ${s.teamCount} team(s) and ${s.memberCount} member(s) will be deleted with it.`
      : 'Everything in this workspace will be deleted with it.';

    const ok = await this.dialog.confirmTyped(
      'Delete organization?',
      `${consequence} This cannot be undone.`,
      org.name,
      'Delete organization',
    );

    if (ok) {
      this.facade.deleteOrganization(org.id, () =>
        this.router.navigate(['/organization/dashboard']),
      );
    }
  }
}
