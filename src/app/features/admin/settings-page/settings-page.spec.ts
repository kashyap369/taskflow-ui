import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { AdminRepository } from '../admin.repository';
import { MeetingReadiness, PlatformSettings } from '../admin.models';
import { AdminSettingsPage } from './settings-page';

const SETTINGS: PlatformSettings = {
  id: 1,
  applicationName: 'TaskFlow',
  supportEmail: 'support@taskflow.com',
  registrationOpen: true,
  maintenanceMode: false,
  maintenanceMessage: null,
  createdAt: '2026-07-01T09:00:00Z',
  updatedAt: null,
};

const READY: MeetingReadiness = {
  status: 'Ready',
  meetingsEnabled: true,
  guestsEnabled: true,
  recordingEnabled: false,
  liveKitEnabled: true,
  webSocketScheme: 'wss',
  webSocketHost: 'media.example.com',
  apiKeyConfigured: true,
  apiKeyFingerprint: 'a1b2c3d4',
  apiSecretConfigured: true,
  apiSecretLength: 36,
  recordingStorageConfigured: true,
  joinTokenIssued: true,
  joinTokenFailure: null,
  blockers: [],
  capacity: {
    maxParticipantsPerMeeting: 50,
    maxConcurrentLiveMeetingsPerOrganization: 10,
    maxConcurrentRecordings: 1,
    maxMessagesPerMeeting: 5000,
    maxAssetsPerMeeting: 100,
    maxFileBytes: 26214400,
    maxStorageBytesPerMeeting: 262144000,
  },
};

describe('AdminSettingsPage', () => {
  let component: AdminSettingsPage;
  let fixture: ComponentFixture<AdminSettingsPage>;
  let updateSettings: jasmine.Spy;
  let getMeetingReadiness: jasmine.Spy;

  beforeEach(async () => {
    updateSettings = jasmine.createSpy('updateSettings').and.returnValue(of(void 0));
    getMeetingReadiness = jasmine.createSpy('getMeetingReadiness').and.returnValue(of(READY));

    await TestBed.configureTestingModule({
      imports: [AdminSettingsPage],
      providers: [
        provideToastr(),
        provideAnimations(),
        {
          provide: AdminRepository,
          useValue: { getSettings: () => of(SETTINGS), updateSettings, getMeetingReadiness },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminSettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('fills the form from the settings singleton', () => {
    expect(component.form.getRawValue()).toEqual({
      applicationName: 'TaskFlow',
      supportEmail: 'support@taskflow.com',
      registrationOpen: true,
      maintenanceMode: false,
      maintenanceMessage: '',
    });
    expect(component.form.pristine).toBeTrue();
  });

  it('validates through the decorator engine', () => {
    component.form.controls.applicationName.setValue('');
    component.form.controls.applicationName.markAsTouched();
    expect(component.fieldError('applicationName')).toBe('An application name is required.');

    component.form.controls.supportEmail.setValue('not-an-email');
    component.form.controls.supportEmail.markAsTouched();
    expect(component.fieldError('supportEmail')).toBe('Enter a valid email address.');
  });

  // The API's rule is `.When(not empty)`, and every decorator except @Required passes on empty —
  // so a blank support email must not block the save.
  it('accepts a blank support email', () => {
    component.form.controls.supportEmail.setValue('');
    expect(component.form.valid).toBeTrue();
  });

  // `UpdatePlatformSettingsCommand` takes all five fields, so a partial save would blank what it
  // omitted. Blank optional strings go back as null to match the DTO's nullability.
  it('sends the whole shape, with blank optionals as null', () => {
    component.form.controls.supportEmail.setValue('  ');
    component.form.controls.maintenanceMode.setValue(true);
    component.form.controls.maintenanceMessage.setValue('  Back at 5pm.  ');

    component.save();

    expect(updateSettings).toHaveBeenCalledWith({
      applicationName: 'TaskFlow',
      supportEmail: null,
      registrationOpen: true,
      maintenanceMode: true,
      maintenanceMessage: 'Back at 5pm.',
    });
  });

  it('does not save an invalid form', () => {
    component.form.controls.applicationName.setValue('');

    component.save();

    expect(updateSettings).not.toHaveBeenCalled();
    expect(component.form.controls.applicationName.touched).toBeTrue();
  });

  // The panel exists because a hosting platform can save LiveKit variables without the running
  // service receiving them — the failure that deferred Meetings on 2026-09-02.
  it('reports meetings readiness from the deployed API', () => {
    expect(getMeetingReadiness).toHaveBeenCalled();
    expect(component.readinessMeta().label).toBe('Ready');
    expect(component.readinessSummary()).toContain('room credentials');
  });

  it('names the blockers when the process never received its LiveKit configuration', () => {
    getMeetingReadiness.and.returnValue(
      of({
        ...READY,
        status: 'Disabled' as const,
        liveKitEnabled: false,
        joinTokenIssued: false,
        joinTokenFailure: 'LiveKit is disabled, so token signing was not attempted.',
        blockers: ['LiveKit:Enabled is false in the running process.'],
      }),
    );

    component.refreshReadiness();
    fixture.detectChanges();

    expect(component.readinessMeta().tone).toBe('neutral');
    expect(component.readiness()?.blockers.length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('LiveKit:Enabled is false');
  });

  // Phase 7 / P7.3: the ceilings are enforced server-side, and an operator can only size a
  // deployment or explain a refusal if the running numbers are visible somewhere.
  it('shows the capacity the deployed API declares, in the units an operator reads', () => {
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Declared capacity');
    expect(text).toContain('50');
    expect(text).toContain('25 MB each');
    expect(text).toContain('250 MB total');
    expect(component.megabytes(262144000)).toBe('250 MB');
  });

  it('discards edits back to the loaded values', () => {
    component.form.controls.applicationName.setValue('Something else');
    component.form.controls.maintenanceMode.setValue(true);

    component.reset();

    expect(component.form.controls.applicationName.value).toBe('TaskFlow');
    expect(component.maintenanceOn).toBeFalse();
  });
});
