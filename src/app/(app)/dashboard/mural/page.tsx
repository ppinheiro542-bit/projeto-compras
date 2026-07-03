import { createClient } from '@/lib/supabase/server';
import { CreatePost } from '@/components/posts/create-post';
import { PostCard } from '@/components/posts/post-card';
import { PostSearch } from '@/components/posts/post-search';
import type { Post } from '@/lib/types/posts';

export const metadata = { title: 'Mural · Projeto Compras' };

type SearchParams = { q?: string };

export default async function MuralPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const query = supabase
    .from('posts')
    .select(
      `id, user_id, caption, image_url, created_at,
       author:profiles(full_name, avatar_url),
       comments(id, post_id, user_id, body, created_at,
                author:profiles(full_name, avatar_url))`,
    )
    .order('created_at', { ascending: false })
    .order('created_at', { ascending: true, referencedTable: 'comments' });

  const search = searchParams.q?.trim();
  if (search) query.ilike('caption', `%${search}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const posts = (data ?? []) as unknown as Post[];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Mural</h1>
        <p className="text-sm text-muted-foreground">
          Publicações da equipe — compartilhe imagens, legendas e depoimentos.
        </p>
      </header>

      <CreatePost />
      <PostSearch defaultValue={search} />

      {posts.length === 0 ? (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          {search
            ? `Nenhuma publicação encontrada para “${search}”.`
            : 'Ainda não há publicações. Seja o primeiro a publicar!'}
        </p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={user?.id ?? null} />
          ))}
        </div>
      )}
    </div>
  );
}
