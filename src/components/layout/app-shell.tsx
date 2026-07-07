import type { Notification } from '@/lib/types/notifications';
import type { UserRole } from '@/lib/types/profiles';
import { APP_VERSION } from '@/lib/version';
import { Header } from './header';
import { Sidebar } from './sidebar';

type Props = {
  user: { email: string; name?: string; role: UserRole };
  notifications: Notification[];
  children: React.ReactNode;
};

export function AppShell({ user, notifications, children }: Props) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar role={user.role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={user} notifications={notifications} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
        <footer className="flex h-8 items-center justify-end border-t px-4 text-xs text-muted-foreground">
          <span className="font-mono">{APP_VERSION}</span>
        </footer>
      </div>
    </div>
  );
}
