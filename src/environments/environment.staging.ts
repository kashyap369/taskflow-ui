export const environment = {
  production: true,
  name: 'staging',
  api: {
    baseUrl: 'https://api.inksphere.space/api',
  },
  features: {
    planner: true,
    meetingsProbe: false,
  },
} as const;
