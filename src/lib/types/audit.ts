export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE';

export type AuditActor = { full_name: string | null; email: string };

export type AuditLog = {
  id: string;
  user_id: string | null;
  action: AuditAction;
  target_table: string;
  record_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  timestamp: string;
  actor: AuditActor | null;
};

export const ACTION_LABELS: Record<AuditAction, string> = {
  INSERT: 'Criação',
  UPDATE: 'Alteração',
  DELETE: 'Exclusão',
};

/** Rótulos amigáveis para os nomes técnicos das tabelas. */
export const TABLE_LABELS: Record<string, string> = {
  products: 'Produtos',
  profiles: 'Usuários',
  posts: 'Publicações',
  comments: 'Comentários',
  user_consents: 'Consentimentos',
};

export function tableLabel(table: string): string {
  return TABLE_LABELS[table] ?? table;
}
