import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('affiche un empty state si aucune arrivee', async ({ page }) => {
  await page.reload();
  await expect(page.getByText('Répartition de la journée')).toBeVisible();
  await expect(page.getByText('Pointez votre arrivée pour voir la répartition')).toBeVisible();
});

test('affiche la timeline', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem('time-tracker-projects', JSON.stringify([
      { id: 'proj_a', name: 'Alpha', createdAt: '2026-03-29T07:00:00.000Z' },
      { id: 'proj_b', name: 'Beta', createdAt: '2026-03-29T07:05:00.000Z' },
    ]));
    localStorage.setItem('tt_entries', JSON.stringify([{
      id: 'entry_1',
      date: new Date().toISOString().slice(0, 10),
      arrivedAt: new Date(new Date().setHours(9, 0, 0, 0)).getTime(),
      departedAt: new Date(new Date().setHours(13, 0, 0, 0)).getTime(),
      breaks: [{ startAt: new Date(new Date().setHours(10, 0, 0, 0)).getTime(), endAt: new Date(new Date().setHours(10, 15, 0, 0)).getTime() }],
    }]));
    localStorage.setItem('time-tracker-sessions', JSON.stringify([
      { id: 'sess_1', projectId: 'proj_a', startedAt: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(), endedAt: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(), duration: 3_600_000 },
      { id: 'sess_2', projectId: 'proj_b', startedAt: new Date(new Date().setHours(10, 15, 0, 0)).toISOString(), endedAt: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(), duration: 2_700_000 },
      { id: 'sess_3', projectId: 'proj_a', startedAt: new Date(new Date().setHours(11, 30, 0, 0)).toISOString(), endedAt: new Date(new Date().setHours(12, 30, 0, 0)).toISOString(), duration: 3_600_000 },
      { id: 'sess_4', projectId: 'proj_b', startedAt: new Date(new Date().setHours(12, 0, 0, 0)).toISOString(), endedAt: new Date(new Date().setHours(13, 0, 0, 0)).toISOString(), duration: 3_600_000 },
    ]));
  });

  await page.reload();

  await expect(page.locator('.timeline__segment')).toHaveCount(7);
  await expect(page.locator('.timeline__legend')).toContainText('Alpha');
  await expect(page.locator('.timeline__legend')).toContainText('Beta');
  await expect(page.locator('.timeline__legend')).toContainText('Pause');
  await expect(page.locator('.timeline__legend')).toContainText('Inactif');
  await expect(page.locator('.timeline__legend')).toContainText('Multi');
});
