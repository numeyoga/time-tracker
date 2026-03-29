import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test.describe('État vide des projets', () => {
  test('affiche l\'empty state quand aucun projet', async ({ page }) => {
    const emptyState = page.locator('[data-js-projects-empty]');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('Aucun projet');
    await expect(emptyState).toContainText('Créez votre premier projet');

    // List is hidden
    await expect(page.locator('[data-js-project-list]')).toBeHidden();
  });

  test('le bouton de l\'empty state ouvre la modale de création', async ({ page }) => {
    await page.locator('[data-js-btn-add-project-empty]').click();
    const dialog = page.locator('[data-js-create-project-dialog]');
    await expect(dialog).toBeVisible();
  });
});

test.describe('Création de projet', () => {
  test('le bouton toolbar ouvre la modale de création', async ({ page }) => {
    await page.getByRole('button', { name: 'Ajouter un projet' }).first().click();
    const dialog = page.locator('[data-js-create-project-dialog]');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Ajouter' })).toBeDisabled();
  });

  test('le bouton Ajouter est actif avec un nom valide', async ({ page }) => {
    await page.getByRole('button', { name: 'Ajouter un projet' }).first().click();
    const dialog = page.locator('[data-js-create-project-dialog]');
    const input = dialog.locator('[data-js-create-project-input]');

    await input.fill('Mon projet');
    await expect(dialog.getByRole('button', { name: 'Ajouter' })).toBeEnabled();
  });

  test('créer un projet l\'affiche dans la liste', async ({ page }) => {
    await page.getByRole('button', { name: 'Ajouter un projet' }).first().click();
    const dialog = page.locator('[data-js-create-project-dialog]');
    await dialog.locator('[data-js-create-project-input]').fill('Alpha');
    await dialog.getByRole('button', { name: 'Ajouter' }).click();

    // Dialog closed
    await expect(dialog).not.toBeVisible();

    // Project in list
    const list = page.locator('[data-js-project-list]');
    await expect(list).toBeVisible();
    await expect(list.locator('.project-list__name')).toHaveText('Alpha');

    // Empty state hidden
    await expect(page.locator('[data-js-projects-empty]')).toBeHidden();

    // Toast shown
    await expect(page.locator('[data-js-toast-container]')).toContainText('Alpha');
  });

  test('validation : nom vide montre une erreur', async ({ page }) => {
    await page.getByRole('button', { name: 'Ajouter un projet' }).first().click();
    const dialog = page.locator('[data-js-create-project-dialog]');
    const input = dialog.locator('[data-js-create-project-input]');

    await input.fill('a');
    await input.fill('');

    const error = dialog.locator('[data-js-create-project-error]');
    await expect(error).toBeVisible();
    await expect(error).toContainText('vide');
    await expect(dialog.getByRole('button', { name: 'Ajouter' })).toBeDisabled();
  });

  test('validation : nom dupliqué montre une erreur', async ({ page }) => {
    // Create first project
    await page.getByRole('button', { name: 'Ajouter un projet' }).first().click();
    let dialog = page.locator('[data-js-create-project-dialog]');
    await dialog.locator('[data-js-create-project-input]').fill('Alpha');
    await dialog.getByRole('button', { name: 'Ajouter' }).click();

    // Try to create duplicate
    await page.getByRole('button', { name: 'Ajouter un projet' }).first().click();
    dialog = page.locator('[data-js-create-project-dialog]');
    await dialog.locator('[data-js-create-project-input]').fill('alpha');

    const error = dialog.locator('[data-js-create-project-error]');
    await expect(error).toBeVisible();
    await expect(error).toContainText('existe déjà');
  });

  test('annuler ferme la modale sans créer', async ({ page }) => {
    await page.getByRole('button', { name: 'Ajouter un projet' }).first().click();
    const dialog = page.locator('[data-js-create-project-dialog]');
    await dialog.locator('[data-js-create-project-input]').fill('Test');
    await dialog.getByRole('button', { name: 'Annuler' }).click();

    await expect(dialog).not.toBeVisible();
    await expect(page.locator('[data-js-projects-empty]')).toBeVisible();
  });

  test('Enter valide la création', async ({ page }) => {
    await page.getByRole('button', { name: 'Ajouter un projet' }).first().click();
    const dialog = page.locator('[data-js-create-project-dialog]');
    const input = dialog.locator('[data-js-create-project-input]');
    await input.fill('Clavier');
    await input.press('Enter');

    await expect(dialog).not.toBeVisible();
    await expect(page.locator('.project-list__name')).toHaveText('Clavier');
  });
});

