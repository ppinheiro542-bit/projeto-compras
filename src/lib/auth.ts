import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdmin as roleIsAdmin, type Profile } from '@/lib/types/profiles';

/**
 * Retorna o perfil (com papel) do usuário autenticado, ou null se não houver
 * sessão. Usado por Server Components e Server Actions para autorização.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, role, is_active, created_at, updated_at')
    .eq('id', user.id)
    .maybeSingle();

  return (data as Profile | null) ?? null;
}

/** Garante que o usuário é admin ativo; redireciona caso contrário. */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login');
  if (!profile.is_active || !roleIsAdmin(profile.role)) redirect('/dashboard');
  return profile;
}
