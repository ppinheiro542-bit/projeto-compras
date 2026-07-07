'use client';

import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatInt } from '@/lib/format';
import type { Product } from '@/lib/types/products';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

/** Gráfico de linha: evolução acumulada de produtos cadastrados por mês. */
export function ProductsTimelineChart({ products }: { products: Product[] }) {
  const data = useMemo(() => {
    const perMonth = new Map<string, number>();
    for (const p of products) {
      const d = new Date(p.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      perMonth.set(key, (perMonth.get(key) ?? 0) + 1);
    }
    const keys = Array.from(perMonth.keys()).sort();
    let cumulative = 0;
    return keys.map((key) => {
      cumulative += perMonth.get(key) ?? 0;
      const [year, month] = key.split('-');
      return {
        label: `${MONTHS[Number(month) - 1]}/${year.slice(2)}`,
        novos: perMonth.get(key) ?? 0,
        total: cumulative,
      };
    });
  }, [products]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Evolução do catálogo (produtos cadastrados)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Sem dados.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ left: 8, right: 16, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v, name) => [
                  formatInt(Number(v)),
                  name === 'total' ? 'Total acumulado' : 'Novos no mês',
                ]}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="total"
              />
              <Line
                type="monotone"
                dataKey="novos"
                stroke="#16a34a"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3 }}
                name="novos"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
