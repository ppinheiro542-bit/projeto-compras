-- ============================================================================
-- 0002_products_and_audit.sql — Sprint 2
--   Tabelas: products, audit_logs
--   Trigger: log_audit_changes (anexada a products)
--   Seed:    15 produtos ficticios de escritorio/informatica
-- ============================================================================

create extension if not exists "pg_trgm";

-- ----------------------------------------------------------------------------
-- ENUM: status do produto
-- ----------------------------------------------------------------------------
create type public.product_status as enum ('ativo', 'inativo', 'descontinuado');

-- ----------------------------------------------------------------------------
-- products
-- ----------------------------------------------------------------------------
create table public.products (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  description  text,
  sku          text not null unique,
  price        numeric(12, 2) not null default 0 check (price >= 0),
  stock_qty    integer not null default 0 check (stock_qty >= 0),
  category     text not null,
  status       public.product_status not null default 'ativo',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index products_category_idx on public.products(category);
create index products_status_idx   on public.products(status);
create index products_name_trgm    on public.products using gin (name gin_trgm_ops);

alter table public.products enable row level security;

create policy "products_select_authenticated" on public.products
  for select to authenticated using (true);

create policy "products_insert_authenticated" on public.products
  for insert to authenticated with check (true);

create policy "products_update_authenticated" on public.products
  for update to authenticated using (true);

create policy "products_delete_authenticated" on public.products
  for delete to authenticated using (true);

-- Reaproveita set_updated_at() criada em 0001_initial.sql
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- audit_logs
-- ----------------------------------------------------------------------------
create table public.audit_logs (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete set null,
  action         text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  target_table   text not null,
  record_id      uuid,
  old_data       jsonb,
  new_data       jsonb,
  timestamp      timestamptz not null default now()
);

create index audit_logs_user_idx        on public.audit_logs(user_id);
create index audit_logs_table_idx       on public.audit_logs(target_table);
create index audit_logs_timestamp_idx   on public.audit_logs(timestamp desc);

alter table public.audit_logs enable row level security;

-- Apenas leitura para usuarios autenticados.
-- A escrita e feita pelo trigger SECURITY DEFINER (bypassa RLS).
create policy "audit_logs_select_authenticated" on public.audit_logs
  for select to authenticated using (true);

-- ----------------------------------------------------------------------------
-- Trigger function: registra automaticamente alteracoes em audit_logs
-- Generica - pode ser anexada a qualquer tabela com coluna `id uuid`
-- ----------------------------------------------------------------------------
create or replace function public.log_audit_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id   uuid;
  v_record_id uuid;
  v_old       jsonb;
  v_new       jsonb;
begin
  -- auth.uid() e NULL quando a operacao ocorre fora de um request autenticado
  -- (ex.: seed via SQL Editor, jobs internos). O log ainda e gerado.
  begin
    v_user_id := auth.uid();
  exception when others then
    v_user_id := null;
  end;

  if (tg_op = 'DELETE') then
    v_old := to_jsonb(old);
    v_new := null;
    v_record_id := (v_old->>'id')::uuid;
  elsif (tg_op = 'UPDATE') then
    v_old := to_jsonb(old);
    v_new := to_jsonb(new);
    v_record_id := (v_new->>'id')::uuid;
  elsif (tg_op = 'INSERT') then
    v_old := null;
    v_new := to_jsonb(new);
    v_record_id := (v_new->>'id')::uuid;
  end if;

  insert into public.audit_logs (user_id, action, target_table, record_id, old_data, new_data)
  values (v_user_id, tg_op, tg_table_name, v_record_id, v_old, v_new);

  if (tg_op = 'DELETE') then
    return old;
  else
    return new;
  end if;
end;
$$;

create trigger products_audit
  after insert or update or delete on public.products
  for each row execute function public.log_audit_changes();

-- ----------------------------------------------------------------------------
-- Seed: 15 produtos (Informatica, Mobiliario, Material de Escritorio)
--   Itens com stock_qty < 5 para validar o card "Estoque Baixo":
--     - Mesa de Escritorio 1.20m (3)
--     - Impressora HP LaserJet   (4)
--     - Webcam Logitech C920     (2)
-- ----------------------------------------------------------------------------
insert into public.products (name, description, sku, price, stock_qty, category, status) values
('Notebook Dell Inspiron 15',              'Notebook 15.6" Intel Core i5, 8GB RAM, SSD 256GB',        'INF-NB-DELL-001',   4299.90,  12, 'Informática',             'ativo'),
('Monitor LG 24" Full HD',                 'Monitor IPS 24 polegadas Full HD 75Hz',                    'INF-MN-LG24-002',    899.00,   8, 'Informática',             'ativo'),
('Cadeira Ergonômica DT3 Beta',            'Cadeira de escritório com apoio lombar ajustável',         'MOB-CD-DT3-003',   1499.00,   6, 'Mobiliário',              'ativo'),
('Mesa de Escritório 1.20m',               'Mesa em MDF com gaveteiro lateral',                        'MOB-MS-120-004',     689.00,   3, 'Mobiliário',              'ativo'),
('Mouse Logitech MX Master 3S',            'Mouse sem fio ergonômico de alta precisão',                'INF-MS-LOG-005',     649.90,  25, 'Informática',             'ativo'),
('Teclado Mecânico Keychron K2',           'Teclado mecânico sem fio 75% layout',                      'INF-TC-KCK2-006',    799.00,  10, 'Informática',             'ativo'),
('Impressora HP LaserJet Pro M404',        'Impressora laser monocromática duplex',                    'INF-IM-HPM404-007', 1899.00,   4, 'Informática',             'ativo'),
('Resma Papel A4 Chamex (500 fls)',        'Papel sulfite 75g/m² A4',                                  'ESC-PP-A4-008',       27.90, 150, 'Material de Escritório',  'ativo'),
('Caneta Esferográfica BIC Cristal',       'Caixa com 50 canetas azuis ponta 1.0mm',                   'ESC-CN-BIC-009',      89.90,  30, 'Material de Escritório',  'ativo'),
('Grampeador Médio Maped',                 'Grampeador para até 25 folhas com extrator',               'ESC-GR-MAP-010',      49.90,  18, 'Material de Escritório',  'ativo'),
('HD Externo Seagate 2TB',                 'HD portátil USB 3.0 capacidade 2TB',                       'INF-HD-SEA-011',     549.00,   7, 'Informática',             'ativo'),
('Webcam Logitech C920 HD Pro',            'Webcam Full HD 1080p com microfone estéreo',               'INF-WC-LOG-012',     449.00,   2, 'Informática',             'ativo'),
('Headset JBL Quantum 100',                'Headset over-ear com microfone removível',                 'INF-HS-JBL-013',     299.00,  11, 'Informática',             'inativo'),
('Calculadora Casio HR-100RC',             'Calculadora de mesa com bobina e 12 dígitos',              'ESC-CL-CAS-014',     219.00,   9, 'Material de Escritório',  'ativo'),
('Pasta Sanfonada Polionda A-Z',           'Pasta arquivo morto formato ofício',                       'ESC-PA-POL-015',      18.50,  60, 'Material de Escritório',  'descontinuado');
