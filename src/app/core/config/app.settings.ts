import { environment } from '@env/environment';

/**
 * Strongly-typed application configuration, sourced from the active
 * environment file. Provided app-wide via the APP_SETTINGS token and
 * injected where needed (e.g. ApiService) instead of imported statically.
 */
export const AppSettings = {
  production: environment.production,

  api: {
    baseUrl: environment.api.baseUrl,
  },

  features: {
    planner: Boolean(environment.features.planner),
  },
} as const;
