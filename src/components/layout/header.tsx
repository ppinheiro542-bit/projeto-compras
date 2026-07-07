import type { Notification } from '@/lib/types/notifications';
import type { UserRole } from '@/lib/types/profiles';
import { APP_NAME } from '@/lib/version';
import { Clock } from './clock';
import { NotificationsBell } from './notifications-bell';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';

type Props = {
  user: { email: string; name?: string; role: UserRole };
  notifications: Notification[];
};

export function Header({ user, notifications }: Props) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="text-sm font-medium md:hidden">{APP_NAME}</div>
      <div className="ml-auto flex items-center gap-3">
        <Clock />
        <NotificationsBell initial={notifications} />
        <ThemeToggle />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
