/**
 * Development environment (default).
 * Swapped for environment.staging.ts / environment.prod.ts at build time
 * via `fileReplacements` in angular.json.
 */
export const environment = {
  production: false,
  name: 'development',
  api: {
    baseUrl: 'https://localhost:7086/api',
  },
  features: {
    planner: true,
    meetingsProbe: true,
  },
} as const;
