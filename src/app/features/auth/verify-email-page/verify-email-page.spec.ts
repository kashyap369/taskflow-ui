import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { APP_SETTINGS } from '@core/config/app.tokens';
import { AppSettings } from '@core/config/app.settings';
import { AuthRepository } from '../auth.repository';
import { VerifyEmailPage } from './verify-email-page';

const verifyEmail = jasmine.createSpy('verifyEmail');
const resendVerification = jasmine
  .createSpy('resendVerification')
  .and.returnValue(of({ success: true }));

const repositoryStub = { verifyEmail, resendVerification };

/** Builds the component with a given `?token=` on the URL. */
async function setup(token: string | null): Promise<ComponentFixture<VerifyEmailPage>> {
  TestBed.resetTestingModule();

  await TestBed.configureTestingModule({
    imports: [VerifyEmailPage],
    providers: [
      provideRouter([]),
      provideHttpClient(),
      provideHttpClientTesting(),
      provideToastr(),
      provideAnimations(),
      { provide: APP_SETTINGS, useValue: AppSettings },
      { provide: AuthRepository, useValue: repositoryStub },
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            queryParamMap: convertToParamMap(token ? { token } : {}),
          },
        },
      },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(VerifyEmailPage);
  fixture.detectChanges();
  return fixture;
}

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    verifyEmail.calls.reset();
    resendVerification.calls.reset();
    verifyEmail.and.returnValue(of({ success: true }));
  });

  it('should create', async () => {
    const fixture = await setup(null);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('waits for the user when there is no token, without calling the API', async () => {
    const fixture = await setup(null);

    expect(fixture.componentInstance.state()).toBe('awaiting');
    expect(verifyEmail).not.toHaveBeenCalled();
  });

  it('verifies automatically when the email link carries a token', async () => {
    const fixture = await setup('a-real-token');

    expect(verifyEmail).toHaveBeenCalledWith('a-real-token');
    expect(fixture.componentInstance.state()).toBe('verified');
  });

  it('offers a recovery path when the token is expired or invalid', async () => {
    verifyEmail.and.returnValue(throwError(() => new Error('bad token')));
    const fixture = await setup('an-expired-token');

    expect(fixture.componentInstance.state()).toBe('failed');
  });

  it('validates the resend email through the decorated model', async () => {
    const fixture = await setup(null);
    const component = fixture.componentInstance;

    component.resend();
    expect(resendVerification).not.toHaveBeenCalled();
    expect(component.fieldError('email')).toBe('Enter the email you registered with.');

    component.resendForm.controls.email.setValue('nope');
    expect(component.fieldError('email')).toBe('Enter a valid email address.');

    component.resendForm.controls.email.setValue('solo@taskflow.test');
    component.resend();
    expect(resendVerification).toHaveBeenCalledWith('solo@taskflow.test');
    expect(component.resent()).toBeTrue();
  });
});
