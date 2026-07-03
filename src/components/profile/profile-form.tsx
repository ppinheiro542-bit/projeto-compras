'use client';

import { useRef, useState, useTransition } from 'react';
import { UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateAvatar, updateProfile } from '@/lib/actions/profile';

type Props = {
  initial: { fullName: string; email: string; avatarUrl: string | null };
};

export function ProfileForm({ initial }: Props) {
  const [pending, start] = useTransition();
  const [uploading, startUpload] = useTransition();
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleSave(formData: FormData) {
    start(async () => {
      const result = await updateProfile(formData);
      if ('error' in result) {
        toast.error(result.error);
      } else {
        toast.success(result.message ?? 'Perfil atualizado.');
      }
    });
  }

  function handleAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    startUpload(async () => {
      const result = await updateAvatar(formData);
      if ('error' in result) {
        toast.error(result.error);
      } else {
        // força recarregar a imagem (cache-buster já vem no path com timestamp)
        toast.success(result.message ?? 'Foto atualizada.');
      }
    });
  }

  return (
    <div className="grid gap-6 md:grid-cols-[240px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Foto de perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border bg-muted">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound className="h-12 w-12 text-muted-foreground" />
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setAvatarUrl(URL.createObjectURL(file));
                handleAvatar(file);
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? 'Enviando...' : 'Alterar foto'}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            PNG, JPG ou WEBP · máx. 2 MB
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Dados da conta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome completo</Label>
              <Input
                id="fullName"
                name="fullName"
                defaultValue={initial.fullName}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={initial.email}
                required
              />
              <p className="text-xs text-muted-foreground">
                Alterar o e-mail exige confirmação pelo link enviado ao novo endereço.
              </p>
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
