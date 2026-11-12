import { Routes } from '@angular/router';

import { BookingsStore } from './data/bookings-store';

export const BOOKINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ui/bookings-page/bookings-page.component').then(
        (module) => module.BookingsPageComponent,
      ),
    providers: [BookingsStore],
  },
];
