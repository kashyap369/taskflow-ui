import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';

import { APP_SETTINGS } from '@core/config/app.tokens';
import { AppSettings } from '@core/config/app.settings';
import { RegisterPage } from './register-page';

describe('RegisterPage', () => {
  let component: RegisterPage;
  let fixture: ComponentFixture<RegisterPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideToastr(),
        provideAnimations(),
        { provide: APP_SETTINGS, useValue: AppSettings },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts invalid and reports required fields via the validation engine', () => {
    expect(component.registerForm.invalid).toBe(true);
    component.registerForm.controls.firstName.markAsTouched();
    expect(component.fieldError('firstName')).toBe('First name is required.');
  });

  it('surfaces the cross-field password-mismatch message on confirmPassword', () => {
    component.registerForm.patchValue({ password: 'Passw0rd', confirmPassword: 'Nope1234' });
    component.registerForm.controls.confirmPassword.markAsTouched();
    expect(component.fieldError('confirmPassword')).toBe("Passwords don't match.");
  });

  it('becomes valid once every rule passes', () => {
    component.registerForm.setValue({
      accountType: component.AccountType.Individual,
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      phoneNumber: '1234567890',
      password: 'Passw0rd',
      confirmPassword: 'Passw0rd',
      acceptTerms: true,
    });
    expect(component.registerForm.valid).toBe(true);
  });
});
