'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  LayoutDashboard,
  MessagesSquare,
  Package,
  ScrollText,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { isAdmin, type UserRole } from '@/lib/types/profiles';
import { Brand } from './brand';

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact: boolean;
};

const mainItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/products', label: 'Produtos', icon: Package, exact: false },
  { href: '/dashboard/relatorios', label: 'Relatórios', icon: BarChart3, exact: false },
  { href: '/dashboard/mural', label: 'Mural', icon: MessagesSquare, exact: false },
];

const adminItems: NavItem[] = [
  { href: '/dashboard/admin/usuarios', label: 'Usuários', icon: Users, exact: false },
  { href: '/dashboard/admin/auditoria', label: 'Auditoria', icon: ScrollText, exact: false },
];

export function Sidebar({ role = 'usuario' }: { role?: UserRole }) {
  const pathname = usePathname();

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
          active
            ? 'bg-secondary text-foreground'
            : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
        )}
      >
        <Icon className="h-4 w-4" />
        {item.label}
      </Link>
    );
  };

  return (
    <aside className="hidden w-60 flex-col border-r bg-background md:flex">
      <div className="flex h-14 items-center border-b px-4">
        <Brand />
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {mainItems.map(renderItem)}

        {isAdmin(role) && (
          <>
            <div className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Administração
            </div>
            {adminItems.map(renderItem)}
          </>
        )}
      </nav>
    </aside>
  );
}
