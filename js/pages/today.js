import { todayISO, formatDateLong, timeStrToMs } from '../utils/time.js';
import { getTodayEntry, upsertTodayEntry, replaceTodayEntry } from '../storage/entries.js';
import {
  deriveState,
  applyEvent,
  renderPunchClock,
  initPunchClockListeners,
  startLiveCounter,
  openDeleteDialog,
} from '../components/punch-clock.js';
import { showToast } from '../components/toast.js';
import { createProject, renameProject, deleteProject, getProjectById } from '../storage/projects.js';
import {
  renderProjectList,
  updateProjectListTimes,
  openCreateProjectDialog,
  openAddTimeDialog,
  openProjectHistoryDrawer,
  openRenameProjectDialog,
  openDeleteProjectDialog,
} from '../components/project-list.js';
import {
  startSession,
  stopSession,
  stopAllActiveSessions,
  stopSessionForProject,
  getActiveSessionForProject,
  getActiveSessions,
  isMultiProjectEnabled,
  setMultiProjectEnabled,
  deleteSessionsForProject,
} from '../storage/sessions.js';
import {
  renderTimerCard,
  startTimerLiveCounter,
} from '../components/timer-card.js';
import {
  renderProjectTimeOverview,
  startProjectTimeOverviewRefresh,
} from '../components/project-time-overview.js';
import { initTimelineOverview, renderTimelineOverview } from '../components/timeline-overview.js';
import { initReportStats } from '../components/report-stats.js';
import { openEntryManagementDrawer } from '../components/entry-management-drawer.js';
import { applyPunchTimeEdit, validatePunchChronology } from '../utils/punch-edit.js';
import { initDataTransfer } from '../components/data-transfer.js';

// ============================================================
// Inline time editing
// ============================================================

const startInlineEdit = (item, clockRoot) => {
  const timeSpan = item.querySelector('[data-js-punch-time]');
  if (!timeSpan || item.querySelector('.punch-list__time-input')) return;

  const currentTime = timeSpan.textContent.trim();
  timeSpan.hidden = true;

  const input = document.createElement('input');
  input.type = 'time';
  input.className = 'punch-list__time-input';
  input.value = currentTime;
  input.step = '60';
  input.dataset.jsTimeInput = '';
  timeSpan.parentElement.insertBefore(input, timeSpan.nextSibling);
  input.focus();
  input.select();

  const commit = () => {
    const newTime = input.value;
    if (newTime) {
      applyInlineEdit(newTime);
    } else {
      cancel();
    }
  };

  const applyInlineEdit = (newTime) => {
    const entry = getTodayEntry();
    if (!entry) { cancel(); return; }

    const punchType = item.dataset.punchType;
    const breakIndex = item.dataset.breakIndex == null ? null : Number(item.dataset.breakIndex);
    const newMs = timeStrToMs(newTime);

    const updated = applyPunchTimeEdit(entry, punchType, breakIndex, newMs);
    if (!updated) {
      showToast({ message: 'Heure invalide : incohérence chronologique.', variant: 'danger' });
      cancel();
      return;
    }

    replaceTodayEntry(updated);
    renderPunchClock(getTodayEntry(), clockRoot);
    showToast({ message: 'Pointage mis à jour.', variant: 'success' });
  };

  const cancel = () => {
    input.remove();
    timeSpan.hidden = false;
  };

  input.addEventListener('blur', () => {
    // Small delay to allow click events to fire first
    setTimeout(() => { if (document.body.contains(input)) commit(); }, 100);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); commit(); }
    if (e.key === 'Escape') { e.preventDefault(); cancel(); }
  });
};


// ============================================================
// Delete punch
// ============================================================

const deletePunch = async (item, clockRoot) => {
  const punchType = item.dataset.punchType;
  const breakIndex = item.dataset.breakIndex == null ? null : Number(item.dataset.breakIndex);
  const label = item.querySelector('.punch-list__label')?.textContent ?? 'ce pointage';

  const confirmed = await openDeleteDialog(label);
  if (!confirmed) return;

  const entry = getTodayEntry();
  if (!entry) return;

  const updated = structuredClone(entry);

  switch (punchType) {
    case 'arrival':
      // Deleting arrival resets the whole day
      updated.arrivedAt = null;
      updated.departedAt = null;
      updated.breaks = [];
      break;
    case 'departure':
      updated.departedAt = null;
      break;
    case 'breakStart': {
      // Remove the break entirely (start + end)
      updated.breaks.splice(breakIndex, 1);
      break;
    }
    case 'breakEnd': {
      // Remove end time — reopens the break
      updated.breaks[breakIndex].endAt = null;
      break;
    }
  }

  replaceTodayEntry(updated);
  renderPunchClock(getTodayEntry(), clockRoot);
  showToast({ message: 'Pointage supprimé.', variant: 'success' });
};

// ============================================================
// Page initialization
// ============================================================

/**
 * Initializes the Today page.
 * Called once on DOMContentLoaded.
 */
