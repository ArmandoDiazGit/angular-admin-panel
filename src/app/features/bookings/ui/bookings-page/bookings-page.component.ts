import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

import {
  ConfirmationDialogData,
  ConfirmDialogComponent,
} from '@shared/ui/confirm-dialog/confirm-dialog.component';
import { BookingsStore } from '../../data/bookings-store';
import { Booking } from '../../model/booking';
import { StatusChange } from '../booking-row/booking-row.component';
import { BookingsFiltersComponent } from '../bookings-filters/bookings-filters.component';
import { BookingsStatsComponent } from '../bookings-stats/bookings-stats.component';
import { BookingsTableComponent } from '../bookings-table/bookings-table.component';

/**
 * Smart container: wires the store to the presentation components and owns the
 * cross-cutting UI concerns (confirmation dialogs, snackbar messages).
 */
@Component({
  selector: 'app-bookings-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BookingsStatsComponent,
    BookingsFiltersComponent,
    BookingsTableComponent,
  ],
  templateUrl: './bookings-page.component.html',
  styleUrl: './bookings-page.component.scss',
})
export class BookingsPageComponent implements OnInit {
  private readonly store = inject(BookingsStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly stats = this.store.stats;
  protected readonly filteredBookings = this.store.filteredBookings;
  protected readonly loading = this.store.loading;
  protected readonly error = this.store.error;
  protected readonly refreshing = this.store.refreshing;
  protected readonly searchTerm = this.store.searchTerm;
  protected readonly statusFilter = this.store.statusFilter;

  ngOnInit(): void {
    this.store.connect();

    this.store.messages$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((message) => this.notify(message));
  }

  protected refresh(): void {
    this.store.refresh();
  }

  protected retry(): void {
    this.store.retry();
  }

  protected async onStatusChange({ booking, status }: StatusChange): Promise<void> {
    const confirmed = await this.confirm({
      title: 'Update Booking Status',
      message: `Are you sure you want to update the status of the booking for ${booking.name} to ${status}?`,
    });

    if (confirmed) {
      await this.store.changeStatus(booking, status);
    }
  }

  protected async onDelete(booking: Booking): Promise<void> {
    const confirmed = await this.confirm({
      title: 'Delete Booking',
      message: `Are you sure you want to delete the booking for ${booking.name}?`,
    });

    if (confirmed) {
      await this.store.remove(booking);
    }
  }

  private async confirm(data: ConfirmationDialogData): Promise<boolean> {
    const dialogRef = this.dialog.open<
      ConfirmDialogComponent,
      ConfirmationDialogData,
      boolean
    >(ConfirmDialogComponent, { width: '500px', data });

    return (await firstValueFrom(dialogRef.afterClosed())) === true;
  }

  private notify(message: string): void {
    this.snackBar.open(message, 'Dismiss', { duration: 2500 });
  }
}
