import { createClient } from '@/lib/supabase/server';
import { ProductsCharts } from '@/components/products/products-charts';
import { ProductsTimelineChart } from '@/components/reports/products-timeline-chart';
import { CategorySummary } from '@/components/reports/category-summary';
import type { Product } from '@/lib/types/products';

export const metadata = { title: 'Relatórios · Projeto Compras' };

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  const products = (data ?? []) as Product[];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Relatórios</h1>
        <p className="text-sm text-muted-foreground">
          Representação visual e consolidação dos dados do catálogo.
        </p>
      </header>

      <ProductsTimelineChart products={products} />
      <ProductsCharts products={products} />
      <CategorySummary products={products} />
    </div>
  );
}
