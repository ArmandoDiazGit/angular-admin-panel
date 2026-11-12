import { Routes } from '@angular/router';
import { BookingsPageComponent } from '@features/bookings/ui/bookings-page/bookings-page.component';

export const routes: Routes = [
    { path: '', redirectTo: '/admin', pathMatch: 'full' },
    { path: 'admin', component: BookingsPageComponent },
    { path: '**', redirectTo: '/admin' },
];
