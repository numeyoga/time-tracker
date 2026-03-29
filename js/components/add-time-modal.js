import { getAllProjects, getProjectById } from '../storage/projects.js';
import { createManualSession } from '../storage/sessions.js';
import { getTodayEntry } from '../storage/entries.js';
import { todayISO } from '../utils/time.js';

const DEFAULT_START_TIME = '09:00';
const DEFAULT_DURATION_HOURS = '1';
const DEFAULT_DURATION_MINUTES = '0';

const createDateTime = (dateValue, timeValue) => {
  if (!dateValue || !timeValue) return null;
  const value = new Date(`${dateValue}T${timeValue}:00`);
  return Number.isNaN(value.getTime()) ? null : value;
};

const isWithinTodayPunchBounds = (dateValue, startedAt, endedAt) => {
  if (dateValue !== todayISO()) return true;

  const entry = getTodayEntry();
  if (!entry?.arrivedAt) return true;

  const lowerBound = entry.arrivedAt;
  const upperBound = entry.departedAt ?? Date.now();
  return startedAt.getTime() >= lowerBound && endedAt.getTime() <= upperBound;
};

const getFieldState = ({
  projectId,
  dateValue,
  startTime,
  mode,
  durationHours,
  durationMinutes,
  endTime,
}) => {
  const errors = {
    project: '',
    date: '',
    startTime: '',
    duration: '',
    endTime: '',
  };

  const today = todayISO();
  const startedAt = createDateTime(dateValue, startTime);

  if (!projectId) {
    errors.project = 'Veuillez sélectionner un projet';
  }

  if (!dateValue) {
    errors.date = 'Date invalide';
  } else if (dateValue > today || !createDateTime(dateValue, '00:00')) {
    errors.date = 'Date invalide';
  }

  if (!startTime || !startedAt) {
    errors.startTime = 'Heure de début requise';
  }

  let endedAt = null;

  if (mode === 'duration') {
    const hours = Number(durationHours);
    const minutes = Number(durationMinutes);

    if (!Number.isInteger(hours) || hours < 0 || hours > 23) {
      errors.duration = 'Heures entre 0 et 23';
    } else if (!Number.isInteger(minutes) || minutes < 0 || minutes > 59) {
      errors.duration = 'Minutes entre 0 et 59';
    } else if ((hours * 60) + minutes <= 0) {
      errors.duration = 'La durée doit être supérieure à 0';
    } else if (startedAt) {
      endedAt = new Date(startedAt.getTime() + ((hours * 60) + minutes) * 60_000);
    }
  } else {
    endedAt = createDateTime(dateValue, endTime);
    if (!endTime || !endedAt || !startedAt || endedAt.getTime() <= startedAt.getTime()) {
      errors.endTime = "L'heure de fin doit être après le début";
    }
  }

  if (startedAt && endedAt && !isWithinTodayPunchBounds(dateValue, startedAt, endedAt)) {
    const boundsError = 'La session dépasse les bornes de la journée';
    if (mode === 'duration') {
      errors.duration = boundsError;
    } else {
      errors.endTime = boundsError;
    }
  }

  const isValid = Object.values(errors).every((message) => !message) && Boolean(startedAt) && Boolean(endedAt);

  return {
    isValid,
    errors,
    startedAt,
    endedAt,
  };
};

const setFieldError = (input, errorEl, message) => {
  if (!input || !errorEl) return;

  if (message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', errorEl.id);
  } else {
    errorEl.textContent = '';
    errorEl.hidden = true;
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
  }
};

const syncModePanels = (dialog, mode) => {
  const durationPanel = dialog.querySelector('[data-js-add-time-duration-panel]');
  const endTimePanel = dialog.querySelector('[data-js-add-time-end-time-panel]');
  if (!durationPanel || !endTimePanel) return;

  durationPanel.hidden = mode !== 'duration';
  endTimePanel.hidden = mode !== 'end-time';
};

const fillProjectOptions = (select) => {
  const projects = getAllProjects();
  const placeholderOption = document.createElement('option');
  placeholderOption.value = '';
  placeholderOption.textContent = 'Choisir un projet...';

  const options = projects.map((project) => {
    const option = document.createElement('option');
    option.value = project.id;
    option.textContent = project.name;
    return option;
  });

  select.replaceChildren(placeholderOption, ...options);
};

