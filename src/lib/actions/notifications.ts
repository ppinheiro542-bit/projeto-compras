'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export type NotificationResult = { success: true } | { error: string };

/** Marca uma notificação como lida. */
export async function markNotificationRead(id: string): Promise<NotificationResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão expirada.' };

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .eq('user_id', user.id);
  if (error) return { error: error.message };

  revalidatePath('/', 'layout');
  return { success: true };
}

/** Marca todas as notificações do usuário como lidas. */
export async function markAllNotificationsRead(): Promise<NotificationResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão expirada.' };

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);
  if (error) return { error: error.message };

  revalidatePath('/', 'layout');
  return { success: true };
}
