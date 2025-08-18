import { Simulation } from '@/App';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, GitBranch } from 'lucide-react';

const simulationTypeIcon = (sim: Simulation) => {
  if (sim.simulationType === 'production') {
    return (
      <span
        title="Production"
        style={{ display: 'inline-flex', alignItems: 'center', marginRight: 4 }}
      >
        <Check className="w-4 h-4" style={{ marginRight: 4 }} />
        Production
      </span>
    );
  }
  return (
    <span title="Master" style={{ display: 'inline-flex', alignItems: 'center', marginRight: 4 }}>
      <GitBranch className="w-4 h-4" style={{ marginRight: 4 }} />
      Master
    </span>
  );
};

interface NewSimTableProps {
  latestSimulations: Simulation[];
}

export const NewSimsTable = ({ latestSimulations }: NewSimTableProps) => {
  const table = useReactTable({
    data: latestSimulations,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                style={{
                  borderBottom: '1px solid #ddd',
                  padding: '8px',
                  textAlign: 'left',
                  background: '#f9f9f9',
                }}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td
                key={cell.id}
                style={{
                  borderBottom: '1px solid #eee',
                  padding: '8px',
                }}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const tableColumns: ColumnDef<Simulation>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'campaignId',
    header: 'Campaign',
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'variables',
    header: 'Variables',
    cell: (info) => (Array.isArray(info.getValue()) ? info.getValue().join(', ') : info.getValue()),
  },
  {
    accessorKey: 'modelStartDate',
    header: 'Start Date',
    cell: (info) => new Date(info.getValue() as string).toLocaleDateString(),
  },
  {
    id: 'versionOrHash',
    header: 'Version / Git Hash',
    cell: (info) => {
      const sim = info.row.original;
      return sim.simulationType === 'production' ? sim.versionTag : sim.gitHash;
    },
  },
  {
    accessorKey: 'uploadDate',
    header: 'Upload Date',
    cell: (info) => new Date(info.getValue() as string).toLocaleDateString(),
  },
  {
    accessorKey: 'simulationType',
    header: 'Type',
    cell: (info) => simulationTypeIcon(info.row.original),
  },
  {
    id: 'details',
    header: 'Details',
    cell: () => (
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          // handle details click, e.g. navigate or open modal
        }}
        aria-label="Details"
        className="p-2"
      >
        <ArrowRight className="w-4 h-4" />
      </Button>
    ),
    enableSorting: false,
    enableColumnFilter: false,
  },
];

export default NewSimsTable;
