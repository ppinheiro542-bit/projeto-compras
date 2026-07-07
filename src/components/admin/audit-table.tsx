'use client';

import { useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { diffFields, renderAuditValue } from '@/lib/audit-diff';
import { formatDateTime } from '@/lib/format';
import {
  ACTION_LABELS,
  tableLabel,
  type AuditAction,
  type AuditLog,
} from '@/lib/types/audit';

const ALL = '__all__';

const ACTION_VARIANT: Record<AuditAction, 'success' | 'warning' | 'destructive'> = {
  INSERT: 'success',
  UPDATE: 'warning',
  DELETE: 'destructive',
};

export function AuditTable({ logs }: { logs: AuditLog[] }) {
  const [search, setSearch] = useState('');
  const [tableFilter, setTableFilter] = useState<string>(ALL);
  const [actionFilter, setActionFilter] = useState<string>(ALL);
  const [detail, setDetail] = useState<AuditLog | null>(null);

  const tables = useMemo(
    () => Array.from(new Set(logs.map((l) => l.target_table))).sort(),
    [logs],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return logs.filter((l) => {
      const matchTable = tableFilter === ALL || l.target_table === tableFilter;
      const matchAction = actionFilter === ALL || l.action === actionFilter;
      const matchTerm =
        !term ||
        (l.record_id ?? '').toLowerCase().includes(term) ||
        (l.actor?.full_name ?? '').toLowerCase().includes(term) ||
        (l.actor?.email ?? '').toLowerCase().includes(term);
      return matchTable && matchAction && matchTerm;
    });
  }, [logs, search, tableFilter, actionFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Buscar por registro, autor ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[240px] flex-1"
        />
        <Select value={tableFilter} onValueChange={setTableFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tabela" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas as tabelas</SelectItem>
            {tables.map((t) => (
              <SelectItem key={t} value={t}>
                {tableLabel(t)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Ação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas as ações</SelectItem>
            {(Object.keys(ACTION_LABELS) as AuditAction[]).map((a) => (
              <SelectItem key={a} value={a}>
                {ACTION_LABELS[a]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Tabela</TableHead>
              <TableHead>Autor</TableHead>
              <TableHead className="text-right">Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                  Nenhum evento encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="whitespace-nowrap text-sm">
                    {formatDateTime(l.timestamp)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={ACTION_VARIANT[l.action]}>{ACTION_LABELS[l.action]}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{tableLabel(l.target_table)}</TableCell>
                  <TableCell className="text-sm">
                    {l.actor ? (
                      <div>
                        <div>{l.actor.full_name ?? '—'}</div>
                        <div className="text-xs text-muted-foreground">{l.actor.email}</div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Sistema</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setDetail(l)}>
                      <Eye className="mr-1.5 h-4 w-4" />
                      Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} de {logs.length} eventos
      </p>

      <Dialog open={detail !== null} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {detail && `${ACTION_LABELS[detail.action]} · ${tableLabel(detail.target_table)}`}
            </DialogTitle>
            <DialogDescription>
              {detail &&
                `${formatDateTime(detail.timestamp)} · ${
                  detail.actor?.email ?? 'Sistema'
                } · registro ${detail.record_id ?? '—'}`}
            </DialogDescription>
          </DialogHeader>

          {detail && (
            <ScrollArea className="max-h-[60vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campo</TableHead>
                    <TableHead>Antes</TableHead>
                    <TableHead>Depois</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {diffFields(detail).map((c) => (
                    <TableRow key={c.field}>
                      <TableCell className="font-mono text-xs">{c.field}</TableCell>
                      <TableCell className="text-xs text-muted-foreground line-through decoration-destructive/50">
                        {renderAuditValue(c.before)}
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        {renderAuditValue(c.after)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
