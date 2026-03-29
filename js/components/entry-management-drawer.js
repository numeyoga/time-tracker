import {
  getAllEntries,
  getEntryByDate,
  replaceEntry,
} from '../storage/entries.js';
import { buildPunchList, openDeleteDialog } from './punch-clock.js';
import { formatDateLong, msToHHMM, timeStrToMs, todayISO } from '../utils/time.js';
import { validatePunchStateMachine, validateRequired } from '../utils/validation.js';
import { showToast } from './toast.js';

const PUNCH_TYPE_META = {
  arrival: { label: 'Arrivée', icon: '#icon-log-in', color: 'success' },
  breakStart: { label: 'Début pause', icon: '#icon-pause', color: 'warning' },
  breakEnd: { label: 'Fin pause', icon: '#icon-play', color: 'info' },
  departure: { label: 'Départ', icon: '#icon-log-out', color: 'danger' },
};

const createSvgIcon = (href, { color = null } = {}) => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('aria-hidden', 'true');
  if (color) svg.dataset.color = color;
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', href);
  svg.appendChild(use);
  return svg;
};

const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfWeek = (date) => {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
};

const startOfMonth = (date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfMonth = (date) => {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
};

const isoFromDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getPeriodDays = (mode, anchorDate) => {
  const days = [];
  const start = mode === 'month' ? startOfMonth(anchorDate) : startOfWeek(anchorDate);
  const end = mode === 'month' ? endOfMonth(anchorDate) : endOfWeek(anchorDate);
  for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    days.push(isoFromDate(cursor));
  }
  return new Set(days);
};

