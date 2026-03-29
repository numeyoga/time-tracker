import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test.describe('Modification inline des pointages', () => {
  test('le crayon d\'arrivée est visible dans la punch list après arrivée', async ({ page }) => {
    await page.getByRole('button', { name: 'Arrivée', exact: true }).click();

    // Open details to see the punch list
    await page.locator('[data-js-punch-details] summary').click();

    const editBtn = page.locator('[data-punch-type="arrival"] [data-js-edit-punch]');
    await expect(editBtn).toBeVisible();
  });

  test('clic sur le crayon affiche un input time inline', async ({ page }) => {
    await page.getByRole('button', { name: 'Arrivée', exact: true }).click();
    await page.locator('[data-js-punch-details] summary').click();

    await page.locator('[data-punch-type="arrival"] [data-js-edit-punch]').click();

    const input = page.locator('[data-punch-type="arrival"] .punch-list__time-input');
    await expect(input).toBeVisible();
    const value = await input.inputValue();
    expect(value).toMatch(/^\d{2}:\d{2}$/);
  });

  test('confirmer une nouvelle heure (Enter) met à jour l\'affichage', async ({ page }) => {
    await page.getByRole('button', { name: 'Arrivée', exact: true }).click();
    await page.locator('[data-js-punch-details] summary').click();

    await page.locator('[data-punch-type="arrival"] [data-js-edit-punch]').click();
    const input = page.locator('[data-punch-type="arrival"] .punch-list__time-input');
    await input.fill('07:00');
    await input.press('Enter');

    // After render, the time span should show the new time
    const timeSpan = page.locator('[data-punch-type="arrival"] [data-js-punch-time]');
    await expect(timeSpan).toHaveText('07:00');
  });

  test('Escape annule l\'édition sans modifier l\'heure', async ({ page }) => {
    await page.getByRole('button', { name: 'Arrivée', exact: true }).click();
    await page.locator('[data-js-punch-details] summary').click();

    const originalTime = await page.locator('[data-punch-type="arrival"] [data-js-punch-time]').textContent();

    await page.locator('[data-punch-type="arrival"] [data-js-edit-punch]').click();
    const input = page.locator('[data-punch-type="arrival"] .punch-list__time-input');
    await input.fill('06:00');
    await input.press('Escape');

    const timeSpan = page.locator('[data-punch-type="arrival"] [data-js-punch-time]');
    await expect(timeSpan).toHaveText(originalTime);
  });

  test('heure incohérente affiche un toast d\'erreur', async ({ page }) => {
    await page.getByRole('button', { name: 'Arrivée', exact: true }).click();
    await page.getByRole('button', { name: 'Départ', exact: true }).click();
    await page.locator('[data-js-punch-details] summary').click();

    // Try to set departure before arrival
    await page.locator('[data-punch-type="departure"] [data-js-edit-punch]').click();
    const input = page.locator('[data-punch-type="departure"] .punch-list__time-input');
    await input.fill('00:01');
    await input.press('Enter');

    // Should show error toast
    const toast = page.locator('[data-js-toast-container]');
    await expect(toast).toContainText('incohérence chronologique');
  });
});

test.describe('Suppression des pointages', () => {
  test('la poubelle ouvre la modale de confirmation', async ({ page }) => {
    await page.getByRole('button', { name: 'Arrivée', exact: true }).click();
    await page.locator('[data-js-punch-details] summary').click();

    await page.locator('[data-punch-type="arrival"] [data-js-delete-punch]').click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('supprimer');
  });

  test('annuler la suppression ne modifie rien', async ({ page }) => {
    await page.getByRole('button', { name: 'Arrivée', exact: true }).click();
    await page.locator('[data-js-punch-details] summary').click();

    await page.locator('[data-punch-type="arrival"] [data-js-delete-punch]').click();

    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Annuler' }).click();

    await expect(dialog).not.toBeVisible();
    // Arrival still exists
    await expect(page.locator('[data-js-punch-badge]')).toHaveText('En cours');
  });

  test('confirmer la suppression de l\'arrivée réinitialise la journée', async ({ page }) => {
    await page.getByRole('button', { name: 'Arrivée', exact: true }).click();
    await page.locator('[data-js-punch-details] summary').click();

    await page.locator('[data-punch-type="arrival"] [data-js-delete-punch]').click();

    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Supprimer' }).click();

    await expect(dialog).not.toBeVisible();
    // Back to initial state
    await expect(page.locator('[data-js-punch-badge]')).toHaveText('Non commencée');
    await expect(page.getByRole('button', { name: 'Arrivée', exact: true })).toBeEnabled();
  });

  test('supprimer le départ réouvre la journée', async ({ page }) => {
    await page.getByRole('button', { name: 'Arrivée', exact: true }).click();
    await page.getByRole('button', { name: 'Départ', exact: true }).click();
    await page.locator('[data-js-punch-details] summary').click();

    await page.locator('[data-punch-type="departure"] [data-js-delete-punch]').click();
    await page.getByRole('dialog').getByRole('button', { name: 'Supprimer' }).click();

    // Back to PRESENT state
    await expect(page.locator('[data-js-punch-badge]')).toHaveText('En cours');
    await expect(page.getByRole('button', { name: 'Départ', exact: true })).toBeEnabled();
  });
});
