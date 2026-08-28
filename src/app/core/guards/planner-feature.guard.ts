import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

import { APP_SETTINGS } from '@core/config/app.tokens';

export const plannerFeatureGuard = (fallback: string): CanMatchFn => {
  return () => {
    const settings = inject(APP_SETTINGS);
    return settings.features.planner ? true : inject(Router).parseUrl(fallback);
  };
};
