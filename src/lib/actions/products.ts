'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { PRODUCT_STATUSES } from '@/lib/types/products';

const productSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter ao menos 2 caracteres'),
  description: z
    .string()
    .trim()
    .max(500, 'Descrição muito longa')
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  sku: z
    .string()
    .trim()
    .min(3, 'SKU deve ter ao menos 3 caracteres')
    .max(50, 'SKU muito longo')
    .regex(/^[A-Z0-9-]+$/i, 'SKU deve conter apenas letras, números e hífens'),
  price: z.coerce.number().min(0, 'Preço não pode ser negativo'),
  stock_qty: z.coerce.number().int('Estoque deve ser inteiro').min(0, 'Estoque não pode ser negativo'),
  category: z.string().trim().min(2, 'Categoria obrigatória'),
  status: z.enum(PRODUCT_STATUSES),
});

export type ProductActionResult =
  | { success: true; error?: never; fieldErrors?: never }
  | {
      success?: false;
      error: string;
      fieldErrors?: Partial<Record<keyof z.infer<typeof productSchema>, string>>;
    };

function parseForm(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    sku: formData.get('sku'),
    price: formData.get('price'),
    stock_qty: formData.get('stock_qty'),
    category: formData.get('category'),
    status: formData.get('status'),
  });
}

function formatFieldErrors(error: z.ZodError): ProductActionResult {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0]?.toString();
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return {
    error: error.issues[0]?.message ?? 'Dados inválidos.',
    fieldErrors: fieldErrors as ProductActionResult extends { fieldErrors?: infer F } ? F : never,
  };
}

export async function createProduct(formData: FormData): Promise<ProductActionResult> {
  const parsed = parseForm(formData);
  if (!parsed.success) return formatFieldErrors(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.from('products').insert(parsed.data);

  if (error) {
    if (error.code === '23505') return { error: 'SKU já cadastrado.' };
    return { error: error.message };
  }

  revalidatePath('/dashboard/products');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateProduct(
  id: string,
  formData: FormData,
): Promise<ProductActionResult> {
  const parsed = parseForm(formData);
  if (!parsed.success) return formatFieldErrors(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.from('products').update(parsed.data).eq('id', id);

  if (error) {
    if (error.code === '23505') return { error: 'SKU já cadastrado.' };
    return { error: error.message };
  }

  revalidatePath('/dashboard/products');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteProduct(id: string): Promise<ProductActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/dashboard/products');
  revalidatePath('/dashboard');
  return { success: true };
}
