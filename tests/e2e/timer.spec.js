import { test, expect } from '@playwright/test';

// Helper: create a project via the dialog
const createProject = async (page, name) => {
  await page.getByRole('button', { name: 'Ajouter un projet' }).first().click();
  const dialog = page.locator('[data-js-create-project-dialog]');
  await dialog.locator('[data-js-create-project-input]').fill(name);
  await dialog.getByRole('button', { name: 'Ajouter' }).click();
  await expect(dialog).not.toBeVisible();
};

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test.describe('Timer Card — état initial', () => {
  test('affiche le chronomètre en état IDLE', async ({ page }) => {
    const timerCard = page.locator('[data-js-timer-card]');
    await expect(timerCard).toBeVisible();

    // Badge neutral
    const badge = timerCard.locator('[data-js-timer-badge]');
    await expect(badge).toHaveText('Chronomètre');
    await expect(badge).toHaveAttribute('data-variant', 'neutral');

    // Status
    await expect(timerCard.locator('[data-js-timer-status]')).toHaveText('Aucun projet en cours');

    // Time
    await expect(timerCard.locator('[data-js-timer-time]')).toHaveText('0h00');

    // Stop button disabled
    await expect(timerCard.locator('[data-js-timer-stop]')).toBeDisabled();

    // Stop all hidden
    await expect(timerCard.locator('[data-js-timer-stop-all]')).toBeHidden();

    // Sessions zone hidden
    await expect(timerCard.locator('[data-js-timer-sessions]')).toBeHidden();
  });

  test('le toggle multi-projet est activé par défaut', async ({ page }) => {
    const toggle = page.locator('[data-js-timer-multi-toggle]');
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
  });
});

test.describe('Play/Stop depuis la liste projets', () => {
  test('play démarre le chronomètre et change l\'icône en stop', async ({ page }) => {
    await createProject(page, 'Alpha');

    // Click play
    const playBtn = page.locator('[data-js-project-play]');
    await playBtn.click();

    // Timer card becomes active
    const timerCard = page.locator('[data-js-timer-card]');
    await expect(timerCard).toHaveAttribute('data-active', '');

    // Badge info
    await expect(timerCard.locator('[data-js-timer-badge]')).toHaveAttribute('data-variant', 'info');

    // Status shows project name
    await expect(timerCard.locator('[data-js-timer-status]')).toHaveText('Alpha');

    // Stop button enabled
    await expect(timerCard.locator('[data-js-timer-stop]')).toBeEnabled();

    // Toast shown
    await expect(page.locator('[data-js-toast-container]')).toContainText('Alpha');

    // Play button now has data-active (stop mode)
    await expect(page.locator('[data-js-project-play]')).toHaveAttribute('data-active', '');
  });

  test('stop arrête le chronomètre et revient à IDLE', async ({ page }) => {
    await createProject(page, 'Alpha');

    // Start
    await page.locator('[data-js-project-play]').click();

    // Stop via project list
    await page.locator('[data-js-project-play]').click();

    // Timer returns to IDLE
    const timerCard = page.locator('[data-js-timer-card]');
    await expect(timerCard.locator('[data-js-timer-badge]')).toHaveAttribute('data-variant', 'neutral');
    await expect(timerCard.locator('[data-js-timer-status]')).toHaveText('Aucun projet en cours');
    await expect(timerCard.locator('[data-js-timer-stop]')).toBeDisabled();
  });
});

