-- ============================================================================
-- 0007_notifications.sql — Sprint S4: Notificações e Alertas
--   * Tabela notifications (por usuário) + RLS
--   * Gatilhos: novo comentário na publicação; estoque baixo (gestores/admins)
--     As funções são SECURITY DEFINER para criar notificações a OUTROS usuários.
-- ============================================================================

create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null check (type in ('comment', 'low_stock', 'system')),
  title       text not null,
  body        text,
  link        text,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index notifications_user_idx
  on public.notifications (user_id, is_read, created_at desc);

alter table public.notifications enable row level security;

-- Cada usuário só enxerga/gerencia as próprias notificações.
create policy "notifications_select_own" on public.notifications
  for select using (auth.uid() = user_id);

create policy "notifications_update_own" on public.notifications
  for update using (auth.uid() = user_id);

create policy "notifications_delete_own" on public.notifications
  for delete using (auth.uid() = user_id);
-- INSERT é feito pelos triggers SECURITY DEFINER abaixo (bypassa RLS).

-- ----------------------------------------------------------------------------
-- Novo comentário -> notifica o autor da publicação (se não for ele mesmo)
-- ----------------------------------------------------------------------------
create or replace function public.notify_on_comment()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_post_author uuid;
  v_actor_name  text;
begin
  select user_id into v_post_author from public.posts where id = new.post_id;

  if v_post_author is not null and v_post_author <> new.user_id then
    select coalesce(full_name, email) into v_actor_name
      from public.profiles where id = new.user_id;

    insert into public.notifications (user_id, type, title, body, link)
    values (
      v_post_author,
      'comment',
      'Novo depoimento na sua publicação',
      coalesce(v_actor_name, 'Alguém') || ' comentou na sua publicação.',
      '/dashboard/mural'
    );
  end if;
  return new;
end;
$$;

create trigger comments_notify
  after insert on public.comments
  for each row execute function public.notify_on_comment();

-- ----------------------------------------------------------------------------
-- Estoque cruzando abaixo de 5 -> notifica gestores e admins ativos
-- ----------------------------------------------------------------------------
create or replace function public.notify_low_stock()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.stock_qty < 5 and (tg_op = 'INSERT' or old.stock_qty >= 5) then
    insert into public.notifications (user_id, type, title, body, link)
    select p.id, 'low_stock', 'Estoque baixo',
           new.name || ' está com apenas ' || new.stock_qty || ' unidade(s).',
           '/dashboard/products'
      from public.profiles p
     where p.role in ('admin', 'gestor') and p.is_active;
  end if;
  return new;
end;
$$;

create trigger products_low_stock
  after insert or update of stock_qty on public.products
  for each row execute function public.notify_low_stock();
