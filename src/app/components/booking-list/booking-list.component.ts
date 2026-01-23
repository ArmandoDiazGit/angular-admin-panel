import {
  Component,
  OnInit,
  viewChild,
  effect,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models/booking';
import { UpperCasePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { SnackbarComponent } from '../snackbar-component/snackbar.component';
import { interval, startWith, Subject, switchMap, takeUntil } from 'rxjs';

@Component({
  selector: 'app-booking-list',
  imports: [
    UpperCasePipe,
    CommonModule,
    FormsModule,
    MatTableModule,
    SnackbarComponent,
  ],
  templateUrl: './booking-list.component.html',
  styleUrl: './booking-list.component.scss',
})
export class BookingListComponent implements OnInit, OnDestroy {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  loading: boolean = true;
  error: string = '';

  searchTerm: string = '';
  statusFilter: string = 'all';
  sortBy: string = 'created';
  sortOrder: 'asc' | 'desc' = 'desc';

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
    private _bookingService: BookingService,
    private _dialog: MatDialog,
    private _changeDetectorRef: ChangeDetectorRef,
  ) {
    effect(() => {
      if (this._showSnackbar) {
        this.snackBar().show();
      }
    });
  }

  ngOnInit(): void {
    interval(5000)
      .pipe(
        startWith(0),
        takeUntil(this._destroy$),
        switchMap(() => this._bookingService.getAllBookings()),
      )
      .subscribe({
        next: (bookings) => {
          this.loading = false;
          this.error = '';
          this.bookings = bookings;

          this.calculateStats();
          this.applyFilters();
        },
        error: () => {
          this.error = 'Failed to load bookings. Please try again.';
          this.loading = false;
        },
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  loadBookings(): void {
    this.loading = true;
    this.error = '';
    this.searchTerm = '';
    this._bookingService
      .getAllBookings()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (bookings) => {
          this.loading = false;
          this.bookings = bookings;
          this.calculateStats();
          this.applyFilters();
          this._changeDetectorRef.detectChanges();
        },
        error: () => {
          this.error = 'Failed to load bookings. Please try again.';
          this.loading = false;
        },
      });
  }

  calculateStats(): void {
    this.stats.total = this.bookings?.length;
    this.stats.pending = this.bookings?.filter(
      (b) => b.status === 'pending',
    ).length;
    this.stats.confirmed = this.bookings.filter(
      (b) => b.status === 'confirmed',
    ).length;
    this.stats.cancelled = this.bookings.filter(
      (b) => b.status === 'cancelled',
    ).length;
  }

  applyFilters(): void {
    let filtered = [...this.bookings];

    if (this.statusFilter !== 'all') {
      filtered = filtered.filter((b) => b.status === this.statusFilter);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      let name = filtered.filter((b) =>
        b.name.toLocaleLowerCase().includes(term),
      );
      filtered = name;
    }

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (this.sortBy) {
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

      return this.sortOrder === 'asc' ? comparison : -comparison;
    });

    this.filteredBookings = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  updateStatus(booking: Booking, newStatus: string): void {
    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: 'Update Booking Status',
        message: `Are you sure you want to update status the booking for ${booking.name} to ${newStatus}?`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this._bookingService
          .updateBookingStatus(booking, newStatus)
          .pipe(takeUntil(this._destroy$))
          .subscribe({
            next: (res) => {
              booking.status = newStatus as
                | 'pending'
                | 'confirmed'
                | 'cancelled';
              this.calculateStats();
              this.applyFilters();
              this._showSnackbar = true;
              this.snackbarMessage = 'Booking status updated successfully';
            },
            error: () => {
              this.snackbarMessage = 'Failed to update booking status';
              this._showSnackbar = true;
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

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this._bookingService
          .deleteBooking(booking.id)
          .pipe()
          .subscribe({
            next: () => {
              this.bookings = this.bookings.filter((b) => b.id !== booking.id);
              this.calculateStats();
              this.applyFilters();
            },
            error: (err) => {
              alert('Failed to delete booking');
              console.error('Error deleting booking:', err);
            },
          });
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  to12Hour(time24: any): string {
    const [h, m, s] = time24.split(':');
    const date = new Date();
    date.setHours(h, m, s);

    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  trackByBookingId(index: number, booking: Booking): number {
    return booking.id;
  }
}
