import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

import { Booking, BookingStatus } from '../../model/booking';

export interface StatusChange {
  booking: Booking;
  status: BookingStatus;
}

@Component({
  selector: 'tr[app-booking-row]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'booking-row' },
  template: `
    <td>
      <div class="customer-info">
        <div class="customer-name">{{ booking().name }}</div>
        <div class="customer-email">{{ booking().email }}</div>
      </div>
    </td>

    <td>
      <div class="service-info">
        <strong>{{ booking().service }}</strong>
        @if (booking().notes) {
          <div class="notes-preview" [title]="booking().notes">
            📝 {{ notesPreview() }}
          </div>
        }
      </div>
    </td>

    <td>
      <div class="appointment-info">
        <div class="appointment-date">📅 {{ scheduledDate() }}</div>
        <div class="appointment-time">🕐 {{ time12Hour() }}</div>
      </div>
    </td>

    <td>
      <div class="contact-info">
        <a [href]="'tel:' + booking().phone" class="phone-link">
          📞 {{ booking().phone }}
        </a>
      </div>
    </td>

    <td>
      <span [class]="statusClass()">{{ statusLabel() }}</span>
    </td>

    <td>
      <div class="action-buttons">
        @if (booking().status === 'pending') {
          <button
            type="button"
            class="btn-confirm"
            title="Confirm Appointment"
            (click)="statusChange.emit({ booking: booking(), status: 'confirmed' })"
          >
            ✓ Confirm
          </button>
        }

        @if (booking().status === 'pending' || booking().status === 'confirmed') {
          <button
            type="button"
            class="btn-pending"
            title="Cancel Appointment"
            (click)="statusChange.emit({ booking: booking(), status: 'cancelled' })"
          >
            ✕ Cancel
          </button>
        }

        @if (booking().status === 'cancelled') {
          <button
            type="button"
            class="btn-restore"
            title="Restore to Pending"
            (click)="statusChange.emit({ booking: booking(), status: 'pending' })"
          >
            ↺ Restore
          </button>
        }

        <button
          type="button"
          class="btn-cancel"
          title="Delete Appointment"
          (click)="delete.emit(booking())"
        >
          Delete
        </button>
      </div>
    </td>
  `,
  styleUrl: './booking-row.component.scss',
})
export class BookingRowComponent {
  readonly booking = input.required<Booking>();

  readonly statusChange = output<StatusChange>();
  readonly delete = output<Booking>();

  readonly scheduledDate = computed(() => formatDate(this.booking().scheduled_at));
  readonly time12Hour = computed(() => formatTime(this.booking().time));
  readonly statusLabel = computed(() => this.booking().status.toUpperCase());
  readonly statusClass = computed(
    () => `status-badge status-${this.booking().status}`,
  );
  readonly notesPreview = computed(() => {
    const notes = this.booking().notes;
    return notes.length > 30 ? `${notes.slice(0, 30)}...` : notes;
  });
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(value: string): string {
  const [hours, minutes, seconds] = value.split(':').map(Number);

  if ([hours, minutes, seconds].some(Number.isNaN)) return value;

  const date = new Date();
  date.setHours(hours, minutes, seconds ?? 0);

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
