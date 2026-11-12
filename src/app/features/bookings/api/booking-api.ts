import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, startWith, switchMap } from 'rxjs';
import { Booking } from '../model/booking';
import { BookingsResponse } from './booking-api.types';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private _apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private _ngZone: NgZone,
  ) {}

  getAllBookings(): Observable<BookingsResponse> {
    return this.http.get<BookingsResponse>(`${this._apiUrl}/bookings`);
  }

  private subscribeToEvents(): Observable<void> {
    return new Observable<void>((observer) => {
      const source = new EventSource(`${this._apiUrl}/events`);
      source.onmessage = () => {
        this._ngZone.run(() => observer.next());
      };
      source.onerror = () => {};
      return () => source.close();
    });
  }

  watchBookings(): Observable<BookingsResponse> {
    return this.subscribeToEvents().pipe(
      startWith(undefined),
      switchMap(() => this.getAllBookings()),
    );
  }

  updateBookingStatus(
    booking: Booking,
    status: Booking['status'],
  ): Observable<void> {
    const payload = {
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      service: booking.service,
      date: booking.date,
      time: booking.time,
      notes: booking.notes,
      status: status,
      scheduled_at: booking.scheduled_at,
    };
    return this.http.put<void>(
      `${this._apiUrl}/booking/${booking.id}`,
      payload,
    );
  }

  deleteBooking(bookingId: number): Observable<void> {
    return this.http.delete<void>(
      `${this._apiUrl}/booking/${bookingId}`,
    );
  }
}
