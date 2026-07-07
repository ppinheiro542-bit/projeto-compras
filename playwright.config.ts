import { defineConfig, devices } from '@playwright/test';

/**
 * Testes end-to-end (navegação e validação de formulários).
 *
 * Pré-requisitos para rodar localmente:
 *   1. `npx playwright install chromium` (baixa o navegador, uma vez)
 *   2. `.env.local` configurado (o servidor usa o Supabase)
 *   3. `npm run test:e2e`  (sobe o dev server automaticamente)
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000/login',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
