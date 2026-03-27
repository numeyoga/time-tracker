/**
 * Pure time/date utility functions.
 * All functions are stateless — no side effects, no DOM access.
 */

/**
 * Returns today's date as "YYYY-MM-DD" (local time).
 * @returns {string}
 */
export const todayISO = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Converts a ms timestamp to "HH:MM" local-time string.
 * Returns "—" if ts is null or undefined.
 * @param {number|null|undefined} ts
 * @returns {string}
 */
export const msToHHMM = (ts) => {
  if (ts == null) return '—';
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};

/**
 * Converts a duration in ms to a human-readable string.
 * Examples: 5400000 → "1h30", 1800000 → "0h30", 60000 → "0h01"
 * Returns "—" if ms is null, 0 or negative.
 * @param {number|null} ms
 * @returns {string}
 */
export const formatDuration = (ms) => {
  if (!ms || ms <= 0) return '—';
  const totalMinutes = Math.floor(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h${String(minutes).padStart(2, '0')}`;
};

/**
 * Parses "HH:MM" time string and combines with a reference date
 * to produce a ms timestamp (same calendar day as refDate).
 * @param {string} timeStr — "HH:MM"
 * @param {Date} [refDate] — defaults to today
 * @returns {number} ms timestamp
 */
export const timeStrToMs = (timeStr, refDate = new Date()) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const d = new Date(refDate);
  d.setHours(hours, minutes, 0, 0);
  return d.getTime();
};

/**
 * Computes total break duration in ms from an entry.
 * Counts in-progress break using Date.now() as endAt.
 * @param {{ breaks: Array<{ startAt: number, endAt: number|null }> }} entry
 * @returns {number}
 */
export const computeTotalBreakDuration = (entry) => {
  if (!entry?.breaks?.length) return 0;
  return entry.breaks.reduce((acc, b) => {
    const end = b.endAt ?? Date.now();
    return acc + (end - b.startAt);
  }, 0);
};

/**
 * Computes net presence duration in ms from an entry.
 * Uses Date.now() as the right bound when the entry is still open.
 * Returns null if arrivedAt is null.
 * @param {object|null} entry
 * @returns {number|null}
 */
export const computeNetPresence = (entry) => {
  if (entry?.arrivedAt == null) return null;
  const end = entry.departedAt ?? Date.now();
  const totalBreak = computeTotalBreakDuration(entry);
  return Math.max(0, end - entry.arrivedAt - totalBreak);
};

/**
 * Formats a date string "YYYY-MM-DD" to a localised French display string.
 * Example: "2026-03-27" → "vendredi 27 mars 2026"
 * @param {string} isoDate
 * @returns {string}
 */
export const formatDateLong = (isoDate) => {
  const d = new Date(`${isoDate}T00:00:00`);
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};
