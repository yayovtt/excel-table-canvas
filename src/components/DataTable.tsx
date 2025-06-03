
import React from 'react';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Theme } from '@/types/theme';

type CellValue = string | number;
type TableData = CellValue[][];

interface Column {
  id: string;
  name: string;
  width: number;
  visible: boolean;
}

interface DataTableProps {
  data: TableData;
  columns: Column[];
  currentTheme: Theme;
  editingCell: {row: number, col: number} | null;
  editValue: string;
  onStartEditing: (row: number, col: number) => void;
  onEditValueChange: (value: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDeleteRow: (rowIndex: number) => void;
  onColumnResize: (e: React.MouseEvent, colIndex: number) => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  currentTheme,
  editingCell,
  editValue,
  onStartEditing,
  onEditValueChange,
  onSaveEdit,
  onCancelEdit,
  onDeleteRow,
  onColumnResize
}) => {
  return (
    <div className="relative border rounded-lg overflow-hidden shadow-lg">
      <div className="overflow-auto max-h-[70vh]">
        <table className={cn("w-full", currentTheme.colors.background)}>
          <thead className={cn("sticky top-0 z-10", currentTheme.colors.accent)}>
            <tr>
              {columns.filter(col => col.visible).map((column, colIndex) => (
                <th
                  key={column.id}
                  style={{ width: `${column.width}px`, minWidth: '60px' }}
                  className={cn(
                    "relative px-4 py-3 text-right font-semibold border-l border-b select-none",
                    currentTheme.colors.border,
                    currentTheme.colors.text,
                    colIndex === 0 ? "sticky right-0 z-20" : ""
                  )}
                >
                  {editingCell?.row === 0 && editingCell?.col === colIndex ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => onEditValueChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') onSaveEdit();
                        if (e.key === 'Escape') onCancelEdit();
                      }}
                      onBlur={onSaveEdit}
                      autoFocus
                      className="w-full p-1 border rounded text-sm"
                    />
                  ) : (
                    <div 
                      onClick={() => onStartEditing(0, colIndex)}
                      className="cursor-pointer"
                    >
                      {data[0]?.[colIndex] || column.name}
                    </div>
                  )}
                  
                  {/* Resize Handle */}
                  <div
                    className="absolute left-0 top-0 w-2 h-full cursor-col-resize hover:bg-blue-300 opacity-0 hover:opacity-50 transition-opacity"
                    onMouseDown={(e) => onColumnResize(e, colIndex)}
                  />
                </th>
              ))}
              <th className="w-16 px-4 py-3 border-l border-b">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(1).map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn(
                  "border-b transition-colors",
                  currentTheme.colors.border,
                  currentTheme.colors.hover
                )}
              >
                {columns.filter(col => col.visible).map((column, colIndex) => (
                  <td
                    key={`${rowIndex}-${colIndex}`}
                    style={{ width: `${column.width}px`, minWidth: '60px' }}
                    className={cn(
                      "px-4 py-3 border-l cursor-pointer",
                      currentTheme.colors.border,
                      colIndex === 0 ? "sticky right-0 z-10 bg-inherit" : ""
                    )}
                    onClick={() => onStartEditing(rowIndex + 1, colIndex)}
                  >
                    {editingCell?.row === rowIndex + 1 && editingCell?.col === colIndex ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => onEditValueChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') onSaveEdit();
                          if (e.key === 'Escape') onCancelEdit();
                        }}
                        onBlur={onSaveEdit}
                        autoFocus
                        className="w-full p-1 border rounded text-sm"
                      />
                    ) : (
                      <span>{row[colIndex] || ''}</span>
                    )}
                  </td>
                ))}
                <td className="px-4 py-3 border-l">
                  <button
                    onClick={() => onDeleteRow(rowIndex + 1)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
