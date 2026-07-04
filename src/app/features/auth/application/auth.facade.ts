import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { AuthService } from '@core/auth/auth.service';

import { AuthRepository } from '../data/auth.repository';
import { toUser } from '../data/dto/auth.mapper';
import { LoginRequest } from '../data/dto/login-request';

/**
 * Application layer for auth. Orchestrates the login use-case:
 *   repository (HTTP) -> AuthService (session state) -> navigation.
 * Presentation talks ONLY to this facade.
 */
@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly repository = inject(AuthRepository);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private readonly _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  login(request: LoginRequest, remember = false): void {
    this._loading.set(true);

    this.repository
      .login(request)
      .pipe(finalize(() => this._loading.set(false)))
      .subscribe({
        next: (response) => {
          this.auth.startSession(toUser(response.data), response.data.token, remember);
          void this.router.navigate(['/organization']);
        },
      });
  }

  logout(): void {
    this.auth.endSession();
    void this.router.navigate(['/auth/login']);
  }
}
