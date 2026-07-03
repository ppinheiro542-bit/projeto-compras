-- ============================================================================
-- 0004_posts_and_comments.sql — Sprint 4: Mural (publicações e depoimentos)
--   Tabelas: posts (publicações com imagem + legenda), comments (depoimentos)
--   Bucket:  post-images
-- ============================================================================

-- ----------------------------------------------------------------------------
-- posts: publicações do mural (imagem opcional + legenda)
-- ----------------------------------------------------------------------------
-- user_id referencia profiles(id) (que espelha auth.users) para permitir o
-- "embed" do autor via PostgREST: posts -> profiles(full_name, avatar_url).
create table public.posts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  caption     text not null check (char_length(caption) between 1 and 1000),
  image_url   text,
  created_at  timestamptz not null default now()
);

create index posts_created_idx on public.posts(created_at desc);
create index posts_caption_trgm on public.posts using gin (caption gin_trgm_ops);

alter table public.posts enable row level security;

create policy "posts_select_authenticated" on public.posts
  for select to authenticated using (true);

create policy "posts_insert_own" on public.posts
  for insert to authenticated with check (auth.uid() = user_id);

create policy "posts_delete_own" on public.posts
  for delete to authenticated using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- comments: depoimentos/comentários em uma publicação
-- ----------------------------------------------------------------------------
create table public.comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.posts(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  body        text not null check (char_length(body) between 1 and 500),
  created_at  timestamptz not null default now()
);

create index comments_post_idx on public.comments(post_id, created_at);

alter table public.comments enable row level security;

create policy "comments_select_authenticated" on public.comments
  for select to authenticated using (true);

create policy "comments_insert_own" on public.comments
  for insert to authenticated with check (auth.uid() = user_id);

create policy "comments_delete_own" on public.comments
  for delete to authenticated using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Bucket público de imagens das publicações (mesma política de pasta por uid)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

create policy "post_images_public_read"
  on storage.objects for select
  using (bucket_id = 'post-images');

create policy "post_images_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "post_images_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
