import { msToHHMM, formatDuration, computeNetPresence } from '../utils/time.js';

// ============================================================
// State machine
// ============================================================

/** @typedef {'IDLE'|'PRESENT'|'ON_BREAK'|'DEPARTED'} ClockState */

/**
 * Derives the state machine state from an entry object.
 * @param {object|null} entry
 * @returns {ClockState}
 */
export const deriveState = (entry) => {
  if (!entry || entry.arrivedAt == null) return 'IDLE';
  if (entry.departedAt != null) return 'DEPARTED';
  const last = entry.breaks.at(-1);
  if (last && last.endAt == null) return 'ON_BREAK';
  return 'PRESENT';
};

/**
 * Returns a new entry after applying the given punch event.
 * Pure function — does not write to storage.
 * @param {object|null} entry
 * @param {'ARRIVE'|'DEPART'|'START_BREAK'|'END_BREAK'} event
 * @returns {object} new entry
 * @throws {Error} if the transition is invalid
 */
export const applyEvent = (entry, event) => {
  const state = deriveState(entry);
  const now = Date.now();

  switch (event) {
    case 'ARRIVE': {
      if (state !== 'IDLE') throw new Error(`ARRIVE invalid in state ${state}`);
      const base = entry ?? { departedAt: null, breaks: [] };
      return { ...base, arrivedAt: now };
    }
    case 'DEPART': {
      if (state !== 'PRESENT') throw new Error(`DEPART invalid in state ${state}`);
      return { ...entry, departedAt: now };
    }
    case 'START_BREAK': {
      if (state !== 'PRESENT') throw new Error(`START_BREAK invalid in state ${state}`);
      return {
        ...entry,
        breaks: [...entry.breaks, { startAt: now, endAt: null }],
      };
    }
    case 'END_BREAK': {
      if (state !== 'ON_BREAK') throw new Error(`END_BREAK invalid in state ${state}`);
      const breaks = entry.breaks.map((b, i) =>
        i === entry.breaks.length - 1 ? { ...b, endAt: now } : b
      );
      return { ...entry, breaks };
    }
    default:
      throw new Error(`Unknown event: ${event}`);
  }
};

// ============================================================
// Constants
// ============================================================

const OBJECTIVE_MS = 8 * 60 * 60 * 1000; // 8h in ms

const BADGE_CONFIG = {
  IDLE:      { variant: 'neutral', label: 'Non commencée' },
  PRESENT:   { variant: 'info',    label: 'En cours' },
  ON_BREAK:  { variant: 'warning', label: 'En pause' },
  DEPARTED:  { variant: 'success', label: 'Journée terminée' },
};

const STATE_MESSAGES = {
  IDLE: '',
  PRESENT: 'Vous êtes au bureau.',
  ON_BREAK: 'Vous êtes en pause.',
  DEPARTED: 'Journée terminée.',
};

const PUNCH_TYPES = {
  arrival:    { label: 'Arrivée',     icon: '#icon-log-in',  color: 'success' },
  breakStart: { label: 'Début pause', icon: '#icon-pause',   color: 'warning' },
  breakEnd:   { label: 'Fin pause',   icon: '#icon-play',    color: 'info' },
  departure:  { label: 'Départ',      icon: '#icon-log-out', color: 'danger' },
};

// ============================================================
// DOM rendering — helpers
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

/**
 * Builds a flat list of punch events from an entry, sorted chronologically.
 * Each item: { type, label, icon, color, ms, breakIndex? }
 */
export const buildPunchList = (entry) => {
  if (entry?.arrivedAt == null) return [];

  const punches = [];

  punches.push({
    type: 'arrival',
    ...PUNCH_TYPES.arrival,
    ms: entry.arrivedAt,
  });

  entry.breaks.forEach((b, i) => {
    punches.push({
      type: 'breakStart',
      ...PUNCH_TYPES.breakStart,
      ms: b.startAt,
      breakIndex: i,
    });
    if (b.endAt) {
      punches.push({
        type: 'breakEnd',
        ...PUNCH_TYPES.breakEnd,
        ms: b.endAt,
        breakIndex: i,
      });
    }
  });

  if (entry.departedAt != null) {
    punches.push({
      type: 'departure',
      ...PUNCH_TYPES.departure,
      ms: entry.departedAt,
    });
  }

  return punches.sort((a, b) => a.ms - b.ms);
};

