import { getAllProjects, validateProjectName } from '../storage/projects.js';
import { openAddTimeDialog as openAddTimeModal } from './add-time-modal.js';
import { openProjectHistoryDrawer as openProjectHistoryDrawerModal } from './project-history-drawer.js';
import { getActiveSessionForProject, getTodayDurationForProject } from '../storage/sessions.js';
import { formatDuration } from '../utils/time.js';

// ============================================================
// SVG icon helper (shared with punch-clock)
// ============================================================

const createSvgIcon = (href, { className = 'icon', size, color } = {}) => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', className);
  svg.setAttribute('aria-hidden', 'true');
  if (size) svg.dataset.size = size;
  if (color) svg.dataset.color = color;
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', href);
  svg.appendChild(use);
  return svg;
};

// ============================================================
// DOM rendering
// ============================================================

const createActionButton = (iconHref, ariaLabel, dataAttr) => {
  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.type = 'button';
  btn.dataset.variant = 'ghost';
  btn.dataset.size = 'sm';
  btn.setAttribute('aria-label', ariaLabel);
  btn.dataset[dataAttr] = '';
  btn.appendChild(createSvgIcon(iconHref));
  return btn;
};

const createProjectItem = (project) => {
  const li = document.createElement('li');
  li.className = 'project-list__item';
  li.dataset.jsProjectItem = '';
  li.setAttribute('data-js-project-item', '');
  li.dataset.projectId = project.id;

  const nameSpan = document.createElement('span');
  nameSpan.className = 'project-list__name';
  nameSpan.textContent = project.name;
  li.appendChild(nameSpan);

  const todayMs = getTodayDurationForProject(project.id);
  const timeSpan = document.createElement('span');
  timeSpan.className = 'project-list__time';
  timeSpan.dataset.jsProjectTime = '';
  timeSpan.setAttribute('data-js-project-time', '');
  timeSpan.textContent = todayMs > 0 ? formatDuration(todayMs) : '0h00';
  li.appendChild(timeSpan);

  const actions = document.createElement('span');
  actions.className = 'project-list__actions';

  // Play/Stop toggle based on active session
  const activeSession = getActiveSessionForProject(project.id);
  const playBtn = createActionButton(
    activeSession ? '#icon-square' : '#icon-play',
    activeSession
      ? `Arrêter le chronomètre pour ${project.name}`
      : `Démarrer le chronomètre pour ${project.name}`,
    'jsProjectPlay',
  );
  if (activeSession) playBtn.dataset.active = '';
  actions.appendChild(playBtn);

  actions.appendChild(createActionButton('#icon-pencil', `Renommer le projet ${project.name}`, 'jsProjectRename'));
  actions.appendChild(createActionButton('#icon-calendar', `Historique du projet ${project.name}`, 'jsProjectHistory'));
  actions.appendChild(createActionButton('#icon-trash', `Supprimer le projet ${project.name}`, 'jsProjectDelete'));
  li.appendChild(actions);

  return li;
};

/**
 * Renders the project list. Shows empty state or list depending on project count.
 * @param {HTMLElement} root — the [data-js-projects-card] element
 */
export const renderProjectList = (root) => {
  const listEl = root.querySelector('[data-js-project-list]');
  const emptyEl = root.querySelector('[data-js-projects-empty]');
  const addTimeBtn = root.querySelector('[data-js-btn-add-time]');
  if (!listEl || !emptyEl) return;

  const projects = getAllProjects();
  if (addTimeBtn) addTimeBtn.disabled = projects.length === 0;

  if (projects.length === 0) {
    listEl.hidden = true;
    emptyEl.hidden = false;
    listEl.replaceChildren();
  } else {
    listEl.hidden = false;
    emptyEl.hidden = true;
    listEl.replaceChildren(...projects.map(createProjectItem));
  }
};

/**
 * Updates only the time displays in the project list (no full re-render).
 * @param {HTMLElement} root — the [data-js-projects-card] element
 */
export const updateProjectListTimes = (root) => {
  const items = root.querySelectorAll('[data-js-project-item]');
  items.forEach((item) => {
    const projectId = item.dataset.projectId;
    const timeEl = item.querySelector('[data-js-project-time]');
    if (!timeEl) return;
    const todayMs = getTodayDurationForProject(projectId);
    timeEl.textContent = todayMs > 0 ? formatDuration(todayMs) : '0h00';
  });
};

// ============================================================
// Dialog helpers — Promise-based
// ============================================================

/**
 * Opens the create-project dialog.
 * @returns {Promise<string|null>} the project name or null if cancelled
 */
