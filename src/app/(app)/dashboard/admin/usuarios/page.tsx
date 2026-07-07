import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { UsersTable } from '@/components/admin/users-table';
import type { Profile } from '@/lib/types/profiles';

export const metadata = { title: 'Usuários · Projeto Compras' };

export default async function UsersPage() {
  const supabase = await createClient();
  const [{ data, error }, current] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url, role, is_active, created_at, updated_at')
      .order('created_at', { ascending: true }),
    getCurrentProfile(),
  ]);

  if (error) throw new Error(error.message);
  const users = (data ?? []) as Profile[];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Usuários</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie papéis e o acesso dos usuários cadastrados. Alterações são registradas em
          auditoria.
        </p>
      </header>
      <UsersTable users={users} currentUserId={current?.id ?? ''} />
    </div>
  );
}
