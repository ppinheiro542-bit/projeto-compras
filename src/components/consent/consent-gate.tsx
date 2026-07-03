'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { acceptCurrentTerms } from '@/lib/actions/consent';

type Props = {
  open: boolean;
  terms: { version: string; title: string; content: string };
};

export function ConsentGate({ open, terms }: Props) {
  const [accepted, setAccepted] = useState(false);
  const [pending, start] = useTransition();

  function handleAccept() {
    start(async () => {
      const result = await acceptCurrentTerms();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Termos aceitos.');
    });
  }

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{terms.title}</DialogTitle>
          <DialogDescription>
            Versão {terms.version} — Leitura e aceite obrigatórios (LGPD).
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-72 rounded-md border p-4 text-sm leading-relaxed whitespace-pre-wrap">
          {terms.content}
        </ScrollArea>

        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={accepted}
            onCheckedChange={(v) => setAccepted(v === true)}
          />
          Li e concordo com os Termos de Uso e a Política de Privacidade.
        </label>

        <DialogFooter>
          <Button onClick={handleAccept} disabled={!accepted || pending}>
            {pending ? 'Registrando...' : 'Aceitar e continuar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
