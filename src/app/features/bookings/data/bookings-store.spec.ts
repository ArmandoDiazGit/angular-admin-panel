import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { installFakeEventSource, FakeEventSource } from '@testing/fake-event-source';
import { environment } from '@env/environment';
import { Booking } from '../model/booking';
import { BookingsStore } from './bookings-store';

const API = environment.apiUrl;

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

describe('BookingsStore', () => {
  let store: BookingsStore;
  let http: HttpTestingController;

  beforeEach(() => {
    installFakeEventSource();

    TestBed.configureTestingModule({
      providers: [
        BookingsStore,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    store = TestBed.inject(BookingsStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  function connectWith(bookings: Booking[]): void {
    store.connect();
    http.expectOne(`${API}/bookings`).flush(bookings);
  }

  it('starts in a loading state and loads bookings on connect', () => {
    expect(store.loading()).toBeTrue();

    connectWith([booking(), booking({ id: 2, status: 'confirmed' })]);

    expect(store.loading()).toBeFalse();
    expect(store.error()).toBeNull();
    expect(store.bookings().length).toBe(2);
    expect(store.filteredBookings().length).toBe(2);
    expect(store.stats()).toEqual({
      total: 2,
      pending: 1,
      confirmed: 1,
      cancelled: 0,
    });
  });

  it('surfaces an initial load failure as an error state', () => {
    store.connect();
    http.expectOne(`${API}/bookings`).flush('backend down', {
      status: 500,
      statusText: 'Server Error',
    });

    expect(store.loading()).toBeFalse();
    expect(store.error()).toBe('backend down');
  });

  it('keeps existing rows and emits a message when a background refresh fails', () => {
    connectWith([booking()]);

    const messages: string[] = [];
    store.messages$.subscribe((message) => messages.push(message));

    store.refresh();
    expect(store.refreshing()).toBeTrue();

    http.expectOne(`${API}/bookings`).flush('nope', {
      status: 500,
      statusText: 'Server Error',
    });

    expect(store.refreshing()).toBeFalse();
    expect(store.bookings().length).toBe(1);
    expect(messages).toEqual(['nope']);
  });

  it('refetches when the server pushes a change event', () => {
    connectWith([booking()]);

    fakeEventSource().emitMessage();
    http
      .expectOne(`${API}/bookings`)
      .flush([booking(), booking({ id: 2, name: 'Grace Hopper' })]);

    expect(store.bookings().length).toBe(2);
  });

  it('updates a status immutably and reports success', async () => {
    const original = booking();
    connectWith([original]);

    const messages: string[] = [];
    store.messages$.subscribe((message) => messages.push(message));

    const updated = store.changeStatus(original, 'confirmed');
    const request = http.expectOne(`${API}/booking/1`);

    expect(request.request.method).toBe('PUT');
    expect(request.request.body.status).toBe('confirmed');
    request.flush(null);

    expect(await updated).toBeTrue();
    expect(original.status).toBe('pending');
    expect(store.bookings()[0].status).toBe('confirmed');
    expect(messages).toEqual(['Booking status updated successfully']);
  });

  it('reports a failed status update without touching the list', async () => {
    const original = booking();
    connectWith([original]);

    const messages: string[] = [];
    store.messages$.subscribe((message) => messages.push(message));

    const updated = store.changeStatus(original, 'confirmed');
    http
      .expectOne(`${API}/booking/1`)
      .flush('invalid', { status: 422, statusText: 'Unprocessable Entity' });

    expect(await updated).toBeFalse();
    expect(store.bookings()[0].status).toBe('pending');
    expect(messages).toEqual(['invalid']);
  });

  it('removes a booking locally only after the server confirms', async () => {
    connectWith([booking(), booking({ id: 2, name: 'Grace Hopper' })]);

    const removed = store.remove(booking());
    const request = http.expectOne(`${API}/booking/1`);

    expect(request.request.method).toBe('DELETE');
    request.flush(null);

    expect(await removed).toBeTrue();
    expect(store.bookings().map((b) => b.id)).toEqual([2]);
  });

  it('derives filtered bookings from the filter signals', () => {
    connectWith([
      booking(),
      booking({ id: 2, name: 'Grace Hopper', status: 'confirmed' }),
    ]);

    store.searchTerm.set('grace');
    expect(store.filteredBookings().map((b) => b.id)).toEqual([2]);

    store.searchTerm.set('');
    store.statusFilter.set('pending');
    expect(store.filteredBookings().map((b) => b.id)).toEqual([1]);
  });

  it('supports retrying after an initial failure', () => {
    store.connect();
    http
      .expectOne(`${API}/bookings`)
      .flush('down', { status: 500, statusText: 'Server Error' });

    store.retry();
    expect(store.loading()).toBeTrue();
    expect(store.error()).toBeNull();

    http.expectOne(`${API}/bookings`).flush([booking()]);
    expect(store.bookings().length).toBe(1);
  });
});

function fakeEventSource() {
  const instance = FakeEventSource.instances[0];
  if (!instance) throw new Error('No EventSource was opened');
  return instance;
}
