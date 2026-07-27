import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';

import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { ApiErrorResponse } from '../api/api-error-response';
import { FailureReason } from '../constants/failure-reasons';
import { MaintenanceService } from '../services/maintenance.service';
import { NotificationService } from '../services/notification.service';

/** `PlatformSettings.MaintenanceMode` is on — see `MaintenanceModeMiddleware` on the API. */
const MAINTENANCE_CODE = 'MAINTENANCE_MODE';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const notification = inject(NotificationService);
  const maintenance = inject(MaintenanceService);

  return next(request).pipe(
    // Any answered request means the platform is reachable again.
    tap((event) => {
      if (event instanceof HttpResponse) {
        maintenance.clear();
      }
    }),
    catchError((error: HttpErrorResponse) => {
      // Network/CORS/API Offline
      if (error.status === 0) {
        notification.error('Unable to connect to the server.');

        return throwError(() => error);
      }

      const apiError = error.error as ApiErrorResponse;

      // Maintenance mode fails *every* non-admin request, so a toast per request would be a storm
      // and would scroll away the one thing the user needs to read. Record it instead — the app
      // root renders a persistent banner off this state.
      if (error.status === 503 && apiError?.code === MAINTENANCE_CODE) {
        maintenance.enter(apiError.message || 'The platform is temporarily unavailable.');

        return throwError(() => error);
      }

      const handlers: Record<string, () => void> = {
        [FailureReason.ValidationFailure]: () => notification.warning(apiError.message),

        [FailureReason.Unauthorized]: () => notification.error(apiError.message),

        [FailureReason.Forbidden]: () => notification.error(apiError.message),

        [FailureReason.Conflict]: () => notification.warning(apiError.message),

        [FailureReason.NotFound]: () => notification.warning(apiError.message),

        [FailureReason.BusinessRuleViolation]: () => notification.warning(apiError.message),

        [FailureReason.InternalServerError]: () => notification.error(apiError.message),
      };

      const handler = handlers[apiError.failureReason];

      if (handler) {
        handler();
      } else {
        notification.error(apiError.message || 'Unexpected error occurred.');
      }

      return throwError(() => error);
    }),
  );
};
