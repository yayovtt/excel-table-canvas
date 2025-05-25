
import React from 'react';
import { cn } from '@/lib/utils';
import { Theme } from '@/types/theme';

interface Column {
  id: string;
  name: string;
  width: number;
  visible: boolean;
}

interface ColumnSettingsProps {
  columns: Column[];
  currentTheme: Theme;
  onColumnsUpdate: (columns: Column[]) => void;
}

export const ColumnSettings: React.FC<ColumnSettingsProps> = ({
  columns,
  currentTheme,
  onColumnsUpdate
}) => {
  return (
    <div className={cn("p-4 border rounded-lg mb-4", currentTheme.colors.border, currentTheme.colors.accent)}>
      <h3 className={cn("font-semibold mb-3", currentTheme.colors.text)}>הגדרות עמודות</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {columns.map((column, index) => (
          <label key={column.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={column.visible}
              onChange={(e) => {
                const newColumns = columns.map((col, i) => 
                  i === index ? { ...col, visible: e.target.checked } : col
                );
                onColumnsUpdate(newColumns);
              }}
              className="rounded"
            />
            <span className={cn("text-sm", currentTheme.colors.text)}>{column.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
