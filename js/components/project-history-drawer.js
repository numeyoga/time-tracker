import { getProjectById } from '../storage/projects.js';
import { deleteSession, getSessionsForProject, updateSession } from '../storage/sessions.js';
import { formatDuration } from '../utils/time.js';
import { validateDateRange, validateRequired } from '../utils/validation.js';

const createSvgIcon = (href) => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', href);
  svg.appendChild(use);
  return svg;
};

const createIconButton = (label, iconHref, dataAttr, variant = 'ghost') => {
  const button = document.createElement('button');
  button.className = 'btn';
  button.type = 'button';
  button.dataset.variant = variant;
  button.dataset.size = 'sm';
  button.setAttribute('aria-label', label);
  button.dataset[dataAttr] = '';
  button.appendChild(createSvgIcon(iconHref));
  return button;
};

const toLocalDateInput = (isoString) => isoString.slice(0, 16);

const toTimeInputValue = (isoString) => {
  const date = new Date(isoString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const toDateTime = (isoString, timeValue) => {
  const date = new Date(isoString);
  const [hours, minutes] = timeValue.split(':').map(Number);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const getValidationError = (session, startValue, endValue) => {
  const startValidation = validateRequired(startValue, 'Heure de début requise');
  if (!startValidation.valid) return startValidation.error;
  if (session.endedAt != null) {
    const endValidation = validateRequired(endValue, 'Heure de fin requise');
    if (!endValidation.valid) return endValidation.error;
  }
  if (session.endedAt != null) {
    const startedAt = toDateTime(session.startedAt, startValue);
    const endedAt = toDateTime(session.startedAt, endValue);
    const rangeValidation = validateDateRange(startedAt, endedAt, {
      startRequiredMessage: 'Heure de début requise',
      endRequiredMessage: 'Heure de fin requise',
      orderMessage: 'La fin doit être après le début',
    });
    if (!rangeValidation.valid) {
      return rangeValidation.error;
    }
  }
  return '';
};

const createEmptyState = () => {
  const emptyState = document.createElement('div');
  emptyState.className = 'empty-state';
  emptyState.dataset.size = 'sm';

  const icon = createSvgIcon('#icon-calendar-off');
  icon.setAttribute('class', 'icon empty-state__icon');
  emptyState.appendChild(icon);

  const title = document.createElement('h3');
  title.className = 'empty-state__title';
  title.textContent = 'Aucune session enregistree';
  emptyState.appendChild(title);

  return emptyState;
};

const createDisplayRow = (session, index) => {
  const row = document.createElement('tr');
  row.className = 'data-table__row';
  row.dataset.jsProjectSessionRow = '';
  row.dataset.sessionId = session.id;

  const numberCell = document.createElement('td');
  numberCell.className = 'data-table__td';
  numberCell.textContent = String(index + 1);
  row.appendChild(numberCell);

  const startCell = document.createElement('td');
  startCell.className = 'data-table__td';
  startCell.textContent = toTimeInputValue(session.startedAt);
  row.appendChild(startCell);

  const endCell = document.createElement('td');
  endCell.className = 'data-table__td';
  endCell.textContent = session.endedAt ? toTimeInputValue(session.endedAt) : '--:--';
  row.appendChild(endCell);

  const durationCell = document.createElement('td');
  durationCell.className = 'data-table__td';
  durationCell.textContent = formatDuration(session.duration) || '0h00';
  row.appendChild(durationCell);

  const statusCell = document.createElement('td');
  statusCell.className = 'data-table__td';
  const badge = document.createElement('span');
  badge.className = 'badge';
  badge.dataset.variant = session.endedAt ? 'success' : 'info';
  badge.textContent = session.endedAt ? 'Terminee' : 'En cours';
  statusCell.appendChild(badge);
  row.appendChild(statusCell);

  const actionsCell = document.createElement('td');
  actionsCell.className = 'data-table__td data-table__td--actions';
  actionsCell.appendChild(createIconButton(`Modifier la session ${index + 1}`, '#icon-pencil', 'jsProjectSessionEdit'));
  actionsCell.appendChild(createIconButton(`Supprimer la session ${index + 1}`, '#icon-trash', 'jsProjectSessionDelete'));
  row.appendChild(actionsCell);

  return row;
};

const createEditingRow = (session, index) => {
  const row = document.createElement('tr');
  row.className = 'data-table__row';
  row.dataset.editing = '';
  row.dataset.sessionId = session.id;

  const numberCell = document.createElement('td');
  numberCell.className = 'data-table__td';
  numberCell.textContent = String(index + 1);
  row.appendChild(numberCell);

  const startCell = document.createElement('td');
  startCell.className = 'data-table__td';
  const startField = document.createElement('div');
  startField.className = 'form-field';
  const startInput = document.createElement('input');
  startInput.className = 'input';
  startInput.type = 'time';
  startInput.value = toTimeInputValue(session.startedAt);
  startInput.dataset.jsProjectSessionStart = '';
  startField.appendChild(startInput);
  startCell.appendChild(startField);
  row.appendChild(startCell);

  const endCell = document.createElement('td');
  endCell.className = 'data-table__td';
  const endField = document.createElement('div');
  endField.className = 'form-field';
  const endInput = document.createElement('input');
  endInput.className = 'input';
  endInput.type = 'time';
  endInput.value = session.endedAt ? toTimeInputValue(session.endedAt) : '';
  endInput.disabled = session.endedAt == null;
  endInput.dataset.jsProjectSessionEnd = '';
  endField.appendChild(endInput);
  endCell.appendChild(endField);
  row.appendChild(endCell);

  const durationCell = document.createElement('td');
  durationCell.className = 'data-table__td';
  durationCell.textContent = formatDuration(session.duration) || '0h00';
  row.appendChild(durationCell);

  const statusCell = document.createElement('td');
  statusCell.className = 'data-table__td';
  const error = document.createElement('span');
  error.className = 'form-field__error';
  error.dataset.jsProjectSessionError = '';
  error.role = 'alert';
  error.hidden = true;
  statusCell.appendChild(error);
  row.appendChild(statusCell);

  const actionsCell = document.createElement('td');
  actionsCell.className = 'data-table__td data-table__td--actions';
  const saveButton = createIconButton(`Enregistrer la session ${index + 1}`, '#icon-save', 'jsProjectSessionSave', 'primary');
  saveButton.disabled = Boolean(getValidationError(session, startInput.value, endInput.value));
  actionsCell.appendChild(saveButton);
  actionsCell.appendChild(createIconButton(`Annuler la modification de la session ${index + 1}`, '#icon-x', 'jsProjectSessionCancel'));
  row.appendChild(actionsCell);

  return row;
};

const renderSessions = (dialog, projectId, editingSessionId = null) => {
  const project = getProjectById(projectId);
  const title = dialog.querySelector('[data-js-project-history-title]');
  const content = dialog.querySelector('[data-js-project-history-content]');
  if (!project || !title || !content) return;

  title.textContent = `Details : ${project.name}`;
  const sessions = getSessionsForProject(projectId);

  if (sessions.length === 0) {
    content.replaceChildren(createEmptyState());
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'data-table-wrapper';
  wrapper.role = 'region';
  wrapper.tabIndex = 0;
  wrapper.setAttribute('aria-label', `Historique des sessions pour ${project.name}`);

  const table = document.createElement('table');
  table.className = 'data-table';
  table.dataset.density = 'compact';

  table.innerHTML = `
    <thead class="data-table__head">
      <tr>
        <th class="data-table__th" scope="col">#</th>
        <th class="data-table__th" scope="col">Debut</th>
        <th class="data-table__th" scope="col">Fin</th>
        <th class="data-table__th" scope="col">Duree</th>
        <th class="data-table__th" scope="col">Statut</th>
        <th class="data-table__th" scope="col"><span class="sr-only">Actions</span></th>
      </tr>
    </thead>
  `;

  const body = document.createElement('tbody');
  body.className = 'data-table__body';
  body.replaceChildren(...sessions.map((session, index) => (
    session.id === editingSessionId ? createEditingRow(session, index) : createDisplayRow(session, index)
  )));

  table.appendChild(body);
  wrapper.appendChild(table);
  content.replaceChildren(wrapper);
};

export const openProjectHistoryDrawer = ({ projectId, onChange }) => {
  const dialog = document.querySelector('[data-js-project-history-drawer]');
  const deleteDialog = document.querySelector('[data-js-project-session-delete-dialog]');
  if (!dialog) return Promise.resolve();

  const closeButtons = dialog.querySelectorAll('[data-js-project-history-close]');
  const content = dialog.querySelector('[data-js-project-history-content]');
  let editingSessionId = null;

  const rerender = () => renderSessions(dialog, projectId, editingSessionId);

  const confirmDelete = (sessionNumber) => {
    if (!deleteDialog) return Promise.resolve(window.confirm(`Supprimer la session #${sessionNumber} ?`));

    const message = deleteDialog.querySelector('[data-js-project-session-delete-message]');
    const confirmBtn = deleteDialog.querySelector('[data-js-project-session-delete-confirm]');
    const cancelBtn = deleteDialog.querySelector('[data-js-project-session-delete-cancel]');
    const closeBtn = deleteDialog.querySelector('[data-js-project-session-delete-close]');
    if (message) message.textContent = `Supprimer la session #${sessionNumber} ?`;

    return new Promise((resolveDelete) => {
      const cleanupDelete = () => {
        confirmBtn.removeEventListener('click', onConfirmDelete);
        cancelBtn.removeEventListener('click', onCancelDelete);
        closeBtn.removeEventListener('click', onCancelDelete);
        deleteDialog.removeEventListener('close', onCancelDelete);
      };

      const onConfirmDelete = () => {
        cleanupDelete();
        deleteDialog.close();
        resolveDelete(true);
      };
      const onCancelDelete = () => {
        cleanupDelete();
        if (deleteDialog.open) deleteDialog.close();
        resolveDelete(false);
      };

      confirmBtn.addEventListener('click', onConfirmDelete);
      cancelBtn.addEventListener('click', onCancelDelete);
      closeBtn.addEventListener('click', onCancelDelete);
      deleteDialog.addEventListener('close', onCancelDelete, { once: true });
      deleteDialog.showModal();
    });
  };

  return new Promise((resolve) => {
    const cleanup = () => {
      closeButtons.forEach((button) => button.removeEventListener('click', onClose));
      dialog.removeEventListener('click', onDialogClick);
      dialog.removeEventListener('input', onDialogInput);
      dialog.removeEventListener('close', onClose);
    };

    const finish = () => {
      cleanup();
      if (dialog.open) dialog.close();
      resolve();
    };

    const onClose = () => finish();

    const onDialogInput = (event) => {
      const row = event.target.closest('[data-editing]');
      if (!row) return;
      const session = getSessionsForProject(projectId).find((item) => item.id === row.dataset.sessionId);
      if (!session) return;
      const startInput = row.querySelector('[data-js-project-session-start]');
      const endInput = row.querySelector('[data-js-project-session-end]');
      const error = row.querySelector('[data-js-project-session-error]');
      const saveButton = row.querySelector('[data-js-project-session-save]');
      const message = getValidationError(session, startInput.value, endInput.value);
      error.textContent = message;
      error.hidden = !message;
      startInput.toggleAttribute('aria-invalid', Boolean(message));
      if (endInput) endInput.toggleAttribute('aria-invalid', Boolean(message));
      if (saveButton) saveButton.disabled = Boolean(message);
    };

    const onDialogClick = async (event) => {
      if (event.target === dialog) {
        finish();
        return;
      }

      const row = event.target.closest('[data-js-project-session-row], [data-editing]');

      if (event.target.closest('[data-js-project-session-edit]') && row) {
        editingSessionId = row.dataset.sessionId;
        rerender();
        content.querySelector('[data-js-project-session-start]')?.focus();
        return;
      }

      if (event.target.closest('[data-js-project-session-cancel]')) {
        editingSessionId = null;
        rerender();
        return;
      }

      if (event.target.closest('[data-js-project-session-save]') && row) {
        const session = getSessionsForProject(projectId).find((item) => item.id === row.dataset.sessionId);
        if (!session) return;
        const startInput = row.querySelector('[data-js-project-session-start]');
        const endInput = row.querySelector('[data-js-project-session-end]');
        const error = row.querySelector('[data-js-project-session-error]');
        const message = getValidationError(session, startInput.value, endInput.value);
        if (message) {
          error.textContent = message;
          error.hidden = false;
          return;
        }

        updateSession(session.id, {
          startedAt: toDateTime(session.startedAt, startInput.value).toISOString(),
          endedAt: session.endedAt == null ? null : toDateTime(session.startedAt, endInput.value).toISOString(),
        });
        editingSessionId = null;
        rerender();
        onChange?.({ type: 'update', project: getProjectById(projectId) });
        return;
      }

      if (event.target.closest('[data-js-project-session-delete]') && row) {
        const sessionNumber = Array.from(content.querySelectorAll('[data-js-project-session-row]')).findIndex(
          (item) => item.dataset.sessionId === row.dataset.sessionId,
        ) + 1;
        const confirmed = await confirmDelete(sessionNumber);
        if (!confirmed) return;

        deleteSession(row.dataset.sessionId);
        editingSessionId = null;
        rerender();
        onChange?.({ type: 'delete', project: getProjectById(projectId) });
      }
    };

    rerender();
    closeButtons.forEach((button) => button.addEventListener('click', onClose));
    dialog.addEventListener('click', onDialogClick);
    dialog.addEventListener('input', onDialogInput);
    dialog.addEventListener('close', onClose, { once: true });
    dialog.showModal();
  });
};
