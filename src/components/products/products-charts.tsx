'use client';

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatBRL, formatInt } from '@/lib/format';
import { STATUS_LABELS, type Product } from '@/lib/types/products';

const PALETTE = ['#2563eb', '#16a34a', '#ea580c', '#9333ea', '#dc2626', '#0891b2', '#ca8a04'];

type Props = { products: Product[] };

export function ProductsCharts({ products }: Props) {
  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) map.set(p.category, (map.get(p.category) ?? 0) + 1);
    return Array.from(map, ([name, value]) => ({ name, value })).sort(
      (a, b) => b.value - a.value,
    );
  }, [products]);

  const stockValueByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      map.set(p.category, (map.get(p.category) ?? 0) + Number(p.price) * p.stock_qty);
    }
    return Array.from(map, ([name, valor]) => ({ name, valor })).sort(
      (a, b) => b.valor - a.valor,
    );
  }, [products]);

  const byStatus = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) map.set(p.status, (map.get(p.status) ?? 0) + 1);
    return Array.from(map, ([status, value]) => ({
      name: STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? status,
      value,
    }));
  }, [products]);

  if (products.length === 0) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Produtos por categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={byCategory}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(d) => `${d.value}`}
              >
                {byCategory.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${formatInt(Number(v))} produtos`, '']} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Valor em estoque por categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stockValueByCategory} margin={{ left: 8, right: 8 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                interval={0}
                angle={-15}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip formatter={(v) => [formatBRL(Number(v)), 'Estoque']} />
              <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                {stockValueByCategory.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Produtos por status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byStatus} margin={{ left: 8, right: 8 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => [`${formatInt(Number(v))} produtos`, '']} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {byStatus.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
