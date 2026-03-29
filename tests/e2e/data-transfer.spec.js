import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('exporte les donnees de la semaine au format JSON', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem('time-tracker-projects', JSON.stringify([
      { id: 'proj_a', name: 'Alpha', createdAt: '2026-03-23T07:00:00.000Z' },
    ]));
    localStorage.setItem('tt_entries', JSON.stringify([
      { id: 'e1', date: '2026-03-24', arrivedAt: new Date('2026-03-24T09:00:00.000Z').getTime(), departedAt: new Date('2026-03-24T17:00:00.000Z').getTime(), breaks: [] },
    ]));
    localStorage.setItem('time-tracker-sessions', JSON.stringify([
      { id: 's1', projectId: 'proj_a', startedAt: '2026-03-24T09:00:00.000Z', endedAt: '2026-03-24T11:00:00.000Z', duration: 7_200_000 },
    ]));
  });
  await page.reload();

  const downloadPromise = page.waitForEvent('download');
  await page.locator('[data-js-export-open]').click();
  const dialog = page.locator('[data-js-export-dialog]');
  await expect(dialog).toBeVisible();
  await dialog.locator('[data-js-export-start]').fill('2026-03-23');
  await dialog.locator('[data-js-export-end]').fill('2026-03-29');
  await dialog.locator('[data-js-export-confirm]').click();

  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('time-tracker-export-2026-03-23-2026-03-29.json');
  const path = await download.path();
  const content = await readFile(path, 'utf-8');
  expect(content).toContain('"version": 1');
  expect(content).toContain('"projectId": "proj_a"');
  await expect(page.locator('[data-js-toast-container]')).toContainText('Export téléchargé');
});

test('importe un fichier JSON valide et recharge les donnees', async ({ page }) => {
  const payload = {
    version: 1,
    exportDate: '2026-03-29T10:00:00.000Z',
    range: { start: '2026-03-23', end: '2026-03-29' },
    punches: [{
      date: '2026-03-24',
      entries: [
        { type: 'arrival', time: '09:00' },
        { type: 'departure', time: '17:00' },
      ],
    }],
    projects: [{ id: 'proj_a', name: 'Alpha' }],
    sessions: [{
      projectId: 'proj_a',
      date: '2026-03-24',
      start: '09:00',
      end: '11:00',
      status: 'completed',
    }],
  };

  await page.locator('[data-js-import-open]').click();
  const dialog = page.locator('[data-js-import-dialog]');
  await expect(dialog).toBeVisible();

  await page.setInputFiles('[data-js-import-file]', {
    name: 'time-tracker-export-2026-03-23-2026-03-29.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(payload)),
  });

  await expect(dialog.locator('[data-js-import-preview]')).toBeVisible();
  await expect(dialog.locator('[data-js-import-confirm]')).toBeEnabled();
  await dialog.locator('[data-js-import-confirm]').click();

  const confirmDialog = page.locator('[data-js-import-confirm-dialog]');
  await expect(confirmDialog).toBeVisible();
  await confirmDialog.locator('[data-js-import-confirm-accept]').click();

  await expect(page.locator('[data-js-toast-container]')).toContainText('Données importées avec succès');
  await expect(page.locator('.project-list__name')).toHaveText('Alpha');

  const stored = await page.evaluate(() => ({
    projects: JSON.parse(localStorage.getItem('time-tracker-projects') ?? '[]'),
    sessions: JSON.parse(localStorage.getItem('time-tracker-sessions') ?? '[]'),
    entries: JSON.parse(localStorage.getItem('tt_entries') ?? '[]'),
  }));

  expect(stored.projects).toHaveLength(1);
  expect(stored.sessions).toHaveLength(1);
  expect(stored.entries).toHaveLength(1);
});

test('affiche une erreur quand le fichier importe est invalide', async ({ page }) => {
  await page.locator('[data-js-import-open]').click();
  await page.setInputFiles('[data-js-import-file]', {
    name: 'broken.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{oops'),
  });

  const dialog = page.locator('[data-js-import-dialog]');
  await expect(dialog.locator('[data-js-import-error]')).toBeVisible();
  await expect(dialog.locator('[data-js-import-confirm]')).toBeDisabled();
});
