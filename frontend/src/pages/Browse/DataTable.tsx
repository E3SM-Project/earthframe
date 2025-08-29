import type {
  Column,
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
import { ArrowUpDown, ChevronDown } from 'lucide-react';
import { useState } from 'react';

import SelectedSimulationChipList from '@/components/layout/SelectedSimulationsChipList';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import type { Simulation } from '@/types/index';

// Max number of rows that can be selected at once.
const MAX_SELECTION = 5;

interface DataTableProps {
  simulations: Simulation[];
  filteredData: Simulation[];
  selectedSimulationIds: string[];
  setSelectedSimulationIds: (ids: string[]) => void;
  handleCompareButtonClick: () => void;
}

export const DataTable = ({
  simulations,
  filteredData,
  selectedSimulationIds,
  setSelectedSimulationIds,
  handleCompareButtonClick,
}: DataTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    ensembleMember: false,
    gridResolution: false,
    gridName: false,
    compset: false,
  });

  // Convert selectedSimulationIds to rowSelection object for react-table.
  const rowSelection = idsToRowSelection(selectedSimulationIds);

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

    setSelectedSimulationIds(selectedIds);
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

  const isCompareButtonDisabled = selectedSimulationIds.length < 2;

  return (
    <div className="w-full">
      {/* Top controls */}
      <div className="flex items-center py-4">
        <SelectedSimulationChipList
          simulations={simulations}
          buttonText="Compare"
          onCompareButtonClick={handleCompareButtonClick}
          selectedSimulationIds={selectedSimulationIds}
          setSelectedSimulationIds={setSelectedSimulationIds}
          isCompareButtonDisabled={isCompareButtonDisabled}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  className="capitalize"
                  checked={col.getIsVisible()}
                  onCheckedChange={(val) => col.toggleVisibility(!!val)}
                >
                  {col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Scroll container for sticky columns */}
      <div className="rounded-md border overflow-x-auto w-full max-w-full">
        <Table className="min-w-max table-auto border-separate border-spacing-0 [&_th]:whitespace-nowrap [&_td]:whitespace-nowrap">
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => {
                  const meta = header.column.columnDef.meta;

                  const isSticky = meta?.sticky;
                  const left =
                    meta?.position === 'left' ? getStickyLeftOffset(header, table) : undefined;
                  const right = meta?.position === 'right' ? 0 : undefined;

                  return (
                    <TableHead
                      key={header.id}
                      className={isSticky ? 'sticky bg-background z-20' : undefined}
                      style={{
                        left,
                        right,
                        minWidth: meta?.width,
                        maxWidth: meta?.width,
                        width: meta?.width,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta;
                  const isSticky = meta?.sticky;
                  const left =
                    meta?.position === 'left' ? getStickyLeftOffset(cell, table) : undefined;
                  const right = meta?.position === 'right' ? 0 : undefined;

                  return (
                    <TableCell
                      key={cell.id}
                      className={isSticky ? 'sticky bg-background z-10' : undefined}
                      style={{
                        left,
                        right,
                        minWidth: meta?.width,
                        maxWidth: meta?.width,
                        width: meta?.width,
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
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
    meta: { sticky: true, width: 50, position: 'left' },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting()}>
        Name
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue('name')}</div>,
    enableSorting: true,
    meta: { sticky: true, width: 200, position: 'left' },
  },
  {
    accessorKey: 'campaignId',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting()}>
        Campaign
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue('campaignId')}</div>,
    enableSorting: true,
  },
  {
    accessorKey: 'experimentTypeId',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting()}>
        Experiment
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue('experimentTypeId')}</div>,
    enableSorting: true,
  },
  {
    accessorKey: 'variables',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting()}>
        Variables
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const variables = row.getValue('variables') as string[];
      return (
        <div>
          {Array.isArray(variables) && variables.length > 0 ? (
            variables.join(', ')
          ) : (
            <span className="text-muted-foreground italic">None</span>
          )}
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: 'versionTag',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting()}>
        Version Tag
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue('versionTag')}</div>,
    enableSorting: true,
  },
  {
    accessorKey: 'modelStartDate',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting()}>
        Model Start Date
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const start = row.original.modelStartDate;
      return start ? (
        <span>{start}</span>
      ) : (
        <span className="text-muted-foreground italic">N/A</span>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: 'modelEndDate',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting()}>
        Model End Date
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const end = row.original.modelEndDate;
      return end ? <span>{end}</span> : <span className="text-muted-foreground italic">N/A</span>;
    },
    enableSorting: true,
  },
  {
    accessorKey: 'ensembleMember',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting()}>
        Ensemble Member
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue('ensembleMember')}</div>,
    enableSorting: true,
  },
  {
    accessorKey: 'gridResolution',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting()}>
        Grid Resolution
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue('gridResolution')}</div>,
    enableSorting: true,
  },
  {
    accessorKey: 'compset',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting()}>
        Component Set
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue('compset')}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'gridName',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting()}>
        Grid Name
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue('gridName')}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: 'details',
    enableHiding: false,
    cell: ({ row }) => {
      const simulation = row.original;
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            window.location.href = `/simulations/${simulation.id}`;
          }}
        >
          Details
        </Button>
      );
    },
    enableSorting: false,
    meta: { sticky: true, width: 100, position: 'right' },
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

const getStickyLeftOffset = (
  headerOrCell: {
    column: { id: string; columnDef: { meta?: { sticky?: boolean; width?: number } } };
  },
  table: { getAllLeafColumns: () => Column<Simulation, unknown>[] },
): number => {
  const all = table.getAllLeafColumns();
  const idx = all.findIndex((c) => c.id === headerOrCell.column.id);

  let left = 0;

  for (let i = 0; i < idx; i++) {
    if (all[i].columnDef.meta?.sticky) {
      left += all[i].columnDef.meta?.width ?? 0;
    }
  }
  return left;
};
