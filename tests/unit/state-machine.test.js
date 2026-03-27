import { describe, it, expect, vi } from 'vitest';
import { deriveState, applyEvent } from '../../js/components/punch-clock.js';

// Fixtures
const idleEntry = () => ({
  id: '1',
  date: '2026-03-27',
  arrivedAt: null,
  departedAt: null,
  breaks: [],
  createdAt: 1000,
  updatedAt: 1000,
});

const arrivedEntry = () => ({
  ...idleEntry(),
  arrivedAt: 1_000_000,
});

const onBreakEntry = () => ({
  ...arrivedEntry(),
  breaks: [{ startAt: 2_000_000, endAt: null }],
});

const breakEndedEntry = () => ({
  ...arrivedEntry(),
  breaks: [{ startAt: 2_000_000, endAt: 3_000_000 }],
});

const departedEntry = () => ({
  ...arrivedEntry(),
  departedAt: 5_000_000,
});

// ============================================================
// deriveState
// ============================================================
describe('deriveState', () => {
  it('returns IDLE for null', () => {
    expect(deriveState(null)).toBe('IDLE');
  });

  it('returns IDLE when arrivedAt is null', () => {
    expect(deriveState(idleEntry())).toBe('IDLE');
  });

  it('returns PRESENT when arrived, not departed, no break in progress', () => {
    expect(deriveState(arrivedEntry())).toBe('PRESENT');
  });

  it('returns PRESENT when all breaks are closed', () => {
    expect(deriveState(breakEndedEntry())).toBe('PRESENT');
  });

  it('returns ON_BREAK when last break has no endAt', () => {
    expect(deriveState(onBreakEntry())).toBe('ON_BREAK');
  });

  it('returns DEPARTED when departedAt is set', () => {
    expect(deriveState(departedEntry())).toBe('DEPARTED');
  });
});

// ============================================================
// applyEvent — valid transitions
// ============================================================
describe('applyEvent — valid transitions', () => {
  it('ARRIVE from IDLE sets arrivedAt', () => {
    const before = Date.now();
    const result = applyEvent(null, 'ARRIVE');
    const after = Date.now();
    expect(result.arrivedAt).toBeGreaterThanOrEqual(before);
    expect(result.arrivedAt).toBeLessThanOrEqual(after);
    expect(result.departedAt).toBeNull();
    expect(result.breaks).toEqual([]);
  });

  it('ARRIVE preserves existing breaks array', () => {
    const result = applyEvent(idleEntry(), 'ARRIVE');
    expect(result.breaks).toEqual([]);
  });

  it('DEPART from PRESENT sets departedAt', () => {
    const before = Date.now();
    const result = applyEvent(arrivedEntry(), 'DEPART');
    const after = Date.now();
    expect(result.departedAt).toBeGreaterThanOrEqual(before);
    expect(result.departedAt).toBeLessThanOrEqual(after);
  });

  it('DEPART preserves arrivedAt', () => {
    const entry = arrivedEntry();
    const result = applyEvent(entry, 'DEPART');
    expect(result.arrivedAt).toBe(entry.arrivedAt);
  });

  it('START_BREAK from PRESENT adds a break with endAt null', () => {
    const before = Date.now();
    const result = applyEvent(arrivedEntry(), 'START_BREAK');
    const after = Date.now();
    expect(result.breaks).toHaveLength(1);
    expect(result.breaks[0].startAt).toBeGreaterThanOrEqual(before);
    expect(result.breaks[0].startAt).toBeLessThanOrEqual(after);
    expect(result.breaks[0].endAt).toBeNull();
  });

  it('START_BREAK adds to existing breaks', () => {
    const entry = breakEndedEntry();
    const result = applyEvent(entry, 'START_BREAK');
    expect(result.breaks).toHaveLength(2);
    expect(result.breaks[1].endAt).toBeNull();
  });

  it('END_BREAK from ON_BREAK sets endAt on last break', () => {
    const before = Date.now();
    const result = applyEvent(onBreakEntry(), 'END_BREAK');
    const after = Date.now();
    expect(result.breaks[0].endAt).toBeGreaterThanOrEqual(before);
    expect(result.breaks[0].endAt).toBeLessThanOrEqual(after);
  });

  it('END_BREAK does not mutate previous breaks', () => {
    const entry = {
      ...arrivedEntry(),
      breaks: [
        { startAt: 1_000, endAt: 2_000 },
        { startAt: 3_000, endAt: null },
      ],
    };
    const result = applyEvent(entry, 'END_BREAK');
    expect(result.breaks[0]).toEqual(entry.breaks[0]); // unchanged
    expect(result.breaks[1].endAt).not.toBeNull();
  });
});

