import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computeProjectTimeStats } from '../../js/components/project-time-overview.js';

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

describe('computeProjectTimeStats', () => {
  it('returns projects sorted by duration desc with percentage', () => {
    localStorageMock.setItem('time-tracker-projects', JSON.stringify([
      { id: 'proj_a', name: 'Alpha', createdAt: '2026-03-29T07:00:00.000Z' },
      { id: 'proj_b', name: 'Beta', createdAt: '2026-03-29T07:05:00.000Z' },
    ]));
    localStorageMock.setItem('time-tracker-sessions', JSON.stringify([
      { id: 'sess_1', projectId: 'proj_a', startedAt: '2026-03-29T09:00:00.000Z', endedAt: '2026-03-29T12:00:00.000Z', duration: 10_800_000 },
      { id: 'sess_2', projectId: 'proj_b', startedAt: '2026-03-29T13:00:00.000Z', endedAt: '2026-03-29T14:00:00.000Z', duration: 3_600_000 },
    ]));

    const stats = computeProjectTimeStats(new Date('2026-03-29T15:00:00.000Z').getTime());
    expect(stats.map((item) => item.project.name)).toEqual(['Alpha', 'Beta']);
    expect(stats[0].percent).toBe(75);
    expect(stats[1].percent).toBe(25);
  });

  it('computes overlapping parallel time per project', () => {
    localStorageMock.setItem('time-tracker-projects', JSON.stringify([
      { id: 'proj_a', name: 'Alpha', createdAt: '2026-03-29T07:00:00.000Z' },
      { id: 'proj_b', name: 'Beta', createdAt: '2026-03-29T07:05:00.000Z' },
    ]));
    localStorageMock.setItem('time-tracker-sessions', JSON.stringify([
      { id: 'sess_1', projectId: 'proj_a', startedAt: '2026-03-29T09:00:00.000Z', endedAt: '2026-03-29T11:00:00.000Z', duration: 7_200_000 },
      { id: 'sess_2', projectId: 'proj_b', startedAt: '2026-03-29T10:00:00.000Z', endedAt: '2026-03-29T12:00:00.000Z', duration: 7_200_000 },
    ]));

    const stats = computeProjectTimeStats(new Date('2026-03-29T15:00:00.000Z').getTime());
    expect(stats[0].parallelMs).toBe(3_600_000);
    expect(stats[1].parallelMs).toBe(3_600_000);
  });
});
