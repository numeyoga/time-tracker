import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  // Arrive first
  await page.getByRole('button', { name: 'Arrivée', exact: true }).click();
});

test.describe('Flux pauses', () => {
  test('Début pause affiche le bouton Fin pause et masque les autres', async ({ page }) => {
    await page.getByRole('button', { name: 'Début pause' }).click();

    await expect(page.getByRole('button', { name: 'Fin pause' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Départ', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Début pause' })).toBeDisabled();
  });

  test('le résumé pauses affiche "En pause…" pendant la pause', async ({ page }) => {
    await page.getByRole('button', { name: 'Début pause' }).click();
    const summary = page.locator('[data-js-breaks-summary]');
    await expect(summary).toHaveText('En pause…');
  });

  test('Fin pause restaure les boutons et affiche le résumé', async ({ page }) => {
    await page.getByRole('button', { name: 'Début pause' }).click();
    await page.getByRole('button', { name: 'Fin pause' }).click();

    await expect(page.getByRole('button', { name: 'Fin pause' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Départ', exact: true })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Début pause' })).toBeEnabled();

    const summary = page.locator('[data-js-breaks-summary]');
    await expect(summary).toHaveText(/\(1 pause\)/);
  });

  test('deux pauses sont correctement comptabilisées', async ({ page }) => {
    await page.getByRole('button', { name: 'Début pause' }).click();
    await page.getByRole('button', { name: 'Fin pause' }).click();
    await page.getByRole('button', { name: 'Début pause' }).click();
    await page.getByRole('button', { name: 'Fin pause' }).click();

    const summary = page.locator('[data-js-breaks-summary]');
    await expect(summary).toHaveText(/\(2 pauses\)/);
  });

  test('le départ décompte les pauses de la présence nette', async ({ page }) => {
    await page.getByRole('button', { name: 'Début pause' }).click();
    await page.getByRole('button', { name: 'Fin pause' }).click();
    await page.getByRole('button', { name: 'Départ', exact: true }).click();

    const net = page.locator('[data-js-net-presence]');
    await expect(net).not.toHaveText('—');
    await expect(net).toHaveText(/\dh\d{2}/);
  });
});
