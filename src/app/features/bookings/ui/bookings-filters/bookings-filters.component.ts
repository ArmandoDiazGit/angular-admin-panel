import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

import { BookingStatus } from '../../model/booking';

@Component({
  selector: 'app-bookings-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="search-box">
      <label class="sr-only" for="booking-search">Search bookings by name</label>
      <input
        #searchInput
        id="booking-search"
        type="search"
        class="search-input"
        placeholder="🔍 Search by name"
        [value]="searchTerm()"
        (input)="searchTermChange.emit(searchInput.value)"
      />
    </div>

    <div class="filters">
      <div class="filter-group">
        <label for="booking-status">Status:</label>
        <select
          id="booking-status"
          class="filter-select"
          [value]="statusFilter()"
          (change)="onStatusChange($event)"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <button
        type="button"
        class="refresh-button"
        [class.refreshing]="refreshing()"
        [disabled]="refreshing()"
        (click)="refresh.emit()"
      >
        <span class="refresh-icon" [class.spinning]="refreshing()" aria-hidden="true">🔄</span>
        {{ refreshing() ? 'Refreshing...' : 'Refresh' }}
      </button>

      <span class="live-indicator" [class.connected]="connected()">
        <span aria-hidden="true">●</span> Live
      </span>
    </div>
  `,
  styleUrl: './bookings-filters.component.scss',
})
export class BookingsFiltersComponent {
  readonly searchTerm = input.required<string>();
  readonly statusFilter = input.required<BookingStatus | 'all'>();
  readonly refreshing = input(false);
  readonly connected = input(false);

  readonly searchTermChange = output<string>();
  readonly statusFilterChange = output<BookingStatus | 'all'>();
  readonly refresh = output<void>();

  onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as BookingStatus | 'all';
    this.statusFilterChange.emit(value);
  }
}
