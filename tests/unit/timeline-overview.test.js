import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computeTimelineSegments } from '../../js/components/timeline-overview.js';

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

describe('computeTimelineSegments', () => {
  it('returns null when no arrival is recorded', () => {
    expect(computeTimelineSegments()).toBeNull();
  });

  it('builds project, break, idle and multi segments for the day', () => {
    localStorageMock.setItem('tt_entries', JSON.stringify([{
      id: 'entry_1',
      date: '2026-03-29',
      arrivedAt: new Date('2026-03-29T09:00:00.000Z').getTime(),
      departedAt: new Date('2026-03-29T13:00:00.000Z').getTime(),
      breaks: [{ startAt: new Date('2026-03-29T10:00:00.000Z').getTime(), endAt: new Date('2026-03-29T10:15:00.000Z').getTime() }],
    }]));
    localStorageMock.setItem('time-tracker-projects', JSON.stringify([
      { id: 'proj_a', name: 'Alpha', createdAt: '2026-03-29T07:00:00.000Z' },
      { id: 'proj_b', name: 'Beta', createdAt: '2026-03-29T07:05:00.000Z' },
    ]));
    localStorageMock.setItem('time-tracker-sessions', JSON.stringify([
      { id: 'sess_1', projectId: 'proj_a', startedAt: '2026-03-29T09:00:00.000Z', endedAt: '2026-03-29T10:00:00.000Z', duration: 3_600_000 },
      { id: 'sess_2', projectId: 'proj_b', startedAt: '2026-03-29T10:15:00.000Z', endedAt: '2026-03-29T11:00:00.000Z', duration: 2_700_000 },
      { id: 'sess_3', projectId: 'proj_a', startedAt: '2026-03-29T11:30:00.000Z', endedAt: '2026-03-29T12:30:00.000Z', duration: 3_600_000 },
      { id: 'sess_4', projectId: 'proj_b', startedAt: '2026-03-29T12:00:00.000Z', endedAt: '2026-03-29T13:00:00.000Z', duration: 3_600_000 },
    ]));

    const result = computeTimelineSegments(new Date('2026-03-29T13:00:00.000Z').getTime());
    expect(result.segments.map((segment) => segment.type)).toEqual(['project', 'break', 'project', 'idle', 'project', 'multi', 'project']);
  });
});
