import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/layout/app-shell';
import { ConsentGate } from '@/components/consent/consent-gate';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

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

  return (
    <AppShell
      user={{
        email: user.email ?? '',
        name: (user.user_metadata?.full_name as string | undefined) ?? undefined,
      }}
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
