import { todayISO, formatDateLong } from '../utils/time.js';
import { getTodayEntry, upsertTodayEntry, replaceTodayEntry } from '../storage/entries.js';
import {
  deriveState,
  applyEvent,
  renderPunchClock,
  initPunchClockListeners,
  startLiveCounter,
} from '../components/punch-clock.js';
import { openEditTimeModal } from '../components/edit-time-modal.js';
import { showToast } from '../components/toast.js';

/**
 * Initializes the Today page.
 * Called once on DOMContentLoaded.
 */
export const initTodayPage = () => {
  const pageRoot = document.querySelector('[data-js-today-page]');
  if (!pageRoot) return;

  // ---- Date display ----
  const dateEl = pageRoot.querySelector('[data-js-today-date]');
  if (dateEl) {
    const today = todayISO();
    dateEl.textContent = formatDateLong(today);
    dateEl.setAttribute('datetime', today);
  }

  // ---- Punch clock ----
  const clockRoot = pageRoot.querySelector('[data-js-punch-clock]');
  if (!clockRoot) return;

  // Initial render from stored state
  renderPunchClock(getTodayEntry(), clockRoot);

  // Start live counter if currently active
  let stopCounter = startLiveCounter(clockRoot, getTodayEntry);

  // ---- Punch events (arrive, depart, break) ----
  initPunchClockListeners(clockRoot, (event) => {
    const current = getTodayEntry();
    const updated = applyEvent(current, event);
    upsertTodayEntry(updated);
    renderPunchClock(getTodayEntry(), clockRoot);

    const newState = deriveState(getTodayEntry());

    if (newState === 'PRESENT' && event === 'ARRIVE') {
      stopCounter();
      stopCounter = startLiveCounter(clockRoot, getTodayEntry);
      showToast({ message: 'Arrivée enregistrée.', variant: 'success' });
    } else if (newState === 'DEPARTED') {
      stopCounter();
      showToast({ message: 'Départ enregistré.', variant: 'success' });
    } else if (event === 'START_BREAK') {
      showToast({ message: 'Pause commencée.', variant: 'info' });
    } else if (event === 'END_BREAK') {
      showToast({ message: 'Pause terminée.', variant: 'info' });
    }
  });

  // ---- Manual edit buttons ----
  clockRoot.addEventListener('click', (e) => {
    const editArrival = e.target.closest('[data-js-edit-arrival]');
    const editDeparture = e.target.closest('[data-js-edit-departure]');

    if (editArrival) {
      handleEdit('arrivedAt', 'Modifier l\'arrivée');
    } else if (editDeparture) {
      handleEdit('departedAt', 'Modifier le départ');
    }
  });

  const handleEdit = async (field, title) => {
    const entry = getTodayEntry();
    const newMs = await openEditTimeModal({
      title,
      currentMs: entry?.[field] ?? null,
      field,
      entry,
    });

    if (newMs == null) return;

    const updated = replaceTodayEntry({ ...entry, [field]: newMs });
    renderPunchClock(updated, clockRoot);

    const label = field === 'arrivedAt' ? 'Arrivée' : 'Départ';
    showToast({ message: `${label} mise à jour.`, variant: 'success' });
  };
};
