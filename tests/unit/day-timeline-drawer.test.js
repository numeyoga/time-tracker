import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getEntryByDate } from '../../js/storage/entries.js';
import { computeTimelineSegmentsForDate } from '../../js/components/timeline-overview.js';

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value); },
    clear: () => { store = {}; },
  };
})();

vi.stubGlobal('localStorage', localStorageMock);

beforeEach(() => {
  localStorageMock.clear();
});

describe('day timeline support', () => {
  it('reads an entry by ISO date', () => {
    localStorageMock.setItem('tt_entries', JSON.stringify([{ id: 'e1', date: '2026-03-23', arrivedAt: 1, departedAt: 2, breaks: [] }]));
    expect(getEntryByDate('2026-03-23')?.id).toBe('e1');
  });

  it('computes timeline segments for an arbitrary date', () => {
    localStorageMock.setItem('tt_entries', JSON.stringify([{ id: 'e1', date: '2026-03-23', arrivedAt: new Date('2026-03-23T09:00:00.000Z').getTime(), departedAt: new Date('2026-03-23T11:00:00.000Z').getTime(), breaks: [] }]));
    localStorageMock.setItem('time-tracker-projects', JSON.stringify([{ id: 'proj_a', name: 'Alpha', createdAt: '2026-03-23T08:00:00.000Z' }]));
    localStorageMock.setItem('time-tracker-sessions', JSON.stringify([{ id: 's1', projectId: 'proj_a', startedAt: '2026-03-23T09:00:00.000Z', endedAt: '2026-03-23T11:00:00.000Z', duration: 7_200_000 }]));

    const timeline = computeTimelineSegmentsForDate('2026-03-23', new Date('2026-03-23T11:00:00.000Z').getTime());
    expect(timeline?.segments).toHaveLength(1);
    expect(timeline?.segments[0].label).toBe('Alpha');
  });
});
