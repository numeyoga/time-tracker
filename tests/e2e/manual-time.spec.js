import { test, expect } from '@playwright/test';

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

test.describe('Ajout manuel de temps', () => {
  test('le bouton est désactivé sans projet puis ouvre la modale avec defaults', async ({ page }) => {
    await expect(page.locator('[data-js-btn-add-time]')).toBeDisabled();

    await createProject(page, 'Alpha');

    const trigger = page.locator('[data-js-btn-add-time]');
    await expect(trigger).toBeEnabled();
    await trigger.click();

    const dialog = page.locator('[data-js-add-time-dialog]');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('[data-js-add-time-date]')).toHaveValue(/\d{4}-\d{2}-\d{2}/);
    await expect(dialog.locator('[data-js-add-time-start]')).toHaveValue('09:00');
    await expect(dialog.locator('[data-js-add-time-duration-hours]')).toHaveValue('1');
    await expect(dialog.locator('[data-js-add-time-duration-minutes]')).toHaveValue('0');
    await expect(dialog.getByRole('button', { name: 'Ajouter' })).toBeDisabled();
  });

  test('crée une session manuelle et met à jour le temps du projet', async ({ page }) => {
    await createProject(page, 'Alpha');
    await page.locator('[data-js-btn-add-time]').click();

    const dialog = page.locator('[data-js-add-time-dialog]');
    await dialog.locator('[data-js-add-time-project]').selectOption({ label: 'Alpha' });
    await expect(dialog.getByRole('button', { name: 'Ajouter' })).toBeEnabled();
    await dialog.getByRole('button', { name: 'Ajouter' }).click();

    await expect(dialog).not.toBeVisible();
    await expect(page.locator('.project-list__time')).toHaveText('1h00');
    await expect(page.locator('[data-js-toast-container]')).toContainText('Temps ajouté sur « Alpha »');

    const sessions = await page.evaluate(() => JSON.parse(localStorage.getItem('time-tracker-sessions') ?? '[]'));
    expect(sessions).toHaveLength(1);
    expect(sessions[0].duration).toBe(3_600_000);
  });

  test('valide le mode heure de fin', async ({ page }) => {
    await createProject(page, 'Alpha');
    await page.locator('[data-js-btn-add-time]').click();

    const dialog = page.locator('[data-js-add-time-dialog]');
    await dialog.locator('[data-js-add-time-project]').selectOption({ label: 'Alpha' });
    await dialog.getByRole('radio', { name: 'Heure de fin' }).check();
    await dialog.locator('[data-js-add-time-end]').fill('08:30');

    await expect(dialog.getByRole('button', { name: 'Ajouter' })).toBeDisabled();
    await expect(dialog.locator('[data-js-add-time-end-error]')).toContainText('après le début');

    await dialog.locator('[data-js-add-time-end]').fill('10:15');
    await expect(dialog.getByRole('button', { name: 'Ajouter' })).toBeEnabled();
  });
});
