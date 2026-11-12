import {
  computed,
  DestroyRef,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  catchError,
  firstValueFrom,
  map,
  Observable,
  of,
  Subject,
  switchMap,
} from 'rxjs';

import { ApiError, isApiError } from '@core/api/api-error';
import { BookingApi } from '../api/booking-api';
import { Booking, BookingStatus } from '../model/booking';
import {
  BookingStats,
  calculateStats,
  filterAndSort,
  SortBy,
  SortOrder,
} from '../model/booking-selectors';

interface LoadResult {
  background: boolean;
  bookings: Booking[] | null;
  error: ApiError | null;
}

/**
 * Feature-scoped state for the bookings screen. Every value the template reads is
 * a signal, so components never call `markForCheck` or recompute filtering by hand.
 */
@Injectable()
export class BookingsStore {
  private readonly api = inject(BookingApi);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _bookings = signal<Booking[]>([]);
  private readonly _loading = signal(true);
  private readonly _error = signal<string | null>(null);
  private readonly _refreshing = signal(false);

  private readonly _messages = new Subject<string>();
  private readonly reload = new Subject<{ background: boolean }>();
  private liveConnected = false;

  readonly bookings = this._bookings.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly refreshing = this._refreshing.asReadonly();

  readonly searchTerm = signal('');
  readonly statusFilter = signal<BookingStatus | 'all'>('all');
  readonly sortBy = signal<SortBy>('created');
  readonly sortOrder = signal<SortOrder>('desc');

  readonly stats = computed<BookingStats>(() => calculateStats(this._bookings()));

  readonly filteredBookings = computed<Booking[]>(() =>
    filterAndSort(this._bookings(), {
      statusFilter: this.statusFilter(),
      searchTerm: this.searchTerm(),
      sortBy: this.sortBy(),
      sortOrder: this.sortOrder(),
    }),
  );

  /** Transient user-facing messages (failures, successful mutations). */
  readonly messages$: Observable<string> = this._messages.asObservable();

  constructor() {
    this.reload
      .pipe(
        // switchMap cancels a stale in-flight list request when a newer one arrives.
        switchMap(({ background }) =>
          this.load(background),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((result) => this.apply(result));
  }

  /** Starts the initial load and subscribes to server-pushed change events. */
  connect(): void {
    if (this.liveConnected) return;
    this.liveConnected = true;

    this.reload.next({ background: false });

    this.api
      .events()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload.next({ background: true }));
  }

  refresh(): void {
    if (this._loading() || this._refreshing()) return;

    this._refreshing.set(true);
    this.reload.next({ background: true });
  }

  retry(): void {
    this._error.set(null);
    this._loading.set(true);
    this.reload.next({ background: false });
  }

  async changeStatus(booking: Booking, status: BookingStatus): Promise<boolean> {
    try {
      await firstValueFrom(this.api.updateStatus(booking, status));

      this._bookings.update((bookings) =>
        bookings.map((current) =>
          current.id === booking.id ? { ...current, status } : current,
        ),
      );
      this._messages.next('Booking status updated successfully');
      return true;
    } catch (error) {
      this._messages.next(messageOf(error, 'Failed to update booking status'));
      return false;
    }
  }

  async remove(booking: Booking): Promise<boolean> {
    try {
      await firstValueFrom(this.api.remove(booking.id));

      this._bookings.update((bookings) =>
        bookings.filter((current) => current.id !== booking.id),
      );
      this._messages.next('Booking deleted successfully');
      return true;
    } catch (error) {
      this._messages.next(messageOf(error, 'Failed to delete booking'));
      return false;
    }
  }

  private load(background: boolean): Observable<LoadResult> {
    return this.api.getAll().pipe(
      map((bookings) => ({ background, bookings, error: null })),
      catchError((error: ApiError) => of({ background, bookings: null, error })),
    );
  }

  private apply(result: LoadResult): void {
    this._loading.set(false);
    this._refreshing.set(false);

    if (result.error) {
      if (result.background) {
        this._messages.next(result.error.message);
      } else {
        this._error.set(result.error.message);
      }
      return;
    }

    this._bookings.set(result.bookings ?? []);
    this._error.set(null);
  }
}

function messageOf(error: unknown, fallback: string): string {
  return isApiError(error) && error.message ? error.message : fallback;
}
