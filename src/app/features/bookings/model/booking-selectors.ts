import { Injectable } from '@angular/core';
import { Booking } from './booking';

export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
}

@Injectable({
  providedIn: 'root',
})
export class BookingUtilsService {
  filterAndSort(
    bookings: Booking[],
    filters: {
      statusFilter: string;
      searchTerm: string;
      sortBy: string;
      sortOrder: 'asc' | 'desc';
    },
  ): Booking[] {
    let filtered = [...bookings];

    if (filters.statusFilter !== 'all') {
      filtered = filtered.filter((b) => b.status === filters.statusFilter);
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter((b) =>
        b.name.toLocaleLowerCase().includes(term),
      );
    }

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'date':
          comparison =
            new Date(a.date + ' ' + a.time).getTime() -
            new Date(b.date + ' ' + b.time).getTime();
          break;
        case 'created':
          comparison =
            new Date(a.created).getTime() - new Date(b.created).getTime();
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }

  calculateStats(bookings: Booking[]): BookingStats {
    return bookings.reduce(
      (acc, b) => {
        acc.total++;
        if (b.status === 'pending') acc.pending++;
        else if (b.status === 'confirmed') acc.confirmed++;
        else if (b.status === 'cancelled') acc.cancelled++;
        return acc;
      },
      { total: 0, pending: 0, confirmed: 0, cancelled: 0 },
    );
  }
}
