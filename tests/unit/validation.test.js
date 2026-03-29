import { describe, expect, it } from 'vitest';
import {
  validateDateRange,
  validateImportStructure,
  validatePunchStateMachine,
  validateRequired,
  validateTimeOrder,
  validateUniqueName,
} from '../../js/utils/validation.js';

describe('validation helpers', () => {
  it('validateRequired detects empty values', () => {
    expect(validateRequired('', 'Champ requis')).toEqual({ valid: false, error: 'Champ requis' });
    expect(validateRequired('ok')).toEqual({ valid: true, error: '' });
  });

  it('validateUniqueName enforces uniqueness and whitespace-only guard', () => {
    const existing = [{ id: 'p1', name: 'Alpha' }];
    expect(validateUniqueName('alpha', existing).valid).toBe(false);
    expect(validateUniqueName('   ', existing).error).toContain('espaces');
    expect(validateUniqueName('Beta', existing).valid).toBe(true);
  });

  it('validateDateRange rejects inverted ranges', () => {
    const result = validateDateRange('2026-03-29T10:00:00.000Z', '2026-03-29T09:00:00.000Z');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('après');
  });

  it('validateTimeOrder enforces strict chronology', () => {
    const result = validateTimeOrder([
      { label: 'Arrivée', value: 100 },
      { label: 'Pause', value: 200 },
      { label: 'Départ', value: 150 },
    ]);
    expect(result.valid).toBe(false);
  });

  it('validatePunchStateMachine rejects inconsistent additions', () => {
    const entry = {
      arrivedAt: 100,
      departedAt: null,
      breaks: [{ startAt: 200, endAt: null }],
    };
    expect(validatePunchStateMachine(entry, { type: 'departure' }).valid).toBe(false);
    expect(validatePunchStateMachine(entry, { type: 'breakEnd' }).valid).toBe(true);
  });

  it('validateImportStructure checks version and arrays', () => {
    expect(validateImportStructure({ version: 2 }).valid).toBe(false);
    expect(validateImportStructure({
      version: 1,
      range: { start: '2026-03-23', end: '2026-03-29' },
      punches: [],
      projects: [],
      sessions: [],
    }).valid).toBe(true);
  });
});
