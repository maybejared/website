import type { FC, ReactNode, CSSProperties } from 'react';

/** Props for the DataTable component. */
export interface DataTableProps {
  /** Column definitions. */
  columns: Array<{ key: string; label: string; align?: 'left' | 'right' }>;
  /** Row data, keyed by column key. */
  rows: Array<Record<string, ReactNode>>;
  /** Extra class name appended after the DS classes. */
  className?: string;
  /** Inline style overrides. */
  style?: CSSProperties;
}

/** Simple data table with left- or right-aligned columns. */
export const DataTable: FC<DataTableProps> = ({ columns, rows, className, style }) => {
  const classes = ['data-table', className].filter(Boolean).join(' ');
  return (
    <table className={classes} style={style}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} className={['label', column.align === 'right' && 'data-table--right'].filter(Boolean).join(' ')}>
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
