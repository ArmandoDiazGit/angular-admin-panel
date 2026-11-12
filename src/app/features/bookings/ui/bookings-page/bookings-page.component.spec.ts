import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { environment } from '@env/environment';
import { installFakeEventSource } from '@testing/fake-event-source';
import { BookingsStore } from '../../data/bookings-store';
import { Booking } from '../../model/booking';
import { BookingsPageComponent } from './bookings-page.component';

function booking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 1,
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    phone: '555-0100',
    service: 'Massage',
    date: '2026-03-10',
    time: '10:30:00',
    notes: '',
    status: 'pending',
    created: '2026-03-01T09:00:00',
    updated_at: '2026-03-01T09:00:00',
    scheduled_at: '2026-03-10T10:30:00',
    ...overrides,
  };
}

describe('BookingsPageComponent', () => {
  let component: BookingsPageComponent;
  let fixture: ComponentFixture<BookingsPageComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    installFakeEventSource();

    await TestBed.configureTestingModule({
      imports: [BookingsPageComponent],
      providers: [
        BookingsStore,
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingsPageComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  function load(bookings: Booking[]): void {
    fixture.detectChanges();
    http.expectOne(`${environment.apiUrl}/bookings`).flush(bookings);
    fixture.detectChanges();
  }

  function rows(): NodeListOf<HTMLElement> {
    return fixture.nativeElement.querySelectorAll('tbody tr');
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders one row per booking', () => {
    load([booking(), booking({ id: 2, name: 'Grace Hopper', status: 'confirmed' })]);

    expect(rows().length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Grace Hopper');
  });

  it('filters the table when the search term changes', () => {
    load([booking(), booking({ id: 2, name: 'Grace Hopper', status: 'confirmed' })]);

    const input = fixture.nativeElement.querySelector(
      '#booking-search',
    ) as HTMLInputElement;

    input.value = 'grace';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(rows().length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Grace Hopper');
    expect(fixture.nativeElement.textContent).not.toContain('Ada Lovelace');
  });

  it('filters the table when the status filter changes', () => {
    load([booking(), booking({ id: 2, name: 'Grace Hopper', status: 'confirmed' })]);

    const select = fixture.nativeElement.querySelector(
      '#booking-status',
    ) as HTMLSelectElement;

    select.value = 'confirmed';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(rows().length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Grace Hopper');
  });

  it('shows the empty state when there are no bookings', () => {
    load([]);

    expect(rows().length).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('No appointments found');
  });

  it('shows the error state and retries the initial load', () => {
    fixture.detectChanges();
    http
      .expectOne(`${environment.apiUrl}/bookings`)
      .flush('down', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('down');

    (fixture.nativeElement.querySelector('.retry-button') as HTMLButtonElement).click();
    fixture.detectChanges();

    http.expectOne(`${environment.apiUrl}/bookings`).flush([booking()]);
    fixture.detectChanges();

    expect(rows().length).toBe(1);
  });
});
