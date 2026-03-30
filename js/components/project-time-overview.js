import { getAllProjects } from '../storage/projects.js';
import { getActiveSessions, getAllSessions } from '../storage/sessions.js';

const getTodayStartMs = (now = Date.now()) => {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return today.getTime();
};

const formatLongDuration = (ms) => {
  const totalMinutes = Math.max(0, Math.floor(ms / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

const getTodaySessions = (now = Date.now()) =>
  getAllSessions()
    .filter((session) => new Date(session.startedAt).getTime() >= getTodayStartMs(now))
    .map((session) => ({
      ...session,
      startMs: new Date(session.startedAt).getTime(),
      endMs: session.endedAt == null ? now : new Date(session.endedAt).getTime(),
    }))
    .filter((session) => session.endMs > session.startMs);

const computeParallelTimes = (sessions) => {
  const points = Array.from(new Set(
    sessions.flatMap((session) => [session.startMs, session.endMs]),
  )).sort((a, b) => a - b);

  const parallelByProject = new Map();

  for (let index = 0; index < points.length - 1; index += 1) {
    const segmentStart = points[index];
    const segmentEnd = points[index + 1];
    if (segmentEnd <= segmentStart) continue;

    const active = sessions.filter((session) => session.startMs < segmentEnd && session.endMs > segmentStart);
    if (active.length < 2) continue;

    const duration = segmentEnd - segmentStart;
    active.forEach((session) => {
      parallelByProject.set(session.projectId, (parallelByProject.get(session.projectId) ?? 0) + duration);
    });
  }

  return parallelByProject;
};

export const computeProjectTimeStats = (now = Date.now()) => {
  const projects = getAllProjects();
  const sessions = getTodaySessions(now);
  const totals = new Map();

  sessions.forEach((session) => {
    totals.set(session.projectId, (totals.get(session.projectId) ?? 0) + (session.endMs - session.startMs));
  });

  const totalMs = Array.from(totals.values()).reduce((sum, value) => sum + value, 0);
  const parallelByProject = computeParallelTimes(sessions);

  return projects
    .map((project) => {
      const durationMs = totals.get(project.id) ?? 0;
      if (durationMs <= 0) return null;

      const percent = totalMs > 0 ? Math.round((durationMs / totalMs) * 100) : 0;
      return {
        project,
        durationMs,
        durationLabel: formatLongDuration(durationMs),
        percent,
        parallelMs: parallelByProject.get(project.id) ?? 0,
        parallelLabel: formatLongDuration(parallelByProject.get(project.id) ?? 0),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.durationMs - a.durationMs);
};

const createIcon = (href, className = 'icon') => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', className);
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', href);
  svg.appendChild(use);
  return svg;
};

const createEmptyState = () => {
  const empty = document.createElement('div');
  empty.className = 'empty-state';
  empty.dataset.jsProjectTimeEmpty = '';

  const icon = createIcon('#icon-clock', 'empty-state__icon');
  empty.appendChild(icon);

  const title = document.createElement('h3');
  title.className = 'empty-state__title';
  title.textContent = "Aucune session de travail aujourd'hui";
  empty.appendChild(title);

  return empty;
};

const createCard = (stat) => {
  const card = document.createElement('article');
  card.className = 'card project-time-card';

  const header = document.createElement('header');
  header.className = 'card__header';

  const title = document.createElement('h3');
  title.className = 'card__title';
  title.textContent = stat.project.name;
  header.appendChild(title);

  if (stat.parallelMs > 0) {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.dataset.variant = 'info';
    badge.appendChild(createIcon('#icon-zap'));
    const label = document.createElement('span');
    label.textContent = `${stat.parallelLabel} parallèle`;
    badge.appendChild(label);
    header.appendChild(badge);
  }

  const body = document.createElement('div');
  body.className = 'card__body';

  const duration = document.createElement('p');
  duration.className = 'project-time__duration';
  duration.textContent = stat.durationLabel;
  body.appendChild(duration);

  const bar = document.createElement('div');
  bar.className = 'project-time__bar-wrapper';
  bar.setAttribute('aria-hidden', 'true');
  const fill = document.createElement('div');
  fill.className = 'project-time__bar-fill';
  fill.style.width = `${stat.percent}%`;
  bar.appendChild(fill);
  body.appendChild(bar);

  const progress = document.createElement('progress');
  progress.className = 'sr-only';
  progress.max = 100;
  progress.value = stat.percent;
  progress.textContent = `${stat.percent}%`;
  body.appendChild(progress);

  const percent = document.createElement('p');
  percent.className = 'project-time__percent';
  percent.textContent = `${stat.percent}% du temps total`;
  body.appendChild(percent);

  card.append(header, body);
  return card;
};

export const renderProjectTimeOverview = (root) => {
  if (!root) return;
  const stats = computeProjectTimeStats();
  root.replaceChildren();

  if (stats.length === 0) {
    root.appendChild(createEmptyState());
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'project-time-grid';
  grid.dataset.jsProjectTimeGrid = '';
  grid.replaceChildren(...stats.map(createCard));
  root.appendChild(grid);
};

export const startProjectTimeOverviewRefresh = (root) => {
  if (!root) return () => {};

  const intervalId = window.setInterval(() => {
    if (getActiveSessions().length === 0) return;
    renderProjectTimeOverview(root);
  }, 60_000);

  return () => window.clearInterval(intervalId);
};
