import { Booking, BookingStatus } from '../model/booking';

export type BookingsResponse = Booking[];

/** The exact shape the status-update endpoint accepts. */
export interface UpdateBookingPayload {
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  notes: string;
  status: BookingStatus;
  scheduled_at: string;
}

export function toUpdateBookingPayload(
  booking: Booking,
  status: BookingStatus,
): UpdateBookingPayload {
  return {
    name: booking.name,
    email: booking.email,
    phone: booking.phone,
    service: booking.service,
    date: booking.date,
    time: booking.time,
    notes: booking.notes,
    status,
    scheduled_at: booking.scheduled_at,
  };
}
