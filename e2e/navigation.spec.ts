import { expect, test } from '@playwright/test';

test.describe('Navegação pública', () => {
  test('usuário não autenticado é redirecionado para /login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible();
  });

  test('a tela de login mostra os campos de e-mail e senha', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel('E-mail')).toBeVisible();
    await expect(page.getByLabel('Senha')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
  });

  test('link "Cadastre-se" leva ao cadastro', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: 'Cadastre-se' }).click();
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByLabel('Nome completo')).toBeVisible();
  });

  test('link "Esqueceu sua senha?" leva à recuperação', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: 'Esqueceu sua senha?' }).click();
    await expect(page).toHaveURL(/\/forgot-password$/);
  });

  test('rotas protegidas redirecionam para login', async ({ page }) => {
    await page.goto('/dashboard/products');
    await expect(page).toHaveURL(/\/login$/);
  });
});
