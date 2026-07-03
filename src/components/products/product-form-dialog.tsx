'use client';

import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createProduct, updateProduct } from '@/lib/actions/products';
import {
  PRODUCT_STATUSES,
  STATUS_LABELS,
  type Product,
  type ProductStatus,
} from '@/lib/types/products';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
  categories?: string[];
};

export function ProductFormDialog({ open, onOpenChange, product, categories = [] }: Props) {
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? 'ativo');

  useEffect(() => {
    if (open) setStatus(product?.status ?? 'ativo');
  }, [open, product]);

  function handleSubmit(formData: FormData) {
    start(async () => {
      const result = product
        ? await updateProduct(product.id, formData)
        : await createProduct(formData);

      if (result.success) {
        toast.success(product ? 'Produto atualizado.' : 'Produto criado.');
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  const isEdit = !!product;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar produto' : 'Novo produto'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Altere os campos abaixo. As mudanças serão registradas em audit_logs.'
              : 'Preencha os dados para cadastrar um novo produto.'}
          </DialogDescription>
        </DialogHeader>

        <form
          action={handleSubmit}
          className="grid gap-4 md:grid-cols-2"
          key={product?.id ?? 'new'}
        >
          <input type="hidden" name="status" value={status} />

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" defaultValue={product?.name} required />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={product?.description ?? ''}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              name="sku"
              defaultValue={product?.sku}
              placeholder="INF-NB-DELL-001"
              required
              className="font-mono uppercase"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              name="category"
              defaultValue={product?.category}
              list="categories-suggestions"
              required
            />
            <datalist id="categories-suggestions">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Preço (R$)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product?.price ?? ''}
              required
              className="font-mono tabular-nums"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock_qty">Estoque</Label>
            <Input
              id="stock_qty"
              name="stock_qty"
              type="number"
              step="1"
              min="0"
              defaultValue={product?.stock_qty ?? ''}
              required
              className="font-mono tabular-nums"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as ProductStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="md:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar produto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