export const initTodayPage = () => {
  const pageRoot = document.querySelector('[data-js-today-page]');
  if (!pageRoot) return;

  // ---- Date display ----
  const dateEl = pageRoot.querySelector('[data-js-today-date]');
  if (dateEl) {
    const today = todayISO();
    dateEl.textContent = formatDateLong(today);
    dateEl.setAttribute('datetime', today);
  }

  // ---- Punch clock ----
  const clockRoot = pageRoot.querySelector('[data-js-punch-clock]');
  if (!clockRoot) return;

  // Initial render from stored state
  renderPunchClock(getTodayEntry(), clockRoot);

  // Start live counter if currently active
  let stopCounter = startLiveCounter(clockRoot, getTodayEntry);

  // ---- Punch events (arrive, depart, break) ----
  initPunchClockListeners(clockRoot, (event) => {
    const current = getTodayEntry();
    const updated = applyEvent(current, event);
    upsertTodayEntry(updated);
    renderPunchClock(getTodayEntry(), clockRoot);

    const newState = deriveState(getTodayEntry());

    if (newState === 'PRESENT' && event === 'ARRIVE') {
      stopCounter();
      stopCounter = startLiveCounter(clockRoot, getTodayEntry);
      showToast({ message: 'Arrivée enregistrée.', variant: 'success' });
    } else if (newState === 'DEPARTED') {
      stopCounter();
      showToast({ message: 'Départ enregistré.', variant: 'success' });
    } else if (event === 'START_BREAK') {
      showToast({ message: 'Pause commencée.', variant: 'info' });
    } else if (event === 'END_BREAK') {
      showToast({ message: 'Pause terminée.', variant: 'info' });
    }
  });

  // ---- Inline edit & delete (delegation on punch list) ----
  clockRoot.addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-js-edit-punch]');
    if (editBtn) {
      const item = editBtn.closest('[data-js-punch-item]');
      if (item) startInlineEdit(item, clockRoot);
      return;
    }

    const deleteBtn = e.target.closest('[data-js-delete-punch]');
    if (deleteBtn) {
      const item = deleteBtn.closest('[data-js-punch-item]');
      if (item) deletePunch(item, clockRoot);
    }
  });

  // ---- Timer & Projects ----
  const projectsCard = pageRoot.querySelector('[data-js-projects-card]');
  const timerRoot = pageRoot.querySelector('[data-js-timer-card]');
  const projectTimeRoot = pageRoot.querySelector('[data-js-project-time-content]');
  const timelineRoot = pageRoot.querySelector('[data-js-timeline-content]');
  const reportRoot = pageRoot.querySelector('[data-js-report-stats]');
  const openGlobalEntryManager = (filter = null) => openEntryManagementDrawer({
    filter,
    onChange: refreshAll,
  });
  const reportStats = initReportStats(reportRoot, {
    onManageEntries: ({ mode, anchorDate }) => openGlobalEntryManager({
      mode,
      anchorDate: new Date(anchorDate),
    }),
  });
  const refreshAll = () => {
    if (timerRoot) renderTimerCard(timerRoot);
    if (projectsCard) renderProjectList(projectsCard);
    if (projectTimeRoot) renderProjectTimeOverview(projectTimeRoot);
    if (timelineRoot) renderTimelineOverview(timelineRoot);
    reportStats.refresh();
  };
  refreshAll();
  pageRoot.querySelector('[data-js-entry-manage-global]')
    ?.addEventListener('click', () => openGlobalEntryManager());
  initTimer(pageRoot, timerRoot, refreshAll);
  initProjects(pageRoot, projectsCard, timerRoot, refreshAll);
  startProjectTimeOverviewRefresh(projectTimeRoot);
  initTimelineOverview(pageRoot.querySelector('[data-js-timeline-card]'));
  initDataTransfer();
};

// ============================================================
// Timer initialization
// ============================================================

