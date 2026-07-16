import React from 'react';

const Table = ({
  columns = [], // Array of { key, header, align: 'left' | 'center' | 'right', render: (row) => ... }
  data = [],
  isLoading = false,
  emptyMessage = 'No data available',
  onRowClick,
  className = ''
}) => {
  return (
    <div className={`w-full overflow-x-auto rounded-[12px] border border-slate-100 dark:border-slate-800 ${className}`}>
      <table className="w-full border-collapse text-left text-sm text-slate-500 dark:text-slate-400">
        <thead className="bg-slate-50/50 dark:bg-slate-900/30 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-6 py-3.5 font-semibold ${
                  col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-transparent">
          {isLoading ? (
            // Skeleton loader
            Array.from({ length: 5 }).map((_, rowIndex) => (
              <tr key={`skeleton-${rowIndex}`}>
                {columns.map((col) => (
                  <td key={`skeleton-${rowIndex}-${col.key}`} className="px-6 py-4">
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-md w-3/4"></div>
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            // Empty state
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <span className="text-sm font-medium text-slate-400 dark:text-slate-500">
                    {emptyMessage}
                  </span>
                </div>
              </td>
            </tr>
          ) : (
            // Data rows
            data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/20 ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((col) => {
                  const alignClass =
                    col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left';
                  return (
                    <td
                      key={`${row.id || rowIndex}-${col.key}`}
                      className={`px-6 py-3.5 text-slate-700 dark:text-slate-300 font-medium ${alignClass}`}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
