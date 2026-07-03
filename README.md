# Projeto Compras — Sistema de Gestão Setorial

Sistema de gestão (ERP de compras/catálogo) desenvolvido como trabalho de
faculdade, seguindo o roadmap de sprints definido pelo professor. Aplicação web
responsiva com autenticação, conformidade LGPD, CRUD auditado, relatórios com
gráficos, exportação, mural social e empacotamento mobile.

## Stack técnica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router, Server Components + Server Actions) |
| Linguagem | TypeScript (strict) |
| UI | Tailwind CSS + componentes shadcn/ui + lucide-react |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Validação | Zod + react-hook-form |
| Tabelas/Relatórios | TanStack Table + Recharts |
| Exportação | jsPDF + jspdf-autotable (PDF), CSV nativo |
| Testes | Vitest + Testing Library |
| Mobile | Capacitor (Android/iOS) |

## Como rodar

```bash
npm install
cp .env.local.example .env.local   # preencha as chaves do Supabase
npm run dev                        # http://localhost:3000
```

Antes do primeiro uso, configure o backend seguindo **[docs/SUPABASE.md](docs/SUPABASE.md)**
(aplicar as 4 migrations e criar os buckets).

### Scripts

| Script | Ação |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run typecheck` | Checagem de tipos (`tsc --noEmit`) |
| `npm test` | Testes automatizados (Vitest) |
| `npm run cap:sync` / `cap:open:android` | Empacotamento mobile (ver [MOBILE.md](MOBILE.md)) |

## Progresso do roadmap

| # | Fase | Status |
|---|---|---|
| 1 | Definição e recorte técnico | ✅ Concluído |
| 2 | Autenticação e acesso | ✅ Login, cadastro, recuperação, sessão, logout |
| 3 | Termos e condições (LGPD) | ✅ Consentimento versionado, bloqueio até aceite |
| 4 | Funcionalidades do usuário | ✅ Perfil (nome/e-mail/avatar), Mural (publicações + depoimentos), busca |
| 5 | Exportação e compartilhamento | ✅ Exportação PDF e CSV do catálogo |
| 6 | Filtro e pesquisa | ✅ Filtros, ordenação, totais/médias, gráficos (pizza/barra) |
| 7 | Testes e depuração | ✅ Vitest (12 testes), typecheck limpo, build validado |
| 8 | Geração do aplicativo | ✅ Android via Capacitor (iOS requer macOS) |
| 9 | Publicação nas lojas | ⏳ Depende de contas de desenvolvedor e revisão das lojas |

## Decisões técnicas (para a apresentação)

- **Aplicação web + Capacitor, não app nativo.** O roadmap pedia APK/IPA. Como o
  núcleo é Next.js com Server Actions, empacotamos com Capacitor apontando para o
  site publicado (*WebView*). Gera APK/IPA reais para as lojas sem reescrever a
  aplicação. Detalhes em [MOBILE.md](MOBILE.md).

- **bcrypt em vez de SHA-256.** O roadmap citava "hash SHA-256" no cadastro. O
  Supabase Auth usa **bcrypt** internamente — mais seguro para senhas (SHA-256
  puro é inadequado por ser rápido demais e sem *salt* obrigatório). Optamos pelo
  padrão do provedor, superior ao pedido.

- **Auditoria automática (LGPD/rastreabilidade).** Toda alteração em `products` é
  registrada em `audit_logs` por um *trigger* `SECURITY DEFINER`, com dados
  antes/depois em JSONB — sem depender do código da aplicação.

- **Row Level Security (RLS)** habilitado em todas as tabelas; usuários só acessam
  os próprios dados (perfil, consentimentos, publicações/comentários).

- **Consentimento LGPD** versionado (`terms_versions`) com registro de IP e
  user-agent no aceite (`user_consents`), conforme art. 8 da Lei 13.709/2018.

## Estrutura

```
src/
├── app/
│   ├── (auth)/            # login, cadastro, recuperação de senha
│   ├── (app)/dashboard/   # dashboard, produtos, perfil, mural
│   └── auth/              # callbacks de autenticação
├── components/
│   ├── auth/  consent/  layout/  products/  posts/  profile/  ui/
├── lib/
│   ├── actions/          # server actions (auth, products, profile, posts, consent)
│   ├── supabase/         # clients (server, client, middleware)
│   ├── types/  export.ts  format.ts
supabase/migrations/       # 0001..0004 (schema versionado)
docs/SUPABASE.md           # configuração do backend
MOBILE.md                  # geração do APK/IPA
```

## Pendências para conclusão total

1. Aplicar as migrations `0003` e `0004` no Supabase (ver docs/SUPABASE.md).
2. Publicar o site (Vercel) e definir `CAP_SERVER_URL`.
3. Gerar o APK no Android Studio e, para as lojas, criar as contas de
   desenvolvedor (Fase 9).
