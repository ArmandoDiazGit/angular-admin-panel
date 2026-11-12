import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/admin', pathMatch: 'full' },
  {
    path: 'admin',
    loadChildren: () =>
      import('@features/bookings').then((module) => module.BOOKINGS_ROUTES),
  },
  { path: '**', redirectTo: '/admin' },
];
