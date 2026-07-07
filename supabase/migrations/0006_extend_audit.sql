-- ============================================================================
-- 0006_extend_audit.sql — Sprint S3: estende a auditoria
--   A função log_audit_changes() (0002) é genérica; aqui anexamos o trigger
--   às demais tabelas com coluna `id uuid`, para rastrear todas as alterações
--   sensíveis (papéis, ativação de contas, publicações, comentários).
-- ============================================================================

create trigger profiles_audit
  after insert or update or delete on public.profiles
  for each row execute function public.log_audit_changes();

create trigger posts_audit
  after insert or update or delete on public.posts
  for each row execute function public.log_audit_changes();

create trigger comments_audit
  after insert or update or delete on public.comments
  for each row execute function public.log_audit_changes();
