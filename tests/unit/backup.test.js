import { describe, expect, it } from 'vitest';
import {
  buildExportPayload,
  getExportFilename,
  parseImportPayload,
  payloadToStorageData,
} from '../../js/utils/backup.js';

describe('backup utils', () => {
  it('builds an export payload filtered by range', () => {
    const payload = buildExportPayload({
      start: '2026-03-23',
      end: '2026-03-29',
      entries: [{
        id: 'e1',
        date: '2026-03-24',
        arrivedAt: new Date('2026-03-24T09:00:00.000Z').getTime(),
        departedAt: new Date('2026-03-24T17:00:00.000Z').getTime(),
        breaks: [],
      }],
      projects: [{ id: 'proj_a', name: 'Alpha' }],
      sessions: [{
        id: 's1',
        projectId: 'proj_a',
        startedAt: '2026-03-24T09:00:00.000Z',
        endedAt: '2026-03-24T11:00:00.000Z',
        duration: 7_200_000,
      }],
      exportDate: '2026-03-29T10:00:00.000Z',
    });

    expect(payload.range).toEqual({ start: '2026-03-23', end: '2026-03-29' });
    expect(payload.projects).toHaveLength(1);
    expect(payload.sessions[0].status).toBe('completed');
    expect(payload.punches[0].entries[0].type).toBe('arrival');
  });

  it('parses and converts an import payload to storage data', () => {
    const payload = parseImportPayload(JSON.stringify({
      version: 1,
      exportDate: '2026-03-29T10:00:00.000Z',
      range: { start: '2026-03-23', end: '2026-03-29' },
      punches: [{
        date: '2026-03-24',
        entries: [
          { type: 'arrival', time: '09:00' },
          { type: 'departure', time: '17:00' },
        ],
      }],
      projects: [{ id: 'proj_a', name: 'Alpha' }],
      sessions: [{
        projectId: 'proj_a',
        date: '2026-03-24',
        start: '09:00',
        end: '11:00',
        status: 'completed',
      }],
    }));

    const storageData = payloadToStorageData(payload);
    expect(storageData.projects[0].name).toBe('Alpha');
    expect(storageData.sessions[0].duration).toBe(7_200_000);
    expect(storageData.entries[0].date).toBe('2026-03-24');
    expect(storageData.entries[0].arrivedAt).toBeTypeOf('number');
  });

  it('rejects invalid import structures', () => {
    expect(() => parseImportPayload('not-json')).toThrow('JSON valide');
    expect(() => parseImportPayload(JSON.stringify({
      version: 1,
      range: { start: '2026-03-23', end: '2026-03-29' },
      punches: [],
      projects: [{ id: 'proj_a', name: 'Alpha' }],
      sessions: [{ projectId: 'missing', date: '2026-03-24', start: '09:00', end: '11:00', status: 'completed' }],
    }))).toThrow('Structure');
  });

  it('builds the expected export filename', () => {
    expect(getExportFilename('2026-03-23', '2026-03-29')).toBe('time-tracker-export-2026-03-23-2026-03-29.json');
  });
});
