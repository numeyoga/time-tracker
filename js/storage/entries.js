import { todayISO } from '../utils/time.js';

const STORAGE_KEY = 'tt_entries';

/**
 * Returns all entries from localStorage (parsed array), sorted by date descending.
 * @returns {Array<object>}
 */
export const getAllEntries = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

/**
 * Writes the full entries array to localStorage.
 * @param {Array<object>} entries
 */
const saveAllEntries = (entries) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

const sortEntries = (entries) => [...entries].sort((a, b) => b.date.localeCompare(a.date));

const isEntryEmpty = (entry) =>
  entry?.arrivedAt == null &&
  entry?.departedAt == null &&
  (!entry?.breaks || entry.breaks.length === 0);

/**
 * Returns today's entry or null if none exists.
 * @returns {object|null}
 */
export const getTodayEntry = () => {
  const today = todayISO();
  return getAllEntries().find((e) => e.date === today) ?? null;
};

/**
 * Returns the entry for a specific ISO date or null.
 * @param {string} isoDate
 * @returns {object|null}
 */
export const getEntryByDate = (isoDate) =>
  getAllEntries().find((entry) => entry.date === isoDate) ?? null;

/**
 * Replaces or deletes an entry for a specific date.
 * Empty entries are removed from storage.
 * @param {object} entry
 * @returns {object|null}
 */
export const replaceEntry = (entry) => {
  const entries = getAllEntries();
  const idx = entries.findIndex((item) => item.date === entry.date);

  if (isEntryEmpty(entry)) {
    if (idx !== -1) {
      const nextEntries = [...entries];
      nextEntries.splice(idx, 1);
      saveAllEntries(sortEntries(nextEntries));
    }
    return null;
  }

  const now = Date.now();
  const updated = {
    id: entry.id ?? crypto.randomUUID(),
    breaks: entry.breaks ?? [],
    createdAt: entry.createdAt ?? now,
    ...entry,
    updatedAt: now,
  };

  if (idx === -1) {
    saveAllEntries(sortEntries([updated, ...entries]));
  } else {
    const nextEntries = [...entries];
    nextEntries[idx] = updated;
    saveAllEntries(sortEntries(nextEntries));
  }

  return updated;
};

/**
 * Deletes the entry for a specific ISO date.
 * @param {string} isoDate
 */
export const deleteEntryByDate = (isoDate) => {
  const entries = getAllEntries();
  const idx = entries.findIndex((entry) => entry.date === isoDate);
  if (idx === -1) return;
  const nextEntries = [...entries];
  nextEntries.splice(idx, 1);
  saveAllEntries(sortEntries(nextEntries));
};

/**
 * Creates or updates today's entry with the given patch.
 * Always updates updatedAt. Creates id/createdAt on first creation.
 * Returns the new entry object.
 * @param {Partial<object>} patch
 * @returns {object}
 */
export const upsertTodayEntry = (patch) => {
  const today = todayISO();
  const entries = getAllEntries();
  const idx = entries.findIndex((e) => e.date === today);
  const now = Date.now();

  if (idx === -1) {
    const newEntry = {
      id: crypto.randomUUID(),
      date: today,
      arrivedAt: null,
      departedAt: null,
      breaks: [],
      createdAt: now,
      updatedAt: now,
      ...patch,
    };
    saveAllEntries([newEntry, ...entries]);
    return newEntry;
  }

  const updated = { ...entries[idx], ...patch, updatedAt: now };
  const newEntries = [...entries];
  newEntries[idx] = updated;
  saveAllEntries(newEntries);
  return updated;
};

/**
 * Replaces today's entry entirely (used after manual time edit).
 * @param {object} entry
 * @returns {object}
 */
export const replaceTodayEntry = (entry) => {
  return replaceEntry({ ...entry, date: todayISO() });
};
