import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addPunchToEntry,
  applyPunchTimeEdit,
  filterEntriesForManagement,
  validatePunchChronology,
} from '../../js/components/entry-management-drawer.js';

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value); },
    clear: () => { store = {}; },
  };
})();

vi.stubGlobal('localStorage', localStorageMock);
vi.stubGlobal('crypto', { randomUUID: () => 'uuid-test' });

beforeEach(() => {
  localStorageMock.clear();
});

describe('entry management drawer helpers', () => {
  it('filters entries by report period in descending order', () => {
    const entries = [
      { date: '2026-03-29', arrivedAt: 1, departedAt: 2, breaks: [] },
      { date: '2026-03-25', arrivedAt: 1, departedAt: 2, breaks: [] },
      { date: '2026-02-20', arrivedAt: 1, departedAt: 2, breaks: [] },
    ];

    const filtered = filterEntriesForManagement(entries, {
      mode: 'week',
      anchorDate: new Date('2026-03-27T12:00:00.000Z'),
    });

    expect(filtered.map((entry) => entry.date)).toEqual(['2026-03-29', '2026-03-25']);
  });

  it('adds a departure only when chronology is valid', () => {
    const result = addPunchToEntry({
      id: 'e1',
      date: '2026-03-27',
      arrivedAt: new Date('2026-03-27T08:00:00.000Z').getTime(),
      departedAt: null,
      breaks: [],
      createdAt: 1,
    }, {
      type: 'departure',
      isoDate: '2026-03-27',
      newMs: new Date('2026-03-27T17:00:00.000Z').getTime(),
    });

    expect(result.error).toBeUndefined();
    expect(result.entry.departedAt).toBe(new Date('2026-03-27T17:00:00.000Z').getTime());
  });

  it('rejects an inline edit that breaks chronology', () => {
    const entry = {
      id: 'e1',
      date: '2026-03-27',
      arrivedAt: new Date('2026-03-27T08:00:00.000Z').getTime(),
      departedAt: new Date('2026-03-27T17:00:00.000Z').getTime(),
      breaks: [],
      createdAt: 1,
    };

    expect(validatePunchChronology(entry)).toBe(true);
    const updated = applyPunchTimeEdit(
      entry,
      'departure',
      null,
      new Date('2026-03-27T07:00:00.000Z').getTime(),
    );
    expect(updated).toBeNull();
  });
});
