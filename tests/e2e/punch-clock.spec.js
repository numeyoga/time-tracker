import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test.describe('Flux arrivée → départ', () => {
  test('bouton Arrivée actif en état initial', async ({ page }) => {
    const arriveBtn = page.getByRole('button', { name: 'Arrivée', exact: true });
    await expect(arriveBtn).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Départ', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeDisabled();
  });

  test('badge affiche "Non commencée" en état initial', async ({ page }) => {
    const badge = page.locator('[data-js-punch-badge]');
    await expect(badge).toHaveText('Non commencée');
    await expect(badge).toHaveAttribute('data-variant', 'neutral');
  });

  test('clic Arrivée enregistre et met à jour badge + boutons', async ({ page }) => {
    await page.getByRole('button', { name: 'Arrivée', exact: true }).click();

    // Bouton désactivé après clic
    await expect(page.getByRole('button', { name: 'Arrivée', exact: true })).toBeDisabled();

    // Badge passe en "En cours"
    const badge = page.locator('[data-js-punch-badge]');
    await expect(badge).toHaveText('En cours');
    await expect(badge).toHaveAttribute('data-variant', 'info');

    // Départ et pause activés
    await expect(page.getByRole('button', { name: 'Départ', exact: true })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeEnabled();

    // Punch list shows arrival with time
    const arrivalItem = page.locator('[data-punch-type="arrival"] [data-js-punch-time]');
    await expect(arrivalItem).toHaveText(/^\d{2}:\d{2}$/);
  });

  test('clic Départ enregistre et désactive tous les boutons', async ({ page }) => {
    await page.getByRole('button', { name: 'Arrivée', exact: true }).click();
    await page.getByRole('button', { name: 'Départ', exact: true }).click();

    // Badge passe en "Journée terminée"
    const badge = page.locator('[data-js-punch-badge]');
    await expect(badge).toHaveText('Journée terminée');
    await expect(badge).toHaveAttribute('data-variant', 'success');

    // Departure time in punch list
    const departureItem = page.locator('[data-punch-type="departure"] [data-js-punch-time]');
    await expect(departureItem).toHaveText(/^\d{2}:\d{2}$/);

    // All buttons disabled
    await expect(page.getByRole('button', { name: 'Arrivée', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Départ', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeDisabled();
  });

  test('les métriques de présence sont affichées après départ', async ({ page }) => {
    await page.getByRole('button', { name: 'Arrivée', exact: true }).click();
    await page.getByRole('button', { name: 'Départ', exact: true }).click();

    const time = page.locator('[data-js-presence-time]');
    await expect(time).not.toHaveText('—');
    await expect(time).toHaveText(/\dh\d{2}/);

    const progress = page.locator('[data-js-presence-progress]');
    await expect(progress).toHaveText(/\d+% \/8h/);
  });

  test('l\'état est restauré après rechargement', async ({ page }) => {
    await page.getByRole('button', { name: 'Arrivée', exact: true }).click();

    const arrivalTimeBefore = await page.locator('[data-punch-type="arrival"] [data-js-punch-time]').textContent();

    await page.reload();

    const arrivalTimeAfter = await page.locator('[data-punch-type="arrival"] [data-js-punch-time]').textContent();
    expect(arrivalTimeAfter).toBe(arrivalTimeBefore);
    await expect(page.getByRole('button', { name: 'Arrivée', exact: true })).toBeDisabled();
    await expect(page.locator('[data-js-punch-badge]')).toHaveText('En cours');
  });
});
