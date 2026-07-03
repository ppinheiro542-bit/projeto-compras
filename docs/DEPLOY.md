# Publicar o Web App online (grátis)

O banco (Supabase) **já está na nuvem**. Falta só hospedar o app Next.js na
**Vercel** (plano Hobby, grátis). Escolha um dos dois caminhos.

## Variáveis de ambiente (usadas nos dois caminhos)

No painel da Vercel (**Settings ▸ Environment Variables**) cadastre:

| Nome | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | igual ao seu `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | igual ao seu `.env.local` |
| `NEXT_PUBLIC_SITE_URL` | `https://SEU-PROJETO.vercel.app` (preencha após o 1º deploy) |
| `NEXT_PUBLIC_APP_VERSION` | `1.1.0-beta` |

> O `.env.local` **não** é enviado (está no `.gitignore`). As chaves ficam só na Vercel.

---

## Caminho A — Vercel CLI (mais rápido para testar)

Não precisa de GitHub. No terminal, dentro da pasta do projeto:

```bash
npm i -g vercel          # instala a CLI (uma vez)
vercel login             # abre o navegador para autenticar
vercel                   # 1º deploy (preview) — responde as perguntas
```

Perguntas típicas: *Set up and deploy?* → **Y**; *Which scope?* → sua conta;
*Link to existing project?* → **N**; *Project name* → enter; *Directory* → `./`;
*Override settings?* → **N** (a Vercel detecta Next.js sozinha).

Depois, cadastre as variáveis de ambiente (comando abaixo ou pelo painel) e
publique em produção:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL         # cole o valor quando pedir
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_SITE_URL             # https://SEU-PROJETO.vercel.app
vercel env add NEXT_PUBLIC_APP_VERSION
vercel --prod                                   # deploy final de produção
```

---

## Caminho B — GitHub + Vercel (atualiza sozinho a cada push)

```bash
git init
git add .
git commit -m "Projeto Compras - web app"
# crie um repositório vazio no github.com e rode:
git remote add origin https://github.com/SEU-USUARIO/projeto-compras.git
git branch -M main
git push -u origin main
```

Depois, em [vercel.com/new](https://vercel.com/new): **Import** o repositório →
cadastre as 4 variáveis de ambiente → **Deploy**. A cada `git push`, a Vercel
recompila e publica automaticamente.

---

## Passo final (obrigatório nos dois caminhos): ajustar o Supabase

Sem isso o login/cadastro por e-mail falha ao redirecionar.

**Supabase ▸ Authentication ▸ URL Configuration:**

- **Site URL:** `https://SEU-PROJETO.vercel.app`
- **Redirect URLs:** adicione
  `https://SEU-PROJETO.vercel.app/auth/callback`
  (mantenha também `http://localhost:3000/auth/callback` para desenvolvimento).

Pronto — o web app fica acessível pela URL da Vercel em qualquer navegador,
sem depender de servidor ou banco local.

## Comparativo dos planos grátis

| Serviço | Grátis inclui | Bom para |
|---|---|---|
| **Vercel Hobby** | HTTPS, domínio `.vercel.app`, SSR/Server Actions, deploys ilimitados | Hospedar o Next.js (uso pessoal/estudo) |
| **Supabase Free** | 500 MB banco, 1 GB storage, 50k usuários/mês | Banco, Auth e Storage (já em uso) |
