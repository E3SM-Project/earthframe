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

// Max number of rows that can be selected at once.
const MAX_SELECTION = 5;

interface DataTableProps {
  data: Simulation[];
  filteredData: Simulation[];
  selectedDataIds: string[];
  setSelectedDataIds: (ids: string[]) => void;
}

export const DataTable = ({
  data,
  filteredData,
  selectedDataIds,
  setSelectedDataIds,
}: DataTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const navigate = useNavigate();
  const handleCompare = () => {
    navigate('/compare');
  };

  // Convert selectedDataIds to rowSelection object for react-table.
  const rowSelection = idsToRowSelection(selectedDataIds);

  // Helper to render the select checkbox with max selection logic.
  const renderSelectCheckbox = (row: Row<Simulation>) => {
    const isSelected = row.getIsSelected();
    const isDisabled =
      !isSelected && Object.values(rowSelection).filter(Boolean).length >= MAX_SELECTION;

    return (
      <Checkbox
        checked={isSelected}
        disabled={isDisabled}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        onClick={(e) => e.stopPropagation()}
      />
    );
  };

  // Memoize columns with select checkbox logic injected.
  const tableColumns = columns.map((col: ColumnDef<Simulation>) =>
    col.id === 'select'
      ? {
          ...col,
          cell: ({ row }) => renderSelectCheckbox(row),
        }
      : col,
  ) as ColumnDef<Simulation>[];

  // Handle row selection change with max selection limit.
  const handleRowSelectionChange = (
    updater: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>),
  ) => {
    const nextRowSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
    const limitedSelection = limitRowSelection(nextRowSelection, MAX_SELECTION);
    const selectedIds = Object.keys(limitedSelection).filter((id) => limitedSelection[id]);

    setSelectedDataIds(selectedIds);
  };

  const table = useReactTable({
    data: filteredData,
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

  // Allow row click to select/deselect, except when clicking on interactive elements (like the checkbox or actions)
  const handleRowClick = (row: Row<Simulation>, event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const tag = target.tagName;

    // Ignore clicks on interactive elements
    if (
      tag === 'BUTTON' ||
      tag === 'INPUT' ||
      tag === 'A' ||
      target.closest('button, input, a, [role="menu"]')
    ) {
      return;
    }

    const isSelected = row.getIsSelected();
    const selectedCount = Object.values(rowSelection).filter(Boolean).length;
    if (!isSelected && selectedCount >= MAX_SELECTION) {
      return;
    }
    row.toggleSelected();
  };

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
              (selectedDataIds?.length ?? 0) === MAX_SELECTION
                ? 'text-warning font-bold'
                : 'text-muted-foreground'
            }`}
          >
            {selectedDataIds?.length ?? 0} / {MAX_SELECTION} selected
          </span>
          {(selectedDataIds ?? []).map((id) => {
            // Always find the row in the full data set (not just filtered)
            const row = data.find((r) => r.id === id);
            if (!row) return null;
            return (
              <span
                key={id}
                className="flex items-center rounded bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
              >
                {row.name}
                <button
                  type="button"
                  className="ml-1 text-muted-foreground hover:text-destructive focus:outline-none"
                  aria-label={`Remove ${row.name}`}
                  onClick={() => {
                    setSelectedDataIds(selectedDataIds.filter((rowId) => rowId !== id));
                  }}
                >
                  ×
                </button>
              </span>
            );
          })}
          {selectedDataIds.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 text-xs"
              onClick={() => setSelectedDataIds([])}
            >
              Deselect all
            </Button>
          )}
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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={(e) => handleRowClick(row, e)}
                  style={{ cursor: 'pointer' }}
                >
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
    accessorKey: 'startDate',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Start Date
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue('startDate') as string}</div>,
  },
  {
    accessorKey: 'tag',
    header: 'Tag',
    cell: ({ row }) => <div>{row.getValue('tag') as string}</div>,
  },
  {
    accessorKey: 'campaign',
    header: 'Campaign',
    cell: ({ row }) => <div>{row.getValue('campaign') as string}</div>,
  },
  {
    accessorKey: 'compset',
    header: 'Compset',
    cell: ({ row }) => <div>{row.getValue('compset') as string}</div>,
  },
  {
    accessorKey: 'resolution',
    header: 'Resolution',
    cell: ({ row }) => <div>{row.getValue('resolution') as string}</div>,
  },
  {
    accessorKey: 'machine',
    header: 'Machine',
    cell: ({ row }) => <div>{row.getValue('machine') as string}</div>,
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const simulation = row.original;
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(simulation.id)}>
              Copy simulation ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Converts an array of IDs into a row selection object.
// Each ID becomes a key with a value of true, indicating selection.
//
// @param ids - Array of row IDs to select
// @returns An object mapping each ID to true
const idsToRowSelection = (ids: string[]): Record<string, boolean> =>
  Object.fromEntries(ids.map((id) => [id, true]));

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

export default DataTable;
