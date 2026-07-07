import type { AuditLog } from '@/lib/types/audit';

export type FieldChange = { field: string; before: unknown; after: unknown };

/**
 * Calcula os campos alterados entre old_data e new_data de um evento de auditoria.
 * Função pura — usada pela UI de auditoria e coberta por testes.
 */
export function diffFields(
  log: Pick<AuditLog, 'old_data' | 'new_data'>,
): FieldChange[] {
  const before = log.old_data ?? {};
  const after = log.new_data ?? {};
  const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));
  const changes: FieldChange[] = [];
  for (const field of keys.sort()) {
    const b = before[field];
    const a = after[field];
    if (JSON.stringify(b) !== JSON.stringify(a)) {
      changes.push({ field, before: b, after: a });
    }
  }
  return changes;
}

export function renderAuditValue(v: unknown): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}
