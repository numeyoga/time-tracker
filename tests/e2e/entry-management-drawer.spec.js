import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('ouvre le drawer depuis TT-9 et permet editer, supprimer puis ajouter un pointage', async ({ page }) => {
  const mondayISO = await page.evaluate(() => {
    const toISO = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const monday = new Date();
    monday.setHours(0, 0, 0, 0);
    const dow = monday.getDay();
    monday.setDate(monday.getDate() + (dow === 0 ? -6 : 1 - dow));
    const at = (h, m = 0) => { const d = new Date(monday); d.setHours(h, m, 0, 0); return d; };
    localStorage.setItem('tt_entries', JSON.stringify([{
      id: 'entry-1',
      date: toISO(monday),
      arrivedAt: at(8).getTime(),
      departedAt: at(17).getTime(),
      breaks: [],
      createdAt: 1,
    }]));
    return toISO(monday);
  });

  await page.reload();
  await page.locator('[data-js-report-manage]').click();

  const drawer = page.locator('[data-js-entry-management-drawer]');
  await expect(drawer).toBeVisible();
  await expect(drawer).toContainText('Gestion des entrées');
  await expect(drawer).toContainText(mondayISO);

  const departureItem = drawer.locator('[data-punch-type="departure"]');
  await departureItem.getByRole('button', { name: /Modifier départ/i }).click();
  await departureItem.locator('[data-js-entry-edit-input]').fill('18:00');
  await departureItem.getByRole('button', { name: 'Enregistrer' }).click();
  await expect(departureItem.locator('[data-js-entry-punch-time]')).toHaveText('18:00');

  await departureItem.getByRole('button', { name: /Supprimer départ/i }).click();
  await page.locator('[data-js-delete-dialog-confirm]').click();
  await expect(drawer.locator('[data-punch-type="departure"]')).toHaveCount(0);

  await drawer.getByRole('button', { name: 'Ajouter un pointage' }).click();
  const addDialog = page.locator('[data-js-entry-add-dialog]');
  await expect(addDialog).toBeVisible();
  await addDialog.locator('[data-js-entry-add-type]').selectOption('departure');
  await addDialog.locator('[data-js-entry-add-date]').fill(mondayISO);
  await addDialog.locator('[data-js-entry-add-time]').fill('19:00');
  await addDialog.getByRole('button', { name: 'Ajouter' }).click();

  await expect(drawer.locator('[data-punch-type="departure"] [data-js-entry-punch-time]')).toHaveText('19:00');
});

test('ouvre la vue globale depuis le header et affiche les journees hors periode courante', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem('tt_entries', JSON.stringify([
      {
        id: 'entry-old',
        date: '2026-02-10',
        arrivedAt: new Date('2026-02-10T08:00:00.000Z').getTime(),
        departedAt: new Date('2026-02-10T16:00:00.000Z').getTime(),
        breaks: [],
        createdAt: 1,
      },
    ]));
  });

  await page.reload();
  await page.locator('[data-js-entry-manage-global]').click();

  const drawer = page.locator('[data-js-entry-management-drawer]');
  await expect(drawer).toBeVisible();
  await expect(drawer).toContainText('Vue globale');
  await expect(drawer).toContainText('2026-02-10');
});
