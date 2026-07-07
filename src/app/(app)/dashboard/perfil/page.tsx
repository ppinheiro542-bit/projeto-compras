import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProfileForm } from '@/components/profile/profile-form';
import { Badge } from '@/components/ui/badge';
import { ROLE_LABELS, type UserRole } from '@/lib/types/profiles';

export const metadata = { title: 'Meu Perfil · Projeto Compras' };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, avatar_url, role')
    .eq('id', user.id)
    .maybeSingle();

  const role = (profile?.role as UserRole | undefined) ?? 'usuario';

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Meu Perfil</h1>
          <p className="text-sm text-muted-foreground">
            Atualize seu nome, e-mail e foto de perfil.
          </p>
        </div>
        <Badge variant="secondary" className="mt-1">
          {ROLE_LABELS[role]}
        </Badge>
      </header>

      <ProfileForm
        initial={{
          fullName: profile?.full_name ?? '',
          email: profile?.email ?? user.email ?? '',
          avatarUrl: profile?.avatar_url ?? null,
        }}
      />
    </div>
  );
}
