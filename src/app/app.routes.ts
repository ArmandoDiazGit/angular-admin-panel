import { Routes } from '@angular/router';
import { BookingListComponent } from './components/booking-list/booking-list.component';

export const routes: Routes = [
    { path: '', redirectTo: '/admin', pathMatch: 'full' },
    { path: 'admin', component: BookingListComponent },
    { path: '**', redirectTo: '/admin' },
];
