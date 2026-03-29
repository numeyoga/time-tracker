import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  // Arrive first
  await page.getByRole('button', { name: 'Arrivée', exact: true }).click();
});

test.describe('Flux pauses', () => {
  test('Pause désactive Départ et Pause, active Reprise', async ({ page }) => {
    await page.getByRole('button', { name: 'Pause', exact: true }).click();

    await expect(page.getByRole('button', { name: 'Reprise', exact: true })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Départ', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeDisabled();

    // Badge passe en "En pause"
    await expect(page.locator('[data-js-punch-badge]')).toHaveText('En pause');
  });

  test('la liste affiche "Début pause" pendant la pause', async ({ page }) => {
    await page.getByRole('button', { name: 'Pause', exact: true }).click();
    await page.locator('[data-js-punch-details] summary').click();

    const breakItem = page.locator('[data-punch-type="breakStart"]');
    await expect(breakItem).toBeVisible();
    await expect(breakItem.locator('[data-js-punch-time]')).toHaveText(/^\d{2}:\d{2}$/);
  });

  test('Reprise restaure les boutons et affiche fin pause', async ({ page }) => {
    await page.getByRole('button', { name: 'Pause', exact: true }).click();
    await page.getByRole('button', { name: 'Reprise', exact: true }).click();

    await expect(page.getByRole('button', { name: 'Reprise', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Départ', exact: true })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeEnabled();

    // Badge revient en "En cours"
    await expect(page.locator('[data-js-punch-badge]')).toHaveText('En cours');

    // Punch list shows both breakStart and breakEnd
    await page.locator('[data-js-punch-details] summary').click();
    await expect(page.locator('[data-punch-type="breakStart"]')).toBeVisible();
    await expect(page.locator('[data-punch-type="breakEnd"]')).toBeVisible();
  });

  test('deux pauses créent 4 entrées dans la liste', async ({ page }) => {
    await page.getByRole('button', { name: 'Pause', exact: true }).click();
    await page.getByRole('button', { name: 'Reprise', exact: true }).click();
    await page.getByRole('button', { name: 'Pause', exact: true }).click();
    await page.getByRole('button', { name: 'Reprise', exact: true }).click();

    const breakStarts = page.locator('[data-punch-type="breakStart"]');
    const breakEnds = page.locator('[data-punch-type="breakEnd"]');
    await expect(breakStarts).toHaveCount(2);
    await expect(breakEnds).toHaveCount(2);
  });

  test('le départ décompte les pauses de la présence nette', async ({ page }) => {
    await page.getByRole('button', { name: 'Pause', exact: true }).click();
    await page.getByRole('button', { name: 'Reprise', exact: true }).click();
    await page.getByRole('button', { name: 'Départ', exact: true }).click();

    const time = page.locator('[data-js-presence-time]');
    await expect(time).not.toHaveText('—');
    await expect(time).toHaveText(/\dh\d{2}/);
  });
});