const initTimer = (pageRoot, timerRoot, refreshAll) => {
  if (!timerRoot) return;

  // Initial render
  renderTimerCard(timerRoot);

  // Sync toggle with stored preference
  const toggle = timerRoot.querySelector('[data-js-timer-multi-toggle]');
  if (toggle) {
    toggle.setAttribute('aria-checked', String(isMultiProjectEnabled()));

    const onToggle = () => {
      const current = toggle.getAttribute('aria-checked') === 'true';
      const next = !current;

      // If switching to mono with 2+ active, stop all but the last
      if (!next) {
        const active = getActiveSessions();
        if (active.length > 1) {
          const sorted = [...active].sort(
            (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
          );
          for (let i = 1; i < sorted.length; i++) {
            stopSession(sorted[i].id);
          }
          showToast({ message: 'Mode mono-projet : sessions excédentaires arrêtées.', variant: 'warning' });
        }
      }

      setMultiProjectEnabled(next);
      toggle.setAttribute('aria-checked', String(next));
      refreshAll();
    };

    toggle.addEventListener('click', onToggle);
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onToggle();
      }
    });
  }

  // Stop button — stops the last started session
  timerRoot.querySelector('[data-js-timer-stop]')
    ?.addEventListener('click', () => {
      const active = getActiveSessions();
      if (active.length === 0) return;
      const last = [...active].sort(
        (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
      )[0];
      const stopped = stopSession(last.id);
      if (stopped) {
        const project = getProjectById(stopped.projectId);
        showToast({ message: `Chronomètre arrêté pour « ${project?.name ?? 'projet'} ».`, variant: 'success' });
      }
      refreshAll();
    });

  // Stop all button
  timerRoot.querySelector('[data-js-timer-stop-all]')
    ?.addEventListener('click', () => {
      const count = stopAllActiveSessions();
      if (count > 0) {
        showToast({ message: `${count} chronomètre(s) arrêté(s).`, variant: 'success' });
      }
      refreshAll();
    });

  // Delegation for chip stop buttons
  timerRoot.addEventListener('click', (e) => {
    const chipStop = e.target.closest('[data-js-timer-chip-stop]');
    if (!chipStop) return;
    const chip = chipStop.closest('[data-js-timer-chip]');
    if (!chip) return;
    const sessionId = chip.dataset.sessionId;
    const stopped = stopSession(sessionId);
    if (stopped) {
      const project = getProjectById(stopped.projectId);
      showToast({ message: `Chronomètre arrêté pour « ${project?.name ?? 'projet'} ».`, variant: 'success' });
    }
    refreshAll();
  });

  // Start live counter (updates project list times too)
  const projectsCard = pageRoot.querySelector('[data-js-projects-card]');
  startTimerLiveCounter(timerRoot, () => {
    if (projectsCard) updateProjectListTimes(projectsCard);
  });
};

// ============================================================
// Projects initialization
// ============================================================

const initProjects = (pageRoot, projectsCard, timerRoot, refreshAll) => {
  if (!projectsCard) return;

  // Initial render
  renderProjectList(projectsCard);

  // "Add project" buttons (toolbar + empty state)
  const handleAddProject = async () => {
    const name = await openCreateProjectDialog();
    if (name == null) return;

    try {
      createProject(name);
      refreshAll();
      showToast({ message: `Projet « ${name} » créé.`, variant: 'success' });
    } catch (err) {
      showToast({ message: err.message, variant: 'danger' });
    }
  };

  projectsCard.querySelector('[data-js-btn-add-project]')
    ?.addEventListener('click', handleAddProject);
  projectsCard.querySelector('[data-js-btn-add-project-empty]')
    ?.addEventListener('click', handleAddProject);
  projectsCard.querySelector('[data-js-btn-add-time]')
    ?.addEventListener('click', async () => {
      const session = await openAddTimeDialog({
        onSuccess: (_session, project) => {
          refreshAll();
          showToast({ message: `Temps ajouté sur « ${project?.name ?? 'projet'} ».`, variant: 'success' });
        },
      });

      if (!session) return;
    });

  // Delegation on project list for action buttons
  projectsCard.addEventListener('click', async (e) => {
    const item = e.target.closest('[data-js-project-item]');
    if (!item) return;
    const projectId = item.dataset.projectId;
    const project = getProjectById(projectId);
    if (!project) return;

    // Rename
    if (e.target.closest('[data-js-project-rename]')) {
      const newName = await openRenameProjectDialog(project.name, projectId);
      if (newName == null) return;

      try {
        renameProject(projectId, newName);
        refreshAll();
        showToast({ message: `Projet renommé en « ${newName} ».`, variant: 'success' });
      } catch (err) {
        showToast({ message: err.message, variant: 'danger' });
      }
      return;
    }

    // Delete
    if (e.target.closest('[data-js-project-delete]')) {
      const confirmed = await openDeleteProjectDialog(project.name);
      if (!confirmed) return;

      // Stop active sessions for this project first
      stopSessionForProject(projectId);
      deleteSessionsForProject(projectId);
      deleteProject(projectId);
      refreshAll();
      showToast({ message: `Projet « ${project.name} » supprimé.`, variant: 'success' });
      return;
    }

    // Play/Stop toggle
    if (e.target.closest('[data-js-project-play]')) {
      const activeSession = getActiveSessionForProject(projectId);

      if (activeSession) {
        // Stop
        stopSession(activeSession.id);
        showToast({ message: `Chronomètre arrêté pour « ${project.name} ».`, variant: 'success' });
      } else {
        // In mono mode, stop current active session first
        if (!isMultiProjectEnabled()) {
          const activeSessions = getActiveSessions();
          for (const s of activeSessions) {
            stopSession(s.id);
          }
        }
        startSession(projectId);
        showToast({ message: `Chronomètre démarré pour « ${project.name} ».`, variant: 'success' });
      }
      refreshAll();
      return;
    }

    // History (→ TT-6) stub
    if (e.target.closest('[data-js-project-history]')) {
      await openProjectHistoryDrawer({
        projectId,
        onChange: ({ type, project: changedProject }) => {
          refreshAll();
          if (type === 'update') {
            showToast({ message: `Session mise a jour pour « ${changedProject?.name ?? 'projet'} ».`, variant: 'success' });
          } else if (type === 'delete') {
            showToast({ message: `Session supprimee pour « ${changedProject?.name ?? 'projet'} ».`, variant: 'success' });
          }
        },
      });
    }
  });
};
