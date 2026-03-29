import { getEntryByDate, getTodayEntry } from '../storage/entries.js';
import { getAllProjects } from '../storage/projects.js';
import { getActiveSessions, getAllSessions } from '../storage/sessions.js';

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

const formatClock = (ms) => {
  const date = new Date(ms);
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

const getProjectSessionsForDate = (isoDate, now = Date.now()) =>
  getAllSessions()
    .filter((session) => session.startedAt.slice(0, 10) === isoDate)
    .map((session) => ({
      ...session,
      startMs: new Date(session.startedAt).getTime(),
      endMs: session.endedAt == null ? now : new Date(session.endedAt).getTime(),
    }))
    .filter((session) => session.endMs > session.startMs);

const getProjectColorMap = () => {
  const projects = getAllProjects();
  return new Map(projects.map((project, index) => [
    project.id,
    PROJECT_COLORS[index % PROJECT_COLORS.length],
  ]));
};

export const computeTimelineSegmentsForDate = (isoDate, now = Date.now()) => {
  const entry = getEntryByDate(isoDate);
  if (!entry?.arrivedAt) return null;

  const startMs = entry.arrivedAt;
  const endMs = entry.departedAt ?? now;
  if (endMs <= startMs) return null;

  const sessions = getProjectSessionsForDate(isoDate, now)
    .map((session) => ({
      ...session,
      startMs: Math.max(startMs, session.startMs),
      endMs: Math.min(endMs, session.endMs),
    }))
    .filter((session) => session.endMs > session.startMs);

  const breaks = (entry.breaks ?? [])
    .map((item) => ({
      startMs: Math.max(startMs, item.startAt),
      endMs: Math.min(endMs, item.endAt ?? now),
    }))
    .filter((item) => item.endMs > item.startMs);

  const bounds = Array.from(new Set([
    startMs,
    endMs,
    ...sessions.flatMap((session) => [session.startMs, session.endMs]),
    ...breaks.flatMap((item) => [item.startMs, item.endMs]),
  ])).sort((a, b) => a - b);

  const projectNames = new Map(getAllProjects().map((project) => [project.id, project.name]));
  const projectColors = getProjectColorMap();
  const segments = [];

  for (let index = 0; index < bounds.length - 1; index += 1) {
    const segmentStart = bounds[index];
    const segmentEnd = bounds[index + 1];
    if (segmentEnd <= segmentStart) continue;

    const onBreak = breaks.some((item) => item.startMs < segmentEnd && item.endMs > segmentStart);
    if (onBreak) {
      segments.push({
        type: 'break',
        label: 'Pause',
        startMs: segmentStart,
        endMs: segmentEnd,
        color: 'var(--color-warning)',
      });
      continue;
    }

    const activeSessions = sessions.filter((session) => session.startMs < segmentEnd && session.endMs > segmentStart);
    if (activeSessions.length === 0) {
      segments.push({
        type: 'idle',
        label: 'Inactif',
        startMs: segmentStart,
        endMs: segmentEnd,
        color: 'var(--color-bg-muted)',
      });
      continue;
    }

    if (activeSessions.length === 1) {
      const session = activeSessions[0];
      segments.push({
        type: 'project',
        label: projectNames.get(session.projectId) ?? 'Projet',
        projectId: session.projectId,
        startMs: segmentStart,
        endMs: segmentEnd,
        color: projectColors.get(session.projectId) ?? PROJECT_COLORS[0],
      });
      continue;
    }

    segments.push({
      type: 'multi',
      label: activeSessions.map((session) => projectNames.get(session.projectId) ?? 'Projet').join(' + '),
      projectIds: activeSessions.map((session) => session.projectId),
      startMs: segmentStart,
      endMs: segmentEnd,
      color: 'var(--color-success)',
    });
  }

  return {
    date: entry.date,
    startMs,
    endMs,
    totalMs: endMs - startMs,
    segments,
    projectColors,
  };
};

export const computeTimelineSegments = (now = Date.now()) => {
  const entry = getTodayEntry();
  if (!entry) return null;
  return computeTimelineSegmentsForDate(entry.date, now);
};

const createIcon = (href, className = 'icon') => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', className);
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/1999/xlink', 'use');
  use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', href);
  svg.appendChild(use);
  return svg;
};

const createEmptyState = (message = 'Pointez votre arrivée pour voir la répartition') => {
  const empty = document.createElement('div');
  empty.className = 'empty-state';
  empty.dataset.size = 'sm';

  empty.appendChild(createIcon('#icon-calendar-off', 'empty-state__icon'));

  const title = document.createElement('h3');
  title.className = 'empty-state__title';
  title.textContent = message;
  empty.appendChild(title);

  return empty;
};

