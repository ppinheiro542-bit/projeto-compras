-- ============================================================================
-- 0001_initial.sql — Sprint 1: profiles, terms_versions, user_consents (LGPD)
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- profiles: extends auth.users with application data
-- ----------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Provisions profile automatically on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at column
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- terms_versions: versioned Terms of Use / Privacy Policy
-- ----------------------------------------------------------------------------
create table public.terms_versions (
  id              uuid primary key default gen_random_uuid(),
  version         text not null unique,
  title           text not null,
  content         text not null,
  effective_date  timestamptz not null default now(),
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

alter table public.terms_versions enable row level security;

create policy "terms_select_authenticated" on public.terms_versions
  for select to authenticated using (true);

-- Ensures at most one active version at any time
create unique index terms_versions_one_active
  on public.terms_versions (is_active) where is_active;

-- ----------------------------------------------------------------------------
-- user_consents: LGPD consent records (Lei 13.709/2018, Art. 8)
-- ----------------------------------------------------------------------------
create table public.user_consents (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  terms_version_id  uuid not null references public.terms_versions(id),
  accepted_at       timestamptz not null default now(),
  ip_address        inet,
  user_agent        text,
  unique (user_id, terms_version_id)
);

alter table public.user_consents enable row level security;

create policy "consents_select_own" on public.user_consents
  for select using (auth.uid() = user_id);

create policy "consents_insert_own" on public.user_consents
  for insert with check (auth.uid() = user_id);

create index user_consents_user_idx on public.user_consents(user_id);

-- ----------------------------------------------------------------------------
-- Seed: initial terms version
-- ----------------------------------------------------------------------------
insert into public.terms_versions (version, title, content) values (
  '1.0.0',
  'Termos de Uso e Política de Privacidade',
  E'## 1. Aceitação\n\nAo utilizar este sistema você concorda com estes Termos de Uso e com a Política de Privacidade descritos a seguir.\n\n## 2. Dados Coletados (LGPD — Lei 13.709/2018)\n\nColetamos: nome, e-mail, dados de uso, endereço IP, agente do navegador e logs de acesso.\n\n## 3. Finalidade do Tratamento\n\nOs dados são utilizados para autenticação, auditoria, prestação dos serviços de ERP e cumprimento de obrigações legais.\n\n## 4. Direitos do Titular\n\nVocê pode solicitar acesso, correção, anonimização, portabilidade ou exclusão dos seus dados a qualquer momento, conforme art. 18 da LGPD.\n\n## 5. Compartilhamento\n\nDados não são compartilhados com terceiros sem consentimento, exceto por obrigação legal ou ordem judicial.\n\n## 6. Segurança\n\nAplicamos medidas técnicas e administrativas para proteger seus dados contra acessos não autorizados.\n\n## 7. Contato\n\nPara exercer seus direitos ou esclarecer dúvidas, entre em contato com o encarregado de dados (DPO) através do canal informado.'
);
