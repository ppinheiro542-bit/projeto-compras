'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Bell, CheckCheck, MessageCircle, PackageX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { markAllNotificationsRead, markNotificationRead } from '@/lib/actions/notifications';
import { formatDateTime } from '@/lib/format';
import type { Notification, NotificationType } from '@/lib/types/notifications';

const ICONS: Record<NotificationType, typeof Bell> = {
  comment: MessageCircle,
  low_stock: PackageX,
  system: Bell,
};

export function NotificationsBell({ initial }: { initial: Notification[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [, start] = useTransition();

  const unread = items.filter((n) => !n.is_read).length;

  function openItem(n: Notification) {
    if (!n.is_read) {
      setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, is_read: true } : i)));
      start(async () => {
        await markNotificationRead(n.id);
      });
    }
    if (n.link) router.push(n.link);
  }

  function markAll() {
    setItems((prev) => prev.map((i) => ({ ...i, is_read: true })));
    start(async () => {
      await markAllNotificationsRead();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notificações" className="relative">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-medium">Notificações</span>
          {unread > 0 && (
            <button
              onClick={markAll}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Marcar todas
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">
            Nenhuma notificação.
          </p>
        ) : (
          <ScrollArea className="max-h-80">
            <ul className="divide-y">
              {items.map((n) => {
                const Icon = ICONS[n.type];
                return (
                  <li key={n.id}>
                    <button
                      onClick={() => openItem(n)}
                      className={`flex w-full items-start gap-2 px-3 py-2.5 text-left hover:bg-muted/50 ${
                        n.is_read ? '' : 'bg-primary/5'
                      }`}
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">{n.title}</span>
                          {!n.is_read && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          )}
                        </div>
                        {n.body && (
                          <p className="text-xs text-muted-foreground">{n.body}</p>
                        )}
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {formatDateTime(n.created_at)}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
