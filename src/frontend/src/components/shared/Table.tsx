import type React from "react";

interface Column<T> {
  key: string;
  header: string;
  render: (row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T, index: number) => string;
  ocidPrefix?: string;
  emptyMessage?: string;
  className?: string;
}

export default function Table<T>({
  columns,
  data,
  rowKey,
  ocidPrefix,
  emptyMessage = "Sin datos",
  className = "",
}: TableProps<T>) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-muted/50 border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-3 py-2.5 text-left font-semibold text-muted-foreground uppercase tracking-wide text-xs ${col.headerClassName ?? ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-8 text-center text-muted-foreground"
                data-ocid={ocidPrefix ? `${ocidPrefix}.empty_state` : undefined}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={rowKey(row, index)}
                data-ocid={
                  ocidPrefix ? `${ocidPrefix}.item.${index + 1}` : undefined
                }
                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors even:bg-muted/10"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-3 py-2.5 text-foreground ${col.className ?? ""}`}
                  >
                    {col.render(row, index)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
