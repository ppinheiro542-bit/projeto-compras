import { APP_NAME } from '@/lib/version';
import { Clock } from './clock';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';

type Props = {
  user: { email: string; name?: string };
};

export function Header({ user }: Props) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="text-sm font-medium md:hidden">{APP_NAME}</div>
      <div className="ml-auto flex items-center gap-3">
        <Clock />
        <ThemeToggle />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