export const openCreateProjectDialog = () => {
  const dialog = document.querySelector('[data-js-create-project-dialog]');
  if (!dialog) return Promise.resolve(null);

  const input = dialog.querySelector('[data-js-create-project-input]');
  const errorEl = dialog.querySelector('[data-js-create-project-error]');
  const confirmBtn = dialog.querySelector('[data-js-create-project-confirm]');
  const cancelBtn = dialog.querySelector('[data-js-create-project-cancel]');
  const closeBtn = dialog.querySelector('[data-js-create-project-close]');

  // Reset state
  input.value = '';
  errorEl.hidden = true;
  errorEl.textContent = '';
  confirmBtn.disabled = true;
  input.removeAttribute('aria-invalid');

  return new Promise((resolve) => {
    const validateInput = () => {
      const err = validateProjectName(input.value);
      if (err) {
        errorEl.textContent = err;
        errorEl.hidden = false;
        input.setAttribute('aria-invalid', 'true');
        confirmBtn.disabled = true;
      } else {
        errorEl.hidden = true;
        input.removeAttribute('aria-invalid');
        confirmBtn.disabled = false;
      }
    };

    const cleanup = () => {
      dialog.close();
      input.removeEventListener('input', validateInput);
      input.removeEventListener('keydown', onKeydown);
      confirmBtn.removeEventListener('click', onConfirm);
      cancelBtn.removeEventListener('click', onCancel);
      closeBtn.removeEventListener('click', onCancel);
      dialog.removeEventListener('close', onDialogClose);
    };

    const onConfirm = () => {
      const name = input.value.trim();
      if (!name) return;
      cleanup();
      resolve(name);
    };

    const onCancel = () => { cleanup(); resolve(null); };
    const onDialogClose = () => { cleanup(); resolve(null); };

    const onKeydown = (e) => {
      if (e.key === 'Enter' && !confirmBtn.disabled) {
        e.preventDefault();
        onConfirm();
      }
    };

    input.addEventListener('input', validateInput);
    input.addEventListener('keydown', onKeydown);
    confirmBtn.addEventListener('click', onConfirm);
    cancelBtn.addEventListener('click', onCancel);
    closeBtn.addEventListener('click', onCancel);
    dialog.addEventListener('close', onDialogClose);

    dialog.showModal();
    input.focus();
  });
};

/**
 * Opens the rename-project dialog.
 * @param {string} currentName
 * @param {string} projectId — excluded from uniqueness check
 * @returns {Promise<string|null>} the new name or null if cancelled
 */
export const openRenameProjectDialog = (currentName, projectId) => {
  const dialog = document.querySelector('[data-js-rename-project-dialog]');
  if (!dialog) return Promise.resolve(null);

  const input = dialog.querySelector('[data-js-rename-project-input]');
  const errorEl = dialog.querySelector('[data-js-rename-project-error]');
  const confirmBtn = dialog.querySelector('[data-js-rename-project-confirm]');
  const cancelBtn = dialog.querySelector('[data-js-rename-project-cancel]');
  const closeBtn = dialog.querySelector('[data-js-rename-project-close]');

  // Pre-fill
  input.value = currentName;
  errorEl.hidden = true;
  errorEl.textContent = '';
  confirmBtn.disabled = false;
  input.removeAttribute('aria-invalid');

  return new Promise((resolve) => {
    const validateInput = () => {
      const err = validateProjectName(input.value, projectId);
      if (err) {
        errorEl.textContent = err;
        errorEl.hidden = false;
        input.setAttribute('aria-invalid', 'true');
        confirmBtn.disabled = true;
      } else {
        errorEl.hidden = true;
        input.removeAttribute('aria-invalid');
        confirmBtn.disabled = false;
      }
    };

    const cleanup = () => {
      dialog.close();
      input.removeEventListener('input', validateInput);
      input.removeEventListener('keydown', onKeydown);
      confirmBtn.removeEventListener('click', onConfirm);
      cancelBtn.removeEventListener('click', onCancel);
      closeBtn.removeEventListener('click', onCancel);
      dialog.removeEventListener('close', onDialogClose);
    };

    const onConfirm = () => {
      const name = input.value.trim();
      if (!name) return;
      cleanup();
      resolve(name);
    };

    const onCancel = () => { cleanup(); resolve(null); };
    const onDialogClose = () => { cleanup(); resolve(null); };

    const onKeydown = (e) => {
      if (e.key === 'Enter' && !confirmBtn.disabled) {
        e.preventDefault();
        onConfirm();
      }
    };

    input.addEventListener('input', validateInput);
    input.addEventListener('keydown', onKeydown);
    confirmBtn.addEventListener('click', onConfirm);
    cancelBtn.addEventListener('click', onCancel);
    closeBtn.addEventListener('click', onCancel);
    dialog.addEventListener('close', onDialogClose);

    dialog.showModal();
    input.focus();
    input.select();
  });
};

/**
 * Opens the delete-project confirmation dialog.
 * @param {string} projectName
 * @returns {Promise<boolean>}
 */
export const openDeleteProjectDialog = (projectName) => {
  const dialog = document.querySelector('[data-js-delete-project-dialog]');
  if (!dialog) return Promise.resolve(false);

  const messageEl = dialog.querySelector('[data-js-delete-project-message]');
  if (messageEl) {
    messageEl.textContent = `Le projet « ${projectName} » et toutes ses sessions seront définitivement supprimés.`;
  }

  return new Promise((resolve) => {
    const cleanup = () => {
      dialog.close();
      confirmBtn.removeEventListener('click', onConfirm);
      cancelBtn.removeEventListener('click', onCancel);
      closeBtn.removeEventListener('click', onCancel);
      dialog.removeEventListener('close', onDialogClose);
    };

    const onConfirm = () => { cleanup(); resolve(true); };
    const onCancel = () => { cleanup(); resolve(false); };
    const onDialogClose = () => { cleanup(); resolve(false); };

    const confirmBtn = dialog.querySelector('[data-js-delete-project-confirm]');
    const cancelBtn = dialog.querySelector('[data-js-delete-project-cancel]');
    const closeBtn = dialog.querySelector('[data-js-delete-project-close]');

    confirmBtn.addEventListener('click', onConfirm);
    cancelBtn.addEventListener('click', onCancel);
    closeBtn.addEventListener('click', onCancel);
    dialog.addEventListener('close', onDialogClose);

    dialog.showModal();
  });
};

export const openAddTimeDialog = (options) => openAddTimeModal(options);
export const openProjectHistoryDrawer = (options) => openProjectHistoryDrawerModal(options);
