import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PRODUCT_STATUSES } from '@/lib/types/products';

/**
 * GET /api/products — intercâmbio de dados (JSON).
 * Autenticado via sessão Supabase (mesmo cookie do app). Retorna o catálogo
 * em JSON, com filtros opcionais por query string.
 *
 * Query params: ?category=Informática  ?status=ativo  ?q=notebook  ?limit=50
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const q = searchParams.get('q');
  const limit = Math.min(Number(searchParams.get('limit') ?? 100) || 100, 500);

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (category) query = query.eq('category', category);
  if (status && (PRODUCT_STATUSES as readonly string[]).includes(status)) {
    query = query.eq('status', status);
  }
  if (q) query = query.ilike('name', `%${q}%`);

  const { data, count, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    count: count ?? data?.length ?? 0,
    data: data ?? [],
    generated_at: new Date().toISOString(),
  });
}