// ============================================================
// applyEvent — invalid transitions (must throw)
// ============================================================
describe('applyEvent — invalid transitions', () => {
  it('ARRIVE from PRESENT throws', () => {
    expect(() => applyEvent(arrivedEntry(), 'ARRIVE')).toThrow('ARRIVE invalid in state PRESENT');
  });

  it('ARRIVE from ON_BREAK throws', () => {
    expect(() => applyEvent(onBreakEntry(), 'ARRIVE')).toThrow('ARRIVE invalid in state ON_BREAK');
  });

  it('ARRIVE from DEPARTED throws', () => {
    expect(() => applyEvent(departedEntry(), 'ARRIVE')).toThrow('ARRIVE invalid in state DEPARTED');
  });

  it('DEPART from IDLE throws', () => {
    expect(() => applyEvent(null, 'DEPART')).toThrow('DEPART invalid in state IDLE');
  });

  it('DEPART from ON_BREAK throws', () => {
    expect(() => applyEvent(onBreakEntry(), 'DEPART')).toThrow('DEPART invalid in state ON_BREAK');
  });

  it('DEPART from DEPARTED throws', () => {
    expect(() => applyEvent(departedEntry(), 'DEPART')).toThrow('DEPART invalid in state DEPARTED');
  });

  it('START_BREAK from IDLE throws', () => {
    expect(() => applyEvent(null, 'START_BREAK')).toThrow('START_BREAK invalid in state IDLE');
  });

  it('START_BREAK from ON_BREAK throws', () => {
    expect(() => applyEvent(onBreakEntry(), 'START_BREAK')).toThrow('START_BREAK invalid in state ON_BREAK');
  });

  it('START_BREAK from DEPARTED throws', () => {
    expect(() => applyEvent(departedEntry(), 'START_BREAK')).toThrow('START_BREAK invalid in state DEPARTED');
  });

  it('END_BREAK from IDLE throws', () => {
    expect(() => applyEvent(null, 'END_BREAK')).toThrow('END_BREAK invalid in state IDLE');
  });

  it('END_BREAK from PRESENT throws', () => {
    expect(() => applyEvent(arrivedEntry(), 'END_BREAK')).toThrow('END_BREAK invalid in state PRESENT');
  });

  it('END_BREAK from DEPARTED throws', () => {
    expect(() => applyEvent(departedEntry(), 'END_BREAK')).toThrow('END_BREAK invalid in state DEPARTED');
  });

  it('unknown event throws', () => {
    expect(() => applyEvent(null, 'TELEPORT')).toThrow('Unknown event: TELEPORT');
  });
});

// ============================================================
// Immutability — applyEvent must not mutate the original
// ============================================================
describe('applyEvent — immutability', () => {
  it('does not mutate the original entry on DEPART', () => {
    const entry = arrivedEntry();
    const original = structuredClone(entry);
    applyEvent(entry, 'DEPART');
    expect(entry).toEqual(original);
  });

  it('does not mutate the original breaks array on START_BREAK', () => {
    const entry = arrivedEntry();
    const originalBreaks = [...entry.breaks];
    applyEvent(entry, 'START_BREAK');
    expect(entry.breaks).toEqual(originalBreaks);
  });

  it('does not mutate the original entry on END_BREAK', () => {
    const entry = onBreakEntry();
    const original = structuredClone(entry);
    applyEvent(entry, 'END_BREAK');
    expect(entry).toEqual(original);
  });
});
