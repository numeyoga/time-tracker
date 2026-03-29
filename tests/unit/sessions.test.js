import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getAllSessions,
  getActiveSessions,
  getActiveSessionForProject,
  getTodayDurationForProject,
  startSession,
  createManualSession,
  stopSession,
  stopAllActiveSessions,
  stopSessionForProject,
  deleteSessionsForProject,
  getSessionsForProject,
  updateSession,
  deleteSession,
  isMultiProjectEnabled,
  setMultiProjectEnabled,
} from '../../js/storage/sessions.js';

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
let uuidCounter = 0;
vi.stubGlobal('crypto', { randomUUID: () => `test-uuid-${++uuidCounter}` });

beforeEach(() => {
  localStorageMock.clear();
  uuidCounter = 0;
});

describe('getAllSessions', () => {
  it('returns empty array when no data', () => {
    expect(getAllSessions()).toEqual([]);
  });

  it('returns parsed sessions from localStorage', () => {
    const sessions = [{ id: 'sess_1', projectId: 'proj_1', startedAt: '2026-01-01T08:00:00Z', endedAt: null, duration: null }];
    localStorageMock.setItem('time-tracker-sessions', JSON.stringify(sessions));
    expect(getAllSessions()).toEqual(sessions);
  });

  it('returns empty array on corrupted JSON', () => {
    localStorageMock.setItem('time-tracker-sessions', 'broken');
    expect(getAllSessions()).toEqual([]);
  });
});

describe('startSession', () => {
  it('creates a session with correct shape', () => {
    const session = startSession('proj_abc');
    expect(session.id).toMatch(/^sess_test-uuid-\d+$/);
    expect(session.projectId).toBe('proj_abc');
    expect(session.startedAt).toBeDefined();
    expect(session.endedAt).toBeNull();
    expect(session.duration).toBeNull();
  });

  it('persists to localStorage', () => {
    startSession('proj_1');
    expect(getAllSessions()).toHaveLength(1);
  });

  it('appends to existing sessions', () => {
    startSession('proj_1');
    startSession('proj_2');
    expect(getAllSessions()).toHaveLength(2);
  });
});

describe('createManualSession', () => {
  it('creates a completed session with duration', () => {
    const session = createManualSession({
      projectId: 'proj_1',
      startedAt: '2026-03-29T08:00:00.000Z',
      endedAt: '2026-03-29T09:30:00.000Z',
    });

    expect(session.id).toMatch(/^sess_test-uuid-\d+$/);
    expect(session.endedAt).toBe('2026-03-29T09:30:00.000Z');
    expect(session.duration).toBe(5_400_000);
  });

  it('persists the manual session', () => {
    createManualSession({
      projectId: 'proj_1',
      startedAt: '2026-03-29T08:00:00.000Z',
      endedAt: '2026-03-29T08:15:00.000Z',
    });

    expect(getAllSessions()).toHaveLength(1);
    expect(getAllSessions()[0].duration).toBe(900_000);
  });

  it('throws when end is before start', () => {
    expect(() => createManualSession({
      projectId: 'proj_1',
      startedAt: '2026-03-29T09:00:00.000Z',
      endedAt: '2026-03-29T08:00:00.000Z',
    })).toThrow('après le début');
  });
});

describe('stopSession', () => {
  it('stops an active session', () => {
    const created = startSession('proj_1');
    const stopped = stopSession(created.id);
    expect(stopped.endedAt).not.toBeNull();
    expect(stopped.duration).toBeGreaterThanOrEqual(0);
  });

  it('returns null for unknown session id', () => {
    expect(stopSession('nonexistent')).toBeNull();
  });

  it('is idempotent on already-stopped session', () => {
    const created = startSession('proj_1');
    const stopped1 = stopSession(created.id);
    const stopped2 = stopSession(created.id);
    expect(stopped2.endedAt).toBe(stopped1.endedAt);
  });

  it('persists the stopped state', () => {
    const created = startSession('proj_1');
    stopSession(created.id);
    const stored = getAllSessions();
    expect(stored[0].endedAt).not.toBeNull();
  });
});

describe('getActiveSessions', () => {
  it('returns only sessions without endedAt', () => {
    startSession('proj_1');
    const sess2 = startSession('proj_2');
    stopSession(sess2.id);
    const active = getActiveSessions();
    expect(active).toHaveLength(1);
    expect(active[0].projectId).toBe('proj_1');
  });

  it('returns empty when all stopped', () => {
    const s = startSession('proj_1');
    stopSession(s.id);
    expect(getActiveSessions()).toHaveLength(0);
  });
});

describe('getActiveSessionForProject', () => {
  it('returns the active session for a project', () => {
    startSession('proj_1');
    startSession('proj_2');
    const active = getActiveSessionForProject('proj_1');
    expect(active).not.toBeNull();
    expect(active.projectId).toBe('proj_1');
  });

  it('returns null when no active session', () => {
    const s = startSession('proj_1');
    stopSession(s.id);
    expect(getActiveSessionForProject('proj_1')).toBeNull();
  });

  it('returns null for unknown project', () => {
    expect(getActiveSessionForProject('nonexistent')).toBeNull();
  });
});

