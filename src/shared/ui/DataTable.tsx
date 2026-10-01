import type { FC, ReactNode } from 'react';
import { cn } from './cn';

/** Props for the DataTable component. */
export interface DataTableProps {
  /** Column definitions. */
  columns: Array<{ key: string; label: string; align?: 'left' | 'right' }>;
  /** Row data, keyed by column key. */
  rows: Array<Record<string, ReactNode>>;
  /** Extra class name appended after the DS classes. */
  className?: string;
}

/** Simple data table with left- or right-aligned columns. */
export const DataTable: FC<DataTableProps> = ({ columns, rows, className }) => {
  const classes = cn('data-table', className);
  return (
    <table className={classes}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} className={cn('label', column.align === 'right' && 'data-table--right')}>
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((column) => (
              <td key={column.key} className={column.align === 'right' ? 'data-table--right' : undefined}>
                {row[column.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
