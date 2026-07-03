import Link from 'next/link';
import { AlertTriangle, Package, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { formatBRL, formatInt } from '@/lib/format';

const LOW_STOCK_THRESHOLD = 5;

async function loadSummary() {
  const supabase = await createClient();

  const [totalRes, lowStockRes, stockRes] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .lt('stock_qty', LOW_STOCK_THRESHOLD),
    supabase.from('products').select('price, stock_qty'),
  ]);

  const totalProducts = totalRes.count ?? 0;
  const lowStockCount = lowStockRes.count ?? 0;
  const stockValue = (stockRes.data ?? []).reduce(
    (sum, p) => sum + Number(p.price) * Number(p.stock_qty),
    0,
  );

  return { totalProducts, lowStockCount, stockValue };
}

export default async function DashboardPage() {
  const { totalProducts, lowStockCount, stockValue } = await loadSummary();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral do catálogo de produtos.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Produtos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">{formatInt(totalProducts)}</div>
            <p className="text-xs text-muted-foreground">itens cadastrados no catálogo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor Total em Estoque
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">{formatBRL(stockValue)}</div>
            <p className="text-xs text-muted-foreground">soma de preço × quantidade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Itens com Estoque Baixo
            </CardTitle>
            <AlertTriangle
              className={
                lowStockCount > 0 ? 'h-4 w-4 text-destructive' : 'h-4 w-4 text-muted-foreground'
              }
            />
          </CardHeader>
          <CardContent>
            <div
              className={
                lowStockCount > 0
                  ? 'text-3xl font-semibold tabular-nums text-destructive'
                  : 'text-3xl font-semibold tabular-nums'
              }
            >
              {formatInt(lowStockCount)}
            </div>
            <p className="text-xs text-muted-foreground">
              menos de {LOW_STOCK_THRESHOLD} unidades ·{' '}
              <Link href="/dashboard/products" className="underline">
                ver produtos
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
