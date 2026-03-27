import { msToHHMM, timeStrToMs } from '../utils/time.js';

/**
 * Opens the edit-time dialog and returns a Promise that resolves with
 * the new ms timestamp on confirm, or null on cancel/close.
 *
 * @param {object} opts
 * @param {string}      opts.title     — Dialog heading text
 * @param {number|null} opts.currentMs — Current timestamp to pre-fill input
 * @param {'arrivedAt'|'departedAt'} opts.field — Which field is being edited
 * @param {object}      opts.entry     — Full entry (for validation bounds)
 * @returns {Promise<number|null>}
 */
export const openEditTimeModal = ({ title, currentMs, field, entry }) => {
  const dialog = document.querySelector('[data-js-edit-time-dialog]');
  const titleEl = dialog.querySelector('[id="edit-time-dialog-title"]');
  const input = dialog.querySelector('[data-js-time-input]');
  const errorEl = dialog.querySelector('[data-js-edit-error]');
  const confirmBtn = dialog.querySelector('[data-js-dialog-confirm]');
  const cancelBtn = dialog.querySelector('[data-js-dialog-cancel]');
  const closeBtn = dialog.querySelector('[data-js-dialog-close]');

  // Pre-fill
  if (titleEl) titleEl.textContent = title;
  input.value = currentMs != null ? msToHHMM(currentMs) : '';
  errorEl.hidden = true;
  errorEl.textContent = '';

  const validate = (timeStr) => {
    if (!timeStr) return 'Veuillez saisir une heure.';
    const newMs = timeStrToMs(timeStr);
    const now = Date.now();
    if (newMs > now) return 'L\'heure ne peut pas être dans le futur.';
    if (field === 'departedAt' && entry?.arrivedAt != null && newMs <= entry.arrivedAt) {
      return 'Le départ doit être après l\'arrivée.';
    }
    if (field === 'arrivedAt' && entry?.departedAt != null && newMs >= entry.departedAt) {
      return 'L\'arrivée doit être avant le départ.';
    }
    return null;
  };

  return new Promise((resolve) => {
    const cleanup = () => {
      confirmBtn.removeEventListener('click', onConfirm);
      cancelBtn.removeEventListener('click', onCancel);
      closeBtn.removeEventListener('click', onCancel);
      dialog.removeEventListener('close', onDialogClose);
      dialog.removeEventListener('click', onBackdrop);
    };

    const onConfirm = () => {
      const error = validate(input.value);
      if (error) {
        errorEl.textContent = error;
        errorEl.hidden = false;
        input.setAttribute('aria-invalid', 'true');
        return;
      }
      cleanup();
      dialog.close();
      resolve(timeStrToMs(input.value));
    };

    const onCancel = () => {
      cleanup();
      dialog.close();
      resolve(null);
    };

    const onDialogClose = () => {
      cleanup();
      resolve(null);
    };

    const onBackdrop = (e) => {
      if (e.target === dialog) onCancel();
    };

    confirmBtn.addEventListener('click', onConfirm);
    cancelBtn.addEventListener('click', onCancel);
    closeBtn.addEventListener('click', onCancel);
    dialog.addEventListener('close', onDialogClose, { once: true });
    dialog.addEventListener('click', onBackdrop);

    // Clear validation state on input change
    input.addEventListener('input', () => {
      errorEl.hidden = true;
      input.removeAttribute('aria-invalid');
    }, { once: false });

    dialog.showModal();
  });
};
