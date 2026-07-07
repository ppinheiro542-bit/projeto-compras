import { expect, test } from '@playwright/test';

test.describe('Validação de formulários', () => {
  test('o campo de e-mail exige formato válido', async ({ page }) => {
    await page.goto('/login');
    const email = page.getByLabel('E-mail');
    await expect(email).toHaveAttribute('type', 'email');
    await expect(email).toHaveAttribute('required', '');
  });

  test('a senha exige mínimo de 8 caracteres no cadastro', async ({ page }) => {
    await page.goto('/register');
    const password = page.getByLabel('Senha');
    await expect(password).toHaveAttribute('minlength', '8');
    await expect(page.getByText('Mínimo de 8 caracteres.')).toBeVisible();
  });

  test('não submete login vazio (validação nativa do navegador)', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Entrar' }).click();
    // Permanece em /login porque os campos required bloqueiam o envio.
    await expect(page).toHaveURL(/\/login$/);
  });
});
