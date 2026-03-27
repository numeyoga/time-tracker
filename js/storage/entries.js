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

/**
 * Returns today's entry or null if none exists.
 * @returns {object|null}
 */
export const getTodayEntry = () => {
  const today = todayISO();
  return getAllEntries().find((e) => e.date === today) ?? null;
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
  const today = todayISO();
  const entries = getAllEntries();
  const idx = entries.findIndex((e) => e.date === today);
  const now = Date.now();
  const updated = { ...entry, updatedAt: now };

  if (idx === -1) {
    saveAllEntries([updated, ...entries]);
  } else {
    const newEntries = [...entries];
    newEntries[idx] = updated;
    saveAllEntries(newEntries);
  }

  return updated;
};
