const parseComparableValue = (value) => {
  if (value == null || value === '') return null;
  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isNaN(ms) ? Number.NaN : ms;
  }
  if (typeof value === 'number') return Number.isFinite(value) ? value : Number.NaN;
  if (typeof value === 'string') {
    const ms = new Date(value).getTime();
    return Number.isNaN(ms) ? Number.NaN : ms;
  }
  return Number.NaN;
};

const validResult = Object.freeze({ valid: true, error: '' });

export const validateRequired = (value, message = 'Ce champ est requis') => {
  if (value == null) return { valid: false, error: message };
  if (typeof value === 'string' && value === '') return { valid: false, error: message };
  return validResult;
};

export const validateUniqueName = (name, existing, { excludeId = null } = {}) => {
  const required = validateRequired(name, 'Le nom du projet ne peut pas être vide.');
  if (!required.valid) return required;

  if (typeof name !== 'string' || name.trim() === '') {
    return { valid: false, error: 'Le nom ne peut contenir que des espaces' };
  }

  const duplicate = existing.some((item) =>
    (excludeId == null || item.id !== excludeId) &&
    item.name.trim().toLowerCase() === name.trim().toLowerCase());

  return duplicate
    ? { valid: false, error: 'Ce nom de projet existe déjà' }
    : validResult;
};

export const validateDateRange = (
  start,
  end,
  { startRequiredMessage = 'Date de début requise', endRequiredMessage = 'Date de fin requise', orderMessage = 'La fin doit être après le début', allowEqual = false } = {},
) => {
  const startRequired = validateRequired(start, startRequiredMessage);
  if (!startRequired.valid) return startRequired;

  const endRequired = validateRequired(end, endRequiredMessage);
  if (!endRequired.valid) return endRequired;

  const startValue = parseComparableValue(start);
  const endValue = parseComparableValue(end);
  if (Number.isNaN(startValue) || Number.isNaN(endValue)) {
    return { valid: false, error: orderMessage };
  }

  if (allowEqual ? endValue < startValue : endValue <= startValue) {
    return { valid: false, error: orderMessage };
  }

  return validResult;
};

export const validateTimeOrder = (times) => {
  const ordered = times.filter((item) => item?.value != null);
  for (let index = 1; index < ordered.length; index += 1) {
    if (ordered[index].value <= ordered[index - 1].value) {
      return {
        valid: false,
        error: 'Viole l’ordre chronologique',
      };
    }
  }
  return validResult;
};

export const validatePunchStateMachine = (entry, candidate) => {
  const nextType = candidate?.type;
  const lastBreak = entry?.breaks?.at(-1) ?? null;

  switch (nextType) {
    case 'arrival':
      return entry?.arrivedAt == null
        ? validResult
        : { valid: false, error: 'Entrée déjà existante pour ce jour' };
    case 'breakStart':
      if (entry?.arrivedAt == null) {
        return { valid: false, error: 'Incohérent avec l’état actuel du pointage' };
      }
      if (entry.departedAt != null || (lastBreak && lastBreak.endAt == null)) {
        return { valid: false, error: 'Incohérent avec l’état actuel du pointage' };
      }
      return validResult;
    case 'breakEnd':
      if (!lastBreak || lastBreak.endAt != null) {
        return { valid: false, error: 'Incohérent avec l’état actuel du pointage' };
      }
      return validResult;
    case 'departure':
      if (entry?.arrivedAt == null || entry.departedAt != null || (lastBreak && lastBreak.endAt == null)) {
        return { valid: false, error: 'Incohérent avec l’état actuel du pointage' };
      }
      return validResult;
    default:
      return { valid: false, error: 'Incohérent avec l’état actuel du pointage' };
  }
};

export const validateImportStructure = (json) => {
  if (typeof json !== 'object' || json == null || Array.isArray(json)) {
    return { valid: false, error: 'Structure du fichier non reconnue' };
  }

  if (!('version' in json)) {
    return { valid: false, error: 'Version de fichier non supportée' };
  }

  if (json.version !== 1) {
    return { valid: false, error: 'Version de fichier non supportée' };
  }

  if (!json.range || typeof json.range !== 'object') {
    return { valid: false, error: 'Structure du fichier non reconnue' };
  }

  const rangeValidation = validateDateRange(json.range.start, json.range.end, {
    startRequiredMessage: 'Date de début requise',
    endRequiredMessage: 'Date de fin requise',
    orderMessage: 'Date de fin < date de début',
    allowEqual: true,
  });
  if (!rangeValidation.valid) return rangeValidation;

  if (!Array.isArray(json.punches) || !Array.isArray(json.projects) || !Array.isArray(json.sessions)) {
    return { valid: false, error: 'Structure du fichier non reconnue' };
  }

  return validResult;
};
