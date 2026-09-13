import { Injectable, inject } from '@angular/core';
import { catchError, of } from 'rxjs';

import { ApiService } from '@core/api/api.service';
import { API } from '@core/api/api-endpoints';
import { AuthService } from '@core/auth/auth.service';

/**
 * Records, on the server, that this account has been through the
 * first-run welcome.
 *
 * The flag lives on the user row rather than in `localStorage` because
 * the welcome is a promise about the account: clearing site data, using
 * a private window or signing in from a second machine must not replay
 * it. `GuidanceProgressService` still keeps a local copy, but only as
 * the fast path that stops a replay inside the current session — this
 * call is what makes it stick.
 *
 * Failure is deliberately silent. Missing the write means one extra
 * welcome on some future sign-in, which is not worth a toast over the
 * dashboard of someone who has just arrived.
 */
@Injectable({ providedIn: 'root' })
export class OnboardingRepository {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  /** Idempotent on the server, so calling it twice costs nothing. */
  complete(): void {
    // Flip the principal first: the welcome must not re-arm on the next
    // route change while this request is still in flight.
    this.auth.markOnboardingComplete();

    this.api
      .post<void>(API.User.CompleteOnboarding, {})
      .pipe(catchError(() => of(void 0)))
      .subscribe();
  }
}
