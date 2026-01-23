import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Booking } from '../models/booking';
import { BookingsResponse } from '../models/bookingResponse-model';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private _apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  getAllBookings(): Observable<BookingsResponse> {
    return this.http
      .get<BookingsResponse>(`${this._apiUrl}/bookings`)
      .pipe(map((response) => response));
  }

  updateBookingStatus(
    booking: Booking,
    status: string,
  ): Observable<BookingsResponse> {
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
    return this.http.put<BookingsResponse>(
      `${this._apiUrl}/booking/${booking.id}`,
      payload,
    );
  }

  deleteBooking(bookingId: number): Observable<BookingsResponse> {
    return this.http.delete<BookingsResponse>(
      `${this._apiUrl}/booking/${bookingId}`,
    );
  }
}
