import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiErrorResponse } from '../api/api-error-response';
import { FailureReason } from '../constants/failure-reasons';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const notification = inject(NotificationService);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // Network/CORS/API Offline
      if (error.status === 0) {
        notification.error('Unable to connect to the server.');

        return throwError(() => error);
      }

      const apiError = error.error as ApiErrorResponse;

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
