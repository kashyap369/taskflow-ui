import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';

import { APP_SETTINGS } from '@core/config/app.tokens';
import { AppSettings } from '@core/config/app.settings';
import { LoginPage } from './login-page';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideToastr(),
        provideAnimations(),
        { provide: APP_SETTINGS, useValue: AppSettings },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts invalid and surfaces the decorated model messages once touched', () => {
    expect(component.loginForm.invalid).toBeTrue();

    // Untouched fields stay quiet.
    expect(component.fieldError('email')).toBeNull();

    component.loginForm.controls.email.markAsTouched();
    component.loginForm.controls.password.markAsTouched();

    expect(component.fieldError('email')).toBe('Email is required.');
    expect(component.fieldError('password')).toBe('Password is required.');
  });

  it('rejects a malformed email with the @Email message', () => {
    const email = component.loginForm.controls.email;
    email.setValue('not-an-email');
    email.markAsTouched();

    expect(component.fieldError('email')).toBe('Enter a valid email address.');

    email.setValue('nadia.owens@taskflow.test');
    expect(component.fieldError('email')).toBeNull();
  });

  it('becomes valid with both credentials filled', () => {
    component.loginForm.setValue({
      email: 'nadia.owens@taskflow.test',
      password: 'Passw0rd!',
      rememberMe: true,
    });

    expect(component.loginForm.valid).toBeTrue();
  });
});
