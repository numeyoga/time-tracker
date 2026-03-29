import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computeReportStats } from '../../js/components/report-stats.js';

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

describe('computeReportStats', () => {
  it('computes weekly KPI and table totals', () => {
    localStorageMock.setItem('time-tracker-projects', JSON.stringify([
      { id: 'proj_a', name: 'Alpha', createdAt: '2026-03-23T07:00:00.000Z' },
      { id: 'proj_b', name: 'Beta', createdAt: '2026-03-23T07:05:00.000Z' },
    ]));
    localStorageMock.setItem('tt_entries', JSON.stringify([
      { id: 'e1', date: '2026-03-23', arrivedAt: 0, departedAt: 28_800_000, breaks: [] },
      { id: 'e2', date: '2026-03-24', arrivedAt: 0, departedAt: 25_200_000, breaks: [] },
    ]));
    localStorageMock.setItem('time-tracker-sessions', JSON.stringify([
      { id: 's1', projectId: 'proj_a', startedAt: '2026-03-23T09:00:00.000Z', endedAt: '2026-03-23T12:00:00.000Z', duration: 10_800_000 },
      { id: 's2', projectId: 'proj_b', startedAt: '2026-03-24T09:00:00.000Z', endedAt: '2026-03-24T11:00:00.000Z', duration: 7_200_000 },
    ]));

    const report = computeReportStats('week', new Date('2026-03-25T10:00:00.000Z'));
    expect(report.totalPresence).toBe(54_000_000);
    expect(report.totalProjects).toBe(18_000_000);
    expect(report.workedDays).toBe(2);
    expect(report.rows[0].project.name).toBe('Alpha');
    expect(report.rows[0].total).toBe(10_800_000);
  });

  it('computes monthly days and empty state', () => {
    const report = computeReportStats('month', new Date('2026-03-10T10:00:00.000Z'));
    expect(report.days).toHaveLength(31);
    expect(report.hasData).toBe(false);
  });
});
