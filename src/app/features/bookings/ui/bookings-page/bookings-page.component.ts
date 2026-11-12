import {
  Component,
  OnInit,
  viewChild,
  effect,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { BookingApi } from '@features/bookings/api/booking-api';
import { calculateStats, filterAndSort, SortBy, SortOrder } from '@features/bookings/model/booking-selectors';
import { Booking, BookingStatus } from '@features/bookings/model/booking';
import { UpperCasePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@shared/ui/confirm-dialog/confirm-dialog.component';
import { SnackbarComponent } from '@app/components/snackbar-component/snackbar.component';
import { FormatDatePipe } from '../pipes/format-date.pipe';
import { To12HourPipe } from '../pipes/to-12-hour.pipe';
import { StatusClassPipe } from '../pipes/status-class.pipe';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-booking-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    UpperCasePipe,
    CommonModule,
    FormsModule,
    SnackbarComponent,
    FormatDatePipe,
    To12HourPipe,
    StatusClassPipe,
  ],
  templateUrl: './bookings-page.component.html',
  styleUrl: './bookings-page.component.scss',
})
export class BookingListComponent implements OnInit, OnDestroy {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  loading: boolean = true;
  initialLoad: boolean = true;
  error: string = '';
  refreshing: boolean = false;

  searchTerm: string = '';
  statusFilter: BookingStatus | 'all' = 'all';
  sortBy: SortBy = 'created';
  sortOrder: SortOrder = 'desc';

  stats = {
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
  };

  snackbarMessage: string = '';

  snackBar = viewChild.required(SnackbarComponent);
  private _showSnackbar: boolean = false;
  private _destroy$ = new Subject<void>();

  constructor(
    private _bookingService: BookingApi,
    private _dialog: MatDialog,
    private _cdr: ChangeDetectorRef,
  ) {
    effect(() => {
      if (this._showSnackbar) {
        this.snackBar().show();
      }
    });
  }

  ngOnInit(): void {
    this._bookingService
      .watchLive()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (bookings) => {
          this.loading = false;
          this.error = '';
          this.refreshing = false;
          this.bookings = bookings;
          this.refreshDisplay();
          this.initialLoad = false;
          this._cdr.markForCheck();
        },
        error: () => {
          if (this.initialLoad) {
            this.error = 'Failed to load bookings. Please try again.';
            this.loading = false;
            this._cdr.markForCheck();
          } else {
            this.snackbarMessage = 'Failed to refresh bookings';
            this._showSnackbar = true;
          }
        },
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  loadBookings(): void {
    this.refreshing = true;
    this._bookingService
      .getAll()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (bookings) => {
          this.refreshing = false;
          this.bookings = bookings;
          this.refreshDisplay();
          this._cdr.markForCheck();
        },
        error: () => {
          this.refreshing = false;
          this.snackbarMessage = 'Failed to refresh bookings';
          this._showSnackbar = true;
          this._cdr.markForCheck();
        },
      });
  }

  private refreshDisplay(): void {
    this.stats = calculateStats(this.bookings);
    this.filteredBookings = filterAndSort(this.bookings, {
      statusFilter: this.statusFilter,
      searchTerm: this.searchTerm,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
    });
  }

  onSearchChange(): void {
    this.refreshDisplay();
  }

  onStatusFilterChange(): void {
    this.refreshDisplay();
  }

  updateStatus(booking: Booking, newStatus: Booking['status']): void {
    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: 'Update Booking Status',
        message: `Are you sure you want to update status the booking for ${booking.name} to ${newStatus}?`,
      },
    });

    dialogRef.afterClosed().pipe(takeUntil(this._destroy$)).subscribe((result) => {
      if (result) {
        this._bookingService
          .updateStatus(booking, newStatus)
          .pipe(takeUntil(this._destroy$))
          .subscribe({
            next: () => {
              booking.status = newStatus;
              this.refreshDisplay();
              this._showSnackbar = true;
              this.snackbarMessage = 'Booking status updated successfully';
              this._cdr.markForCheck();
            },
            error: () => {
              this.snackbarMessage = 'Failed to update booking status';
              this._showSnackbar = true;
              this._cdr.markForCheck();
            },
          });
      }
    });
  }

  deleteBooking(booking: Booking): void {
    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: 'Delete Booking',
        message: `Are you sure you want to delete the booking for ${booking.name}?`,
      },
    });

    dialogRef.afterClosed().pipe(takeUntil(this._destroy$)).subscribe((result) => {
      if (result) {
        this._bookingService
          .remove(booking.id)
          .pipe(takeUntil(this._destroy$))
          .subscribe({
            next: () => {
              this.bookings = this.bookings.filter((b) => b.id !== booking.id);
              this.refreshDisplay();
              this._showSnackbar = true;
              this.snackbarMessage = 'Booking deleted successfully';
              this._cdr.markForCheck();
            },
            error: () => {
              this.snackbarMessage = 'Failed to delete booking';
              this._showSnackbar = true;
              this._cdr.markForCheck();
            },
          });
      }
    });
  }

  trackByBookingId(index: number, booking: Booking): number {
    return booking.id;
  }
}
