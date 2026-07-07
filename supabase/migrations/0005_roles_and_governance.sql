-- ============================================================================
-- 0005_roles_and_governance.sql — Sprint S1: Governança (RBAC)
--   * Papéis: admin, gestor, usuario  (coluna profiles.role)
--   * Conta ativa/inativa: profiles.is_active
--   * Funções helper: current_user_role(), is_admin(), can_manage()
--   * RLS por papel em products e audit_logs; políticas de admin em profiles
--   * Promove o primeiro/─mais antigo usuário a admin
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Papel do usuário
-- ----------------------------------------------------------------------------
create type public.user_role as enum ('admin', 'gestor', 'usuario');

alter table public.profiles
  add column role      public.user_role not null default 'usuario',
  add column is_active  boolean         not null default true;

-- ----------------------------------------------------------------------------
-- Helpers de papel — SECURITY DEFINER lê profiles ignorando RLS (evita recursão)
-- ----------------------------------------------------------------------------
create or replace function public.current_user_role()
returns public.user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_active
  );
$$;

-- gestor ou admin (ambos gerenciam dados operacionais)
create or replace function public.can_manage()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'gestor') and is_active
  );
$$;

-- ----------------------------------------------------------------------------
-- handle_new_user: primeiro usuário do sistema nasce admin
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_role public.user_role := 'usuario';
begin
  if not exists (select 1 from public.profiles) then
    v_role := 'admin';
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', v_role);
  return new;
end;
$$;

-- Promove o usuário mais antigo a admin se ainda não houver nenhum
update public.profiles
set role = 'admin'
where id = (select id from public.profiles order by created_at asc limit 1)
  and not exists (select 1 from public.profiles where role = 'admin');

-- ----------------------------------------------------------------------------
-- RLS: products — leitura para todos; escrita apenas gestor/admin
-- ----------------------------------------------------------------------------
drop policy if exists "products_select_authenticated" on public.products;
drop policy if exists "products_insert_authenticated" on public.products;
drop policy if exists "products_update_authenticated" on public.products;
drop policy if exists "products_delete_authenticated" on public.products;

create policy "products_select" on public.products
  for select to authenticated using (true);

create policy "products_write" on public.products
  for all to authenticated
  using (public.can_manage())
  with check (public.can_manage());

-- ----------------------------------------------------------------------------
-- RLS: profiles — admin enxerga e edita todos
-- ----------------------------------------------------------------------------
create policy "profiles_select_admin" on public.profiles
  for select using (public.is_admin());

create policy "profiles_update_admin" on public.profiles
  for update using (public.is_admin());

-- ----------------------------------------------------------------------------
-- RLS: audit_logs — consulta restrita a admin
-- ----------------------------------------------------------------------------
drop policy if exists "audit_logs_select_authenticated" on public.audit_logs;

create policy "audit_logs_select_admin" on public.audit_logs
  for select using (public.is_admin());
