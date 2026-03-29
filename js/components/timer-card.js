import { formatDuration } from '../utils/time.js';
import { getActiveSessions, getActiveSessionForProject } from '../storage/sessions.js';
import { getProjectById } from '../storage/projects.js';

// ============================================================
// SVG icon helper
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
// State derivation
// ============================================================

/** @typedef {'IDLE'|'RUNNING_SINGLE'|'RUNNING_MULTI'} TimerState */

/**
 * Derives the timer state from active sessions.
 * @param {Array} activeSessions
 * @returns {TimerState}
 */
export const deriveTimerState = (activeSessions) => {
  if (activeSessions.length === 0) return 'IDLE';
  if (activeSessions.length === 1) return 'RUNNING_SINGLE';
  return 'RUNNING_MULTI';
};

/**
 * Computes the total elapsed duration across all active sessions.
 * @param {Array} activeSessions
 * @returns {number} ms
 */
export const computeTotalActiveTime = (activeSessions) =>
  activeSessions.reduce(
    (acc, s) => acc + (Date.now() - new Date(s.startedAt).getTime()),
    0,
  );

/**
 * Computes elapsed duration for a single session.
 * @param {object} session
 * @returns {number} ms
 */
export const computeSessionTime = (session) =>
  Date.now() - new Date(session.startedAt).getTime();

// ============================================================
// Rendering
// ============================================================

/**
 * Creates a timer chip DOM element for an active session.
 * @param {object} session
 * @param {object} project
 * @returns {HTMLElement}
 */
const createTimerChip = (session, project) => {
  const li = document.createElement('li');
  li.className = 'timer-chip';
  li.dataset.jsTimerChip = '';
  li.dataset.sessionId = session.id;

  const dot = document.createElement('span');
  dot.className = 'timer-chip__dot';
  li.appendChild(dot);

  const name = document.createElement('span');
  name.className = 'timer-chip__name';
  name.textContent = project?.name ?? 'Projet inconnu';
  li.appendChild(name);

  const time = document.createElement('span');
  time.className = 'timer-chip__time';
  time.dataset.jsTimerChipTime = '';
  time.textContent = formatDuration(computeSessionTime(session));
  li.appendChild(time);

  const stopBtn = document.createElement('button');
  stopBtn.className = 'btn';
  stopBtn.type = 'button';
  stopBtn.dataset.variant = 'ghost';
  stopBtn.dataset.size = 'sm';
  stopBtn.dataset.jsTimerChipStop = '';
  stopBtn.setAttribute('aria-label', `Arrêter ${project?.name ?? 'le chronomètre'}`);
  stopBtn.appendChild(createSvgIcon('#icon-square'));
  li.appendChild(stopBtn);

  return li;
};

/**
 * Renders the timer card. Single source of truth for DOM state.
 * @param {HTMLElement} root — the [data-js-timer-card] element
 */
export const renderTimerCard = (root) => {
  const activeSessions = getActiveSessions();
  const state = deriveTimerState(activeSessions);

  // Badge
  const badge = root.querySelector('[data-js-timer-badge]');
  if (badge) {
    badge.dataset.variant = state === 'IDLE' ? 'neutral' : 'info';
    badge.textContent = 'Chronomètre';
  }

  // Status text
  const statusEl = root.querySelector('[data-js-timer-status]');
  if (statusEl) {
    if (state === 'IDLE') {
      statusEl.textContent = 'Aucun projet en cours';
    } else if (state === 'RUNNING_SINGLE') {
      const project = getProjectById(activeSessions[0].projectId);
      statusEl.textContent = project?.name ?? 'Projet inconnu';
    } else {
      statusEl.textContent = `${activeSessions.length} projets actifs`;
    }
  }

  // Total time
  const timeEl = root.querySelector('[data-js-timer-time]');
  if (timeEl) {
    const totalMs = computeTotalActiveTime(activeSessions);
    timeEl.textContent = totalMs > 0 ? formatDuration(totalMs) : '0h00';
  }

  // Active state on card
  if (state === 'IDLE') {
    delete root.dataset.active;
  } else {
    root.dataset.active = '';
  }

  // Stop button
  const stopBtn = root.querySelector('[data-js-timer-stop]');
  if (stopBtn) {
    stopBtn.disabled = state === 'IDLE';
    if (state !== 'IDLE') {
      stopBtn.dataset.variant = 'warning';
    } else {
      stopBtn.dataset.variant = 'ghost';
    }
  }

  // Stop all button
  const stopAllBtn = root.querySelector('[data-js-timer-stop-all]');
  if (stopAllBtn) {
    stopAllBtn.hidden = state !== 'RUNNING_MULTI';
  }

  // Sessions zone
  const sessionsZone = root.querySelector('[data-js-timer-sessions]');
  const sessionsList = root.querySelector('[data-js-timer-sessions-list]');
  const countBadge = root.querySelector('[data-js-timer-session-count]');

  if (sessionsZone && sessionsList) {
    if (state === 'IDLE') {
      sessionsZone.hidden = true;
      sessionsList.replaceChildren();
    } else {
      sessionsZone.hidden = false;
      if (countBadge) countBadge.textContent = String(activeSessions.length);

      const chips = activeSessions.map((s) => {
        const project = getProjectById(s.projectId);
        return createTimerChip(s, project);
      });
      sessionsList.replaceChildren(...chips);
    }
  }
};

/**
 * Updates only the live time displays (no DOM rebuild).
 * @param {HTMLElement} root
 */
export const updateTimerTimes = (root) => {
  const activeSessions = getActiveSessions();

  // Total time
  const timeEl = root.querySelector('[data-js-timer-time]');
  if (timeEl) {
    const totalMs = computeTotalActiveTime(activeSessions);
    timeEl.textContent = totalMs > 0 ? formatDuration(totalMs) : '0h00';
  }

  // Individual chip times
  const chips = root.querySelectorAll('[data-js-timer-chip]');
  chips.forEach((chip) => {
    const sessionId = chip.dataset.sessionId;
    const session = activeSessions.find((s) => s.id === sessionId);
    if (!session) return;
    const timeSpan = chip.querySelector('[data-js-timer-chip-time]');
    if (timeSpan) {
      timeSpan.textContent = formatDuration(computeSessionTime(session));
    }
  });
};

/**
 * Starts a 1-second interval to update live times.
 * @param {HTMLElement} root
 * @param {function} [onTick] — optional callback after each tick (e.g. to update project list times)
 * @returns {function} stop — call to clear the interval
 */
export const startTimerLiveCounter = (root, onTick) => {
  const id = setInterval(() => {
    updateTimerTimes(root);
    onTick?.();
  }, 1000);

  return () => clearInterval(id);
};
