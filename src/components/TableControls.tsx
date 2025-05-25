
import React from 'react';
import { Search, Upload, Plus, Download, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Theme } from '@/types/theme';

interface TableControlsProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  currentTheme: Theme;
  onFileImport: () => void;
  onAddColumn: () => void;
  onAddRow: () => void;
  onExport: () => void;
  showColumnSettings: boolean;
  onToggleColumnSettings: () => void;
}

export const TableControls: React.FC<TableControlsProps> = ({
  searchTerm,
  onSearchChange,
  currentTheme,
  onFileImport,
  onAddColumn,
  onAddRow,
  onExport,
  showColumnSettings,
  onToggleColumnSettings
}) => {
  return (
    <div className="flex flex-wrap gap-4 mb-4 items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-64">
        <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="חיפוש בטבלה..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            "w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            currentTheme.colors.border
          )}
        />
      </div>

      {/* File Import */}
      <button
        onClick={onFileImport}
        className={cn(
          "flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors",
          currentTheme.colors.primary
        )}
      >
        <Upload className="h-4 w-4" />
        ייבא מאקסל
      </button>

      {/* Add Column */}
      <button
        onClick={onAddColumn}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
      >
        <Plus className="h-4 w-4" />
        הוסף עמודה
      </button>

      {/* Add Row */}
      <button
        onClick={onAddRow}
        className={cn(
          "flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors",
          currentTheme.colors.secondary.replace('bg-gray-100', 'bg-green-600').replace('hover:bg-gray-200', 'hover:bg-green-700')
        )}
      >
        <Plus className="h-4 w-4" />
        הוסף שורה
      </button>

      {/* Export */}
      <button
        onClick={onExport}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
          currentTheme.colors.secondary
        )}
      >
        <Download className="h-4 w-4" />
        ייצא לאקסל
      </button>

      {/* Column Settings */}
      <button
        onClick={onToggleColumnSettings}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
          currentTheme.colors.secondary
        )}
      >
        <Settings className="h-4 w-4" />
        עמודות
      </button>
    </div>
  );
};
