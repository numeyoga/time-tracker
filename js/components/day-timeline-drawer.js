import { getEntryByDate } from '../storage/entries.js';
import { getAllProjects } from '../storage/projects.js';
import { getAllSessions } from '../storage/sessions.js';
import { computeTimelineSegmentsForDate, renderTimelineData } from './timeline-overview.js';

const PROJECT_COLORS = [
  'var(--timeline-color-1)',
  'var(--timeline-color-2)',
  'var(--timeline-color-3)',
  'var(--timeline-color-4)',
  'var(--timeline-color-5)',
  'var(--timeline-color-6)',
  'var(--timeline-color-7)',
  'var(--timeline-color-8)',
];

const formatClock = (value) => {
  const date = new Date(value);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const formatDuration = (ms) => {
  const totalMinutes = Math.max(0, Math.floor(ms / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h${minutes.toString().padStart(2, '0')}`;
};

const formatDayLabel = (isoDate) => {
  const date = new Date(`${isoDate}T00:00:00`);
  const weekday = date.toLocaleDateString('fr-FR', { weekday: 'long' });
  const display = date.toLocaleDateString('fr-FR');
  return `Timeline du ${weekday} ${display}`;
};

const getProjectColorMap = () => new Map(
  getAllProjects().map((project, index) => [project.id, PROJECT_COLORS[index % PROJECT_COLORS.length]]),
);

const createEventItem = ({ color, time, label, duration = '' }) => `
  <li class="event-list__item">
    <span class="event-list__indicator" style="background-color: ${color}"></span>
    <div class="event-list__content">
      <span class="event-list__time">${time}</span>
      <span class="event-list__label">${label}</span>
      ${duration ? `<span class="event-list__duration">${duration}</span>` : ''}
    </div>
  </li>
`;

const buildEvents = (isoDate, now = Date.now()) => {
  const entry = getEntryByDate(isoDate);
  if (!entry) return [];

  const projectNames = new Map(getAllProjects().map((project) => [project.id, project.name]));
  const projectColors = getProjectColorMap();
  const sessions = getAllSessions()
    .filter((session) => session.startedAt.slice(0, 10) === isoDate)
    .map((session) => ({
      type: 'project',
      time: new Date(session.startedAt).getTime(),
      label: `Début ${projectNames.get(session.projectId) ?? 'Projet'}`,
      duration: formatDuration((session.endedAt == null ? now : new Date(session.endedAt).getTime()) - new Date(session.startedAt).getTime()),
      color: projectColors.get(session.projectId) ?? PROJECT_COLORS[0],
    }));

  const breakEvents = (entry.breaks ?? []).flatMap((item) => ([
    {
      type: 'break-start',
      time: item.startAt,
      label: 'Début Pause',
      duration: item.endAt ? formatDuration(item.endAt - item.startAt) : '',
      color: 'var(--color-warning)',
    },
    ...(item.endAt ? [{
      type: 'break-end',
      time: item.endAt,
      label: 'Fin Pause',
      duration: '',
      color: 'var(--color-warning)',
    }] : []),
  ]));

  const events = [
    { type: 'arrival', time: entry.arrivedAt, label: 'Arrivée', color: 'var(--color-success)' },
    ...sessions,
    ...breakEvents,
    ...(entry.departedAt ? [{ type: 'departure', time: entry.departedAt, label: 'Départ', color: 'var(--color-danger)' }] : []),
  ];

  return events.sort((a, b) => a.time - b.time);
};

export const openDayTimelineDrawer = (isoDate) => {
  const dialog = document.querySelector('[data-js-day-timeline-drawer]');
  if (!dialog) return Promise.resolve();

  const title = dialog.querySelector('[data-js-day-timeline-title]');
  const timelineRoot = dialog.querySelector('[data-js-day-timeline-content]');
  const eventRoot = dialog.querySelector('[data-js-day-timeline-events]');
  const closeButtons = dialog.querySelectorAll('[data-js-day-timeline-close]');

  title.textContent = formatDayLabel(isoDate);
  renderTimelineData(timelineRoot, computeTimelineSegmentsForDate(isoDate), {
    emptyMessage: 'Aucun événement pour ce jour',
  });

  const events = buildEvents(isoDate);
  eventRoot.innerHTML = events.length > 0
    ? `<ul class="event-list">${events.map((event) => createEventItem({
      color: event.color,
      time: formatClock(event.time),
      label: event.label,
      duration: event.duration,
    })).join('')}</ul>`
    : '<div class="empty-state" data-size="sm"><svg class="empty-state__icon" aria-hidden="true"><use href="#icon-calendar-off"></use></svg><h3 class="empty-state__title">Aucun événement pour ce jour</h3></div>';

  return new Promise((resolve) => {
    const cleanup = () => {
      closeButtons.forEach((button) => button.removeEventListener('click', onClose));
      dialog.removeEventListener('click', onBackdrop);
      dialog.removeEventListener('close', onClose);
    };

    const onClose = () => {
      cleanup();
      if (dialog.open) dialog.close();
      resolve();
    };

    const onBackdrop = (event) => {
      if (event.target === dialog) onClose();
    };

    closeButtons.forEach((button) => button.addEventListener('click', onClose));
    dialog.addEventListener('click', onBackdrop);
    dialog.addEventListener('close', onClose, { once: true });
    dialog.showModal();
  });
};
