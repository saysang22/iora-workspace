import styles from './Table.module.scss';
import type { CSSProperties, ReactNode } from 'react';

type TableColumn = {
  key: string;
  header: ReactNode;
  align?: 'left' | 'center' | 'right';
};

type TableRow = Record<string, ReactNode | null | undefined>;

type TableProps = {
  columns: TableColumn[];
  rows: TableRow[];
  minWidth?: string;
  mobileCard?: boolean;
  thColor?: string;
  thBackground?: string;
  tdColor?: string;
  tdBackground?: string;
  borderColor?: string;
  headerPadding?: string;
  cellPadding?: string;
  thFontSize?: string;
  tdFontSize?: string;
  thFontWeight?: string;
  rowHoverBackground?: string;
  className?: string;
  onRowClick?: (row: TableRow, rowIndex: number) => void;
  rowKeyField?: string;
};

export function Table({
  columns,
  rows,
  minWidth = '720px',
  mobileCard = false,
  thColor,
  thBackground,
  tdColor,
  tdBackground,
  borderColor,
  headerPadding,
  cellPadding,
  thFontSize,
  tdFontSize,
  thFontWeight,
  rowHoverBackground,
  className = '',
  onRowClick,
  rowKeyField,
}: TableProps) {
  const mergedClassName = [styles.wrapper, mobileCard ? styles.mobileCard : '', className].filter(Boolean).join(' ');

  const customStyle: CSSProperties = {
    ...({ '--table-min-width': minWidth } as CSSProperties),
    ...(thColor ? ({ '--table-th-color': thColor } as CSSProperties) : {}),
    ...(thBackground ? ({ '--table-th-background': thBackground } as CSSProperties) : {}),
    ...(tdColor ? ({ '--table-td-color': tdColor } as CSSProperties) : {}),
    ...(tdBackground ? ({ '--table-td-background': tdBackground } as CSSProperties) : {}),
    ...(borderColor ? ({ '--table-border-color': borderColor } as CSSProperties) : {}),
    ...(headerPadding ? ({ '--table-header-padding': headerPadding } as CSSProperties) : {}),
    ...(cellPadding ? ({ '--table-cell-padding': cellPadding } as CSSProperties) : {}),
    ...(thFontSize ? ({ '--table-th-font-size': thFontSize } as CSSProperties) : {}),
    ...(tdFontSize ? ({ '--table-td-font-size': tdFontSize } as CSSProperties) : {}),
    ...(thFontWeight ? ({ '--table-th-font-weight': thFontWeight } as CSSProperties) : {}),
    ...(rowHoverBackground ? ({ '--table-row-hover-background': rowHoverBackground } as CSSProperties) : {}),
  };

  return (
    <div className={mergedClassName} style={customStyle}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={{ textAlign: column.align ?? 'left' }}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => {
            const rowKey = rowKeyField ? row[rowKeyField] : undefined;

            return (
              <tr
                key={rowKey !== undefined ? String(rowKey) : `row-${rowIndex}`}
                onClick={() => onRowClick?.(row, rowIndex)}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map((column) => {
                  const value = row[column.key];
                  return (
                    <td
                      key={`${rowIndex}-${column.key}`}
                      data-label={typeof column.header === 'string' ? column.header : ''}
                      style={{ textAlign: column.align ?? 'left' }}
                    >
                      {value ?? '-'}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
