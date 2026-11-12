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

  filtered.sort((a, b) => compare(a, b, filters.sortBy, direction));

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

function compare(a: Booking, b: Booking, sortBy: SortBy, direction: number): number {
  if (sortBy === 'name') {
    return direction * a.name.localeCompare(b.name);
  }

  const aValue = sortBy === 'date' ? appointmentTime(a) : dateValue(a.created);
  const bValue = sortBy === 'date' ? appointmentTime(b) : dateValue(b.created);

  const aInvalid = Number.isNaN(aValue);
  const bInvalid = Number.isNaN(bValue);

  // Unparseable dates always sink to the bottom, whichever direction is active.
  if (aInvalid || bInvalid) {
    if (aInvalid && bInvalid) return 0;
    return aInvalid ? 1 : -1;
  }

  return direction * (aValue - bValue);
}

/**
 * `new Date('2026-01-01 10:00')` is not valid in every browser, so the
 * timestamp is built from an ISO-ish string instead.
 */
function appointmentTime(booking: Booking): number {
  return dateValue(`${booking.date}T${booking.time}`);
}

function dateValue(value: string): number {
  return new Date(value).getTime();
}
