const STORAGE_KEY = 'time-tracker-sessions';
const MULTI_KEY = 'time-tracker-multi-project';

// ============================================================
// Low-level persistence
// ============================================================

const readAll = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const saveAll = (sessions) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
};

// ============================================================
// Queries
// ============================================================

/**
 * Returns all sessions from localStorage.
 * @returns {Array<{id: string, projectId: string, startedAt: string, endedAt: string|null, duration: number|null}>}
 */
export const getAllSessions = () => readAll();

/**
 * Returns all currently active (running) sessions.
 * @returns {Array}
 */
export const getActiveSessions = () =>
  readAll().filter((s) => s.endedAt == null);

/**
 * Returns the active session for a given project, or null.
 * @param {string} projectId
 * @returns {object|null}
 */
export const getActiveSessionForProject = (projectId) =>
  getActiveSessions().find((s) => s.projectId === projectId) ?? null;

/**
 * Returns all sessions for a project, sorted by startedAt descending.
 * @param {string} projectId
 * @returns {Array}
 */
export const getSessionsForProject = (projectId) =>
  readAll()
    .filter((s) => s.projectId === projectId)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

/**
 * Returns today's total duration in ms for a project (completed + active).
 * @param {string} projectId
 * @returns {number}
 */
export const getTodayDurationForProject = (projectId) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayMs = todayStart.getTime();

  return readAll()
    .filter((s) => s.projectId === projectId && new Date(s.startedAt).getTime() >= todayMs)
    .reduce((acc, s) => {
      if (s.endedAt != null) return acc + (s.duration ?? 0);
      return acc + (Date.now() - new Date(s.startedAt).getTime());
    }, 0);
};

// ============================================================
// Commands
// ============================================================

/**
 * Starts a new session for a project. Returns the created session.
 * @param {string} projectId
 * @returns {object}
 */
export const startSession = (projectId) => {
  const session = {
    id: `sess_${crypto.randomUUID()}`,
    projectId,
    startedAt: new Date().toISOString(),
    endedAt: null,
    duration: null,
  };
  saveAll([...readAll(), session]);
  return session;
};

/**
 * Creates a completed manual session.
 * @param {object} input
 * @param {string} input.projectId
 * @param {string} input.startedAt
 * @param {string} input.endedAt
 * @returns {object}
 */
export const createManualSession = ({ projectId, startedAt, endedAt }) => {
  const startMs = new Date(startedAt).getTime();
  const endMs = new Date(endedAt).getTime();

  if (!projectId) throw new Error('Veuillez sélectionner un projet');
  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) {
    throw new Error('La session manuelle est invalide.');
  }

  const session = {
    id: `sess_${crypto.randomUUID()}`,
    projectId,
    startedAt,
    endedAt,
    duration: endMs - startMs,
  };

  saveAll([...readAll(), session]);
  return session;
};

/**
 * Stops a session by id. Returns the updated session, or null if not found.
 * @param {string} sessionId
 * @returns {object|null}
 */
export const stopSession = (sessionId) => {
  const sessions = readAll();
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx === -1) return null;

  const s = sessions[idx];
  if (s.endedAt != null) return s; // already stopped

  const endedAt = new Date().toISOString();
  const duration = new Date(endedAt).getTime() - new Date(s.startedAt).getTime();
  const updated = { ...s, endedAt, duration };
  const next = [...sessions];
  next[idx] = updated;
  saveAll(next);
  return updated;
};

/**
 * Stops all active sessions. Returns the count of sessions stopped.
 * @returns {number}
 */
export const stopAllActiveSessions = () => {
  const sessions = readAll();
  const now = new Date().toISOString();
  let count = 0;

  const updated = sessions.map((s) => {
    if (s.endedAt != null) return s;
    count++;
    const duration = new Date(now).getTime() - new Date(s.startedAt).getTime();
    return { ...s, endedAt: now, duration };
  });

  if (count > 0) saveAll(updated);
  return count;
};

/**
 * Stops the active session for a given project. Returns the session or null.
 * @param {string} projectId
 * @returns {object|null}
 */
export const stopSessionForProject = (projectId) => {
  const active = getActiveSessionForProject(projectId);
  if (!active) return null;
  return stopSession(active.id);
};

/**
 * Deletes all sessions for a given project (used when deleting a project).
 * @param {string} projectId
 * @returns {number} count of deleted sessions
 */
export const deleteSessionsForProject = (projectId) => {
  const sessions = readAll();
  const filtered = sessions.filter((s) => s.projectId !== projectId);
  const count = sessions.length - filtered.length;
  if (count > 0) saveAll(filtered);
  return count;
};

/**
 * Updates a session times and recalculates duration when ended.
 * @param {string} sessionId
 * @param {object} patch
 * @param {string} patch.startedAt
 * @param {string|null} patch.endedAt
 * @returns {object|null}
 */
export const updateSession = (sessionId, { startedAt, endedAt }) => {
  const sessions = readAll();
  const index = sessions.findIndex((session) => session.id === sessionId);
  if (index === -1) return null;

  const startMs = new Date(startedAt).getTime();
  const endMs = endedAt == null ? null : new Date(endedAt).getTime();
  if (Number.isNaN(startMs) || (endMs != null && (Number.isNaN(endMs) || endMs <= startMs))) {
    throw new Error('La session est invalide.');
  }

  const nextSession = {
    ...sessions[index],
    startedAt,
    endedAt,
    duration: endMs == null ? null : endMs - startMs,
  };

  const next = [...sessions];
  next[index] = nextSession;
  saveAll(next);
  return nextSession;
};

/**
 * Deletes a single session by id.
 * @param {string} sessionId
 * @returns {boolean}
 */
export const deleteSession = (sessionId) => {
  const sessions = readAll();
  const filtered = sessions.filter((session) => session.id !== sessionId);
  if (filtered.length === sessions.length) return false;
  saveAll(filtered);
  return true;
};

// ============================================================
// Multi-project toggle preference
// ============================================================

/**
 * Returns whether multi-project mode is enabled (default: true).
 * @returns {boolean}
 */
export const isMultiProjectEnabled = () => {
  const val = localStorage.getItem(MULTI_KEY);
  return val !== 'false'; // default true
};

/**
 * Sets the multi-project preference.
 * @param {boolean} enabled
 */
export const setMultiProjectEnabled = (enabled) => {
  localStorage.setItem(MULTI_KEY, String(enabled));
};
