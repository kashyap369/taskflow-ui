import { Routes } from '@angular/router';
export const MEETINGS_GUEST_ROUTES: Routes = [
  { path: 'join', loadComponent: () => import('./guest-join-page/guest-join-page').then((m) => m.GuestJoinPage) },
  { path: 'guest/room', loadComponent: () => import('./guest-room-page/guest-room-page').then((m) => m.GuestRoomPage) },
  { path: 'guest/archive', loadComponent: () => import('./guest-archive-page/guest-archive-page').then((m) => m.GuestArchivePage) },
];
