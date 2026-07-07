import { formatBRL } from '@/lib/format';
import { STATUS_LABELS, type Product } from '@/lib/types/products';

/** Colunas exportadas (ordem e rótulos usados em CSV e PDF). */
const COLUMNS: { header: string; value: (p: Product) => string }[] = [
  { header: 'Nome', value: (p) => p.name },
  { header: 'SKU', value: (p) => p.sku },
  { header: 'Categoria', value: (p) => p.category },
  { header: 'Preço', value: (p) => formatBRL(p.price) },
  { header: 'Estoque', value: (p) => String(p.stock_qty) },
  { header: 'Status', value: (p) => STATUS_LABELS[p.status] },
];

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function timestamp() {
  return new Date().toISOString().slice(0, 10);
}

/** Escapa um campo para CSV (RFC 4180). */
function csvCell(value: string): string {
  if (/[",\n;]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Monta o conteúdo CSV (separador `;`, compatível com Excel pt-BR) como string.
 * Função pura — sem efeitos colaterais — para facilitar testes automatizados.
 * Inclui BOM (﻿) no início para garantir a acentuação correta no Excel.
 */
export function buildProductsCsv(products: Product[]): string {
  const header = COLUMNS.map((c) => csvCell(c.header)).join(';');
  const rows = products.map((p) => COLUMNS.map((c) => csvCell(c.value(p))).join(';'));
  return '﻿' + [header, ...rows].join('\r\n');
}

/** Exporta a lista de produtos para CSV e dispara o download no navegador. */
export function exportProductsCsv(products: Product[]) {
  triggerDownload(
    new Blob([buildProductsCsv(products)], { type: 'text/csv;charset=utf-8;' }),
    `produtos-${timestamp()}.csv`,
  );
}

/** Exporta a lista de produtos para JSON (intercâmbio de dados / integrações). */
export function exportProductsJson(products: Product[]) {
  const payload = {
    generated_at: new Date().toISOString(),
    count: products.length,
    data: products,
  };
  triggerDownload(
    new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8;' }),
    `produtos-${timestamp()}.json`,
  );
}

/** Exporta a lista de produtos para PDF (import dinâmico do jsPDF). */
export async function exportProductsPdf(products: Product[]) {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF({ orientation: 'landscape' });
  const generatedAt = new Date().toLocaleString('pt-BR');

  doc.setFontSize(14);
  doc.text('Catálogo de Produtos — Projeto Compras', 14, 16);
  doc.setFontSize(9);
  doc.text(`Gerado em ${generatedAt} · ${products.length} itens`, 14, 22);

  const totalStockValue = products.reduce(
    (sum, p) => sum + Number(p.price) * Number(p.stock_qty),
    0,
  );

  autoTable(doc, {
    startY: 27,
    head: [COLUMNS.map((c) => c.header)],
    body: products.map((p) => COLUMNS.map((c) => c.value(p))),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [30, 41, 59] },
    foot: [['', '', '', 'Valor total em estoque:', '', formatBRL(totalStockValue)]],
    footStyles: { fillColor: [241, 245, 249], textColor: 20, fontStyle: 'bold' },
  });

  doc.save(`produtos-${timestamp()}.pdf`);
}
