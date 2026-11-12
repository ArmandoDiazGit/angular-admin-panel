import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Booking } from '../../model/booking';
import { BookingRowComponent, StatusChange } from '../booking-row/booking-row.component';

@Component({
  selector: 'app-bookings-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BookingRowComponent],
  template: `
    <div class="table-container">
      <table class="bookings-table">
        <caption class="sr-only">Bookings</caption>
        <thead>
          <tr>
            <th scope="col">Customer</th>
            <th scope="col">Service</th>
            <th scope="col">Appointment</th>
            <th scope="col">Contact</th>
            <th scope="col">Status</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (booking of bookings(); track booking.id) {
            <tr
              app-booking-row
              [booking]="booking"
              (statusChange)="statusChange.emit($event)"
              (delete)="delete.emit($event)"
            ></tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styleUrl: './bookings-table.component.scss',
})
export class BookingsTableComponent {
  readonly bookings = input.required<Booking[]>();

  readonly statusChange = output<StatusChange>();
  readonly delete = output<Booking>();
}