test.describe('Renommage de projet', () => {
  test.beforeEach(async ({ page }) => {
    // Create a project first
    await page.getByRole('button', { name: 'Ajouter un projet' }).first().click();
    const dialog = page.locator('[data-js-create-project-dialog]');
    await dialog.locator('[data-js-create-project-input]').fill('Original');
    await dialog.getByRole('button', { name: 'Ajouter' }).click();
  });

  test('le crayon ouvre la modale de renommage avec le nom pré-rempli', async ({ page }) => {
    await page.locator('[data-js-project-rename]').click();
    const dialog = page.locator('[data-js-rename-project-dialog]');
    await expect(dialog).toBeVisible();

    const input = dialog.locator('[data-js-rename-project-input]');
    await expect(input).toHaveValue('Original');
  });

  test('renommer met à jour le nom dans la liste', async ({ page }) => {
    await page.locator('[data-js-project-rename]').click();
    const dialog = page.locator('[data-js-rename-project-dialog]');
    await dialog.locator('[data-js-rename-project-input]').fill('Renamed');
    await dialog.getByRole('button', { name: 'Renommer' }).click();

    await expect(dialog).not.toBeVisible();
    await expect(page.locator('.project-list__name')).toHaveText('Renamed');
  });

  test('annuler ne renomme pas', async ({ page }) => {
    await page.locator('[data-js-project-rename]').click();
    const dialog = page.locator('[data-js-rename-project-dialog]');
    await dialog.locator('[data-js-rename-project-input]').fill('Changed');
    await dialog.getByRole('button', { name: 'Annuler' }).click();

    await expect(page.locator('.project-list__name')).toHaveText('Original');
  });
});

test.describe('Suppression de projet', () => {
  test.beforeEach(async ({ page }) => {
    await page.getByRole('button', { name: 'Ajouter un projet' }).first().click();
    const dialog = page.locator('[data-js-create-project-dialog]');
    await dialog.locator('[data-js-create-project-input]').fill('ToDelete');
    await dialog.getByRole('button', { name: 'Ajouter' }).click();
  });

  test('la poubelle ouvre la modale de confirmation avec warning', async ({ page }) => {
    await page.locator('[data-js-project-delete]').click();
    const dialog = page.locator('[data-js-delete-project-dialog]');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.alert')).toBeVisible();
    await expect(dialog).toContainText('ToDelete');
  });

  test('confirmer supprime le projet et affiche l\'empty state', async ({ page }) => {
    await page.locator('[data-js-project-delete]').click();
    const dialog = page.locator('[data-js-delete-project-dialog]');
    await dialog.getByRole('button', { name: 'Supprimer' }).click();

    await expect(dialog).not.toBeVisible();
    await expect(page.locator('[data-js-projects-empty]')).toBeVisible();
    await expect(page.locator('[data-js-project-list]')).toBeHidden();
  });

  test('annuler ne supprime pas', async ({ page }) => {
    await page.locator('[data-js-project-delete]').click();
    const dialog = page.locator('[data-js-delete-project-dialog]');
    await dialog.getByRole('button', { name: 'Annuler' }).click();

    await expect(dialog).not.toBeVisible();
    await expect(page.locator('.project-list__name')).toHaveText('ToDelete');
  });
});

test.describe('Persistance des projets', () => {
  test('les projets sont restaurés après rechargement', async ({ page }) => {
    // Create project
    await page.getByRole('button', { name: 'Ajouter un projet' }).first().click();
    const dialog = page.locator('[data-js-create-project-dialog]');
    await dialog.locator('[data-js-create-project-input]').fill('Persistent');
    await dialog.getByRole('button', { name: 'Ajouter' }).click();

    // Reload
    await page.reload();

    // Project still there
    await expect(page.locator('.project-list__name')).toHaveText('Persistent');
    await expect(page.locator('[data-js-projects-empty]')).toBeHidden();
  });
});
