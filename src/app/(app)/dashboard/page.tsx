import Link from 'next/link';
import {
  AlertTriangle,
  MessagesSquare,
  Package,
  ShieldCheck,
  Users,
  Wallet,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { formatBRL, formatDateTime, formatInt } from '@/lib/format';
import { ACTION_LABELS, tableLabel, type AuditAction } from '@/lib/types/audit';
import { isAdmin } from '@/lib/types/profiles';

const LOW_STOCK_THRESHOLD = 5;

export default async function DashboardPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const admin = isAdmin(profile?.role);

  const [totalRes, lowStockRes, stockRes, postsRes, usersRes, auditRes] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase
      .from('products')
      .select('id, name, sku, stock_qty', { count: 'exact' })
      .lt('stock_qty', LOW_STOCK_THRESHOLD)
      .order('stock_qty', { ascending: true }),
    supabase.from('products').select('price, stock_qty'),
    supabase.from('posts').select('id', { count: 'exact', head: true }),
    admin
      ? supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_active', true)
      : Promise.resolve({ count: null }),
    admin
      ? supabase
          .from('audit_logs')
          .select('id, action, target_table, timestamp')
          .order('timestamp', { ascending: false })
          .limit(6)
      : Promise.resolve({ data: [] }),
  ]);

  const totalProducts = totalRes.count ?? 0;
  const lowStock = lowStockRes.data ?? [];
  const lowStockCount = lowStockRes.count ?? 0;
  const stockValue = (stockRes.data ?? []).reduce(
    (sum, p) => sum + Number(p.price) * Number(p.stock_qty),
    0,
  );
  const postsCount = postsRes.count ?? 0;
  const usersCount = (usersRes as { count: number | null }).count;
  const recentAudit = (auditRes as { data: { id: string; action: AuditAction; target_table: string; timestamp: string }[] }).data ?? [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Olá, {profile?.full_name?.split(' ')[0] ?? 'usuário'} 👋
        </h1>
        <p className="text-sm text-muted-foreground">Visão geral do sistema de compras.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi title="Total de Produtos" icon={Package} value={formatInt(totalProducts)} hint="itens no catálogo" />
        <Kpi title="Valor em Estoque" icon={Wallet} value={formatBRL(stockValue)} hint="preço × quantidade" />
        <Kpi
          title="Estoque Baixo"
          icon={AlertTriangle}
          value={formatInt(lowStockCount)}
          hint={`abaixo de ${LOW_STOCK_THRESHOLD} un.`}
          alert={lowStockCount > 0}
        />
        {admin ? (
          <Kpi title="Usuários Ativos" icon={Users} value={formatInt(usersCount ?? 0)} hint="contas habilitadas" />
        ) : (
          <Kpi title="Publicações" icon={MessagesSquare} value={formatInt(postsCount)} hint="no mural" />
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens com estoque baixo</CardTitle>
            <Link href="/dashboard/products" className="text-xs text-muted-foreground underline">
              ver produtos
            </Link>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nenhum item com estoque baixo. 👍
              </p>
            ) : (
              <ul className="divide-y">
                {lowStock.slice(0, 6).map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-2">
                    <div>
                      <div className="text-sm font-medium">{p.name}</div>
                      <div className="font-mono text-xs text-muted-foreground">{p.sku}</div>
                    </div>
                    <Badge variant={p.stock_qty === 0 ? 'destructive' : 'warning'}>
                      {formatInt(p.stock_qty)} un.
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {admin && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="flex items-center gap-1.5 text-sm font-medium">
                <ShieldCheck className="h-4 w-4" />
                Atividade recente
              </CardTitle>
              <Link
                href="/dashboard/admin/auditoria"
                className="text-xs text-muted-foreground underline"
              >
                ver auditoria
              </Link>
            </CardHeader>
            <CardContent>
              {recentAudit.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Sem eventos registrados.
                </p>
              ) : (
                <ul className="divide-y">
                  {recentAudit.map((a) => (
                    <li key={a.id} className="flex items-center justify-between py-2 text-sm">
                      <span>
                        {ACTION_LABELS[a.action]} em{' '}
                        <span className="font-medium">{tableLabel(a.target_table)}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(a.timestamp)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function Kpi({
  title,
  icon: Icon,
  value,
  hint,
  alert = false,
}: {
  title: string;
  icon: typeof Package;
  value: string;
  hint: string;
  alert?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={alert ? 'h-4 w-4 text-destructive' : 'h-4 w-4 text-muted-foreground'} />
      </CardHeader>
      <CardContent>
        <div
          className={
            alert
              ? 'text-3xl font-semibold tabular-nums text-destructive'
              : 'text-3xl font-semibold tabular-nums'
          }
        >
          {value}
        </div>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
