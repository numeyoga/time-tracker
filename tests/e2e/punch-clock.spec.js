import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // Clear localStorage before each test
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test.describe('Flux arrivée → départ', () => {
  test('bouton Arrivée actif en état initial', async ({ page }) => {
    const arriveBtn = page.getByRole('button', { name: 'Arrivée', exact: true });
    await expect(arriveBtn).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Départ', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Début pause' })).toBeDisabled();
  });

  test('clic Arrivée enregistre l\'heure et désactive le bouton', async ({ page }) => {
    await page.getByRole('button', { name: 'Arrivée', exact: true }).click();

    // Bouton désactivé après clic
    await expect(page.getByRole('button', { name: 'Arrivée', exact: true })).toBeDisabled();

    // Heure affichée (format HH:MM)
    const arrivalTime = page.locator('[data-js-arrival-time]');
    await expect(arrivalTime).not.toHaveText('—');
    await expect(arrivalTime).toHaveText(/^\d{2}:\d{2}$/);

    // Départ et pause activés
    await expect(page.getByRole('button', { name: 'Départ', exact: true })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Début pause' })).toBeEnabled();
  });

  test('clic Départ enregistre l\'heure et désactive tous les boutons', async ({ page }) => {
    await page.getByRole('button', { name: 'Arrivée', exact: true }).click();
    await page.getByRole('button', { name: 'Départ', exact: true }).click();

    const departureTime = page.locator('[data-js-departure-time]');
    await expect(departureTime).not.toHaveText('—');
    await expect(departureTime).toHaveText(/^\d{2}:\d{2}$/);

    await expect(page.getByRole('button', { name: 'Arrivée', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Départ', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Début pause' })).toBeDisabled();
  });

  test('la présence nette est affichée après départ', async ({ page }) => {
    await page.getByRole('button', { name: 'Arrivée', exact: true }).click();
    await page.getByRole('button', { name: 'Départ', exact: true }).click();

    const net = page.locator('[data-js-net-presence]');
    await expect(net).not.toHaveText('—');
    await expect(net).toHaveText(/\dh\d{2}/);
  });

  test('l\'état est restauré après rechargement', async ({ page }) => {
    await page.getByRole('button', { name: 'Arrivée', exact: true }).click();
    const arrivalBefore = await page.locator('[data-js-arrival-time]').textContent();

    await page.reload();

    const arrivalAfter = await page.locator('[data-js-arrival-time]').textContent();
    expect(arrivalAfter).toBe(arrivalBefore);
    await expect(page.getByRole('button', { name: 'Arrivée', exact: true })).toBeDisabled();
  });
});
