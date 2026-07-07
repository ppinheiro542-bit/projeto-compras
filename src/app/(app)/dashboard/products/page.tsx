import { createClient } from '@/lib/supabase/server';
import { ProductsTable } from '@/components/products/products-table';
import { ProductsCharts } from '@/components/products/products-charts';
import { getCurrentProfile } from '@/lib/auth';
import { canManage } from '@/lib/types/profiles';
import type { Product } from '@/lib/types/products';

export const metadata = { title: 'Produtos · Projeto Compras' };

export default async function ProductsPage() {
  const supabase = await createClient();
  const [{ data, error }, profile] = await Promise.all([
    supabase.from('products').select('*').order('created_at', { ascending: false }),
    getCurrentProfile(),
  ]);

  if (error) throw new Error(error.message);

  const products = (data ?? []) as Product[];
  const categories = Array.from(new Set(products.map((p) => p.category))).sort();
  const userCanManage = canManage(profile?.role);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Produtos</h1>
        <p className="text-sm text-muted-foreground">
          Catálogo de produtos e materiais. Toda alteração é registrada em{' '}
          <code className="rounded bg-muted px-1">audit_logs</code>.
        </p>
      </header>
      <ProductsCharts products={products} />
      <ProductsTable
        products={products}
        categories={categories}
        canManage={userCanManage}
      />
    </div>
  );
}
