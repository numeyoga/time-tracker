import { getAllEntries } from '../storage/entries.js';
import { getAllProjects } from '../storage/projects.js';
import { getAllSessions } from '../storage/sessions.js';
import { computeNetPresence } from '../utils/time.js';
import { openDayTimelineDrawer } from './day-timeline-drawer.js';

const DAY_LABELS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

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

const formatDurationLong = (ms) => {
  if (!ms || ms <= 0) return '–';
  const totalMinutes = Math.floor(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

const formatLabel = (mode, anchorDate) => {
  if (mode === 'month') {
    return anchorDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }

  const start = startOfWeek(anchorDate);
  const end = endOfWeek(anchorDate);
  const startDay = String(start.getDate()).padStart(2, '0');
  const endDay = String(end.getDate()).padStart(2, '0');
  const month = end.toLocaleDateString('fr-FR', { month: 'short' });
  return `${startDay} – ${endDay} ${month} ${end.getFullYear()}`;
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
    days.push({
      date: new Date(cursor),
      iso: isoFromDate(cursor),
      label: mode === 'month'
        ? String(cursor.getDate())
        : DAY_LABELS[cursor.getDay()],
    });
  }
  return days;
};

export const computeReportStats = (mode, anchorDate = new Date()) => {
  const days = getPeriodDays(mode, anchorDate);
  const dayMap = new Map(days.map((day) => [day.iso, day]));
  const projects = getAllProjects();
  const entries = getAllEntries().filter((entry) => dayMap.has(entry.date));
  const sessions = getAllSessions().filter((session) => dayMap.has(session.startedAt.slice(0, 10)));

  const presenceByDay = new Map(days.map((day) => [day.iso, 0]));
  const projectTotalsByDay = new Map(days.map((day) => [day.iso, 0]));
  const projectCellMap = new Map();

  entries.forEach((entry) => {
    presenceByDay.set(entry.date, computeNetPresence(entry) ?? 0);
  });

  sessions.forEach((session) => {
    const iso = session.startedAt.slice(0, 10);
    const duration = session.endedAt == null
      ? Math.max(0, Date.now() - new Date(session.startedAt).getTime())
      : (session.duration ?? 0);

    projectTotalsByDay.set(iso, (projectTotalsByDay.get(iso) ?? 0) + duration);
    const key = `${session.projectId}:${iso}`;
    projectCellMap.set(key, (projectCellMap.get(key) ?? 0) + duration);
  });

  const rows = projects
    .map((project) => {
      const values = days.map((day) => projectCellMap.get(`${project.id}:${day.iso}`) ?? 0);
      const total = values.reduce((sum, value) => sum + value, 0);
      return {
        project,
        values,
        total,
      };
    })
    .filter((row) => row.total > 0)
    .sort((a, b) => b.total - a.total);

  const totalPresence = Array.from(presenceByDay.values()).reduce((sum, value) => sum + value, 0);
  const totalProjects = Array.from(projectTotalsByDay.values()).reduce((sum, value) => sum + value, 0);
  const workedDays = entries.filter((entry) => entry.arrivedAt != null).length;
  const availableDays = mode === 'month'
    ? days.filter((day) => {
      const weekday = day.date.getDay();
      return weekday >= 1 && weekday <= 5;
    }).length
    : 5;

  return {
    mode,
    label: formatLabel(mode, anchorDate),
    days,
    rows,
    totalPresence,
    totalProjects,
    workedDays,
    availableDays,
    footerProjects: days.map((day) => projectTotalsByDay.get(day.iso) ?? 0),
    footerPresence: days.map((day) => presenceByDay.get(day.iso) ?? 0),
    hasData: rows.length > 0 || totalPresence > 0,
  };
};

const renderKpiCard = (label, value) => `
  <article class="card card--kpi">
    <div class="card__body">
      <p class="report-kpi__label">${label}</p>
      <p class="report-kpi__value">${value}</p>
    </div>
  </article>
`;

const renderTable = (report) => {
  const headCells = report.days.map((day) => `
    <th class="data-table__th" scope="col">
      <div class="report-table__day-head">
        <span>${day.label}</span>
        <button class="btn" data-variant="ghost" data-size="sm" type="button"
                data-js-report-day-chart="${day.iso}" aria-label="Ouvrir la timeline du ${day.iso}">
          <svg class="icon" aria-hidden="true"><use href="#icon-bar-chart-2"></use></svg>
        </button>
      </div>
    </th>
  `).join('');

  const bodyRows = report.rows.map((row) => `
    <tr class="data-table__row">
      <td class="data-table__td">${row.project.name}</td>
      ${row.values.map((value) => `<td class="data-table__td">${value > 0 ? formatDurationLong(value) : '–'}</td>`).join('')}
      <td class="data-table__td data-table__td--total">${formatDurationLong(row.total)}</td>
    </tr>
  `).join('');

  return `
    <div class="data-table-wrapper report-table" role="region" aria-label="Rapports et statistiques" tabindex="0">
      <table class="data-table">
        <thead class="data-table__head">
          <tr>
            <th class="data-table__th" scope="col">Projet</th>
            ${headCells}
            <th class="data-table__th data-table__th--total" scope="col">Total</th>
          </tr>
        </thead>
        <tbody class="data-table__body">${bodyRows}</tbody>
        <tfoot class="data-table__foot">
          <tr class="data-table__row">
            <td class="data-table__td"><strong>Projets</strong></td>
            ${report.footerProjects.map((value) => `<td class="data-table__td">${value > 0 ? formatDurationLong(value) : '–'}</td>`).join('')}
            <td class="data-table__td data-table__td--total"><strong>${formatDurationLong(report.totalProjects)}</strong></td>
          </tr>
          <tr class="data-table__row">
            <td class="data-table__td"><strong>Présence</strong></td>
            ${report.footerPresence.map((value) => `<td class="data-table__td">${value > 0 ? formatDurationLong(value) : '–'}</td>`).join('')}
            <td class="data-table__td data-table__td--total"><strong>${formatDurationLong(report.totalPresence)}</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
};

const renderEmptyState = () => `
  <div class="empty-state" data-size="sm">
    <svg class="empty-state__icon" aria-hidden="true"><use href="#icon-bar-chart-2"></use></svg>
    <h3 class="empty-state__title">Aucune donnée pour cette période</h3>
  </div>
`;

export const initReportStats = (root, { onManageEntries = () => {} } = {}) => {
  if (!root) return { refresh: () => {} };

  const state = {
    mode: 'week',
    anchorDate: new Date(),
  };

  const render = () => {
    const report = computeReportStats(state.mode, state.anchorDate);

    root.innerHTML = `
      <div class="report-toolbar">
        <div class="tabs">
          <div class="tabs__list" role="tablist" aria-label="Période du rapport">
            <button class="tabs__tab" type="button" role="tab" data-js-report-tab="week" aria-selected="${state.mode === 'week'}">Semaine</button>
            <button class="tabs__tab" type="button" role="tab" data-js-report-tab="month" aria-selected="${state.mode === 'month'}">Mois</button>
          </div>
        </div>
        <div class="report-nav">
          <button class="btn" data-variant="ghost" type="button" data-js-report-prev aria-label="Période précédente">
            <svg class="icon" aria-hidden="true"><use href="#icon-chevron-left"></use></svg>
          </button>
          <span class="report-nav__label" data-js-report-label>${report.label}</span>
          <button class="btn" data-variant="ghost" type="button" data-js-report-next aria-label="Période suivante">
            <svg class="icon" aria-hidden="true"><use href="#icon-chevron-right"></use></svg>
          </button>
        </div>
        <button class="btn" data-variant="secondary" data-size="sm" type="button" data-js-report-manage>
          <svg class="icon" aria-hidden="true"><use href="#icon-settings"></use></svg>
          <span class="btn__label">Gérer les entrées</span>
        </button>
      </div>
      <div class="report-kpi-grid">
        ${renderKpiCard('Temps de présence', formatDurationLong(report.totalPresence))}
        ${renderKpiCard('Temps projets', formatDurationLong(report.totalProjects))}
        ${renderKpiCard('Jours travaillés', `${report.workedDays} / ${report.availableDays}`)}
      </div>
      ${report.hasData ? renderTable(report) : renderEmptyState()}
    `;
  };

  const shiftPeriod = (direction) => {
    const next = new Date(state.anchorDate);
    if (state.mode === 'week') {
      next.setDate(next.getDate() + (direction * 7));
    } else {
      next.setMonth(next.getMonth() + direction);
    }
    state.anchorDate = next;
    render();
  };

  root.addEventListener('click', async (event) => {
    const tab = event.target.closest('[data-js-report-tab]');
    if (tab) {
      state.mode = tab.dataset.jsReportTab;
      render();
      return;
    }

    if (event.target.closest('[data-js-report-prev]')) {
      shiftPeriod(-1);
      return;
    }

    if (event.target.closest('[data-js-report-next]')) {
      shiftPeriod(1);
      return;
    }

    const dayButton = event.target.closest('[data-js-report-day-chart]');
    if (dayButton) {
      await openDayTimelineDrawer(dayButton.dataset.jsReportDayChart);
      return;
    }

    if (event.target.closest('[data-js-report-manage]')) {
      onManageEntries({ mode: state.mode, anchorDate: state.anchorDate });
    }
  });

  root.addEventListener('keydown', (event) => {
    const current = event.target.closest('[data-js-report-tab]');
    if (!current) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

    event.preventDefault();
    state.mode = event.key === 'ArrowRight' ? 'month' : 'week';
    render();
    root.querySelector(`[data-js-report-tab="${state.mode}"]`)?.focus();
  });

  render();
  return { refresh: render };
};
