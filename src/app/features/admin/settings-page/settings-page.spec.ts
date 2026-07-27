import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { AdminRepository } from '../admin.repository';
import { PlatformSettings } from '../admin.models';
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

describe('AdminSettingsPage', () => {
  let component: AdminSettingsPage;
  let fixture: ComponentFixture<AdminSettingsPage>;
  let updateSettings: jasmine.Spy;

  beforeEach(async () => {
    updateSettings = jasmine.createSpy('updateSettings').and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [AdminSettingsPage],
      providers: [
        provideToastr(),
        provideAnimations(),
        {
          provide: AdminRepository,
          useValue: { getSettings: () => of(SETTINGS), updateSettings },
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

  it('discards edits back to the loaded values', () => {
    component.form.controls.applicationName.setValue('Something else');
    component.form.controls.maintenanceMode.setValue(true);

    component.reset();

    expect(component.form.controls.applicationName.value).toBe('TaskFlow');
    expect(component.maintenanceOn).toBeFalse();
  });
});
