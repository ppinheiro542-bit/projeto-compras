'use client';

import { useMemo, useState } from 'react';
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowUpDown,
  FileSpreadsheet,
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { exportProductsCsv, exportProductsPdf } from '@/lib/export';
import { formatBRL, formatInt } from '@/lib/format';
import {
  PRODUCT_STATUSES,
  STATUS_LABELS,
  type Product,
} from '@/lib/types/products';
import { DeleteProductDialog } from './delete-product-dialog';
import { ProductFormDialog } from './product-form-dialog';
import { StatusBadge } from './status-badge';

const ALL = '__all__';

type Props = {
  products: Product[];
  categories: string[];
};

export function ProductsTable({ products, categories }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Produto',
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="font-mono text-xs text-muted-foreground">{row.original.sku}</div>
          </div>
        ),
        filterFn: (row, _id, value) =>
          row.original.name.toLowerCase().includes(String(value).toLowerCase()),
      },
      {
        accessorKey: 'category',
        header: 'Categoria',
        cell: ({ row }) => <span className="text-sm">{row.original.category}</span>,
        filterFn: (row, id, value) => row.getValue(id) === value,
      },
      {
        accessorKey: 'price',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Preço
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-mono tabular-nums">{formatBRL(row.original.price)}</span>
        ),
      },
      {
        accessorKey: 'stock_qty',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Estoque
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => {
          const qty = row.original.stock_qty;
          const low = qty < 5;
          return (
            <span
              className={
                low
                  ? 'font-mono tabular-nums font-medium text-destructive'
                  : 'font-mono tabular-nums'
              }
            >
              {formatInt(qty)}
            </span>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
        filterFn: (row, id, value) => row.getValue(id) === value,
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Ações">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditing(row.original)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeleting(row.original)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: products,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const nameFilter = (table.getColumn('name')?.getFilterValue() as string) ?? '';
  const categoryFilter = (table.getColumn('category')?.getFilterValue() as string) ?? ALL;
  const statusFilter = (table.getColumn('status')?.getFilterValue() as string) ?? ALL;

  // Totais/médias calculados sobre as linhas filtradas (respeitam os filtros ativos).
  const filteredProducts = table.getFilteredRowModel().rows.map((r) => r.original);
  const totals = useMemo(() => {
    const count = filteredProducts.length;
    const totalStock = filteredProducts.reduce((s, p) => s + p.stock_qty, 0);
    const stockValue = filteredProducts.reduce(
      (s, p) => s + Number(p.price) * Number(p.stock_qty),
      0,
    );
    const avgPrice =
      count > 0 ? filteredProducts.reduce((s, p) => s + Number(p.price), 0) / count : 0;
    return { count, totalStock, stockValue, avgPrice };
  }, [filteredProducts]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <Input
            placeholder="Filtrar por nome..."
            value={nameFilter}
            onChange={(e) => table.getColumn('name')?.setFilterValue(e.target.value)}
          />
        </div>

        <Select
          value={categoryFilter}
          onValueChange={(v) =>
            table.getColumn('category')?.setFilterValue(v === ALL ? undefined : v)
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas categorias</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(v) =>
            table.getColumn('status')?.setFilterValue(v === ALL ? undefined : v)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos status</SelectItem>
            {PRODUCT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => exportProductsCsv(filteredProducts)}
            disabled={filteredProducts.length === 0}
            title="Exportar para CSV (Excel)"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => exportProductsPdf(filteredProducts)}
            disabled={filteredProducts.length === 0}
            title="Exportar para PDF"
          >
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo produto
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  Nenhum produto encontrado.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
          {totals.count > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell className="text-xs text-muted-foreground">
                  {formatInt(totals.count)}{' '}
                  {totals.count === 1 ? 'produto' : 'produtos'}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  Preço médio: {formatBRL(totals.avgPrice)}
                </TableCell>
                <TableCell className="text-right text-xs text-muted-foreground">
                  Valor em estoque:
                </TableCell>
                <TableCell colSpan={3} className="font-mono tabular-nums">
                  {formatBRL(totals.stockValue)}{' '}
                  <span className="text-xs font-normal text-muted-foreground">
                    ({formatInt(totals.totalStock)} un.)
                  </span>
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Página {table.getState().pagination.pageIndex + 1} de{' '}
          {Math.max(1, table.getPageCount())} ·{' '}
          {table.getFilteredRowModel().rows.length} de {products.length} produtos
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Próxima
          </Button>
        </div>
      </div>

      <ProductFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        categories={categories}
      />
      <ProductFormDialog
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        product={editing ?? undefined}
        categories={categories}
      />
      <DeleteProductDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        product={deleting}
      />
    </div>
  );
}