const createLegendItem = (label, color) => {
  const item = document.createElement('span');
  item.className = 'timeline__legend-item';
  const dot = document.createElement('span');
  dot.className = 'timeline__legend-dot';
  dot.style.backgroundColor = color;
  item.appendChild(dot);
  const text = document.createElement('span');
  text.textContent = label;
  item.appendChild(text);
  return item;
};

export const renderTimelineData = (root, timeline, { emptyMessage = 'Pointez votre arrivée pour voir la répartition' } = {}) => {
  if (!root) return;
  root.replaceChildren();

  if (!timeline) {
    root.appendChild(createEmptyState(emptyMessage));
    return;
  }

  const bar = document.createElement('div');
  bar.className = 'timeline__bar';

  timeline.segments.forEach((segment) => {
    const button = document.createElement('button');
    button.className = 'timeline__segment';
    button.type = 'button';
    button.dataset.type = segment.type;
    button.style.width = `${((segment.endMs - segment.startMs) / timeline.totalMs) * 100}%`;
    button.style.backgroundColor = segment.color;
    button.setAttribute('aria-label', `${segment.label}, ${formatClock(segment.startMs)} – ${formatClock(segment.endMs)}, ${formatDuration(segment.endMs - segment.startMs)}`);
    button.dataset.tooltip = `${segment.label}\n${formatClock(segment.startMs)} – ${formatClock(segment.endMs)} (${formatDuration(segment.endMs - segment.startMs)})`;
    bar.appendChild(button);
  });

  const markers = document.createElement('div');
  markers.className = 'timeline__markers';
  markers.innerHTML = `<span>${formatClock(timeline.startMs)}</span><span>${formatClock(timeline.endMs)}</span>`;

  const legend = document.createElement('div');
  legend.className = 'timeline__legend';
  const legendMap = new Map();

  timeline.segments.forEach((segment) => {
    if (segment.type === 'project') {
      legendMap.set(segment.label, segment.color);
    }
  });
  if (timeline.segments.some((segment) => segment.type === 'break')) legendMap.set('Pause', 'var(--color-warning)');
  if (timeline.segments.some((segment) => segment.type === 'idle')) legendMap.set('Inactif', 'var(--color-bg-muted)');
  if (timeline.segments.some((segment) => segment.type === 'multi')) legendMap.set('Multi', 'var(--color-success)');

  legend.replaceChildren(...Array.from(legendMap.entries()).map(([label, color]) => createLegendItem(label, color)));

  let tooltip = document.querySelector('[data-js-timeline-tooltip]');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.hidden = true;
    tooltip.dataset.jsTimelineTooltip = '';
    document.body.appendChild(tooltip);
  }

  const showTooltip = (event) => {
    const segment = event.target.closest('.timeline__segment');
    if (!segment) return;
    tooltip.textContent = segment.dataset.tooltip;
    const rect = segment.getBoundingClientRect();
    tooltip.hidden = false;
    const tRect = tooltip.getBoundingClientRect();
    let top = rect.top - tRect.height - 8;
    if (top < 8) top = rect.bottom + 8;
    let left = rect.left + (rect.width - tRect.width) / 2;
    left = Math.max(8, Math.min(left, globalThis.innerWidth - tRect.width - 8));
    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  };

  const hideTooltip = () => {
    tooltip.hidden = true;
  };

  bar.addEventListener('mouseover', showTooltip);
  bar.addEventListener('focusin', showTooltip);
  bar.addEventListener('mouseout', hideTooltip);
  bar.addEventListener('focusout', hideTooltip);

  root.append(bar, markers, legend);
};

export const renderTimelineOverview = (root) => {
  renderTimelineData(root, computeTimelineSegments(), {
    emptyMessage: 'Pointez votre arrivée pour voir la répartition',
  });
};

export const initTimelineOverview = (cardRoot) => {
  if (!cardRoot) return () => {};
  const content = cardRoot.querySelector('[data-js-timeline-content]');
  if (!content) return () => {};

  const render = () => renderTimelineOverview(content);
  render();

  const intervalId = globalThis.setInterval(() => {
    if (getActiveSessions().length === 0 && getTodayEntry()?.departedAt != null) return;
    render();
  }, 60_000);

  return () => {
    globalThis.clearInterval(intervalId);
  };
};
