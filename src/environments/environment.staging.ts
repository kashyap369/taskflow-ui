export const environment = {
  production: true,
  name: 'staging',
  api: {
    baseUrl: 'https://api.inksphere.space/api',
  },
  // Street map under the attendance routes. OpenStreetMap's own tiles are free for light use
  // (their tile policy); swap in a keyed provider (MapTiler, Stadia) before heavy use.
  maps: {
    tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  features: {
    planner: true,
    meetingsProbe: false,
  },
} as const;
