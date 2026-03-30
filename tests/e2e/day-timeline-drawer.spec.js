import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('ouvre le drawer timeline quotidienne depuis le tableau des rapports', async ({ page }) => {
  const mondayISO = await page.evaluate(() => {
    const toISO = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const monday = new Date();
    monday.setHours(0, 0, 0, 0);
    const dow = monday.getDay();
    monday.setDate(monday.getDate() + (dow === 0 ? -6 : 1 - dow));
    const at = (h, m = 0) => { const d = new Date(monday); d.setHours(h, m, 0, 0); return d; };
    localStorage.setItem('time-tracker-projects', JSON.stringify([
      { id: 'proj_a', name: 'Alpha', createdAt: at(7).toISOString() },
    ]));
    localStorage.setItem('tt_entries', JSON.stringify([{
      id: 'e1',
      date: toISO(monday),
      arrivedAt: at(9).getTime(),
      departedAt: at(12).getTime(),
      breaks: [{ startAt: at(10).getTime(), endAt: at(10, 15).getTime() }],
    }]));
    localStorage.setItem('time-tracker-sessions', JSON.stringify([
      { id: 's1', projectId: 'proj_a', startedAt: at(9).toISOString(), endedAt: at(10).toISOString(), duration: 3_600_000 },
      { id: 's2', projectId: 'proj_a', startedAt: at(10, 15).toISOString(), endedAt: at(12).toISOString(), duration: 6_300_000 },
    ]));
    return toISO(monday);
  });

  await page.reload();
  await page.getByRole('button', { name: new RegExp(`Ouvrir la timeline du ${mondayISO}`) }).click();

  const drawer = page.locator('[data-js-day-timeline-drawer]');
  await expect(drawer).toBeVisible();
  await expect(drawer).toContainText('Timeline du');
  await expect(drawer).toContainText('Détail de la journée');
  await expect(drawer.locator('.timeline__segment')).toHaveCount(3);
  await expect(drawer.locator('.event-list__item')).toHaveCount(6);
});