const createPunchListItem = (punch) => {
  const li = document.createElement('li');
  li.className = 'punch-list__item';
  li.dataset.jsPunchItem = '';
  li.dataset.punchType = punch.type;
  if (punch.breakIndex != null) li.dataset.breakIndex = String(punch.breakIndex);

  // Icon
  li.appendChild(createSvgIcon(punch.icon, {
    className: 'icon punch-list__icon',
    size: 'sm',
    color: punch.color,
  }));

  // Label
  const labelSpan = document.createElement('span');
  labelSpan.className = 'punch-list__label';
  labelSpan.textContent = punch.label;
  li.appendChild(labelSpan);

  // Time display
  const timeSpan = document.createElement('span');
  timeSpan.className = 'punch-list__time';
  timeSpan.dataset.jsPunchTime = '';
  timeSpan.textContent = msToHHMM(punch.ms);
  li.appendChild(timeSpan);

  // Action buttons
  const actionsSpan = document.createElement('span');
  actionsSpan.className = 'punch-list__actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'btn';
  editBtn.type = 'button';
  editBtn.dataset.variant = 'ghost';
  editBtn.dataset.size = 'sm';
  editBtn.dataset.jsEditPunch = '';
  editBtn.setAttribute('aria-label', `Modifier l'heure de ${punch.label.toLowerCase()}`);
  editBtn.appendChild(createSvgIcon('#icon-pencil'));
  actionsSpan.appendChild(editBtn);

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn';
  deleteBtn.type = 'button';
  deleteBtn.dataset.variant = 'ghost';
  deleteBtn.dataset.size = 'sm';
  deleteBtn.dataset.jsDeletePunch = '';
  deleteBtn.setAttribute('aria-label', `Supprimer le pointage ${punch.label.toLowerCase()}`);
  deleteBtn.appendChild(createSvgIcon('#icon-trash'));
  actionsSpan.appendChild(deleteBtn);

  li.appendChild(actionsSpan);

  return li;
};

// ============================================================
// DOM rendering — main
// ============================================================

const renderBadge = (state, root) => {
  const badge = root.querySelector('[data-js-punch-badge]');
  if (!badge) return;
  const config = BADGE_CONFIG[state];
  badge.dataset.variant = config.variant;
  badge.textContent = config.label;
};

const renderMetrics = (entry, state, root) => {
  const timeEl = root.querySelector('[data-js-presence-time]');
  const progressEl = root.querySelector('[data-js-presence-progress]');
  const objectiveEl = root.querySelector('[data-js-presence-objective]');

  const net = computeNetPresence(entry);

  if (timeEl) {
    timeEl.textContent = net == null ? '—' : formatDuration(net);
  }

  if (progressEl && net != null) {
    const pct = Math.min(100, Math.round((net / OBJECTIVE_MS) * 100));
    progressEl.textContent = `${pct}% /8h`;
  } else if (progressEl) {
    progressEl.textContent = '';
  }

  if (objectiveEl) {
    if (net != null && net >= OBJECTIVE_MS) {
      objectiveEl.textContent = 'Objectif atteint !';
      objectiveEl.hidden = false;
    } else {
      objectiveEl.hidden = true;
    }
  }
};

const renderButtons = (state, root) => {
  const btnArrive = root.querySelector('[data-js-btn-arrive]');
  const btnDepart = root.querySelector('[data-js-btn-depart]');
  const btnStartBreak = root.querySelector('[data-js-btn-start-break]');
  const btnEndBreak = root.querySelector('[data-js-btn-end-break]');

  if (btnArrive) btnArrive.disabled = state !== 'IDLE';
  if (btnDepart) btnDepart.disabled = state !== 'PRESENT';
  if (btnStartBreak) btnStartBreak.disabled = state !== 'PRESENT';
  if (btnEndBreak) btnEndBreak.disabled = state !== 'ON_BREAK';
};

