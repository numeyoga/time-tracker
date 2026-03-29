import {
  applyImportedStorage,
  buildExportPayload,
  getCurrentWeekRange,
  getExportFilename,
  getExportPreview,
  parseImportPayload,
  payloadToStorageData,
} from '../utils/backup.js';
import { getAllEntries } from '../storage/entries.js';
import { getAllProjects } from '../storage/projects.js';
import { getAllSessions } from '../storage/sessions.js';
import { validateDateRange } from '../utils/validation.js';
import { queueToastForReload, showToast } from './toast.js';

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} o`;
  return `${(bytes / 1024).toFixed(1)} Ko`;
};

const createPreviewTable = (payload) => {
  const preview = getExportPreview(payload);
  return `
    <div class="data-table-wrapper" tabindex="0" role="region" aria-label="Aperçu de l'import">
      <table class="data-table" data-density="compact">
        <tbody class="data-table__body">
          <tr class="data-table__row"><th class="data-table__th" scope="row">Période</th><td class="data-table__td">${preview.period}</td></tr>
          <tr class="data-table__row"><th class="data-table__th" scope="row">Projets</th><td class="data-table__td">${preview.projects}</td></tr>
          <tr class="data-table__row"><th class="data-table__th" scope="row">Sessions</th><td class="data-table__td">${preview.sessions}</td></tr>
          <tr class="data-table__row"><th class="data-table__th" scope="row">Pointages</th><td class="data-table__td">${preview.punches} jours</td></tr>
        </tbody>
      </table>
    </div>
  `;
};

const setFieldError = (input, errorEl, message) => {
  if (!input || !errorEl) return;
  if (!message) {
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
    errorEl.hidden = true;
    errorEl.textContent = '';
    return;
  }

  input.setAttribute('aria-invalid', 'true');
  input.setAttribute('aria-describedby', errorEl.id);
  errorEl.hidden = false;
  errorEl.textContent = message;
};

const readFileText = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result ?? ''));
  reader.onerror = () => reject(new Error('Impossible de lire le fichier'));
  reader.readAsText(file);
});

const confirmImport = () => {
  const dialog = document.querySelector('[data-js-import-confirm-dialog]');
  if (!dialog) return Promise.resolve(false);

  const confirmBtn = dialog.querySelector('[data-js-import-confirm-accept]');
  const cancelButtons = dialog.querySelectorAll('[data-js-import-confirm-close]');

  return new Promise((resolve) => {
    const cleanup = () => {
      confirmBtn.removeEventListener('click', onConfirm);
      cancelButtons.forEach((button) => button.removeEventListener('click', onCancel));
      dialog.removeEventListener('click', onBackdrop);
      dialog.removeEventListener('close', onCancel);
    };

    const onConfirm = () => {
      cleanup();
      dialog.close();
      resolve(true);
    };
    const onCancel = () => {
      cleanup();
      if (dialog.open) dialog.close();
      resolve(false);
    };
    const onBackdrop = (event) => {
      if (event.target === dialog) onCancel();
    };

    confirmBtn.addEventListener('click', onConfirm);
    cancelButtons.forEach((button) => button.addEventListener('click', onCancel));
    dialog.addEventListener('click', onBackdrop);
    dialog.addEventListener('close', onCancel, { once: true });
    dialog.showModal();
  });
};

const openExportDialog = () => {
  const dialog = document.querySelector('[data-js-export-dialog]');
  if (!dialog) return;

  const form = dialog.querySelector('[data-js-export-form]');
  const startInput = dialog.querySelector('[data-js-export-start]');
  const endInput = dialog.querySelector('[data-js-export-end]');
  const errorEl = dialog.querySelector('[data-js-export-error]');
  const confirmBtn = dialog.querySelector('[data-js-export-confirm]');
  const closeButtons = dialog.querySelectorAll('[data-js-export-close]');

  const defaults = getCurrentWeekRange();
  startInput.value = defaults.start;
  endInput.value = defaults.end;

  const renderValidation = () => {
    const validation = validateDateRange(startInput.value, endInput.value, {
      startRequiredMessage: 'Date de début requise',
      endRequiredMessage: 'Date de fin requise',
      orderMessage: 'La date de fin doit être ≥ date de début',
      allowEqual: true,
    });
    setFieldError(endInput, errorEl, validation.valid ? '' : validation.error);
    confirmBtn.disabled = !validation.valid;
    return validation.valid;
  };

  const downloadPayload = () => {
    const payload = buildExportPayload({
      start: startInput.value,
      end: endInput.value,
      entries: getAllEntries(),
      projects: getAllProjects(),
      sessions: getAllSessions(),
    });

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = getExportFilename(startInput.value, endInput.value);
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast({ message: 'Export téléchargé.', variant: 'success' });
  };

  const cleanup = () => {
    form.removeEventListener('input', renderValidation);
    form.removeEventListener('submit', onSubmit);
    closeButtons.forEach((button) => button.removeEventListener('click', onClose));
    dialog.removeEventListener('click', onBackdrop);
    dialog.removeEventListener('close', onClose);
  };

  const onClose = () => {
    cleanup();
    if (dialog.open) dialog.close();
  };
  const onBackdrop = (event) => {
    if (event.target === dialog) onClose();
  };
  const onSubmit = (event) => {
    event.preventDefault();
    if (!renderValidation()) return;
    downloadPayload();
    onClose();
  };

  renderValidation();
  form.addEventListener('input', renderValidation);
  form.addEventListener('submit', onSubmit);
  closeButtons.forEach((button) => button.addEventListener('click', onClose));
  dialog.addEventListener('click', onBackdrop);
  dialog.addEventListener('close', onClose, { once: true });
  dialog.showModal();
};

const openImportDialog = () => {
  const dialog = document.querySelector('[data-js-import-dialog]');
  if (!dialog) return;

  const fileInput = dialog.querySelector('[data-js-import-file]');
  const browseBtn = dialog.querySelector('[data-js-import-browse]');
  const clearBtn = dialog.querySelector('[data-js-import-clear]');
  const fileBox = dialog.querySelector('[data-js-import-file-box]');
  const fileName = dialog.querySelector('[data-js-import-file-name]');
  const fileSize = dialog.querySelector('[data-js-import-file-size]');
  const errorAlert = dialog.querySelector('[data-js-import-error]');
  const errorMessage = dialog.querySelector('[data-js-import-error-message]');
  const previewRoot = dialog.querySelector('[data-js-import-preview]');
  const importBtn = dialog.querySelector('[data-js-import-confirm]');
  const closeButtons = dialog.querySelectorAll('[data-js-import-close]');
  const dropzone = dialog.querySelector('[data-js-import-dropzone]');

  const state = {
    file: null,
    payload: null,
  };

  const render = () => {
    fileBox.hidden = !state.file;
    previewRoot.hidden = !state.payload;
    errorAlert.hidden = true;
    errorMessage.textContent = '';
    importBtn.disabled = !state.payload;

    if (state.file) {
      fileName.textContent = state.file.name;
      fileSize.textContent = formatBytes(state.file.size);
    }

    if (state.payload) {
      previewRoot.innerHTML = createPreviewTable(state.payload);
    } else {
      previewRoot.innerHTML = '';
    }
  };

  const showError = (message) => {
    state.payload = null;
    importBtn.disabled = true;
    previewRoot.hidden = true;
    previewRoot.innerHTML = '';
    errorAlert.hidden = false;
    errorMessage.textContent = message;
  };

  const handleFile = async (file) => {
    state.file = file ?? null;
    state.payload = null;
    render();
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json')) {
      showError('Le fichier doit être au format JSON.');
      return;
    }

    try {
      const text = await readFileText(file);
      state.payload = parseImportPayload(text);
      render();
    } catch (error) {
      showError(error.message || 'Structure du fichier non reconnue');
    }
  };

  const cleanup = () => {
    fileInput.removeEventListener('change', onFileChange);
    browseBtn.removeEventListener('click', onBrowse);
    clearBtn.removeEventListener('click', onClear);
    importBtn.removeEventListener('click', onImport);
    closeButtons.forEach((button) => button.removeEventListener('click', onClose));
    dialog.removeEventListener('click', onBackdrop);
    dropzone.removeEventListener('dragover', onDragOver);
    dropzone.removeEventListener('dragleave', onDragLeave);
    dropzone.removeEventListener('drop', onDrop);
    dialog.removeEventListener('close', onClose);
  };

  const onClose = () => {
    cleanup();
    if (dialog.open) dialog.close();
  };
  const onBackdrop = (event) => {
    if (event.target === dialog) onClose();
  };
  const onBrowse = () => fileInput.click();
  const onClear = () => {
    fileInput.value = '';
    handleFile(null);
  };
  const onFileChange = () => handleFile(fileInput.files?.[0] ?? null);
  const onDragOver = (event) => {
    event.preventDefault();
    dropzone.dataset.dragover = 'true';
  };
  const onDragLeave = () => {
    delete dropzone.dataset.dragover;
  };
  const onDrop = (event) => {
    event.preventDefault();
    delete dropzone.dataset.dragover;
    const [file] = event.dataTransfer?.files ?? [];
    if (file) handleFile(file);
  };
  const onImport = async () => {
    if (!state.payload) return;
    const confirmed = await confirmImport();
    if (!confirmed) return;

    try {
      const storageData = payloadToStorageData(state.payload);
      applyImportedStorage(storageData);
      queueToastForReload({
        message: `Données importées avec succès (${storageData.sessions.length} sessions, ${storageData.entries.length} jours).`,
        variant: 'success',
      });
      window.location.reload();
    } catch (error) {
      showToast({ message: error.message || 'Erreur lors de l’import', variant: 'danger' });
    }
  };

  state.file = null;
  state.payload = null;
  fileInput.value = '';
  render();

  fileInput.addEventListener('change', onFileChange);
  browseBtn.addEventListener('click', onBrowse);
  clearBtn.addEventListener('click', onClear);
  importBtn.addEventListener('click', onImport);
  closeButtons.forEach((button) => button.addEventListener('click', onClose));
  dialog.addEventListener('click', onBackdrop);
  dialog.addEventListener('close', onClose, { once: true });
  dropzone.addEventListener('dragover', onDragOver);
  dropzone.addEventListener('dragleave', onDragLeave);
  dropzone.addEventListener('drop', onDrop);
  dialog.showModal();
};

export const initDataTransfer = () => {
  document.querySelector('[data-js-export-open]')?.addEventListener('click', openExportDialog);
  document.querySelector('[data-js-import-open]')?.addEventListener('click', openImportDialog);
};
