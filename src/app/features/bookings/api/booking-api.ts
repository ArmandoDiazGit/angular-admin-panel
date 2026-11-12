import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '@core/api/api-client';
import { Booking, BookingStatus } from '../model/booking';
import {
  BookingsResponse,
  toUpdateBookingPayload,
} from './booking-api.types';

/**
 * Typed bookings endpoints. This layer knows nothing about components or state;
 * it only turns HTTP and the SSE feed into observables of domain data.
 */
@Injectable({ providedIn: 'root' })
export class BookingApi {
  private readonly api = inject(ApiClient);

  getAll(): Observable<BookingsResponse> {
    return this.api.get<BookingsResponse>('/bookings');
  }

  /** Emits a tick whenever the server signals that bookings changed. */
  events(): Observable<void> {
    return this.api.eventStream('/events');
  }

  updateStatus(booking: Booking, status: BookingStatus): Observable<void> {
    return this.api.put<void>(
      `/booking/${booking.id}`,
      toUpdateBookingPayload(booking, status),
    );
  }

  remove(bookingId: number): Observable<void> {
    return this.api.delete<void>(`/booking/${bookingId}`);
  }
}