const renderPunchList = (entry, root) => {
  const listEl = root.querySelector('[data-js-punch-list]');
  if (!listEl) return;

  const punches = buildPunchList(entry);
  listEl.replaceChildren(...punches.map(createPunchListItem));
};

/**
 * Updates the DOM to reflect the current entry state.
 * Single source of truth for all UI mutations on the punch-clock card.
 * @param {object|null} entry
 * @param {HTMLElement} root — the [data-js-punch-clock] element
 */
export const renderPunchClock = (entry, root) => {
  const state = deriveState(entry);
  renderBadge(state, root);
  renderMetrics(entry, state, root);
  renderButtons(state, root);
  renderPunchList(entry, root);

  const stateMsg = root.querySelector('[data-js-state-msg]') ??
    document.getElementById('punch-clock-state-msg');
  if (stateMsg) stateMsg.textContent = STATE_MESSAGES[state] ?? '';
};

// ============================================================
// Event listeners (delegation)
// ============================================================

const EVENT_MAP = {
  jsBtnArrive:     'ARRIVE',
  jsBtnDepart:     'DEPART',
  jsBtnStartBreak: 'START_BREAK',
  jsBtnEndBreak:   'END_BREAK',
};

/**
 * Wires all button event listeners via delegation on the root element.
 * @param {HTMLElement} root
 * @param {function} onEvent — called with (event: string)
 * @returns {function} cleanup — removes listeners
 */
export const initPunchClockListeners = (root, onEvent) => {
  const handler = (e) => {
    const btn = e.target.closest(
      'button[data-js-btn-arrive], button[data-js-btn-depart], ' +
      'button[data-js-btn-start-break], button[data-js-btn-end-break]'
    );
    if (!btn) return;

    const dsKey = Object.keys(btn.dataset).find((k) => k.startsWith('jsBtn'));
    if (dsKey && EVENT_MAP[dsKey]) {
      onEvent(EVENT_MAP[dsKey]);
    }
  };

  root.addEventListener('click', handler);
  return () => root.removeEventListener('click', handler);
};

// ============================================================
// Live counter
// ============================================================

/**
 * Starts the live net-presence counter (updates every 30s).
 * Stops automatically when state becomes DEPARTED.
 * @param {HTMLElement} root
 * @param {function} getEntry — returns current entry from storage
 * @returns {function} stop
 */
export const startLiveCounter = (root, getEntry) => {
  let id;

  const tick = () => {
    const entry = getEntry();
    const state = deriveState(entry);
    if (state === 'DEPARTED' || state === 'IDLE') {
      clearInterval(id);
      return;
    }
    renderMetrics(entry, state, root);
  };

  id = setInterval(tick, 30_000);
  return () => clearInterval(id);
};

// ============================================================
// Delete confirmation dialog
// ============================================================

/**
 * Opens the delete confirmation dialog and returns a Promise.
 * Resolves to true if confirmed, false if cancelled.
 * @param {string} punchLabel — e.g. "Arrivée"
 * @returns {Promise<boolean>}
 */
export const openDeleteDialog = (punchLabel) => {
  const dialog = document.querySelector('[data-js-delete-dialog]');
  if (!dialog) return Promise.resolve(false);

  const messageEl = dialog.querySelector('[data-js-delete-dialog-message]');
  if (messageEl) {
    messageEl.textContent = `Êtes-vous sûr de vouloir supprimer le pointage « ${punchLabel} » ?`;
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

    const confirmBtn = dialog.querySelector('[data-js-delete-dialog-confirm]');
    const cancelBtn = dialog.querySelector('[data-js-delete-dialog-cancel]');
    const closeBtn = dialog.querySelector('[data-js-delete-dialog-close]');

    confirmBtn.addEventListener('click', onConfirm);
    cancelBtn.addEventListener('click', onCancel);
    closeBtn.addEventListener('click', onCancel);
    dialog.addEventListener('close', onDialogClose);

    dialog.showModal();
  });
};
