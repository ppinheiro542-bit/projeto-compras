-- ============================================================================
-- 0003_avatars_storage.sql — Sprint 4: bucket de avatares (edição de perfil)
--   Cria o bucket público "avatars" e políticas de acesso por usuário.
--   Cada usuário só pode gravar/alterar arquivos dentro da própria pasta
--   (o primeiro segmento do path é o auth.uid()): "<uid>/<arquivo>".
-- ============================================================================

-- Bucket público de leitura (avatar aparece na UI sem URL assinada).
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Qualquer um pode LER (bucket público — necessário para <img src>).
create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Upload apenas na própria pasta.
create policy "avatars_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Atualizar apenas os próprios arquivos.
create policy "avatars_update_own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Remover apenas os próprios arquivos.
create policy "avatars_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
