import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';

import { APP_SETTINGS } from '@core/config/app.tokens';
import { AppSettings } from '@core/config/app.settings';
import { ForgotPasswordPage } from './forgot-password-page';

describe('ForgotPasswordPage', () => {
  let component: ForgotPasswordPage;
  let fixture: ComponentFixture<ForgotPasswordPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotPasswordPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        provideToastr(),
        { provide: APP_SETTINGS, useValue: AppSettings },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('validates the recovery email before requesting a code', () => {
    const email = component.form.controls.email;
    email.markAsTouched();
    expect(component.fieldError('email')).toBe('Email is required.');

    email.setValue('not-an-email');
    expect(component.fieldError('email')).toBe('Enter a valid email address.');
  });

  it('requires a six-digit code and matching strong passwords', () => {
    component.form.setValue({
      email: 'person@taskflow.test',
      code: '12345',
      newPassword: 'Secure123',
      confirmPassword: 'Different123',
    });
    component.form.markAllAsTouched();

    expect(component.fieldError('code')).toBe('Code must contain exactly 6 digits.');
    expect(component.fieldError('confirmPassword')).toBe("Passwords don't match.");
  });
});
