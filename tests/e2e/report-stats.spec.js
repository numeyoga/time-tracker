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
    localStorage.setItem('time-tracker-projects', JSON.stringify([
      { id: 'proj_a', name: 'Alpha', createdAt: '2026-03-23T07:00:00.000Z' },
      { id: 'proj_b', name: 'Beta', createdAt: '2026-03-23T07:05:00.000Z' },
    ]));
    localStorage.setItem('tt_entries', JSON.stringify([
      { id: 'e1', date: '2026-03-23', arrivedAt: new Date('2026-03-23T08:00:00.000Z').getTime(), departedAt: new Date('2026-03-23T16:00:00.000Z').getTime(), breaks: [] },
      { id: 'e2', date: '2026-03-24', arrivedAt: new Date('2026-03-24T08:00:00.000Z').getTime(), departedAt: new Date('2026-03-24T15:00:00.000Z').getTime(), breaks: [] },
    ]));
    localStorage.setItem('time-tracker-sessions', JSON.stringify([
      { id: 's1', projectId: 'proj_a', startedAt: '2026-03-23T09:00:00.000Z', endedAt: '2026-03-23T12:30:00.000Z', duration: 12_600_000 },
      { id: 's2', projectId: 'proj_b', startedAt: '2026-03-24T09:00:00.000Z', endedAt: '2026-03-24T11:00:00.000Z', duration: 7_200_000 },
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
