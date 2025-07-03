import { useState } from 'react';
import type {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Simulation } from '@/App';
import { useNavigate } from 'react-router-dom';

interface DataTableProps {
  data: Simulation[];
  selectedDataIds: string[] | null;
  setSelectedDataIds: (ids: string[]) => void;
}

export const DataTable = ({ data, selectedDataIds, setSelectedDataIds }: DataTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const navigate = useNavigate();
  const handleCompare = () => {
    navigate('/compare');
  };

  // Convert selectedDataIds to rowSelection object for react-table
  const rowSelection: Record<string, boolean> = {};
  if (selectedDataIds) {
    selectedDataIds.forEach((id) => {
      rowSelection[id] = true;
    });
  }
  // Max selection limit
  const MAX_SELECTION = 5;

  // Helper to render the select checkbox with max selection logic
  function renderSelectCheckbox(row: Row<Simulation>) {
    const isSelected = row.getIsSelected();
    const isDisabled =
      !isSelected && Object.values(rowSelection).filter(Boolean).length >= MAX_SELECTION;

    return (
      <Checkbox
        checked={isSelected}
        disabled={isDisabled}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    );
  }

  // Memoize columns with select checkbox logic injected
  const tableColumns = columns.map((col: ColumnDef<Simulation>) =>
    col.id === 'select'
      ? {
          ...col,
          cell: ({ row }) => renderSelectCheckbox(row),
        }
      : col,
  ) as ColumnDef<Simulation>[];

  // Handle row selection change with max selection limit
  function handleRowSelectionChange(
    updater: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>),
  ) {
    const nextRowSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
    const limitedSelection = limitRowSelection(nextRowSelection, MAX_SELECTION);
    const selectedIds = Object.keys(limitedSelection).filter((id) => limitedSelection[id]);
    setSelectedDataIds(selectedIds);
  }

  const table = useReactTable({
    data,
    columns: tableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: handleRowSelectionChange,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <div>
          <Button
            variant="default"
            size="sm"
            onClick={() => handleCompare()}
            disabled={Object.values(rowSelection).filter(Boolean).length < 2}
          >
            Compare
          </Button>
        </div>
        <div className="ml-4 flex flex-wrap items-center gap-2">
          <span
            className={`text-xs ${
              table.getFilteredSelectedRowModel().rows.length === MAX_SELECTION
                ? 'text-warning font-bold'
                : 'text-muted-foreground'
            }`}
          >
            {table.getFilteredSelectedRowModel().rows.length} / {MAX_SELECTION} selected
          </span>
          {table.getFilteredSelectedRowModel().rows.map((row) => (
            <span
              key={row.id}
              className="flex items-center rounded bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
            >
              {row.original.name}
              <button
                type="button"
                className="ml-1 text-muted-foreground hover:text-destructive focus:outline-none"
                aria-label={`Remove ${row.original.name}`}
                onClick={() => {
                  // Remove this row from selection
                  table.getRow(row.id)?.toggleSelected(false);
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
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

export default DataTable;

const columns: ColumnDef<Simulation>[] = [
  {
    id: 'select',
    header: () => null,
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Name
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue('name') as string}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <div className="capitalize">{row.getValue('status') as string}</div>,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Email
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div className="lowercase">{row.getValue('email') as string}</div>,
  },
  {
    accessorKey: 'amount',
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount') as string);

      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.id)}>
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

/**
 * Limits the row selection to a maximum number of rows.
 * @param selection The current row selection object.
 * @param max The maximum number of rows that can be selected.
 * @returns A new selection object limited to the specified max.
 */
const limitRowSelection = (
  selection: Record<string, boolean>,
  max: number,
): Record<string, boolean> => {
  const selectedIds = Object.keys(selection).filter((id) => selection[id]);
  if (selectedIds.length <= max) return selection;

  const limitedSelection = { ...selection };
  selectedIds.slice(max).forEach((id) => {
    limitedSelection[id] = false;
  });

  return limitedSelection;
};
