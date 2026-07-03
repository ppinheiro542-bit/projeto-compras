'use client';

import { useRef, useState, useTransition } from 'react';
import { MessageCircle, Send, Trash2, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { addComment, deleteComment, deletePost } from '@/lib/actions/posts';
import { formatDateTime } from '@/lib/format';
import type { Post } from '@/lib/types/posts';

function Avatar({ url }: { url: string | null }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <UserRound className="h-5 w-5 text-muted-foreground" />
      )}
    </div>
  );
}

type Props = { post: Post; currentUserId: string | null };

export function PostCard({ post, currentUserId }: Props) {
  const [pending, start] = useTransition();
  const [showComments, setShowComments] = useState(false);
  const commentRef = useRef<HTMLFormElement>(null);
  const isOwner = currentUserId === post.user_id;

  function handleComment(formData: FormData) {
    start(async () => {
      const result = await addComment(post.id, formData);
      if ('error' in result) {
        toast.error(result.error);
        return;
      }
      commentRef.current?.reset();
    });
  }

  function handleDeletePost() {
    if (!confirm('Excluir esta publicação?')) return;
    start(async () => {
      const result = await deletePost(post.id);
      if ('error' in result) toast.error(result.error);
      else toast.success('Publicação excluída.');
    });
  }

  function handleDeleteComment(id: string) {
    start(async () => {
      const result = await deleteComment(id);
      if ('error' in result) toast.error(result.error);
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <Avatar url={post.author?.avatar_url ?? null} />
        <div className="flex-1">
          <div className="text-sm font-medium">
            {post.author?.full_name ?? 'Usuário'}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatDateTime(post.created_at)}
          </div>
        </div>
        {isOwner && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDeletePost}
            disabled={pending}
            aria-label="Excluir publicação"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="whitespace-pre-wrap text-sm">{post.caption}</p>
        {post.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.image_url}
            alt="Imagem da publicação"
            className="max-h-96 w-full rounded-md border object-contain"
          />
        )}
      </CardContent>

      <CardFooter className="flex-col items-stretch gap-3">
        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <MessageCircle className="h-4 w-4" />
          {post.comments.length}{' '}
          {post.comments.length === 1 ? 'depoimento' : 'depoimentos'}
        </button>

        {showComments && (
          <div className="space-y-3 border-t pt-3">
            {post.comments.map((c) => (
              <div key={c.id} className="flex items-start gap-2">
                <Avatar url={c.author?.avatar_url ?? null} />
                <div className="flex-1 rounded-md bg-muted px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">
                      {c.author?.full_name ?? 'Usuário'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDateTime(c.created_at)}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm">{c.body}</p>
                </div>
                {currentUserId === c.user_id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteComment(c.id)}
                    disabled={pending}
                    aria-label="Excluir depoimento"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}

            <form ref={commentRef} action={handleComment} className="flex gap-2">
              <Input
                name="body"
                placeholder="Escreva um depoimento..."
                required
                maxLength={500}
              />
              <Button type="submit" size="icon" disabled={pending} aria-label="Enviar">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
