import { Booking, BookingStatus } from './booking';

export type SortBy = 'date' | 'created' | 'name';
export type SortOrder = 'asc' | 'desc';

export interface BookingFilters {
  statusFilter: BookingStatus | 'all';
  searchTerm: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
}

export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
}

export function filterAndSort(
  bookings: readonly Booking[],
  filters: BookingFilters,
): Booking[] {
  const term = filters.searchTerm.trim().toLocaleLowerCase();

  let filtered = [...bookings];

  if (filters.statusFilter !== 'all') {
    filtered = filtered.filter((booking) => booking.status === filters.statusFilter);
  }

  if (term) {
    filtered = filtered.filter((booking) =>
      booking.name.toLocaleLowerCase().includes(term),
    );
  }

  const direction = filters.sortOrder === 'asc' ? 1 : -1;

  filtered.sort((a, b) => direction * compare(a, b, filters.sortBy));

  return filtered;
}

export function calculateStats(bookings: readonly Booking[]): BookingStats {
  return bookings.reduce<BookingStats>(
    (stats, booking) => {
      stats.total++;

      if (booking.status === 'pending') stats.pending++;
      else if (booking.status === 'confirmed') stats.confirmed++;
      else if (booking.status === 'cancelled') stats.cancelled++;

      return stats;
    },
    { total: 0, pending: 0, confirmed: 0, cancelled: 0 },
  );
}

function compare(a: Booking, b: Booking, sortBy: SortBy): number {
  switch (sortBy) {
    case 'date':
      return appointmentTime(a) - appointmentTime(b);
    case 'created':
      return dateValue(a.created) - dateValue(b.created);
    case 'name':
      return a.name.localeCompare(b.name);
  }
}

/**
 * `new Date('2026-01-01 10:00')` is not valid in every browser. Building the
 * timestamp from an ISO-ish string is portable, and an unparseable value sorts
 * to the bottom instead of producing NaN.
 */
function appointmentTime(booking: Booking): number {
  return dateValue(`${booking.date}T${booking.time}`);
}

function dateValue(value: string): number {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}
