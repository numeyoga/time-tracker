import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getAllProjects,
  getProjectById,
  createProject,
  renameProject,
  deleteProject,
  validateProjectName,
} from '../../js/storage/projects.js';

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

describe('getAllProjects', () => {
  it('returns empty array when no data', () => {
    expect(getAllProjects()).toEqual([]);
  });

  it('returns parsed projects from localStorage', () => {
    const projects = [{ id: 'proj_1', name: 'Alpha', createdAt: '2026-01-01T00:00:00Z' }];
    localStorageMock.setItem('time-tracker-projects', JSON.stringify(projects));
    expect(getAllProjects()).toEqual(projects);
  });

  it('returns empty array on corrupted JSON', () => {
    localStorageMock.setItem('time-tracker-projects', 'not-json');
    expect(getAllProjects()).toEqual([]);
  });
});

describe('getProjectById', () => {
  it('returns the matching project', () => {
    const projects = [
      { id: 'proj_1', name: 'Alpha', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'proj_2', name: 'Beta', createdAt: '2026-01-02T00:00:00Z' },
    ];
    localStorageMock.setItem('time-tracker-projects', JSON.stringify(projects));
    expect(getProjectById('proj_2')).toEqual(projects[1]);
  });

  it('returns null when not found', () => {
    expect(getProjectById('nonexistent')).toBeNull();
  });
});

describe('createProject', () => {
  it('creates a project with id, name, and createdAt', () => {
    const project = createProject('Mon projet');
    expect(project.id).toMatch(/^proj_test-uuid-\d+$/);
    expect(project.name).toBe('Mon projet');
    expect(project.createdAt).toBeDefined();
  });

  it('trims whitespace from name', () => {
    const project = createProject('  Spaces  ');
    expect(project.name).toBe('Spaces');
  });

  it('persists to localStorage', () => {
    createProject('Test');
    const stored = getAllProjects();
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('Test');
  });

  it('throws on empty name', () => {
    expect(() => createProject('')).toThrow('vide');
    expect(() => createProject('   ')).toThrow('vide');
  });

  it('throws on duplicate name (case-insensitive)', () => {
    createProject('Alpha');
    expect(() => createProject('alpha')).toThrow('existe déjà');
    expect(() => createProject('ALPHA')).toThrow('existe déjà');
  });

  it('appends to existing projects', () => {
    createProject('First');
    createProject('Second');
    expect(getAllProjects()).toHaveLength(2);
  });
});

describe('renameProject', () => {
  it('renames an existing project', () => {
    createProject('Original');
    const projects = getAllProjects();
    const updated = renameProject(projects[0].id, 'Renamed');
    expect(updated.name).toBe('Renamed');
    expect(getAllProjects()[0].name).toBe('Renamed');
  });

  it('trims whitespace', () => {
    createProject('Test');
    const id = getAllProjects()[0].id;
    const updated = renameProject(id, '  New Name  ');
    expect(updated.name).toBe('New Name');
  });

  it('throws on empty name', () => {
    createProject('Test');
    const id = getAllProjects()[0].id;
    expect(() => renameProject(id, '')).toThrow('vide');
  });

  it('throws on duplicate name (excluding self)', () => {
    createProject('Alpha');
    createProject('Beta');
    const betaId = getAllProjects()[1].id;
    expect(() => renameProject(betaId, 'Alpha')).toThrow('existe déjà');
  });

  it('allows renaming to same name (no false duplicate)', () => {
    createProject('Same');
    const id = getAllProjects()[0].id;
    expect(() => renameProject(id, 'Same')).not.toThrow();
  });

  it('throws when project not found', () => {
    expect(() => renameProject('nonexistent', 'New')).toThrow('introuvable');
  });
});

describe('deleteProject', () => {
  it('deletes an existing project', () => {
    createProject('ToDelete');
    const id = getAllProjects()[0].id;
    const result = deleteProject(id);
    expect(result).toBe(true);
    expect(getAllProjects()).toHaveLength(0);
  });

  it('returns false when project not found', () => {
    expect(deleteProject('nonexistent')).toBe(false);
  });

  it('preserves other projects', () => {
    createProject('Keep');
    createProject('Remove');
    const removeId = getAllProjects()[1].id;
    deleteProject(removeId);
    const remaining = getAllProjects();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].name).toBe('Keep');
  });
});

describe('validateProjectName', () => {
  it('returns error for empty name', () => {
    expect(validateProjectName('')).toContain('vide');
    expect(validateProjectName('   ')).toContain('vide');
  });

  it('returns error for duplicate name', () => {
    createProject('Existing');
    expect(validateProjectName('existing')).toContain('existe déjà');
  });

  it('returns null for valid name', () => {
    expect(validateProjectName('New Project')).toBeNull();
  });

  it('excludes a project id from duplicate check (rename)', () => {
    createProject('Self');
    const id = getAllProjects()[0].id;
    expect(validateProjectName('Self', id)).toBeNull();
  });
});
