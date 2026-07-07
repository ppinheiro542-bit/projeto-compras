# Guia de configuração do Supabase

Passo a passo para deixar o backend pronto: aplicar as migrations, criar os
buckets de imagens e configurar a confirmação de e-mail. Não requer instalar a
CLI — tudo pelo painel web (SQL Editor).

## 1. Credenciais do projeto

1. Acesse [app.supabase.com](https://app.supabase.com) e abra (ou crie) o projeto.
2. Menu **Project Settings ▸ API**. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Cole no arquivo `.env.local` (veja `.env.local.example`).

## 2. Aplicar as migrations (ordem importa)

Menu lateral **SQL Editor ▸ New query**. Rode **uma de cada vez, na ordem**,
colando o conteúdo de cada arquivo e clicando em **Run**:

| Ordem | Arquivo | O que cria |
|---|---|---|
| 1 | `supabase/migrations/0001_initial.sql` | `profiles`, `terms_versions`, `user_consents`, triggers, termos v1.0.0 |
| 2 | `supabase/migrations/0002_products_and_audit.sql` | `products`, `audit_logs`, trigger de auditoria, 15 produtos |
| 3 | `supabase/migrations/0003_avatars_storage.sql` | Bucket `avatars` + políticas (edição de perfil) |
| 4 | `supabase/migrations/0004_posts_and_comments.sql` | `posts`, `comments`, bucket `post-images` (Mural) |
| 5 | `supabase/migrations/0005_roles_and_governance.sql` | Papéis (admin/gestor/usuário), `is_active`, RLS por papel; promove o usuário mais antigo a admin |
| 6 | `supabase/migrations/0006_extend_audit.sql` | Estende a auditoria a `profiles`, `posts` e `comments` |

> Se um script reclamar que "policy já existe" ao rodar de novo, é porque já foi
> aplicado antes — pode ignorar. Migrations não são idempotentes por padrão.

### Verificar os buckets

Menu **Storage**. Devem aparecer dois buckets **públicos**: `avatars` e
`post-images`. Se algum não apareceu, rode de novo a migration correspondente
(3 ou 4) — a criação do bucket está dentro dela.

## 3. Confirmação de e-mail (cadastro e troca de e-mail)

O cadastro (`signUp`) e a troca de e-mail no perfil disparam e-mails de
confirmação. Configure em **Authentication ▸ Providers ▸ Email**:

- **Confirm email**: ligado (padrão). O usuário recebe um link antes de acessar.
  - Para **testes rápidos em sala**, você pode **desligar** essa opção para logar
    sem confirmar. Reative antes da entrega/produção.
- **Authentication ▸ URL Configuration**:
  - **Site URL**: a URL do app publicado (ex.: `https://projeto-compras.vercel.app`)
    ou `http://localhost:3000` em dev.
  - **Redirect URLs**: adicione `http://localhost:3000/auth/callback` e a URL de
    produção equivalente. Sem isso, o link do e-mail falha ao redirecionar.

### E-mails em desenvolvimento

No plano free o Supabase limita o envio de e-mails. Para ver os links sem SMTP:
**Authentication ▸ Users** → abra o usuário → há o link de confirmação. Ou
configure um SMTP próprio em **Project Settings ▸ Auth ▸ SMTP**.

## 4. Criar um usuário de teste

1. **Authentication ▸ Users ▸ Add user** (marque *Auto Confirm User* para pular e-mail).
2. Faça login no app. O trigger `handle_new_user` cria o registro em `profiles`.
3. No primeiro acesso aparece o modal de **Termos (LGPD)** — aceite para liberar.

## 5. Conferência rápida (Table Editor)

Depois de usar o app, confira em **Table Editor**:

- `profiles` — seu usuário, com `full_name`/`avatar_url` após editar o perfil.
- `user_consents` — 1 registro com IP e user-agent após aceitar os termos.
- `products` — 15 itens do seed.
- `audit_logs` — 1 linha para cada criação/edição/exclusão de produto.
- `posts` / `comments` — preenchidos ao usar o Mural.

## Resolução de problemas

| Sintoma | Causa provável | Solução |
|---|---|---|
| Upload de avatar/imagem falha | Migration 0003/0004 não aplicada | Rode a migration; confira o bucket em Storage |
| "row violates row-level security" | Bucket sem política ou uid diferente da pasta | Confirme que a migration criou as *policies* de `storage.objects` |
| Link do e-mail dá erro de redirect | Redirect URL não cadastrada | Adicione a URL em Authentication ▸ URL Configuration |
| Login não persiste | Site URL incorreta | Ajuste Site URL para a origem real do app |
