export const PRODUCT_STATUSES = ['ativo', 'inativo', 'descontinuado'] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export type Product = {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  price: number;
  stock_qty: number;
  category: string;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
};

export const STATUS_LABELS: Record<ProductStatus, string> = {
  ativo: 'Ativo',
  inativo: 'Inativo',
  descontinuado: 'Descontinuado',
};
