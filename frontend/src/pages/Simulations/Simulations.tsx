import { Tooltip } from '@radix-ui/react-tooltip';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Simulation } from '@/types/index';

interface SimulationProps {
  simulations: Simulation[];
}

const statusColors: Record<string, string> = {
  running: 'bg-blue-100 text-blue-800',
  complete: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  'not-started': 'bg-gray-100 text-gray-800',
};

const typeColors: Record<Simulation['simulationType'], string> = {
  production: 'border-green-600 text-green-700',
  master: 'border-blue-600 text-blue-700',
  experimental: 'border-amber-600 text-amber-700',
};

const formatDate = (d?: string) => {
  if (!d) return '—';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '—';
  return format(dt, 'yyyy-MM-dd');
};

// Escape CSV fields (wrap with quotes, double quotes inside)
const csvEscape = (v: unknown): string => {
  if (v === undefined || v === null) return '';
  const s = String(v);
  if (/["\n,]/.test(s)) return '"' + s.replaceAll('"', '""') + '"';
  return s;
};

const Simulations = ({ simulations }: SimulationProps) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'uploadDate', desc: true },
    { id: 'name', desc: false },
  ]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const navigate = useNavigate();

  const columns = useMemo<ColumnDef<Simulation>[]>(
    () => [
      // Name (link)
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <Link
            to={`/simulations/${row.original.id}`}
            className="text-blue-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {row.original.name}
          </Link>
        ),
        size: 260,
      },
      // Type (badge)
      {
        accessorKey: 'simulationType',
        header: 'Type',
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn('capitalize', typeColors[row.original.simulationType])}
          >
            {row.original.simulationType}
          </Badge>
        ),
        size: 130,
      },
      // Status (badge)
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge
            className={cn(
              'capitalize',
              statusColors[row.original.status] || 'bg-gray-100 text-gray-800',
            )}
          >
            {row.original.status}
          </Badge>
        ),
        size: 130,
      },
      // Version / Tag
      { accessorKey: 'versionTag', header: 'Version / Tag', size: 180 },
      // Grid
      { accessorKey: 'gridName', header: 'Grid', size: 110 },
      // Compset (truncated)
      {
        accessorKey: 'compset',
        header: 'Compset',
        cell: ({ getValue }) => (
          <span title={String(getValue() ?? '')} className="inline-block max-w-[16ch] truncate">
            {String(getValue() ?? '—')}
          </span>
        ),
        size: 180,
      },
      // Model date range
      {
        id: 'modelDates',
        header: 'Dates (Model)',
        accessorFn: (r) => `${formatDate(r.modelStartDate)} → ${formatDate(r.modelEndDate)}`,
        size: 220,
      },
      // Machine
      {
        accessorKey: 'machineId',
        header: 'Machine',
        cell: ({ row }) => (
          <span title={row.original.machine?.name ?? '—'}>{row.original.machine?.name ?? '—'}</span>
        ),
        size: 140,
      },
      // Vars count (with tooltip on hover)
      {
        id: 'vars',
        header: 'Vars',
        accessorFn: (r) => r.variables?.length ?? 0,
        cell: ({ row }) => {
          const vars = row.original.variables;
          if (!vars || vars.length === 0) return '—';

          return (
            <TooltipProvider delayDuration={1}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="cursor-help">
                    {vars.length}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  {vars.length <= 10
                    ? vars.join(', ')
                    : `${vars.slice(0, 10).join(', ')}, … (${vars.length} total)`}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
        size: 90,
      },
      // Diagnostics counts
      {
        id: 'diagnostics',
        header: 'Diagnostics',
        accessorFn: (r) => ({
          diag: r.diagnosticLinks?.length ?? 0,
          pace: r.paceLinks?.length ?? 0,
        }),
        cell: ({ getValue }) => {
          const v = getValue() as { diag: number; pace: number };
          return (
            <div className="flex items-center gap-2">
              <span title="Diagnostic links" className="inline-flex items-center gap-1">
                📊 {v.diag}
              </span>
              <span title="PACE links" className="inline-flex items-center gap-1">
                ⚡ {v.pace}
              </span>
            </div>
          );
        },
        size: 150,
      },
      // Submitted date
      {
        accessorKey: 'uploadDate',
        header: 'Submitted',
        cell: ({ getValue }) => formatDate(getValue() as string | undefined),
        size: 140,
      },
      // --- Power columns (hidden by default) ---
      {
        accessorKey: 'gitHash',
        header: 'Git',
        cell: ({ getValue }) => (
          <span className="font-mono" title={String(getValue() ?? '')}>
            {String(getValue() ?? '').slice(0, 7) || '—'}
          </span>
        ),
        size: 120,
        enableHiding: true,
      },
      {
        accessorKey: 'branch',
        header: 'Branch',
        cell: ({ getValue }) => (
          <span className="inline-block max-w-[12ch] truncate" title={String(getValue() ?? '')}>
            {String(getValue() ?? '—')}
          </span>
        ),
        size: 140,
        enableHiding: true,
      },
      {
        accessorKey: 'runDate',
        header: 'Run Date',
        cell: ({ getValue }) => formatDate(getValue() as string | undefined),
        size: 140,
        enableHiding: true,
      },
      {
        accessorKey: 'lastEditedAt',
        header: 'Edited',
        cell: ({ row }) => (
          <span title={`by ${row.original.lastEditedBy || '—'}`}>
            {formatDate(row.original.lastEditedAt)}
          </span>
        ),
        size: 170,
        enableHiding: true,
      },
    ],
    [],
  );

  const table = useReactTable({
    data: simulations,
    columns,
    state: { globalFilter, sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: (row, _id, value) => {
      if (!value) return true;
      const v = String(value).toLowerCase();
      const s: Simulation = row.original as Simulation;
      return [
        s.id,
        s.name,
        s.versionTag,
        s.gridName,
        s.compset,
        s.machineId,
        s.variables?.join(',') ?? '',
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(v));
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Select all in current page helper
  const toggleAllOnPage = (checked: boolean | 'indeterminate') => {
    const bool = checked === true;
    const pageRows = table.getRowModel().rows;
    const next = { ...selectedRows };
    pageRows.forEach((r) => (next[r.original.id] = bool));
    setSelectedRows(next);
  };

  // Export currently filtered + sorted rows (pre-pagination) with visible columns
  const exportCsv = () => {
    const rows = table.getPrePaginationRowModel().rows; // filtered + sorted
    const visibleCols = table
      .getAllLeafColumns()
      .filter((c) => c.getIsVisible())
      .map((c) => ({ id: c.id, header: String(c.columnDef.header ?? c.id) }));

    // Add explicit selection column? (no)
    const headers = visibleCols.map((c) => csvEscape(c.header)).join(',');

    const lines = rows.map((r) => {
      return visibleCols
        .map((c) => {
          const o = r.original as Simulation;
          switch (c.id) {
            case 'name':
              return csvEscape(o.name);
            case 'simulationType':
              return csvEscape(o.simulationType);
            case 'status':
              return csvEscape(o.status);
            case 'versionTag':
              return csvEscape(o.versionTag);
            case 'gridName':
              return csvEscape(o.gridName);
            case 'compset':
              return csvEscape(o.compset);
            case 'modelDates':
              return csvEscape(`${formatDate(o.modelStartDate)} → ${formatDate(o.modelEndDate)}`);
            case 'machineId':
              return csvEscape(o.machineId);
            case 'vars':
              return csvEscape(o.variables?.length ?? 0);
            case 'diagnostics': {
              const diag = o.diagnosticLinks?.length ?? 0;
              const pace = o.paceLinks?.length ?? 0;
              return csvEscape(`diag:${diag}; pace:${pace}`);
            }
            case 'uploadDate':
              return csvEscape(formatDate(o.uploadDate));
            case 'gitHash':
              return csvEscape(o.gitHash?.slice(0, 7) ?? '');
            case 'branch':
              return csvEscape(o.branch ?? '');
            case 'runDate':
              return csvEscape(formatDate(o.runDate));
            case 'lastEditedAt':
              return csvEscape(formatDate(o.lastEditedAt));
            default: {
              // Fallback to value via column accessor
              const val = (r as any).getValue?.(c.id) ?? (o as any)[c.id];
              return csvEscape(val ?? '');
            }
          }
        })
        .join(',');
    });

    const csv = [headers, ...lines].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulations_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">All Simulations</h1>
          <p className="text-gray-600 text-sm">
            Complete catalog. Use search, filters, and sorting to locate specific runs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/upload')}>
            Upload to Catalog
          </Button>
          <Button variant="default" onClick={exportCsv}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-wrap gap-3 items-center bg-muted p-4 rounded-md">
        <Input
          placeholder="Search by ID, name, version, grid, compset, machine, or variable…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-[500px]"
        />
        {/* Column visibility quick presets */}
        <div className="ml-auto flex items-center gap-2 text-sm">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table.getAllLeafColumns().map((column) => {
                if (!column.getCanHide()) return null;
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(v) => column.toggleVisibility(Boolean(v))}
                  >
                    {String(column.columnDef.header ?? column.id)}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="text-muted-foreground hidden sm:inline">View:</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              setColumnVisibility({
                gitHash: false,
                branch: false,
                runDate: false,
                lastEditedAt: false,
              })
            }
            title="Hide advanced columns (Git, Branch, Run Date, Edited)"
          >
            Scientist
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              setColumnVisibility({
                gitHash: true,
                branch: true,
                runDate: true,
                lastEditedAt: true,
              })
            }
            title="Show advanced columns (Git, Branch, Run Date, Edited)"
          >
            Developer
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-auto rounded-md border bg-background relative">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-20">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {/* Sticky select-all column */}
                <TableHead className="w-10 sticky left-0 z-30 bg-background border-r">
                  <Checkbox
                    checked={
                      table.getRowModel().rows.length > 0 &&
                      table.getRowModel().rows.every((r) => selectedRows[r.original.id])
                    }
                    onCheckedChange={toggleAllOnPage}
                    aria-label="Select all on page"
                  />
                </TableHead>
                {headerGroup.headers.map((header) => {
                  const isName = header.column.id === 'name';
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'whitespace-nowrap',
                        isName && 'sticky left-10 z-20 bg-background border-r',
                      )}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            'select-none',
                            header.column.getCanSort() && 'cursor-pointer',
                          )}
                          onClick={header.column.getToggleSortingHandler?.()}
                          title={
                            header.column.getIsSorted() === 'asc'
                              ? 'Sorted ascending'
                              : header.column.getIsSorted() === 'desc'
                                ? 'Sorted descending'
                                : 'Click to sort'
                          }
                        >
                          {String(header.column.columnDef.header ?? header.column.id)}
                          {header.column.getIsSorted() === 'asc' && ' ▲'}
                          {header.column.getIsSorted() === 'desc' && ' ▼'}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="hover:bg-muted/40 cursor-pointer"
                onClick={() => navigate(`/simulations/${row.original.id}`)}
              >
                {/* Sticky checkbox cell */}
                <TableCell
                  className="w-10 sticky left-0 z-10 bg-background border-r"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={!!selectedRows[row.original.id]}
                    onCheckedChange={(checked) =>
                      setSelectedRows((prev) => ({ ...prev, [row.original.id]: checked === true }))
                    }
                    aria-label="Select row"
                  />
                </TableCell>
                {row.getVisibleCells().map((cell) => {
                  const isName = cell.column.id === 'name';
                  return (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'whitespace-nowrap',
                        isName && 'sticky left-10 z-[5] bg-background border-r',
                      )}
                    >
                      {cell.column.columnDef.cell
                        ? (cell.column.columnDef.cell as any)(cell.getContext())
                        : ((cell.getValue() as any) ?? '—')}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer / Pagination */}
      <div className="flex items-center justify-between py-2 text-sm text-muted-foreground">
        <div>
          Showing {table.getRowModel().rows.length} of {simulations.length}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <span>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Simulations;
