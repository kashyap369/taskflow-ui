import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';

import { tap } from 'rxjs/operators';

import { APP_SETTINGS } from '../config/app.tokens';

/**
 * Logging middleware — mirrors a backend LoggingMiddleware.
 * Logs each request's method, URL, status and duration. Silent in production.
 */
export const loggingInterceptor: HttpInterceptorFn = (request, next) => {
  const settings = inject(APP_SETTINGS);

  if (settings.production) {
    return next(request);
  }

  const startedAt = performance.now();

  return next(request).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          const ms = Math.round(performance.now() - startedAt);
          console.debug(`[HTTP] ${request.method} ${request.urlWithParams} → ${event.status} (${ms}ms)`);
        }
      },
      error: (error: unknown) => {
        const ms = Math.round(performance.now() - startedAt);
        console.debug(`[HTTP] ${request.method} ${request.urlWithParams} → ERROR (${ms}ms)`, error);
      },
    }),
  );
};