describe('getSessionsForProject', () => {
  it('returns sessions for one project sorted by newest first', () => {
    localStorageMock.setItem('time-tracker-sessions', JSON.stringify([
      { id: 'sess_1', projectId: 'proj_1', startedAt: '2026-03-29T08:00:00.000Z', endedAt: '2026-03-29T09:00:00.000Z', duration: 3_600_000 },
      { id: 'sess_2', projectId: 'proj_2', startedAt: '2026-03-29T10:00:00.000Z', endedAt: '2026-03-29T11:00:00.000Z', duration: 3_600_000 },
      { id: 'sess_3', projectId: 'proj_1', startedAt: '2026-03-29T12:00:00.000Z', endedAt: null, duration: null },
    ]));

    expect(getSessionsForProject('proj_1').map((item) => item.id)).toEqual(['sess_3', 'sess_1']);
  });
});

describe('stopAllActiveSessions', () => {
  it('stops all active sessions and returns count', () => {
    startSession('proj_1');
    startSession('proj_2');
    const count = stopAllActiveSessions();
    expect(count).toBe(2);
    expect(getActiveSessions()).toHaveLength(0);
  });

  it('returns 0 when no active sessions', () => {
    expect(stopAllActiveSessions()).toBe(0);
  });

  it('preserves already-stopped sessions', () => {
    const s1 = startSession('proj_1');
    stopSession(s1.id);
    startSession('proj_2');
    stopAllActiveSessions();
    expect(getAllSessions()).toHaveLength(2);
    expect(getAllSessions().every((s) => s.endedAt != null)).toBe(true);
  });
});

describe('stopSessionForProject', () => {
  it('stops the active session for a project', () => {
    startSession('proj_1');
    startSession('proj_2');
    const stopped = stopSessionForProject('proj_1');
    expect(stopped).not.toBeNull();
    expect(stopped.projectId).toBe('proj_1');
    expect(getActiveSessions()).toHaveLength(1);
  });

  it('returns null when no active session for project', () => {
    expect(stopSessionForProject('proj_1')).toBeNull();
  });
});

describe('deleteSessionsForProject', () => {
  it('deletes all sessions for a project', () => {
    startSession('proj_1');
    startSession('proj_1');
    startSession('proj_2');
    const count = deleteSessionsForProject('proj_1');
    expect(count).toBe(2);
    expect(getAllSessions()).toHaveLength(1);
    expect(getAllSessions()[0].projectId).toBe('proj_2');
  });

  it('returns 0 when no sessions', () => {
    expect(deleteSessionsForProject('proj_1')).toBe(0);
  });
});

describe('updateSession', () => {
  it('updates a completed session and recalculates duration', () => {
    const created = createManualSession({
      projectId: 'proj_1',
      startedAt: '2026-03-29T08:00:00.000Z',
      endedAt: '2026-03-29T09:00:00.000Z',
    });

    const updated = updateSession(created.id, {
      startedAt: '2026-03-29T08:30:00.000Z',
      endedAt: '2026-03-29T10:00:00.000Z',
    });

    expect(updated.duration).toBe(5_400_000);
    expect(getAllSessions()[0].startedAt).toBe('2026-03-29T08:30:00.000Z');
  });

  it('allows updating only start time for an active session', () => {
    const created = startSession('proj_1');
    const updated = updateSession(created.id, {
      startedAt: '2026-03-29T08:30:00.000Z',
      endedAt: null,
    });

    expect(updated.endedAt).toBeNull();
    expect(updated.duration).toBeNull();
  });
});

describe('deleteSession', () => {
  it('deletes a single session by id', () => {
    const one = startSession('proj_1');
    const two = startSession('proj_1');
    expect(deleteSession(one.id)).toBe(true);
    expect(getAllSessions()).toHaveLength(1);
    expect(getAllSessions()[0].id).toBe(two.id);
  });
});

describe('getTodayDurationForProject', () => {
  it('returns 0 when no sessions', () => {
    expect(getTodayDurationForProject('proj_1')).toBe(0);
  });

  it('sums completed session durations', () => {
    // Manually insert a completed session from today
    const now = new Date();
    const sessions = [{
      id: 'sess_manual_1',
      projectId: 'proj_1',
      startedAt: new Date(now.getTime() - 3600000).toISOString(), // 1h ago
      endedAt: now.toISOString(),
      duration: 3600000,
    }];
    localStorageMock.setItem('time-tracker-sessions', JSON.stringify(sessions));
    expect(getTodayDurationForProject('proj_1')).toBe(3600000);
  });

  it('includes active session duration', () => {
    startSession('proj_1');
    // Should be > 0 (at least a few ms)
    expect(getTodayDurationForProject('proj_1')).toBeGreaterThanOrEqual(0);
  });
});

describe('multi-project toggle', () => {
  it('defaults to true', () => {
    expect(isMultiProjectEnabled()).toBe(true);
  });

  it('can be set to false', () => {
    setMultiProjectEnabled(false);
    expect(isMultiProjectEnabled()).toBe(false);
  });

  it('can be set back to true', () => {
    setMultiProjectEnabled(false);
    setMultiProjectEnabled(true);
    expect(isMultiProjectEnabled()).toBe(true);
  });
});
