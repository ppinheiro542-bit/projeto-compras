import { Badge } from '@/components/ui/badge';
import { STATUS_LABELS, type ProductStatus } from '@/lib/types/products';

const variants: Record<ProductStatus, 'success' | 'muted' | 'destructive'> = {
  ativo: 'success',
  inativo: 'muted',
  descontinuado: 'destructive',
};

export function StatusBadge({ status }: { status: ProductStatus }) {
  return <Badge variant={variants[status]}>{STATUS_LABELS[status]}</Badge>;
}
