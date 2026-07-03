'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

const captionSchema = z.string().trim().min(1, 'Escreva uma legenda').max(1000, 'Legenda muito longa');
const commentSchema = z.string().trim().min(1, 'Escreva um comentário').max(500, 'Comentário muito longo');

export type PostActionResult = { success: true } | { error: string };

/** Cria uma publicação com legenda e imagem opcional. */
export async function createPost(formData: FormData): Promise<PostActionResult> {
  const parsedCaption = captionSchema.safeParse(formData.get('caption'));
  if (!parsedCaption.success) return { error: parsedCaption.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão expirada. Faça login novamente.' };

  let imageUrl: string | null = null;
  const file = formData.get('image');
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_IMAGE_BYTES) return { error: 'Imagem muito grande (máximo 5 MB).' };
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return { error: 'Formato inválido. Use PNG, JPG, WEBP ou GIF.' };
    }
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png';
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(path, file, { contentType: file.type });
    if (uploadError) return { error: uploadError.message };
    imageUrl = supabase.storage.from('post-images').getPublicUrl(path).data.publicUrl;
  }

  const { error } = await supabase
    .from('posts')
    .insert({ user_id: user.id, caption: parsedCaption.data, image_url: imageUrl });
  if (error) return { error: error.message };

  revalidatePath('/dashboard/mural');
  return { success: true };
}

/** Remove uma publicação (apenas o autor, garantido por RLS). */
export async function deletePost(id: string): Promise<PostActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/dashboard/mural');
  return { success: true };
}

/** Adiciona um depoimento/comentário a uma publicação. */
export async function addComment(postId: string, formData: FormData): Promise<PostActionResult> {
  const parsed = commentSchema.safeParse(formData.get('body'));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão expirada. Faça login novamente.' };

  const { error } = await supabase
    .from('comments')
    .insert({ post_id: postId, user_id: user.id, body: parsed.data });
  if (error) return { error: error.message };

  revalidatePath('/dashboard/mural');
  return { success: true };
}

/** Remove um comentário (apenas o autor, garantido por RLS). */
export async function deleteComment(id: string): Promise<PostActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('comments').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/dashboard/mural');
  return { success: true };
}
