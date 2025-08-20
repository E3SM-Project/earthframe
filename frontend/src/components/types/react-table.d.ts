import type { RowData } from '@tanstack/react-table';

// Extend ColumnMeta to support sticky columns
declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    sticky?: boolean;
    width?: number;
    position?: 'left' | 'right';
  }
}
