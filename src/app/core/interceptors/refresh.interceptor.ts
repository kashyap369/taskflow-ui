import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';

import { API } from '../api/api-endpoints';
import { ApiService } from '../api/api.service';
import { ApiResponse } from '../api/api-response';
import { TokenService } from '../auth/token.service';

/**
 * Transparent access-token refresh.
 *
 * On a `401` from a protected endpoint we call `POST /auth/refresh` with the stored refresh token,
 * swap in the rotated tokens, and retry the original request once. Concurrent requests that 401 while
 * a refresh is already in flight are **queued** (single-flight) and replayed with the new token once it
 * arrives, so we never fire multiple refreshes. If the refresh itself fails (expired / reused token),
 * we clear the session and bounce to the login screen.
 *
 * Placed LAST in the interceptor chain (innermost) so it sees the raw 401 before the error interceptor
 * would toast it — a successfully refreshed request never surfaces an error.
 */

/** Refresh is in progress across all requests. */
let isRefreshing = false;

/** Emits the freshly rotated access token when a refresh completes (null = pending / failed). */
const refreshedToken$ = new BehaviorSubject<string | null>(null);

/** Endpoints where a 401 must NOT trigger a refresh (auth flows own their own errors). */
const SKIP_URLS: readonly string[] = [
  API.Auth.Login,
  API.Auth.Register,
  API.Auth.Refresh,
  API.Auth.Logout,
];

/** The refresh response reuses the login DTO shape (token + refreshToken). */
interface RefreshResult {
  token: string;
  refreshToken: string;
}

function withBearer(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

export const refreshInterceptor: HttpInterceptorFn = (request, next) => {
  const tokens = inject(TokenService);
  const api = inject(ApiService);
  const router = inject(Router);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthEndpoint = SKIP_URLS.some((url) => request.url.includes(url));
      const refreshToken = tokens.getRefreshToken();

      // Only intercept genuine token-expiry 401s on protected endpoints.
      if (error.status !== 401 || isAuthEndpoint || !refreshToken) {
        return throwError(() => error);
      }

      // A refresh is already running — wait for it, then replay with the new token.
      if (isRefreshing) {
        return refreshedToken$.pipe(
          filter((token): token is string => token !== null),
          take(1),
          switchMap((token) => next(withBearer(request, token))),
        );
      }

      // Kick off the single-flight refresh.
      isRefreshing = true;
      refreshedToken$.next(null);

      return api
        .post<ApiResponse<RefreshResult>>(API.Auth.Refresh, { refreshToken })
        .pipe(
          switchMap((response) => {
            const { token, refreshToken: rotated } = response.data;
            tokens.updateTokens(token, rotated);

            isRefreshing = false;
            refreshedToken$.next(token);

            return next(withBearer(request, token));
          }),
          catchError((refreshError) => {
            isRefreshing = false;
            refreshedToken$.next(null);

            // Refresh token invalid / reused / expired → hard logout.
            tokens.clearSession();
            void router.navigate(['/auth/login']);

            return throwError(() => refreshError);
          }),
        );
    }),
  );
};
