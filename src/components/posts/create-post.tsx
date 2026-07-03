'use client';

import { useRef, useState, useTransition } from 'react';
import { ImagePlus, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { createPost } from '@/lib/actions/posts';

export function CreatePost() {
  const [pending, start] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleSubmit(formData: FormData) {
    start(async () => {
      const result = await createPost(formData);
      if ('error' in result) {
        toast.error(result.error);
        return;
      }
      toast.success('Publicação criada.');
      formRef.current?.reset();
      setPreview(null);
    });
  }

  function clearImage() {
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form ref={formRef} action={handleSubmit} className="space-y-3">
          <Textarea
            name="caption"
            placeholder="No que você está pensando?"
            rows={3}
            required
            maxLength={1000}
          />

          {preview && (
            <div className="relative w-fit">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Prévia"
                className="max-h-48 rounded-md border object-contain"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute right-1 top-1 rounded-full bg-background/80 p-1 text-foreground shadow"
                aria-label="Remover imagem"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            name="image"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setPreview(file ? URL.createObjectURL(file) : null);
            }}
          />

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
            >
              <ImagePlus className="mr-2 h-4 w-4" />
              Imagem
            </Button>
            <Button type="submit" disabled={pending}>
              <Send className="mr-2 h-4 w-4" />
              {pending ? 'Publicando...' : 'Publicar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
