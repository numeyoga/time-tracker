import { expect, test } from '@playwright/test';

const createProject = async (page, name) => {
  await page.locator('[data-js-btn-add-project]').click();
  const dialog = page.locator('[data-js-create-project-dialog]');
  await expect(dialog).toBeVisible();
  await dialog.locator('[data-js-create-project-input]').fill(name);
  await dialog.getByRole('button', { name: 'Ajouter' }).click();
  await expect(dialog).not.toBeVisible();
};

const addManualSession = async (page, projectName, start, end) => {
  await page.locator('[data-js-btn-add-time]').click();
  const dialog = page.locator('[data-js-add-time-dialog]');
  await expect(dialog).toBeVisible();
  await dialog.locator('[data-js-add-time-project]').selectOption({ label: projectName });
  await dialog.getByRole('radio', { name: 'Heure de fin' }).check();
  await dialog.locator('[data-js-add-time-start]').fill(start);
  await dialog.locator('[data-js-add-time-end]').fill(end);
  await dialog.getByRole('button', { name: 'Ajouter' }).click();
  await expect(dialog).not.toBeVisible();
};

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('affiche un empty state quand aucune session du jour', async ({ page }) => {
  await expect(page.getByText("Temps par projet aujourd'hui")).toBeVisible();
  await expect(page.getByText("Aucune session de travail aujourd'hui")).toBeVisible();
});

test('affiche les cartes triees par duree avec pourcentage et parallele', async ({ page }) => {
  await createProject(page, 'Alpha');
  await createProject(page, 'Beta');

  await addManualSession(page, 'Alpha', '09:00', '12:00');
  await addManualSession(page, 'Beta', '10:00', '12:00');

  const cards = page.locator('.project-time-card');
  await expect(cards).toHaveCount(2);
  await expect(cards.nth(0)).toContainText('Alpha');
  await expect(cards.nth(0)).toContainText('3h 0m');
  await expect(cards.nth(0)).toContainText('60% du temps total');
  await expect(cards.nth(1)).toContainText('Beta');
  await expect(cards.nth(1)).toContainText('2h 0m');
  await expect(cards.nth(1)).toContainText('40% du temps total');
  await expect(cards.nth(0).locator('.badge[data-variant="info"]')).toContainText('2h 0m parallèle');
});
