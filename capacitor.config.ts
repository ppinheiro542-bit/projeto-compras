import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Configuração do Capacitor — empacota o app web em APK/IPA.
 *
 * ESTRATÉGIA (Caminho A — WebView para app hospedado):
 *   Este projeto Next.js usa Server Components + Server Actions + Supabase SSR,
 *   que exigem um servidor Node em execução. Por isso o app nativo NÃO empacota
 *   os arquivos localmente: ele carrega a versão publicada do site (ex.: Vercel)
 *   via `server.url`. O APK/IPA vira uma "casca" nativa do sistema já pronto.
 *
 *   Publique o Next.js e defina a URL em `.env.local`:
 *     CAP_SERVER_URL=https://seu-projeto.vercel.app
 *
 *   Para desenvolvimento local com o app rodando na mesma rede, use o IP da
 *   máquina (não "localhost", que aponta para o próprio celular):
 *     CAP_SERVER_URL=http://192.168.0.10:3000
 */
const serverUrl = process.env.CAP_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'br.faculdade.projetocompras',
  appName: 'Projeto Compras',
  // webDir precisa existir mesmo no modo server.url (fallback offline).
  webDir: 'public',
  server: serverUrl
    ? {
        url: serverUrl,
        cleartext: serverUrl.startsWith('http://'), // permite HTTP só em dev local
      }
    : undefined,
};

export default config;
