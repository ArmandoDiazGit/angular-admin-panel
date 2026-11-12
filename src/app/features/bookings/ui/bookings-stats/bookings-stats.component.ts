import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { BookingStats } from '../../model/booking-selectors';

interface StatCard {
  key: 'total' | 'pending' | 'confirmed' | 'cancelled';
  icon: string;
  label: string;
  value: number;
}

@Component({
  selector: 'app-bookings-stats',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stats-grid">
      @for (card of cards(); track card.key) {
        <div [class]="'stat-card ' + card.key">
          <div class="stat-icon" aria-hidden="true">{{ card.icon }}</div>
          <div class="stat-content">
            <div class="stat-value">{{ card.value }}</div>
            <div class="stat-label">{{ card.label }}</div>
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './bookings-stats.component.scss',
})
export class BookingsStatsComponent {
  readonly stats = input.required<BookingStats>();

  readonly cards = computed<StatCard[]>(() => {
    const stats = this.stats();
    return [
      { key: 'total', icon: '📊', label: 'Total Bookings', value: stats.total },
      { key: 'pending', icon: '⏳', label: 'Pending', value: stats.pending },
      { key: 'confirmed', icon: '✅', label: 'Confirmed', value: stats.confirmed },
      { key: 'cancelled', icon: '❌', label: 'Cancelled', value: stats.cancelled },
    ];
  });
}
