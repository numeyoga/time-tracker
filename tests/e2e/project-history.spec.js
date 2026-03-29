import { test, expect } from '@playwright/test';

const createProject = async (page, name) => {
  await page.locator('[data-js-btn-add-project]').click();
  const dialog = page.locator('[data-js-create-project-dialog]');
  await expect(dialog).toBeVisible();
  await dialog.locator('[data-js-create-project-input]').fill(name);
  await dialog.getByRole('button', { name: 'Ajouter' }).click();
  await expect(dialog).not.toBeVisible();
};

const addManualSession = async (page, projectName, { start = '09:00', end = '10:00' } = {}) => {
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

const openHistoryDrawer = async (page) => {
  const drawer = page.locator('[data-js-project-history-drawer]');
  await page.locator('[data-js-project-history]').click({ force: true });
  await expect(drawer).toBeVisible();
  return drawer;
};

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test.describe('Historique projet', () => {
  test('ouvre le drawer et affiche les sessions', async ({ page }) => {
    await createProject(page, 'Alpha');
    await addManualSession(page, 'Alpha', { start: '09:00', end: '10:30' });

    const drawer = await openHistoryDrawer(page);
    await expect(drawer).toContainText('Details : Alpha');
    await expect(drawer.locator('.data-table__row')).toHaveCount(1);
    await expect(drawer.locator('.badge[data-variant="success"]')).toContainText('Terminee');
  });

  test('permet l edition inline d une session', async ({ page }) => {
    await createProject(page, 'Alpha');
    await addManualSession(page, 'Alpha', { start: '09:00', end: '10:00' });

    const drawer = await openHistoryDrawer(page);
    await drawer.locator('[data-js-project-session-edit]').click();

    await drawer.locator('[data-js-project-session-end]').fill('08:30');
    await drawer.locator('[data-js-project-session-save]').click();
    await expect(drawer.locator('[data-js-project-session-error]')).toContainText('La fin doit être après le début');

    await drawer.locator('[data-js-project-session-end]').fill('11:00');
    await drawer.locator('[data-js-project-session-save]').click();

    await expect(drawer.locator('.data-table__td')).toContainText(['1', '09:00', '11:00', '2h00', 'Terminee']);
    await expect(page.locator('.project-list__time')).toHaveText('2h00');
  });

  test('supprime une session et affiche l etat vide', async ({ page }) => {
    await createProject(page, 'Alpha');
    await addManualSession(page, 'Alpha');

    const drawer = await openHistoryDrawer(page);
    await drawer.locator('[data-js-project-session-delete]').click();

    const confirm = page.locator('[data-js-project-session-delete-dialog]');
    await expect(confirm).toBeVisible();
    await confirm.getByRole('button', { name: 'Supprimer' }).click();

    await expect(drawer.locator('.empty-state')).toBeVisible();
    await expect(drawer).toContainText('Aucune session enregistree');
    await expect(page.locator('.project-list__time')).toHaveText('0h00');
  });
});
