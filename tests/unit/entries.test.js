import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getAllEntries,
  getTodayEntry,
  upsertTodayEntry,
  replaceTodayEntry,
} from '../../js/storage/entries.js';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

vi.stubGlobal('localStorage', localStorageMock);

// Mock todayISO to return a fixed date
vi.mock('../../js/utils/time.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    todayISO: () => '2026-03-27',
  };
});

beforeEach(() => {
  localStorage.clear();
});

describe('getAllEntries', () => {
  it('returns empty array when storage is empty', () => {
    expect(getAllEntries()).toEqual([]);
  });

  it('returns parsed entries from storage', () => {
    const entries = [{ id: '1', date: '2026-03-27', arrivedAt: null, departedAt: null, breaks: [], createdAt: 1, updatedAt: 1 }];
    localStorage.setItem('tt_entries', JSON.stringify(entries));
    expect(getAllEntries()).toEqual(entries);
  });

  it('returns empty array on invalid JSON', () => {
    localStorage.setItem('tt_entries', 'not-json');
    expect(getAllEntries()).toEqual([]);
  });
});

describe('getTodayEntry', () => {
  it('returns null when no entry for today', () => {
    expect(getTodayEntry()).toBeNull();
  });

  it('returns null when only other days exist', () => {
    const entries = [{ id: '1', date: '2026-03-26', arrivedAt: null, departedAt: null, breaks: [], createdAt: 1, updatedAt: 1 }];
    localStorage.setItem('tt_entries', JSON.stringify(entries));
    expect(getTodayEntry()).toBeNull();
  });

  it('returns today\'s entry', () => {
    const entries = [
      { id: '1', date: '2026-03-27', arrivedAt: 1000, departedAt: null, breaks: [], createdAt: 1, updatedAt: 1 },
      { id: '2', date: '2026-03-26', arrivedAt: 900, departedAt: null, breaks: [], createdAt: 1, updatedAt: 1 },
    ];
    localStorage.setItem('tt_entries', JSON.stringify(entries));
    expect(getTodayEntry()).toEqual(entries[0]);
  });
});

describe('upsertTodayEntry', () => {
  it('creates a new entry when none exists', () => {
    const entry = upsertTodayEntry({ arrivedAt: 1000 });
    expect(entry.date).toBe('2026-03-27');
    expect(entry.arrivedAt).toBe(1000);
    expect(entry.departedAt).toBeNull();
    expect(entry.breaks).toEqual([]);
    expect(entry.id).toBeTruthy();
    expect(entry.createdAt).toBeTruthy();
  });

  it('updates existing entry preserving id and createdAt', () => {
    const first = upsertTodayEntry({ arrivedAt: 1000 });
    const second = upsertTodayEntry({ departedAt: 5000 });

    expect(second.id).toBe(first.id);
    expect(second.createdAt).toBe(first.createdAt);
    expect(second.arrivedAt).toBe(1000);
    expect(second.departedAt).toBe(5000);
  });

  it('updates updatedAt on each call', async () => {
    const first = upsertTodayEntry({ arrivedAt: 1000 });
    await new Promise((r) => setTimeout(r, 5));
    const second = upsertTodayEntry({ departedAt: 5000 });
    expect(second.updatedAt).toBeGreaterThanOrEqual(first.updatedAt);
  });

  it('persists to localStorage', () => {
    upsertTodayEntry({ arrivedAt: 1000 });
    const stored = getAllEntries();
    expect(stored).toHaveLength(1);
    expect(stored[0].arrivedAt).toBe(1000);
  });

  it('does not create duplicate entries', () => {
    upsertTodayEntry({ arrivedAt: 1000 });
    upsertTodayEntry({ departedAt: 5000 });
    expect(getAllEntries()).toHaveLength(1);
  });
});

describe('replaceTodayEntry', () => {
  it('replaces today\'s entry entirely', () => {
    const original = upsertTodayEntry({ arrivedAt: 1000 });
    const modified = { ...original, arrivedAt: 2000 };
    const result = replaceTodayEntry(modified);
    expect(result.arrivedAt).toBe(2000);
    expect(getTodayEntry().arrivedAt).toBe(2000);
  });

  it('preserves other days\' entries', () => {
    const yesterday = { id: '99', date: '2026-03-26', arrivedAt: 500, departedAt: 600, breaks: [], createdAt: 1, updatedAt: 1 };
    localStorage.setItem('tt_entries', JSON.stringify([yesterday]));
    const today = { id: '1', date: '2026-03-27', arrivedAt: 1000, departedAt: null, breaks: [], createdAt: 1, updatedAt: 1 };
    replaceTodayEntry(today);

    const all = getAllEntries();
    expect(all).toHaveLength(2);
    expect(all.find((e) => e.date === '2026-03-26')).toEqual(yesterday);
  });
});
