/**
 * Validates that all punch times in an entry are in strict chronological order.
 * Handles open breaks (endAt == null) and missing departure.
 *
 * @param {object|null} entry
 * @returns {boolean}
 */
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

/**
 * Applies a time edit to an entry and validates the result.
 * Returns the updated entry, or null if the change breaks chronology.
 *
 * @param {object} entry
 * @param {string} punchType - 'arrival' | 'departure' | 'breakStart' | 'breakEnd'
 * @param {number|null} breakIndex
 * @param {number} newMs - new time in milliseconds since midnight
 * @returns {object|null}
 */
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