export const openAddTimeDialog = ({ onSuccess } = {}) => {
  const dialog = document.querySelector('[data-js-add-time-dialog]');
  if (!dialog) return Promise.resolve(null);

  const form = dialog.querySelector('[data-js-add-time-form]');
  const projectSelect = dialog.querySelector('[data-js-add-time-project]');
  const dateInput = dialog.querySelector('[data-js-add-time-date]');
  const startTimeInput = dialog.querySelector('[data-js-add-time-start]');
  const durationHoursInput = dialog.querySelector('[data-js-add-time-duration-hours]');
  const durationMinutesInput = dialog.querySelector('[data-js-add-time-duration-minutes]');
  const endTimeInput = dialog.querySelector('[data-js-add-time-end]');
  const confirmBtn = dialog.querySelector('[data-js-add-time-confirm]');
  const cancelBtn = dialog.querySelector('[data-js-add-time-cancel]');
  const closeBtn = dialog.querySelector('[data-js-add-time-close]');
  const modeInputs = dialog.querySelectorAll('input[name="add-time-mode"]');

  const errorEls = {
    project: dialog.querySelector('[data-js-add-time-project-error]'),
    date: dialog.querySelector('[data-js-add-time-date-error]'),
    startTime: dialog.querySelector('[data-js-add-time-start-error]'),
    duration: dialog.querySelector('[data-js-add-time-duration-error]'),
    endTime: dialog.querySelector('[data-js-add-time-end-error]'),
  };

  const readState = () => ({
    projectId: projectSelect.value,
    dateValue: dateInput.value,
    startTime: startTimeInput.value,
    mode: form.elements['add-time-mode'].value,
    durationHours: durationHoursInput.value,
    durationMinutes: durationMinutesInput.value,
    endTime: endTimeInput.value,
  });

  fillProjectOptions(projectSelect);
  form.reset();
  projectSelect.value = '';
  dateInput.value = todayISO();
  startTimeInput.value = DEFAULT_START_TIME;
  durationHoursInput.value = DEFAULT_DURATION_HOURS;
  durationMinutesInput.value = DEFAULT_DURATION_MINUTES;
  endTimeInput.value = '';
  syncModePanels(dialog, 'duration');

  return new Promise((resolve) => {
    const renderValidation = () => {
      const state = readState();
      syncModePanels(dialog, state.mode);

      const validation = getFieldState(state);
      setFieldError(projectSelect, errorEls.project, validation.errors.project);
      setFieldError(dateInput, errorEls.date, validation.errors.date);
      setFieldError(startTimeInput, errorEls.startTime, validation.errors.startTime);
      setFieldError(durationHoursInput, errorEls.duration, validation.errors.duration);
      setFieldError(durationMinutesInput, errorEls.duration, validation.errors.duration);
      setFieldError(endTimeInput, errorEls.endTime, validation.errors.endTime);
      confirmBtn.disabled = !validation.isValid;
      return validation;
    };

    const cleanup = () => {
      form.removeEventListener('input', onInput);
      form.removeEventListener('change', onInput);
      form.removeEventListener('submit', onSubmit);
      cancelBtn.removeEventListener('click', onCancel);
      closeBtn.removeEventListener('click', onCancel);
      dialog.removeEventListener('click', onBackdropClick);
      dialog.removeEventListener('close', onDialogClose);
      modeInputs.forEach((input) => input.removeEventListener('change', onInput));
    };

    const finish = (value) => {
      cleanup();
      if (dialog.open) dialog.close();
      resolve(value);
    };

    const onInput = () => {
      renderValidation();
    };

    const onSubmit = (event) => {
      event.preventDefault();
      const validation = renderValidation();
      if (!validation.isValid) return;

      const session = createManualSession({
        projectId: projectSelect.value,
        startedAt: validation.startedAt.toISOString(),
        endedAt: validation.endedAt.toISOString(),
      });

      onSuccess?.(session, getProjectById(session.projectId));
      finish(session);
    };

    const onCancel = () => finish(null);
    const onDialogClose = () => finish(null);
    const onBackdropClick = (event) => {
      if (event.target === dialog) finish(null);
    };

    form.addEventListener('input', onInput);
    form.addEventListener('change', onInput);
    form.addEventListener('submit', onSubmit);
    cancelBtn.addEventListener('click', onCancel);
    closeBtn.addEventListener('click', onCancel);
    dialog.addEventListener('click', onBackdropClick);
    dialog.addEventListener('close', onDialogClose, { once: true });
    modeInputs.forEach((input) => input.addEventListener('change', onInput));

    renderValidation();
    dialog.showModal();
    projectSelect.focus();
  });
};