test.describe('Mode multi-projet', () => {
  test('2 projets actifs affichent les chips et "Tout arrêter"', async ({ page }) => {
    await createProject(page, 'Alpha');
    await createProject(page, 'Beta');

    // Start both
    const playBtns = page.locator('[data-js-project-play]');
    await playBtns.nth(0).click();
    await playBtns.nth(1).click();

    const timerCard = page.locator('[data-js-timer-card]');

    // Status shows count
    await expect(timerCard.locator('[data-js-timer-status]')).toHaveText('2 projets actifs');

    // Sessions visible with 2 chips
    await expect(timerCard.locator('[data-js-timer-sessions]')).toBeVisible();
    await expect(timerCard.locator('[data-js-timer-session-count]')).toHaveText('2');
    await expect(timerCard.locator('.timer-chip')).toHaveCount(2);

    // Stop all button visible
    await expect(timerCard.locator('[data-js-timer-stop-all]')).toBeVisible();
  });

  test('arrêter un chip individuel réduit à 1 session', async ({ page }) => {
    await createProject(page, 'Alpha');
    await createProject(page, 'Beta');

    const playBtns = page.locator('[data-js-project-play]');
    await playBtns.nth(0).click();
    await playBtns.nth(1).click();

    // Stop first chip
    const chipStop = page.locator('[data-js-timer-chip-stop]').first();
    await chipStop.click();

    const timerCard = page.locator('[data-js-timer-card]');
    await expect(timerCard.locator('.timer-chip')).toHaveCount(1);
    // Stop all hidden (only 1 active)
    await expect(timerCard.locator('[data-js-timer-stop-all]')).toBeHidden();
  });

  test('"Tout arrêter" stoppe toutes les sessions', async ({ page }) => {
    await createProject(page, 'Alpha');
    await createProject(page, 'Beta');

    const playBtns = page.locator('[data-js-project-play]');
    await playBtns.nth(0).click();
    await playBtns.nth(1).click();

    // Click stop all
    await page.locator('[data-js-timer-stop-all]').click();

    const timerCard = page.locator('[data-js-timer-card]');
    await expect(timerCard.locator('[data-js-timer-status]')).toHaveText('Aucun projet en cours');
    await expect(timerCard.locator('[data-js-timer-sessions]')).toBeHidden();
    await expect(timerCard.locator('[data-js-timer-stop]')).toBeDisabled();
  });
});

test.describe('Mode mono-projet', () => {
  test('démarrer un 2e projet arrête le 1er en mode mono', async ({ page }) => {
    await createProject(page, 'Alpha');
    await createProject(page, 'Beta');

    // Disable multi-project
    await page.locator('[data-js-timer-multi-toggle]').click();
    await expect(page.locator('[data-js-timer-multi-toggle]')).toHaveAttribute('aria-checked', 'false');

    // Start Alpha
    const playBtns = page.locator('[data-js-project-play]');
    await playBtns.nth(0).click();
    await expect(page.locator('[data-js-timer-status]')).toHaveText('Alpha');

    // Start Beta — should auto-stop Alpha
    await playBtns.nth(1).click();
    await expect(page.locator('[data-js-timer-status]')).toHaveText('Beta');

    // Only 1 active session
    await expect(page.locator('.timer-chip')).toHaveCount(1);
  });
});

test.describe('Bouton Arrêter (timer card)', () => {
  test('arrête le dernier projet démarré', async ({ page }) => {
    await createProject(page, 'Alpha');
    await createProject(page, 'Beta');

    const playBtns = page.locator('[data-js-project-play]');
    await playBtns.nth(0).click();
    await playBtns.nth(1).click();

    // Click stop (stops last started = Beta)
    await page.locator('[data-js-timer-stop]').click();

    // Alpha should still be running
    const timerCard = page.locator('[data-js-timer-card]');
    await expect(timerCard.locator('[data-js-timer-status]')).toHaveText('Alpha');
    await expect(timerCard.locator('.timer-chip')).toHaveCount(1);
  });
});

test.describe('Persistance des sessions', () => {
  test('les sessions actives survivent au rechargement', async ({ page }) => {
    await createProject(page, 'Alpha');
    await page.locator('[data-js-project-play]').click();

    // Reload
    await page.reload();

    // Timer should still show Alpha as active
    const timerCard = page.locator('[data-js-timer-card]');
    await expect(timerCard.locator('[data-js-timer-status]')).toHaveText('Alpha');
    await expect(timerCard.locator('[data-js-timer-badge]')).toHaveAttribute('data-variant', 'info');
  });

  test('le toggle multi-projet persiste après rechargement', async ({ page }) => {
    // Disable
    await page.locator('[data-js-timer-multi-toggle]').click();
    await expect(page.locator('[data-js-timer-multi-toggle]')).toHaveAttribute('aria-checked', 'false');

    await page.reload();
    await expect(page.locator('[data-js-timer-multi-toggle]')).toHaveAttribute('aria-checked', 'false');
  });
});

test.describe('Suppression de projet avec sessions', () => {
  test('supprimer un projet stoppe et supprime ses sessions', async ({ page }) => {
    await createProject(page, 'Alpha');
    await page.locator('[data-js-project-play]').click();

    // Delete the project
    await page.locator('[data-js-project-delete]').click();
    const dialog = page.locator('[data-js-delete-project-dialog]');
    await dialog.getByRole('button', { name: 'Supprimer' }).click();

    // Timer returns to IDLE
    const timerCard = page.locator('[data-js-timer-card]');
    await expect(timerCard.locator('[data-js-timer-status]')).toHaveText('Aucun projet en cours');
    await expect(timerCard.locator('[data-js-timer-stop]')).toBeDisabled();
  });
});