const formatFilterLabel = (filter) => {
  if (!filter) return 'Vue globale de toutes les journées.';

  if (filter.mode === 'month') {
    return `Filtre actif : ${filter.anchorDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
  }

  const start = startOfWeek(filter.anchorDate);
  const end = endOfWeek(filter.anchorDate);
  const startLabel = start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  const endLabel = end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  return `Filtre actif : semaine du ${startLabel} au ${endLabel}.`;
};

export const filterEntriesForManagement = (entries, filter = null) => {
  if (!filter) return [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const allowedDays = getPeriodDays(filter.mode, filter.anchorDate);
  return entries
    .filter((entry) => allowedDays.has(entry.date))
    .sort((a, b) => b.date.localeCompare(a.date));
};

export const validatePunchChronology = (entry) => {
  if (!entry) return false;
  if (entry.arrivedAt == null) {
    return entry.departedAt == null && (!entry.breaks || entry.breaks.length === 0);
  }

  let cursor = entry.arrivedAt;

  for (let i = 0; i < entry.breaks.length; i += 1) {
    const item = entry.breaks[i];
    if (item.startAt == null || item.startAt <= cursor) return false;
    cursor = item.startAt;

    if (item.endAt == null) {
      return i === entry.breaks.length - 1 && entry.departedAt == null;
    }

    if (item.endAt <= item.startAt) return false;
    cursor = item.endAt;
  }

  if (entry.departedAt != null && entry.departedAt <= cursor) return false;
  return true;
};

export const applyPunchTimeEdit = (entry, punchType, breakIndex, newMs) => {
  const updated = structuredClone(entry);

  switch (punchType) {
    case 'arrival':
      updated.arrivedAt = newMs;
      break;
    case 'departure':
      updated.departedAt = newMs;
      break;
    case 'breakStart':
      updated.breaks[breakIndex].startAt = newMs;
      break;
    case 'breakEnd':
      updated.breaks[breakIndex].endAt = newMs;
      break;
    default:
      return null;
  }

  return validatePunchChronology(updated) ? updated : null;
};

export const deletePunchFromEntry = (entry, punchType, breakIndex) => {
  const updated = structuredClone(entry);

  switch (punchType) {
    case 'arrival':
      updated.arrivedAt = null;
      updated.departedAt = null;
      updated.breaks = [];
      break;
    case 'departure':
      updated.departedAt = null;
      break;
    case 'breakStart':
      updated.breaks.splice(breakIndex, 1);
      break;
    case 'breakEnd':
      updated.breaks[breakIndex].endAt = null;
      break;
    default:
      return null;
  }

  return updated;
};

export const addPunchToEntry = (entry, { type, isoDate, newMs }) => {
  const baseEntry = entry
    ? structuredClone(entry)
    : {
      id: crypto.randomUUID(),
      date: isoDate,
      arrivedAt: null,
      departedAt: null,
      breaks: [],
      createdAt: Date.now(),
    };

  const stateValidation = validatePunchStateMachine(entry ?? null, { type });
  if (!stateValidation.valid) {
    return { error: stateValidation.error };
  }

  switch (type) {
    case 'arrival':
      baseEntry.arrivedAt = newMs;
      break;
    case 'breakStart':
      baseEntry.breaks.push({ startAt: newMs, endAt: null });
      break;
    case 'breakEnd':
      baseEntry.breaks.at(-1).endAt = newMs;
      break;
    case 'departure':
      baseEntry.departedAt = newMs;
      break;
    default:
      return { error: 'Type de pointage inconnu.' };
  }

  if (!validatePunchChronology(baseEntry)) {
    return { error: 'Heure invalide : incohérence chronologique.' };
  }

  return { entry: baseEntry };
};

const renderEmptyState = (subtitle) => `
  <div class="empty-state" data-size="sm">
    <svg class="empty-state__icon" aria-hidden="true"><use href="#icon-calendar-off"></use></svg>
    <h3 class="empty-state__title">Aucune entrée à gérer</h3>
    <p class="empty-state__description">${subtitle}</p>
  </div>
`;

const renderPunchItem = (punch) => `
  <li class="entry-management__item"
      data-js-entry-punch-item
      data-punch-type="${punch.type}"
      ${punch.breakIndex != null ? `data-break-index="${punch.breakIndex}"` : ''}>
    <div class="entry-management__item-main">
      <span class="entry-management__item-icon" data-color="${punch.color}">
        <svg class="icon" aria-hidden="true" data-color="${punch.color}"><use href="${punch.icon}"></use></svg>
      </span>
      <div class="entry-management__item-copy">
        <span class="entry-management__item-label">${punch.label}</span>
        <span class="entry-management__item-meta">Pointage ${punch.label.toLowerCase()}</span>
      </div>
      <span class="entry-management__item-time" data-js-entry-punch-time>${msToHHMM(punch.ms)}</span>
      <div class="entry-management__item-actions" data-js-entry-punch-actions>
        <button class="btn" data-variant="ghost" data-size="sm" type="button" data-js-entry-edit aria-label="Modifier ${punch.label.toLowerCase()}">
          <svg class="icon" aria-hidden="true"><use href="#icon-pencil"></use></svg>
        </button>
        <button class="btn" data-variant="ghost" data-size="sm" type="button" data-js-entry-delete aria-label="Supprimer ${punch.label.toLowerCase()}">
          <svg class="icon" aria-hidden="true"><use href="#icon-trash"></use></svg>
        </button>
      </div>
    </div>
    <div class="entry-management__item-error" data-js-entry-item-error hidden></div>
  </li>
`;

const renderDayGroup = (entry) => {
  const punches = buildPunchList(entry);
  return `
    <section class="entry-management__day" data-js-entry-day data-iso-date="${entry.date}">
      <header class="entry-management__day-header">
        <div>
          <h3 class="entry-management__day-title">${formatDateLong(entry.date)}</h3>
          <p class="entry-management__day-subtitle">${entry.date}</p>
        </div>
        <span class="badge" data-variant="neutral">${punches.length} pointage${punches.length > 1 ? 's' : ''}</span>
      </header>
      <ul class="entry-management__list">
        ${punches.map((punch) => renderPunchItem(punch)).join('')}
      </ul>
    </section>
  `;
};

const createInlineEditActions = () => {
  const wrapper = document.createElement('div');
  wrapper.className = 'entry-management__edit';
  wrapper.dataset.jsEntryEditForm = '';

  const input = document.createElement('input');
  input.className = 'input entry-management__time-input';
  input.type = 'time';
  input.step = '60';
  input.dataset.jsEntryEditInput = '';

  const saveButton = document.createElement('button');
  saveButton.className = 'btn';
  saveButton.type = 'button';
  saveButton.dataset.variant = 'primary';
  saveButton.dataset.size = 'sm';
  saveButton.dataset.jsEntryEditSave = '';
  saveButton.setAttribute('aria-label', 'Enregistrer');
  saveButton.appendChild(createSvgIcon('#icon-save'));

  const cancelButton = document.createElement('button');
  cancelButton.className = 'btn';
  cancelButton.type = 'button';
  cancelButton.dataset.variant = 'secondary';
  cancelButton.dataset.size = 'sm';
  cancelButton.dataset.jsEntryEditCancel = '';
  cancelButton.setAttribute('aria-label', 'Annuler');
  cancelButton.appendChild(createSvgIcon('#icon-x'));

  wrapper.append(input, saveButton, cancelButton);
  return { wrapper, input };
};

const closeInlineEdit = (item) => {
  item.querySelector('[data-js-entry-edit-form]')?.remove();
  item.querySelector('[data-js-entry-punch-time]')?.removeAttribute('hidden');
  item.querySelector('[data-js-entry-punch-actions]')?.removeAttribute('hidden');
  const errorEl = item.querySelector('[data-js-entry-item-error]');
  errorEl?.setAttribute('hidden', '');
  if (errorEl) errorEl.textContent = '';
  delete item.dataset.editing;
};

const openEntryAddDialog = ({ filter }) => {
  const dialog = document.querySelector('[data-js-entry-add-dialog]');
  if (!dialog) return Promise.resolve(null);

  const form = dialog.querySelector('[data-js-entry-add-form]');
  const typeInput = dialog.querySelector('[data-js-entry-add-type]');
  const dateInput = dialog.querySelector('[data-js-entry-add-date]');
  const timeInput = dialog.querySelector('[data-js-entry-add-time]');
  const typeErrorEl = dialog.querySelector('[data-js-entry-add-type-error]');
  const dateErrorEl = dialog.querySelector('[data-js-entry-add-date-error]');
  const timeErrorEl = dialog.querySelector('[data-js-entry-add-time-error]');
  const confirmBtn = dialog.querySelector('[data-js-entry-add-confirm]');
  const closeButtons = dialog.querySelectorAll('[data-js-entry-add-close]');

  const initialDate = filter
    ? [...getPeriodDays(filter.mode, filter.anchorDate)].sort().at(-1) ?? todayISO()
    : todayISO();

  form.reset();
  typeInput.value = 'arrival';
  dateInput.value = initialDate;
  timeInput.value = '09:00';
  [typeErrorEl, dateErrorEl, timeErrorEl].forEach((element) => {
    element.hidden = true;
    element.textContent = '';
  });

  const setFieldError = (input, errorEl, message) => {
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

  const renderValidation = () => {
    const typeValidation = validateRequired(typeInput.value, 'Type requis');
    const dateValidation = validateRequired(dateInput.value, 'Date requise');
    const timeValidation = validateRequired(timeInput.value, 'Heure requise');

    let dateMessage = dateValidation.error;
    if (!dateMessage && filter && !getPeriodDays(filter.mode, filter.anchorDate).has(dateInput.value)) {
      dateMessage = 'La date doit appartenir à la période affichée.';
    }

    setFieldError(typeInput, typeErrorEl, typeValidation.error);
    setFieldError(dateInput, dateErrorEl, dateMessage);
    setFieldError(timeInput, timeErrorEl, timeValidation.error);

    const isValid = !typeValidation.error && !dateMessage && !timeValidation.error;
    confirmBtn.disabled = !isValid;
    return isValid;
  };

  return new Promise((resolve) => {
    const cleanup = () => {
      form.removeEventListener('input', renderValidation);
      form.removeEventListener('change', renderValidation);
      closeButtons.forEach((button) => button.removeEventListener('click', onCancel));
      form.removeEventListener('submit', onSubmit);
      dialog.removeEventListener('click', onBackdrop);
      dialog.removeEventListener('close', onCancel);
    };

    const onCancel = () => {
      cleanup();
      if (dialog.open) dialog.close();
      resolve(null);
    };

    const onBackdrop = (event) => {
      if (event.target === dialog) onCancel();
    };

    const onSubmit = (event) => {
      event.preventDefault();

      const isoDate = dateInput.value;
      const type = typeInput.value;
      const time = timeInput.value;
      if (!renderValidation()) return;

      cleanup();
      dialog.close();
      resolve({
        type,
        isoDate,
        newMs: timeStrToMs(time, new Date(`${isoDate}T00:00:00`)),
      });
    };

    form.addEventListener('input', renderValidation);
    form.addEventListener('change', renderValidation);
    closeButtons.forEach((button) => button.addEventListener('click', onCancel));
    form.addEventListener('submit', onSubmit);
    dialog.addEventListener('click', onBackdrop);
    dialog.addEventListener('close', onCancel, { once: true });
    renderValidation();
    dialog.showModal();
  });
};

export const openEntryManagementDrawer = ({ filter = null, onChange = () => {} } = {}) => {
  const dialog = document.querySelector('[data-js-entry-management-drawer]');
  if (!dialog) return Promise.resolve();

  const title = dialog.querySelector('[data-js-entry-management-title]');
  const subtitle = dialog.querySelector('[data-js-entry-management-subtitle]');
  const content = dialog.querySelector('[data-js-entry-management-content]');
  const addButton = dialog.querySelector('[data-js-entry-management-add]');
  const closeButtons = dialog.querySelectorAll('[data-js-entry-management-close]');

  const refresh = () => {
    const entries = filterEntriesForManagement(getAllEntries(), filter);
    title.textContent = 'Gestion des entrées';
    subtitle.textContent = formatFilterLabel(filter);
    content.innerHTML = entries.length > 0
      ? entries.map((entry) => renderDayGroup(entry)).join('')
      : renderEmptyState(filter ? 'Aucune entrée dans la période sélectionnée.' : 'Aucune journée pointée pour le moment.');
  };

  const startInlineEdit = (item) => {
    if (item.dataset.editing === 'true') return;

    item.dataset.editing = 'true';
    const timeEl = item.querySelector('[data-js-entry-punch-time]');
    const actionsEl = item.querySelector('[data-js-entry-punch-actions]');
    const errorEl = item.querySelector('[data-js-entry-item-error]');
    const { wrapper, input } = createInlineEditActions();

    timeEl.hidden = true;
    actionsEl.hidden = true;
    input.value = timeEl.textContent.trim();
    item.querySelector('.entry-management__item-main')?.appendChild(wrapper);
    input.focus();
    input.select();

    const saveEdit = () => {
      const day = item.closest('[data-js-entry-day]');
      const punchType = item.dataset.punchType;
      const breakIndex = item.dataset.breakIndex == null ? null : Number(item.dataset.breakIndex);
      const entry = getEntryByDate(day.dataset.isoDate);
      if (!entry) {
        closeInlineEdit(item);
        return;
      }

      const updated = applyPunchTimeEdit(
        entry,
        punchType,
        breakIndex,
        timeStrToMs(input.value, new Date(`${day.dataset.isoDate}T00:00:00`)),
      );

      if (!updated) {
        errorEl.hidden = false;
        errorEl.textContent = 'Heure invalide : incohérence chronologique.';
        input.setAttribute('aria-invalid', 'true');
        return;
      }

      replaceEntry(updated);
      closeInlineEdit(item);
      refresh();
      onChange();
      showToast({ message: 'Pointage mis à jour.', variant: 'success' });
    };

    wrapper.querySelector('[data-js-entry-edit-save]')?.addEventListener('click', saveEdit);
    wrapper.querySelector('[data-js-entry-edit-cancel]')?.addEventListener('click', () => closeInlineEdit(item));
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        saveEdit();
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        closeInlineEdit(item);
      }
    });
  };

  const handleDelete = async (item) => {
    const day = item.closest('[data-js-entry-day]');
    const punchType = item.dataset.punchType;
    const breakIndex = item.dataset.breakIndex == null ? null : Number(item.dataset.breakIndex);
    const label = item.querySelector('.entry-management__item-label')?.textContent ?? 'ce pointage';

    const confirmed = await openDeleteDialog(label);
    if (!confirmed) return;

    const entry = getEntryByDate(day.dataset.isoDate);
    if (!entry) return;

    const updated = deletePunchFromEntry(entry, punchType, breakIndex);
    replaceEntry(updated);
    refresh();
    onChange();
    showToast({ message: 'Pointage supprimé.', variant: 'success' });
  };

  const handleAdd = async () => {
    const payload = await openEntryAddDialog({ filter });
    if (!payload) return;

    const existingEntry = getEntryByDate(payload.isoDate);
    const result = addPunchToEntry(existingEntry, payload);
    if (result.error) {
      showToast({ message: result.error, variant: 'danger' });
      return;
    }

    replaceEntry(result.entry);
    refresh();
    onChange();
    showToast({ message: 'Pointage ajouté.', variant: 'success' });
  };

  refresh();

  return new Promise((resolve) => {
    const cleanup = () => {
      addButton?.removeEventListener('click', handleAdd);
      closeButtons.forEach((button) => button.removeEventListener('click', onClose));
      dialog.removeEventListener('click', onBackdrop);
      dialog.removeEventListener('close', onClose);
      content.removeEventListener('click', onContentClick);
    };

    const onClose = () => {
      cleanup();
      if (dialog.open) dialog.close();
      resolve();
    };

    const onBackdrop = (event) => {
      if (event.target === dialog) onClose();
    };

    const onContentClick = (event) => {
      const editButton = event.target.closest('[data-js-entry-edit]');
      if (editButton) {
        startInlineEdit(editButton.closest('[data-js-entry-punch-item]'));
        return;
      }

      const deleteButton = event.target.closest('[data-js-entry-delete]');
      if (deleteButton) {
        handleDelete(deleteButton.closest('[data-js-entry-punch-item]'));
      }
    };

    addButton?.addEventListener('click', handleAdd);
    closeButtons.forEach((button) => button.addEventListener('click', onClose));
    dialog.addEventListener('click', onBackdrop);
    dialog.addEventListener('close', onClose, { once: true });
    content.addEventListener('click', onContentClick);
    dialog.showModal();
  });
};
