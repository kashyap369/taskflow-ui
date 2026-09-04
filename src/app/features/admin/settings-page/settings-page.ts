import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  CalendarDays,
  Info,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  Radio,
  Settings,
  ShieldAlert,
  TriangleAlert,
  UserPlus,
} from 'lucide-angular';

import { Skeleton } from '@shared/ui/atoms/skeletons/skeleton/skeleton';
import { controlValidators, messageFor } from '@shared/validations';
import { AdminFacade } from '../admin.facade';
import { MEETING_READINESS_META } from '../admin.models';
import { PlatformSettingsFormModel } from '../admin.form-models';

/**
 * Platform settings — `GET` / `PUT /admin/settings`, the singleton row that governs the whole
 * installation.
 *
 * Neither flag is cosmetic: the API enforces `registrationOpen` in the register handler (403
 * `REGISTRATION_CLOSED`) and `maintenanceMode` in middleware (503 `MAINTENANCE_MODE` for every
 * non-admin request). The copy says so, because turning either one on locks real people out.
 */
@Component({
  selector: 'app-admin-settings-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, Skeleton],
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        Settings,
        UserPlus,
        TriangleAlert,
        ShieldAlert,
        Info,
        CalendarDays,
        Radio,
      }),
    },
  ],
})
export class AdminSettingsPage {
  private readonly facade = inject(AdminFacade);
  private readonly fb = inject(FormBuilder);

  readonly settings = this.facade.settings;
  readonly loading = this.facade.settingsLoading;
  readonly saving = this.facade.settingsSaving;

  readonly readiness = this.facade.meetingReadiness;
  readonly readinessLoading = this.facade.meetingReadinessLoading;

  /** Label + tone for the status pill; falls back to the neutral "Disabled" styling. */
  readonly readinessMeta = computed(
    () => MEETING_READINESS_META[this.readiness()?.status ?? 'Disabled'],
  );

  /** One sentence saying what the status means for a member trying to join right now. */
  readonly readinessSummary = computed(() => {
    const readiness = this.readiness();
    if (!readiness) return '';
    if (readiness.status === 'Ready') return 'Members can be issued room credentials.';
    if (readiness.status === 'Disabled') return 'Meetings are switched off for this deployment.';
    return 'Meetings are switched on but cannot serve a room.';
  });

  /** Nothing has arrived yet — show the form-shaped skeleton rather than an empty form. */
  readonly loadingSettings = computed(() => this.settings() === null);

  /** Per-control validators derived from `PlatformSettingsFormModel`'s decorators. */
  private readonly rules = controlValidators(PlatformSettingsFormModel);

  readonly form = this.fb.nonNullable.group({
    applicationName: ['', this.rules['applicationName']],
    supportEmail: ['', this.rules['supportEmail']],
    registrationOpen: [true],
    maintenanceMode: [false],
    maintenanceMessage: ['', this.rules['maintenanceMessage']],
  });

  /**
   * Live toggle values, so the template can warn about the consequence *before* the save lands.
   * Plain getters rather than signals — a reactive form isn't signal-backed, and change detection
   * already runs on every control event.
   */
  get maintenanceOn(): boolean {
    return this.form.controls.maintenanceMode.value;
  }

  get registrationClosed(): boolean {
    return !this.form.controls.registrationOpen.value;
  }

  /** Touched-gated message for a field, straight from the decorator that failed. */
  fieldError(property: string): string | null {
    return messageFor(this.form, property);
  }

  constructor() {
    this.facade.loadSettings();
    this.facade.loadMeetingReadiness();

    // Refill whenever the singleton lands — on first load and after a save (which re-fetches, so
    // the form settles back to pristine on the server's values).
    effect(() => {
      const settings = this.settings();
      if (settings) {
        this.form.reset({
          applicationName: settings.applicationName,
          supportEmail: settings.supportEmail ?? '',
          registrationOpen: settings.registrationOpen,
          maintenanceMode: settings.maintenanceMode,
          maintenanceMessage: settings.maintenanceMessage ?? '',
        });
      }
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    // The command takes all five fields, so send the whole shape — a partial save would blank
    // whatever it omitted. Blank optional strings go back as null, matching the DTO's nullability.
    this.facade.updateSettings({
      applicationName: value.applicationName.trim(),
      supportEmail: value.supportEmail.trim() || null,
      registrationOpen: value.registrationOpen,
      maintenanceMode: value.maintenanceMode,
      maintenanceMessage: value.maintenanceMessage.trim() || null,
    });
  }

  /** Re-read readiness after an operator changes deployment variables and restarts the API. */
  refreshReadiness(): void {
    this.facade.loadMeetingReadiness();
  }

  /** Discard unsaved edits back to the loaded values. */
  reset(): void {
    const settings = this.settings();
    if (settings) {
      this.form.reset({
        applicationName: settings.applicationName,
        supportEmail: settings.supportEmail ?? '',
        registrationOpen: settings.registrationOpen,
        maintenanceMode: settings.maintenanceMode,
        maintenanceMessage: settings.maintenanceMessage ?? '',
      });
    }
  }
}
