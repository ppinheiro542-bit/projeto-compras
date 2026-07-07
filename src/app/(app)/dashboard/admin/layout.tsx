import { requireAdmin } from '@/lib/auth';

/** Protege todas as rotas /dashboard/admin/*: apenas administradores ativos. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <>{children}</>;
}
