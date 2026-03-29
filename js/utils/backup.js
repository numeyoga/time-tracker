import { buildPunchList } from '../components/punch-clock.js';
import { validateDateRange, validateImportStructure, validateRequired, validateTimeOrder, validateUniqueName } from './validation.js';
import { formatDateLong, msToHHMM, timeStrToMs } from './time.js';

const ENTRY_TYPE_MAP = {
  arrival: 'arrival',
  breakStart: 'break_start',
  breakEnd: 'break_end',
  departure: 'departure',
};

const IMPORT_TYPE_MAP = {
  arrival: 'arrival',
  break_start: 'breakStart',
  break_end: 'breakEnd',
  departure: 'departure',
};

const STORAGE_KEYS = {
  projects: 'time-tracker-projects',
  sessions: 'time-tracker-sessions',
  entries: 'tt_entries',
  multi: 'time-tracker-multi-project',
};

const isIsoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value);
const isTime = (value) => /^\d{2}:\d{2}$/.test(value);

export const getCurrentWeekRange = (anchorDate = new Date()) => {
  const date = new Date(anchorDate);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const start = new Date(date);
  start.setDate(date.getDate() + diff);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const toIsoDate = (input) => {
    const year = input.getFullYear();
    const month = String(input.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(input.getDate()).padStart(2, '0');
    return `${year}-${month}-${dayOfMonth}`;
  };

  return {
    start: toIsoDate(start),
    end: toIsoDate(end),
  };
};

const isDateInRange = (isoDate, start, end) => isoDate >= start && isoDate <= end;

export const buildExportPayload = ({
  start,
  end,
  entries,
  projects,
  sessions,
  exportDate = new Date().toISOString(),
}) => {
  const rangeValidation = validateDateRange(start, end, {
    startRequiredMessage: 'Date de début requise',
    endRequiredMessage: 'Date de fin requise',
    orderMessage: 'La date de fin doit être ≥ date de début',
    allowEqual: true,
  });
  if (!rangeValidation.valid) throw new Error(rangeValidation.error);

  const filteredEntries = entries
    .filter((entry) => isDateInRange(entry.date, start, end))
    .sort((a, b) => a.date.localeCompare(b.date));

  const filteredSessions = sessions
    .filter((session) => isDateInRange(session.startedAt.slice(0, 10), start, end))
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt));

  const referencedProjectIds = new Set(filteredSessions.map((session) => session.projectId));

  return {
    version: 1,
    exportDate,
    range: { start, end },
    punches: filteredEntries.map((entry) => ({
      date: entry.date,
      entries: buildPunchList(entry).map((punch) => ({
        type: ENTRY_TYPE_MAP[punch.type],
        time: msToHHMM(punch.ms),
      })),
    })),
    projects: projects
      .filter((project) => referencedProjectIds.has(project.id))
      .map((project) => ({ id: project.id, name: project.name })),
    sessions: filteredSessions.map((session) => ({
      projectId: session.projectId,
      date: session.startedAt.slice(0, 10),
      start: msToHHMM(new Date(session.startedAt).getTime()),
      end: session.endedAt ? msToHHMM(new Date(session.endedAt).getTime()) : null,
      status: session.endedAt ? 'completed' : 'active',
    })),
  };
};

export const getExportFilename = (start, end) => `time-tracker-export-${start}-${end}.json`;

export const getExportPreview = (payload) => ({
  period: `${formatDateLong(payload.range.start)} – ${formatDateLong(payload.range.end)}`,
  projects: payload.projects.length,
  sessions: payload.sessions.length,
  punches: payload.punches.length,
});

