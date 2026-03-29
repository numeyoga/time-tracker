import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('ouvre le drawer timeline quotidienne depuis le tableau des rapports', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem('time-tracker-projects', JSON.stringify([
      { id: 'proj_a', name: 'Alpha', createdAt: '2026-03-23T07:00:00.000Z' },
    ]));
    localStorage.setItem('tt_entries', JSON.stringify([
      {
        id: 'e1',
        date: '2026-03-23',
        arrivedAt: new Date('2026-03-23T09:00:00.000Z').getTime(),
        departedAt: new Date('2026-03-23T12:00:00.000Z').getTime(),
        breaks: [{ startAt: new Date('2026-03-23T10:00:00.000Z').getTime(), endAt: new Date('2026-03-23T10:15:00.000Z').getTime() }],
      },
    ]));
    localStorage.setItem('time-tracker-sessions', JSON.stringify([
      { id: 's1', projectId: 'proj_a', startedAt: '2026-03-23T09:00:00.000Z', endedAt: '2026-03-23T10:00:00.000Z', duration: 3_600_000 },
      { id: 's2', projectId: 'proj_a', startedAt: '2026-03-23T10:15:00.000Z', endedAt: '2026-03-23T12:00:00.000Z', duration: 6_300_000 },
    ]));
  });

  await page.reload();
  await page.getByRole('button', { name: /Ouvrir la timeline du 2026-03-23/ }).click();

  const drawer = page.locator('[data-js-day-timeline-drawer]');
  await expect(drawer).toBeVisible();
  await expect(drawer).toContainText('Timeline du');
  await expect(drawer).toContainText('Détail de la journée');
  await expect(drawer.locator('.timeline__segment')).toHaveCount(3);
  await expect(drawer.locator('.event-list__item')).toHaveCount(6);
});
