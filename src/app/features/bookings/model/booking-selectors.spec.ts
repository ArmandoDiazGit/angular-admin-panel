import { Booking } from './booking';
import { calculateStats, filterAndSort, SortBy, SortOrder } from './booking-selectors';

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

function filters(overrides: Partial<Parameters<typeof filterAndSort>[1]> = {}) {
  return {
    statusFilter: 'all' as const,
    searchTerm: '',
    sortBy: 'created' as SortBy,
    sortOrder: 'desc' as SortOrder,
    ...overrides,
  };
}

describe('booking selectors', () => {
  const ada = booking({ id: 1, name: 'Ada Lovelace' });
  const grace = booking({
    id: 2,
    name: 'Grace Hopper',
    status: 'confirmed',
    date: '2026-03-09',
    time: '09:00:00',
    created: '2026-03-02T09:00:00',
  });
  const alan = booking({
    id: 3,
    name: 'Alan Turing',
    status: 'cancelled',
    date: '2026-03-11',
    time: '16:00:00',
    created: '2026-03-03T09:00:00',
  });
  const all = [ada, grace, alan];

  it('does not mutate the input collection', () => {
    const input = [...all];
    filterAndSort(input, filters({ sortBy: 'name', sortOrder: 'asc' }));
    expect(input).toEqual(all);
  });

  it('filters by status', () => {
    expect(filterAndSort(all, filters({ statusFilter: 'confirmed' }))).toEqual([grace]);
    expect(filterAndSort(all, filters({ statusFilter: 'cancelled' }))).toEqual([alan]);
  });

  it('matches names case-insensitively and ignores surrounding whitespace', () => {
    expect(filterAndSort(all, filters({ searchTerm: '  ADA ' }))).toEqual([ada]);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterAndSort(all, filters({ searchTerm: 'nobody' }))).toEqual([]);
  });

  it('sorts by appointment date in both directions', () => {
    expect(
      filterAndSort(all, filters({ sortBy: 'date', sortOrder: 'asc' })).map((b) => b.id),
    ).toEqual([2, 1, 3]);

    expect(
      filterAndSort(all, filters({ sortBy: 'date', sortOrder: 'desc' })).map((b) => b.id),
    ).toEqual([3, 1, 2]);
  });

  it('sorts by creation date and by name', () => {
    expect(
      filterAndSort(all, filters({ sortBy: 'created', sortOrder: 'desc' })).map((b) => b.id),
    ).toEqual([3, 2, 1]);

    expect(
      filterAndSort(all, filters({ sortBy: 'name', sortOrder: 'asc' })).map((b) => b.name),
    ).toEqual(['Ada Lovelace', 'Alan Turing', 'Grace Hopper']);
  });

  it('sorts unparseable dates to the bottom instead of producing NaN', () => {
    const broken = booking({ id: 4, name: 'Bad Date', date: 'not-a-date' });

    const sorted = filterAndSort([...all, broken], filters({ sortBy: 'date', sortOrder: 'asc' }));

    expect(sorted[sorted.length - 1].id).toBe(4);
  });

  it('calculates totals per status', () => {
    expect(calculateStats(all)).toEqual({
      total: 3,
      pending: 1,
      confirmed: 1,
      cancelled: 1,
    });
  });

  it('handles an empty collection', () => {
    expect(calculateStats([])).toEqual({
      total: 0,
      pending: 0,
      confirmed: 0,
      cancelled: 0,
    });
  });
});
