'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function acceptCurrentTerms() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão expirada. Faça login novamente.' };

  const { data: terms } = await supabase
    .from('terms_versions')
    .select('id')
    .eq('is_active', true)
    .single();
  if (!terms) return { error: 'Termos indisponíveis no momento.' };

  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
  const ua = h.get('user-agent');

  const { error } = await supabase.from('user_consents').insert({
    user_id: user.id,
    terms_version_id: terms.id,
    ip_address: ip,
    user_agent: ua,
  });

  if (error && !error.message.toLowerCase().includes('duplicate')) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}
