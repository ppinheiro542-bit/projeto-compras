'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatBRL, formatInt } from '@/lib/format';
import type { Product } from '@/lib/types/products';

type Row = {
  category: string;
  count: number;
  stock: number;
  stockValue: number;
  avgPrice: number;
};

/** Tabela agrupada por categoria, com totais e médias no rodapé. */
export function CategorySummary({ products }: { products: Product[] }) {
  const { rows, totals } = useMemo(() => {
    const map = new Map<string, Row>();
    for (const p of products) {
      const r =
        map.get(p.category) ??
        { category: p.category, count: 0, stock: 0, stockValue: 0, avgPrice: 0 };
      r.count += 1;
      r.stock += p.stock_qty;
      r.stockValue += Number(p.price) * p.stock_qty;
      map.set(p.category, r);
    }
    const rows = Array.from(map.values()).sort((a, b) => b.stockValue - a.stockValue);
    for (const r of rows) {
      // preço médio simples dos produtos da categoria
      const catProducts = products.filter((p) => p.category === r.category);
      r.avgPrice =
        catProducts.reduce((s, p) => s + Number(p.price), 0) / (catProducts.length || 1);
    }
    const totals = rows.reduce(
      (acc, r) => ({
        count: acc.count + r.count,
        stock: acc.stock + r.stock,
        stockValue: acc.stockValue + r.stockValue,
      }),
      { count: 0, stock: 0, stockValue: 0 },
    );
    return { rows, totals };
  }, [products]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Resumo por categoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Produtos</TableHead>
                <TableHead className="text-right">Estoque (un.)</TableHead>
                <TableHead className="text-right">Preço médio</TableHead>
                <TableHead className="text-right">Valor em estoque</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.category}>
                  <TableCell className="font-medium">{r.category}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatInt(r.count)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatInt(r.stock)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatBRL(r.avgPrice)}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatBRL(r.stockValue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            {rows.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatInt(totals.count)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatInt(totals.stock)}
                  </TableCell>
                  <TableCell />
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatBRL(totals.stockValue)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
