const STORAGE_KEY = 'time-tracker-projects';

/**
 * Returns all projects from localStorage, sorted by createdAt ascending (stable order).
 * @returns {Array<{id: string, name: string, createdAt: string}>}
 */
export const getAllProjects = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

/**
 * Writes the full projects array to localStorage.
 * @param {Array} projects
 */
const saveAllProjects = (projects) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

/**
 * Returns a project by id, or null.
 * @param {string} id
 * @returns {object|null}
 */
export const getProjectById = (id) =>
  getAllProjects().find((p) => p.id === id) ?? null;

/**
 * Creates a new project. Returns the created project.
 * @param {string} name
 * @returns {object}
 * @throws {Error} if name is empty or duplicate
 */
export const createProject = (name) => {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('Le nom du projet ne peut pas être vide.');

  const projects = getAllProjects();
  const duplicate = projects.some(
    (p) => p.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (duplicate) throw new Error('Un projet avec ce nom existe déjà.');

  const project = {
    id: `proj_${crypto.randomUUID()}`,
    name: trimmed,
    createdAt: new Date().toISOString(),
  };

  saveAllProjects([...projects, project]);
  return project;
};

/**
 * Renames a project. Returns the updated project.
 * @param {string} id
 * @param {string} newName
 * @returns {object}
 * @throws {Error} if name is empty, duplicate, or project not found
 */
export const renameProject = (id, newName) => {
  const trimmed = newName.trim();
  if (!trimmed) throw new Error('Le nom du projet ne peut pas être vide.');

  const projects = getAllProjects();
  const idx = projects.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error('Projet introuvable.');

  const duplicate = projects.some(
    (p) => p.id !== id && p.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (duplicate) throw new Error('Un projet avec ce nom existe déjà.');

  const updated = { ...projects[idx], name: trimmed };
  const newProjects = [...projects];
  newProjects[idx] = updated;
  saveAllProjects(newProjects);
  return updated;
};

/**
 * Deletes a project by id. Returns true if deleted, false if not found.
 * @param {string} id
 * @returns {boolean}
 */
export const deleteProject = (id) => {
  const projects = getAllProjects();
  const filtered = projects.filter((p) => p.id !== id);
  if (filtered.length === projects.length) return false;
  saveAllProjects(filtered);
  return true;
};

/**
 * Validates a project name for creation or rename.
 * Returns an error message string or null if valid.
 * @param {string} name
 * @param {string|null} excludeId — project id to exclude from uniqueness check (for rename)
 * @returns {string|null}
 */
export const validateProjectName = (name, excludeId = null) => {
  const trimmed = name.trim();
  if (!trimmed) return 'Le nom du projet ne peut pas être vide.';

  const projects = getAllProjects();
  const duplicate = projects.some(
    (p) => (excludeId == null || p.id !== excludeId) &&
           p.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (duplicate) return 'Un projet avec ce nom existe déjà.';

  return null;
};
