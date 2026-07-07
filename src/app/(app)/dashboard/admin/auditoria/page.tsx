import { createClient } from '@/lib/supabase/server';
import { AuditTable } from '@/components/admin/audit-table';
import type { AuditLog } from '@/lib/types/audit';

export const metadata = { title: 'Auditoria · Projeto Compras' };

const MAX_LOGS = 300;

export default async function AuditPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('audit_logs')
    .select('id, user_id, action, target_table, record_id, old_data, new_data, timestamp')
    .order('timestamp', { ascending: false })
    .limit(MAX_LOGS);

  if (error) throw new Error(error.message);
  const rows = data ?? [];

  // Resolve os autores (audit_logs.user_id -> auth.users; buscamos em profiles).
  const userIds = Array.from(
    new Set(rows.map((r) => r.user_id).filter((id): id is string => !!id)),
  );
  const actorsById = new Map<string, { full_name: string | null; email: string }>();
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', userIds);
    for (const p of profiles ?? []) {
      actorsById.set(p.id, { full_name: p.full_name, email: p.email });
    }
  }

  const logs: AuditLog[] = rows.map((r) => ({
    ...(r as Omit<AuditLog, 'actor'>),
    actor: r.user_id ? actorsById.get(r.user_id) ?? null : null,
  }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Auditoria</h1>
        <p className="text-sm text-muted-foreground">
          Histórico de alterações do sistema (últimos {MAX_LOGS} eventos). Cada registro guarda os
          dados antes e depois da mudança.
        </p>
      </header>
      <AuditTable logs={logs} />
    </div>
  );
}
