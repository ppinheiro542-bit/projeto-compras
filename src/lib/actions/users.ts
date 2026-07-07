'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { isAdmin, USER_ROLES } from '@/lib/types/profiles';

export type UserActionResult = { success: true } | { error: string };

const roleSchema = z.enum(USER_ROLES);

async function requireAdminActor(): Promise<
  { ok: true; actorId: string } | { ok: false; error: string }
> {
  const profile = await getCurrentProfile();
  if (!profile || !isAdmin(profile.role)) {
    return { ok: false, error: 'Apenas administradores podem gerenciar usuários.' };
  }
  return { ok: true, actorId: profile.id };
}

/** Altera o papel de um usuário. */
export async function updateUserRole(
  userId: string,
  role: string,
): Promise<UserActionResult> {
  const actor = await requireAdminActor();
  if (!actor.ok) return { error: actor.error };

  const parsed = roleSchema.safeParse(role);
  if (!parsed.success) return { error: 'Papel inválido.' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ role: parsed.data })
    .eq('id', userId);
  if (error) return { error: error.message };

  revalidatePath('/dashboard/admin/usuarios');
  return { success: true };
}

/** Ativa ou desativa o acesso de um usuário. */
export async function setUserActive(
  userId: string,
  isActive: boolean,
): Promise<UserActionResult> {
  const actor = await requireAdminActor();
  if (!actor.ok) return { error: actor.error };

  // Impede o admin de desativar a própria conta (evita se trancar para fora).
  if (userId === actor.actorId && !isActive) {
    return { error: 'Você não pode desativar a própria conta.' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', userId);
  if (error) return { error: error.message };

  revalidatePath('/dashboard/admin/usuarios');
  return { success: true };
}
