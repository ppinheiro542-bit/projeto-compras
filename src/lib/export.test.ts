import { describe, expect, it } from 'vitest';
import { buildProductsCsv } from './export';
import type { Product } from './types/products';

const product = (over: Partial<Product> = {}): Product => ({
  id: '1',
  name: 'Notebook Dell',
  description: null,
  sku: 'INF-NB-001',
  price: 4299.9,
  stock_qty: 12,
  category: 'Informática',
  status: 'ativo',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...over,
});

describe('buildProductsCsv', () => {
  it('inclui o cabeçalho de colunas', () => {
    const csv = buildProductsCsv([]);
    const [header] = csv.replace('﻿', '').split('\r\n');
    expect(header).toBe('Nome;SKU;Categoria;Preço;Estoque;Status');
  });

  it('começa com BOM para compatibilidade com Excel', () => {
    expect(buildProductsCsv([]).startsWith('﻿')).toBe(true);
  });

  it('gera uma linha por produto', () => {
    const csv = buildProductsCsv([product(), product({ id: '2', sku: 'X-2' })]);
    const lines = csv.replace('﻿', '').split('\r\n');
    expect(lines).toHaveLength(3); // 1 cabeçalho + 2 produtos
  });

  it('escapa campos que contêm o separador ";"', () => {
    const csv = buildProductsCsv([product({ name: 'Item; especial' })]);
    expect(csv).toContain('"Item; especial"');
  });

  it('rotula o status em português', () => {
    const csv = buildProductsCsv([product({ status: 'descontinuado' })]);
    expect(csv).toContain('Descontinuado');
  });
});
