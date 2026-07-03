'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { deleteProduct } from '@/lib/actions/products';
import type { Product } from '@/lib/types/products';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
};

export function DeleteProductDialog({ open, onOpenChange, product }: Props) {
  const [pending, start] = useTransition();

  function handleConfirm(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (!product) return;
    start(async () => {
      const result = await deleteProduct(product.id);
      if (result.success) {
        toast.success('Produto excluído.');
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
          <AlertDialogDescription>
            {product ? (
              <>
                Esta ação não pode ser desfeita. O produto{' '}
                <span className="font-medium text-foreground">{product.name}</span> será removido
                permanentemente. A operação será registrada em <code>audit_logs</code>.
              </>
            ) : (
              'Selecione um produto.'
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={pending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {pending ? 'Excluindo...' : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
