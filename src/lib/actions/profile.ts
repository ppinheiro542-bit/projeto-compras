'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const profileSchema = z.object({
  fullName: z.string().trim().min(2, 'Informe seu nome completo'),
  email: z.string().email('E-mail inválido'),
});

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_AVATAR_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export type ProfileActionResult =
  | { success: true; message?: string }
  | { error: string };

/**
 * Atualiza nome e e-mail do perfil.
 * - full_name: gravado em profiles e em user_metadata (usado no cabeçalho).
 * - email: alterado via Supabase Auth; dispara e-mail de confirmação.
 */
export async function updateProfile(formData: FormData): Promise<ProfileActionResult> {
  const parsed = profileSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão expirada. Faça login novamente.' };

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ full_name: parsed.data.fullName })
    .eq('id', user.id);
  if (profileError) return { error: profileError.message };

  const emailChanged = parsed.data.email !== user.email;
  const { error: authError } = await supabase.auth.updateUser({
    data: { full_name: parsed.data.fullName },
    ...(emailChanged ? { email: parsed.data.email } : {}),
  });
  if (authError) return { error: authError.message };

  revalidatePath('/', 'layout');
  return {
    success: true,
    message: emailChanged
      ? 'Perfil salvo. Confirme o novo e-mail pelo link enviado à sua caixa de entrada.'
      : 'Perfil atualizado.',
  };
}

/** Faz upload do avatar para o bucket "avatars" e grava a URL pública no perfil. */
export async function updateAvatar(formData: FormData): Promise<ProfileActionResult> {
  const file = formData.get('avatar');
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Selecione uma imagem.' };
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return { error: 'Imagem muito grande (máximo 2 MB).' };
  }
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    return { error: 'Formato inválido. Use PNG, JPG ou WEBP.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão expirada. Faça login novamente.' };

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png';
  const path = `${user.id}/avatar-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type });
  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(path);

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id);
  if (profileError) return { error: profileError.message };

  await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });

  revalidatePath('/', 'layout');
  return { success: true, message: 'Foto de perfil atualizada.' };
}
