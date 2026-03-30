import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('affiche un empty state en absence de donnees', async ({ page }) => {
  await page.reload();
  await expect(page.getByText('Rapports et Statistiques')).toBeVisible();
  await expect(page.getByText('Aucune donnée pour cette période')).toBeVisible();
});

test('affiche les KPI et le tableau hebdomadaire puis permet de passer en mois', async ({ page }) => {
  await page.evaluate(() => {
    const toISO = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const at = (base, h, m = 0) => { const d = new Date(base); d.setHours(h, m, 0, 0); return d; };

    const monday = new Date();
    monday.setHours(0, 0, 0, 0);
    const dow = monday.getDay();
    monday.setDate(monday.getDate() + (dow === 0 ? -6 : 1 - dow));
    const tuesday = new Date(monday);
    tuesday.setDate(monday.getDate() + 1);

    localStorage.setItem('time-tracker-projects', JSON.stringify([
      { id: 'proj_a', name: 'Alpha', createdAt: at(monday, 7).toISOString() },
      { id: 'proj_b', name: 'Beta', createdAt: at(monday, 7, 5).toISOString() },
    ]));
    localStorage.setItem('tt_entries', JSON.stringify([
      { id: 'e1', date: toISO(monday), arrivedAt: at(monday, 8).getTime(), departedAt: at(monday, 16).getTime(), breaks: [] },
      { id: 'e2', date: toISO(tuesday), arrivedAt: at(tuesday, 8).getTime(), departedAt: at(tuesday, 15).getTime(), breaks: [] },
    ]));
    localStorage.setItem('time-tracker-sessions', JSON.stringify([
      { id: 's1', projectId: 'proj_a', startedAt: at(monday, 9).toISOString(), endedAt: at(monday, 12, 30).toISOString(), duration: 12_600_000 },
      { id: 's2', projectId: 'proj_b', startedAt: at(tuesday, 9).toISOString(), endedAt: at(tuesday, 11).toISOString(), duration: 7_200_000 },
    ]));
  });

  await page.reload();

  await expect(page.locator('.report-kpi-grid')).toContainText('Temps de présence');
  await expect(page.locator('.report-kpi-grid')).toContainText('15h 0m');
  await expect(page.locator('.report-kpi-grid')).toContainText('Temps projets');
  await expect(page.locator('.report-kpi-grid')).toContainText('5h 30m');
  await expect(page.locator('.report-kpi-grid')).toContainText('Jours travaillés');
  await expect(page.locator('.report-table')).toContainText('Alpha');
  await expect(page.locator('.report-table')).toContainText('Beta');

  await page.getByRole('tab', { name: 'Mois' }).click();
  await expect(page.getByRole('tab', { name: 'Mois' })).toHaveAttribute('aria-selected', 'true');

  await page.locator('[data-js-report-manage]').click();
  await expect(page.locator('[data-js-entry-management-drawer]')).toBeVisible();
});
