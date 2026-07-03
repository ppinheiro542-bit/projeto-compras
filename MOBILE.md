# Geração do App Mobile (Fase 8 e 9)

Este projeto é uma aplicação **Next.js** (Server Components + Server Actions + Supabase).
Para gerar o APK/IPA usamos o **Capacitor** na estratégia **WebView para app hospedado**
(*Caminho A*): o app nativo carrega a versão publicada do site — não empacota os
arquivos localmente, porque o Next precisa de um servidor Node em execução.

```
┌─────────────┐     server.url      ┌──────────────────────┐
│  APK / IPA  │  ───────────────▶   │  Site publicado       │
│ (Capacitor) │                     │  (Vercel / servidor)  │
└─────────────┘                     └──────────────────────┘
```

## Pré-requisitos

- **Android:** [Android Studio](https://developer.android.com/studio) + JDK 17 (Windows/Mac/Linux).
- **iOS:** apenas em **macOS** com **Xcode** (não é possível gerar IPA no Windows).

## Passo 1 — Publicar o site (obrigatório)

O app é uma casca do site publicado, então publique primeiro o Next.js:

1. Suba o repositório para o GitHub e importe na [Vercel](https://vercel.com).
2. Configure as variáveis de ambiente na Vercel (as mesmas do `.env.local`:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`).
3. Anote a URL final, ex.: `https://projeto-compras.vercel.app`.

Defina essa URL no `.env.local`:

```
CAP_SERVER_URL=https://projeto-compras.vercel.app
```

> **Dev local:** para testar com o `npm run dev` rodando no PC, use o IP da máquina
> na rede (não `localhost`): `CAP_SERVER_URL=http://192.168.0.10:3000`.

## Passo 2 — Sincronizar o Capacitor

Sempre que mudar `capacitor.config.ts` ou o `CAP_SERVER_URL`:

```bash
npm run cap:sync
```

## Passo 3 — Abrir no Android Studio e gerar o APK

```bash
npm run cap:open:android
```

No Android Studio:

- **APK de teste:** menu **Build ▸ Build Bundle(s) / APK(s) ▸ Build APK(s)**.
  O arquivo sai em `android/app/build/outputs/apk/debug/app-debug.apk`.
- **AAB para a Play Store:** menu **Build ▸ Generate Signed Bundle / APK**, escolha
  **Android App Bundle**, crie ou selecione um *keystore* (assinatura digital) e conclua.

## Passo 4 — Permissões (Fase 8)

O `AndroidManifest.xml` (em `android/app/src/main/`) já inclui acesso à internet.
Se futuramente usar câmera ou arquivos, adicione as permissões correspondentes ali.

## Passo 5 — Publicação (Fase 9)

### Play Store (Android)
1. Conta de desenvolvedor Google Play (taxa única de US$ 25).
2. Assinar o **AAB** (Passo 3) — o Android Studio gera o *keystore*.
3. Criar o app no Play Console, subir o AAB, preencher ícone, screenshots e política de privacidade.
4. Enviar para revisão.

### App Store (iOS) — requer Mac
1. Conta Apple Developer (US$ 99/ano).
2. Certificados e *Provisioning Profiles* no Xcode.
3. `npx cap add ios` → `npm run cap:sync` → abrir no Xcode → **Archive** → subir via Transporter.
4. Enviar para revisão no App Store Connect.

---

### Resumo dos comandos

| Comando | Efeito |
|---|---|
| `npm run cap:add:android` | Cria o projeto nativo `android/` (já executado) |
| `npm run cap:sync` | Aplica config/plugins ao projeto nativo |
| `npm run cap:open:android` | Abre o projeto no Android Studio |
