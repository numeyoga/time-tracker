import { msToHHMM, formatDuration, computeNetPresence, computeTotalBreakDuration } from '../utils/time.js';

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
// DOM rendering — helpers
// ============================================================

const renderBreaksSummary = (entry, el) => {
  const breakCount = entry?.breaks?.length ?? 0;
  if (breakCount === 0) { el.textContent = '—'; return; }
  const last = entry.breaks.at(-1);
  if (last.endAt == null) { el.textContent = 'En pause…'; return; }
  const totalMs = computeTotalBreakDuration(entry);
  el.textContent = `${formatDuration(totalMs)} (${breakCount} pause${breakCount > 1 ? 's' : ''})`;
};

const renderBreakList = (entry, listEl) => {
  if (!entry?.breaks?.length) return;
  listEl.replaceChildren(
    ...entry.breaks.map((b, i) => {
      const li = document.createElement('li');
      li.className = 'punch-status__break-item';
      const start = msToHHMM(b.startAt);
      const end = b.endAt ? msToHHMM(b.endAt) : '…';
      const dur = b.endAt ? ` — ${formatDuration(b.endAt - b.startAt)}` : '';
      li.textContent = `Pause ${i + 1} : ${start} – ${end}${dur}`;
      return li;
    })
  );
};

const STATE_MESSAGES = {
  IDLE: '',
  PRESENT: 'Vous êtes au bureau.',
  ON_BREAK: 'Vous êtes en pause.',
  DEPARTED: 'Journée terminée.',
};

// ============================================================
// DOM rendering — main
// ============================================================

const renderStatusValues = (entry, state, root) => {
  const arrivalEl = root.querySelector('[data-js-arrival-time]');
  const departureEl = root.querySelector('[data-js-departure-time]');
  const breaksSummaryEl = root.querySelector('[data-js-breaks-summary]');
  const netPresenceEl = root.querySelector('[data-js-net-presence]');
  const tickEl = root.querySelector('[data-js-tick-indicator]');
  const breakList = root.querySelector('[data-js-break-list]');

  if (arrivalEl) arrivalEl.textContent = msToHHMM(entry?.arrivedAt);
  if (departureEl) departureEl.textContent = msToHHMM(entry?.departedAt);
  if (breaksSummaryEl) renderBreaksSummary(entry, breaksSummaryEl);
  if (netPresenceEl) {
    const net = computeNetPresence(entry);
    netPresenceEl.textContent = net == null ? '—' : formatDuration(net);
  }
  if (tickEl) tickEl.hidden = state === 'IDLE' || state === 'DEPARTED';
  if (breakList) renderBreakList(entry, breakList);
};

const renderButtons = (entry, state, root) => {
  const btnArrive = root.querySelector('[data-js-btn-arrive]');
  const btnDepart = root.querySelector('[data-js-btn-depart]');
  const btnStartBreak = root.querySelector('[data-js-btn-start-break]');
  const btnEndBreak = root.querySelector('[data-js-btn-end-break]');
  const editArrival = root.querySelector('[data-js-edit-arrival]');
  const editDeparture = root.querySelector('[data-js-edit-departure]');
  const toggleBreakDetail = root.querySelector('[data-js-toggle-breaks-detail]');

  if (btnArrive) btnArrive.disabled = state !== 'IDLE';
  if (btnDepart) btnDepart.disabled = state !== 'PRESENT';
  if (btnStartBreak) btnStartBreak.disabled = state !== 'PRESENT';
  if (btnEndBreak) btnEndBreak.hidden = state !== 'ON_BREAK';
  if (editArrival) editArrival.hidden = state === 'IDLE';
  if (editDeparture) editDeparture.hidden = state !== 'DEPARTED';
  if (toggleBreakDetail) toggleBreakDetail.hidden = (entry?.breaks?.length ?? 0) === 0;
};

/**
 * Updates the DOM to reflect the current entry state.
 * Single source of truth for all UI mutations on the punch-clock card.
 * @param {object|null} entry
 * @param {HTMLElement} root — the [data-js-punch-clock] element
 */
export const renderPunchClock = (entry, root) => {
  const state = deriveState(entry);
  renderStatusValues(entry, state, root);
  renderButtons(entry, state, root);

  const stateMsg = root.querySelector('[data-js-state-msg]') ??
    document.getElementById('punch-clock-state-msg');
  if (stateMsg) stateMsg.textContent = STATE_MESSAGES[state] ?? '';
};

// ============================================================
// Event listeners (delegation)
// ============================================================

// Keys are camelCase dataset property names (data-js-btn-arrive → jsBtnArrive)
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
      'button[data-js-btn-start-break], button[data-js-btn-end-break], ' +
      'button[data-js-toggle-breaks-detail]'
    );
    if (!btn) return;

    // Convert data-js-btn-* to camelCase dataset key and look up in EVENT_MAP
    const dsKey = Object.keys(btn.dataset).find((k) => k.startsWith('jsBtn'));
    if (dsKey && EVENT_MAP[dsKey]) {
      onEvent(EVENT_MAP[dsKey]);
      return;
    }

    // Toggle break detail
    if ('jsToggleBreaksDetail' in btn.dataset) {
      const detail = root.querySelector('[data-js-breaks-detail]');
      if (detail) {
        detail.hidden = !detail.hidden;
        btn.setAttribute('aria-expanded', String(!detail.hidden));
      }
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
    if (deriveState(entry) === 'DEPARTED') {
      clearInterval(id);
      return;
    }
    const netEl = root.querySelector('[data-js-net-presence]');
    if (netEl) {
      const net = computeNetPresence(entry);
      netEl.textContent = net != null ? formatDuration(net) : '—';
    }
  };

  id = setInterval(tick, 30_000);
  return () => clearInterval(id);
};
