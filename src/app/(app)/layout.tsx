import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/layout/app-shell';
import { ConsentGate } from '@/components/consent/consent-gate';
import { AccountDisabled } from '@/components/layout/account-disabled';
import type { UserRole } from '@/lib/types/profiles';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, is_active')
    .eq('id', user.id)
    .maybeSingle();

  // Conta desativada por um administrador: bloqueia o acesso ao app.
  if (profile && profile.is_active === false) {
    return <AccountDisabled email={user.email ?? ''} />;
  }

  const { data: activeTerms } = await supabase
    .from('terms_versions')
    .select('id, version, title, content')
    .eq('is_active', true)
    .maybeSingle();

  let needsConsent = false;
  if (activeTerms) {
    const { data: consent } = await supabase
      .from('user_consents')
      .select('id')
      .eq('user_id', user.id)
      .eq('terms_version_id', activeTerms.id)
      .maybeSingle();
    needsConsent = !consent;
  }

  const { data: notifications } = await supabase
    .from('notifications')
    .select('id, user_id, type, title, body, link, is_read, created_at')
    .order('created_at', { ascending: false })
    .limit(15);

  return (
    <AppShell
      user={{
        email: user.email ?? '',
        name:
          (profile?.full_name as string | undefined) ??
          (user.user_metadata?.full_name as string | undefined) ??
          undefined,
        role: (profile?.role as UserRole | undefined) ?? 'usuario',
      }}
      notifications={notifications ?? []}
    >
      {children}
      {activeTerms && (
        <ConsentGate
          open={needsConsent}
          terms={{
            version: activeTerms.version,
            title: activeTerms.title,
            content: activeTerms.content,
          }}
        />
      )}
    </AppShell>
  );
}
