import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  todayISO,
  msToHHMM,
  formatDuration,
  timeStrToMs,
  computeTotalBreakDuration,
  computeNetPresence,
} from '../../js/utils/time.js';

// Fixed "now" for deterministic tests: 2026-03-27 08:00:00 UTC+1
const FIXED_NOW = new Date('2026-03-27T08:00:00').getTime();
const FIXED_DATE = new Date('2026-03-27T08:00:00');

describe('todayISO', () => {
  it('returns a string matching YYYY-MM-DD', () => {
    const result = todayISO();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('msToHHMM', () => {
  it('returns "—" for null', () => {
    expect(msToHHMM(null)).toBe('—');
  });

  it('returns "—" for undefined', () => {
    expect(msToHHMM(undefined)).toBe('—');
  });

  it('converts a timestamp to HH:MM', () => {
    // 2026-03-27 08:32 local
    const ts = new Date('2026-03-27T08:32:00').getTime();
    expect(msToHHMM(ts)).toBe('08:32');
  });

  it('pads single-digit hours and minutes', () => {
    const ts = new Date('2026-03-27T09:05:00').getTime();
    expect(msToHHMM(ts)).toBe('09:05');
  });
});

describe('formatDuration', () => {
  it('returns "—" for null', () => {
    expect(formatDuration(null)).toBe('—');
  });

  it('returns "—" for 0', () => {
    expect(formatDuration(0)).toBe('—');
  });

  it('returns "—" for negative values', () => {
    expect(formatDuration(-1000)).toBe('—');
  });

  it('converts 1h30 correctly', () => {
    expect(formatDuration(5_400_000)).toBe('1h30');
  });

  it('converts 0h30 correctly', () => {
    expect(formatDuration(1_800_000)).toBe('0h30');
  });

  it('converts 0h01 correctly', () => {
    expect(formatDuration(60_000)).toBe('0h01');
  });

  it('pads minutes to 2 digits', () => {
    expect(formatDuration(3_660_000)).toBe('1h01');
  });
});

describe('timeStrToMs', () => {
  it('converts "08:30" to a timestamp at 08:30 on the reference date', () => {
    const ts = timeStrToMs('08:30', FIXED_DATE);
    const result = new Date(ts);
    expect(result.getHours()).toBe(8);
    expect(result.getMinutes()).toBe(30);
    expect(result.getSeconds()).toBe(0);
  });

  it('converts "00:00" correctly', () => {
    const ts = timeStrToMs('00:00', FIXED_DATE);
    const result = new Date(ts);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
  });

  it('converts "23:59" correctly', () => {
    const ts = timeStrToMs('23:59', FIXED_DATE);
    const result = new Date(ts);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
  });
});

describe('computeTotalBreakDuration', () => {
  it('returns 0 for entry with no breaks', () => {
    expect(computeTotalBreakDuration({ breaks: [] })).toBe(0);
  });

  it('returns 0 for null entry', () => {
    expect(computeTotalBreakDuration(null)).toBe(0);
  });

  it('sums two closed breaks', () => {
    const entry = {
      breaks: [
        { startAt: 1000, endAt: 2800 }, // 1800ms = 30min
        { startAt: 5000, endAt: 6800 }, // 1800ms = 30min
      ],
    };
    expect(computeTotalBreakDuration(entry)).toBe(3600);
  });

  it('counts an in-progress break using Date.now()', () => {
    const startAt = Date.now() - 60_000; // started 1min ago
    const entry = { breaks: [{ startAt, endAt: null }] };
    const result = computeTotalBreakDuration(entry);
    // Should be approximately 60000ms, allow ±500ms tolerance
    expect(result).toBeGreaterThanOrEqual(59_000);
    expect(result).toBeLessThanOrEqual(61_000);
  });
});

describe('computeNetPresence', () => {
  it('returns null for null entry', () => {
    expect(computeNetPresence(null)).toBeNull();
  });

  it('returns null when arrivedAt is null', () => {
    expect(computeNetPresence({ arrivedAt: null, departedAt: null, breaks: [] })).toBeNull();
  });

  it('computes presence with no breaks', () => {
    const entry = {
      arrivedAt: 0,
      departedAt: 3_600_000, // 1h
      breaks: [],
    };
    expect(computeNetPresence(entry)).toBe(3_600_000);
  });

  it('deducts break duration from presence', () => {
    const entry = {
      arrivedAt: 0,
      departedAt: 3_600_000, // 1h
      breaks: [{ startAt: 1_000_000, endAt: 1_600_000 }], // 10min break
    };
    expect(computeNetPresence(entry)).toBe(3_000_000); // 50min
  });

  it('uses Date.now() as upper bound when no departure', () => {
    const arrivedAt = Date.now() - 3_600_000; // arrived 1h ago
    const entry = { arrivedAt, departedAt: null, breaks: [] };
    const result = computeNetPresence(entry);
    expect(result).toBeGreaterThanOrEqual(3_590_000);
    expect(result).toBeLessThanOrEqual(3_610_000);
  });

  it('returns 0 for negative values (clock correction edge case)', () => {
    const entry = {
      arrivedAt: 1000,
      departedAt: 500, // departure before arrival — should not go negative
      breaks: [],
    };
    expect(computeNetPresence(entry)).toBe(0);
  });
});
