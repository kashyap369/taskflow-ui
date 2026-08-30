export const environment = {
  production: true,
  name: 'production',
  api: {
    baseUrl: 'https://api.inksphere.space/api',
  },
  features: {
    planner: true,
    meetingsProbe: false,
  },
} as const;