export const parseImportPayload = (text) => {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Le fichier n’est pas un JSON valide');
  }

  const structureValidation = validateImportStructure(parsed);
  if (!structureValidation.valid) throw new Error(structureValidation.error);

  const seenProjects = [];
  for (const project of parsed.projects) {
    if (!project || typeof project.id !== 'string') {
      throw new Error('Structure du fichier non reconnue');
    }
    const nameValidation = validateUniqueName(project.name, seenProjects, { excludeId: project.id });
    if (!nameValidation.valid) throw new Error(nameValidation.error);
    seenProjects.push(project);
  }

  const projectIds = new Set(parsed.projects.map((project) => project.id));

  for (const punchDay of parsed.punches) {
    if (!punchDay || !isIsoDate(punchDay.date) || !Array.isArray(punchDay.entries)) {
      throw new Error('Structure du fichier non reconnue');
    }
    for (const item of punchDay.entries) {
      if (!IMPORT_TYPE_MAP[item?.type] || !isTime(item?.time)) {
        throw new Error('Structure du fichier non reconnue');
      }
    }
  }

  for (const session of parsed.sessions) {
    if (!session || typeof session.projectId !== 'string' || !isIsoDate(session.date) || !isTime(session.start)) {
      throw new Error('Structure du fichier non reconnue');
    }
    if (!projectIds.has(session.projectId)) {
      throw new Error('Structure du fichier non reconnue');
    }
    if (session.end != null && !isTime(session.end)) {
      throw new Error('Structure du fichier non reconnue');
    }
    if (!['completed', 'active'].includes(session.status)) {
      throw new Error('Structure du fichier non reconnue');
    }
    if (session.status === 'completed') {
      const rangeValidation = validateDateRange(
        `${session.date}T${session.start}:00`,
        `${session.date}T${session.end}:00`,
        {
          startRequiredMessage: 'Heure de début requise',
          endRequiredMessage: 'Heure de fin requise',
          orderMessage: 'La fin doit être après le début',
        },
      );
      if (!rangeValidation.valid) throw new Error(rangeValidation.error);
    }
  }

  return parsed;
};

export const payloadToStorageData = (payload) => {
  const entries = payload.punches.map((day, dayIndex) => {
    const baseDate = new Date(`${day.date}T00:00:00`);
    const times = day.entries.map((entry) => ({
      type: IMPORT_TYPE_MAP[entry.type],
      value: timeStrToMs(entry.time, baseDate),
    }));

    const chronologyValidation = validateTimeOrder(times.map((item) => ({
      label: item.type,
      value: item.value,
    })));
    if (!chronologyValidation.valid) throw new Error(chronologyValidation.error);

    const rebuilt = {
      id: `entry_import_${dayIndex}_${day.date}`,
      date: day.date,
      arrivedAt: null,
      departedAt: null,
      breaks: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    for (const item of times) {
      switch (item.type) {
        case 'arrival':
          rebuilt.arrivedAt = item.value;
          break;
        case 'breakStart':
          rebuilt.breaks.push({ startAt: item.value, endAt: null });
          break;
        case 'breakEnd':
          if (!rebuilt.breaks.at(-1)) throw new Error('Structure du fichier non reconnue');
          rebuilt.breaks.at(-1).endAt = item.value;
          break;
        case 'departure':
          rebuilt.departedAt = item.value;
          break;
        default:
          throw new Error('Structure du fichier non reconnue');
      }
    }

    return rebuilt;
  });

  const sessions = payload.sessions.map((session, index) => {
    const startedAt = new Date(`${session.date}T${session.start}:00`).toISOString();
    const endedAt = session.end == null ? null : new Date(`${session.date}T${session.end}:00`).toISOString();
    return {
      id: `sess_import_${index}_${session.projectId}`,
      projectId: session.projectId,
      startedAt,
      endedAt,
      duration: endedAt == null ? null : new Date(endedAt).getTime() - new Date(startedAt).getTime(),
    };
  });

  const projects = payload.projects.map((project, index) => ({
    id: project.id,
    name: project.name.trim(),
    createdAt: new Date(Date.now() + index).toISOString(),
  }));

  return { projects, sessions, entries };
};

export const snapshotStorage = () => ({
  projects: localStorage.getItem(STORAGE_KEYS.projects),
  sessions: localStorage.getItem(STORAGE_KEYS.sessions),
  entries: localStorage.getItem(STORAGE_KEYS.entries),
  multi: localStorage.getItem(STORAGE_KEYS.multi),
});

export const applyImportedStorage = ({ projects, sessions, entries }) => {
  const snapshot = snapshotStorage();

  try {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
    localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(sessions));
    localStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(entries));
  } catch (error) {
    localStorage.clear();
    Object.entries(snapshot).forEach(([key, value]) => {
      if (value != null) localStorage.setItem(STORAGE_KEYS[key], value);
    });
    throw error;
  }
};
