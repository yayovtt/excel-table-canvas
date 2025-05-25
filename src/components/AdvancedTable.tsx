
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Search, Upload, Plus, Trash2, Edit3, Palette, Download, Settings } from 'lucide-react';
import * as XLSX from 'xlsx';
import { cn } from '@/lib/utils';
import { useTableData } from '@/hooks/useTableData';
import { Toaster } from '@/components/ui/toaster';

type CellValue = string | number;
type TableData = CellValue[][];

interface Column {
  id: string;
  name: string;
  width: number;
  visible: boolean;
}

interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    border: string;
    hover: string;
  };
}

const themes: Theme[] = [
  {
    name: 'קלאסי כחול',
    colors: {
      primary: 'bg-blue-600 hover:bg-blue-700',
      secondary: 'bg-gray-100 hover:bg-gray-200',
      accent: 'bg-blue-50',
      background: 'bg-white',
      text: 'text-gray-900',
      border: 'border-gray-300',
      hover: 'hover:bg-blue-50'
    }
  },
  {
    name: 'ירוק מודרני',
    colors: {
      primary: 'bg-green-600 hover:bg-green-700',
      secondary: 'bg-emerald-100 hover:bg-emerald-200',
      accent: 'bg-green-50',
      background: 'bg-white',
      text: 'text-gray-900',
      border: 'border-emerald-300',
      hover: 'hover:bg-green-50'
    }
  },
  {
    name: 'סגול יוקרתי',
    colors: {
      primary: 'bg-purple-600 hover:bg-purple-700',
      secondary: 'bg-purple-100 hover:bg-purple-200',
      accent: 'bg-purple-50',
      background: 'bg-white',
      text: 'text-gray-900',
      border: 'border-purple-300',
      hover: 'hover:bg-purple-50'
    }
  },
  {
    name: 'כהה אלגנטי',
    colors: {
      primary: 'bg-gray-800 hover:bg-gray-900',
      secondary: 'bg-gray-700 hover:bg-gray-600',
      accent: 'bg-gray-100',
      background: 'bg-gray-50',
      text: 'text-gray-900',
      border: 'border-gray-400',
      hover: 'hover:bg-gray-100'
    }
  }
];

const AdvancedTable: React.FC = () => {
  const { 
    data, 
    columns, 
    isLoading, 
    updateData, 
    updateColumns, 
    updateBoth,
    setData,
    setColumns 
  } = useTableData();

  const [editingCell, setEditingCell] = useState<{row: number, col: number} | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [draggedColumn, setDraggedColumn] = useState<number | null>(null);
  const [resizingColumn, setResizingColumn] = useState<number | null>(null);
  const [resizeStart, setResizeStart] = useState<{x: number, width: number} | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Filter data based on search term
  const filteredData = React.useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter((row, index) => {
      if (index === 0) return true; // Always show header
      return row.some(cell => 
        cell.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [data, searchTerm]);

  // Handle file import
  const handleFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (file.name.endsWith('.txt')) {
          const text = e.target?.result as string;
          const rows = text.split('\n').map(row => row.split('\t'));
          
          // Update columns
          const newColumns = rows[0]?.map((header, index) => ({
            id: index.toString(),
            name: header,
            width: 120,
            visible: true
          })) || [];
          
          updateBoth(rows, newColumns);
        } else {
          const workbook = XLSX.read(e.target?.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as CellValue[][];
          
          // Update columns
          const headers = jsonData[0] || [];
          const newColumns = headers.map((header, index) => ({
            id: index.toString(),
            name: header.toString(),
            width: 120,
            visible: true
          }));
          
          updateBoth(jsonData, newColumns);
        }
      } catch (error) {
        console.error('Error importing file:', error);
        alert('שגיאה בייבוא הקובץ');
      }
    };
    
    if (file.name.endsWith('.txt')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
    
    // Reset input
    event.target.value = '';
  }, [updateBoth]);

  // Handle cell editing
  const startEditing = useCallback((row: number, col: number) => {
    setEditingCell({ row, col });
    setEditValue(data[row][col]?.toString() || '');
  }, [data]);

  const saveEdit = useCallback(() => {
    if (!editingCell) return;
    
    const newData = [...data];
    newData[editingCell.row][editingCell.col] = editValue;
    updateData(newData);
    setEditingCell(null);
    setEditValue('');
  }, [editingCell, editValue, data, updateData]);

  const cancelEdit = useCallback(() => {
    setEditingCell(null);
    setEditValue('');
  }, []);

  // Add new row
  const addRow = useCallback(() => {
    const newRow = new Array(columns.length).fill('');
    const newData = [...data, newRow];
    updateData(newData);
  }, [data, columns.length, updateData]);

  // Add new column
  const addColumn = useCallback(() => {
    const newColumnIndex = columns.length;
    const newColumn: Column = {
      id: newColumnIndex.toString(),
      name: 'עמודה חדשה',
      width: 120,
      visible: true
    };
    
    const newColumns = [...columns, newColumn];
    const newData = data.map(row => [...row, '']);
    
    updateBoth(newData, newColumns);
  }, [columns, data, updateBoth]);

  // Delete row
  const deleteRow = useCallback((rowIndex: number) => {
    if (rowIndex === 0) return; // Can't delete header
    const newData = data.filter((_, index) => index !== rowIndex);
    updateData(newData);
  }, [data, updateData]);

  // Handle column resize
  const handleMouseDown = useCallback((e: React.MouseEvent, colIndex: number) => {
    e.preventDefault();
    setResizingColumn(colIndex);
    setResizeStart({ x: e.clientX, width: columns[colIndex].width });
  }, [columns]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (resizingColumn === null || !resizeStart) return;
    
    const diff = e.clientX - resizeStart.x;
    const newWidth = Math.max(60, resizeStart.width + diff);
    
    const newColumns = columns.map((col, index) => 
      index === resizingColumn ? { ...col, width: newWidth } : col
    );
    setColumns(newColumns);
  }, [resizingColumn, resizeStart, columns, setColumns]);

  const handleMouseUp = useCallback(() => {
    if (resizingColumn !== null) {
      updateColumns(columns);
    }
    setResizingColumn(null);
    setResizeStart(null);
  }, [resizingColumn, columns, updateColumns]);

  useEffect(() => {
    if (resizingColumn !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizingColumn, handleMouseMove, handleMouseUp]);

  // Export to Excel
  const exportToExcel = useCallback(() => {
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'נתונים');
    XLSX.writeFile(workbook, 'table-data.xlsx');
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">טוען נתונים...</div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen p-6", currentTheme.colors.background)} dir="rtl">
      <Toaster />
      
      {/* Header */}
      <div className="mb-6">
        <h1 className={cn("text-3xl font-bold mb-4", currentTheme.colors.text)}>
          מערכת טבלה מתקדמת
        </h1>
        
        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-4 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="חיפוש בטבלה..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                currentTheme.colors.border
              )}
            />
          </div>

          {/* File Import */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            accept=".xlsx,.xls,.txt"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
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
            onClick={addColumn}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            הוסף עמודה
          </button>

          {/* Add Row */}
          <button
            onClick={addRow}
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
            onClick={exportToExcel}
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
            onClick={() => setShowColumnSettings(!showColumnSettings)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
              currentTheme.colors.secondary
            )}
          >
            <Settings className="h-4 w-4" />
            עמודות
          </button>
        </div>

        {/* Column Settings Panel */}
        {showColumnSettings && (
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
                      updateColumns(newColumns);
                    }}
                    className="rounded"
                  />
                  <span className={cn("text-sm", currentTheme.colors.text)}>{column.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="relative border rounded-lg overflow-hidden shadow-lg">
        <div className="overflow-auto max-h-[70vh]">
          <table ref={tableRef} className={cn("w-full", currentTheme.colors.background)}>
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
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit();
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        onBlur={saveEdit}
                        autoFocus
                        className="w-full p-1 border rounded text-sm"
                      />
                    ) : (
                      <div 
                        onClick={() => startEditing(0, colIndex)}
                        className="cursor-pointer"
                      >
                        {filteredData[0]?.[colIndex] || column.name}
                      </div>
                    )}
                    
                    {/* Resize Handle */}
                    <div
                      className="absolute left-0 top-0 w-2 h-full cursor-col-resize hover:bg-blue-300 opacity-0 hover:opacity-50 transition-opacity"
                      onMouseDown={(e) => handleMouseDown(e, colIndex)}
                    />
                  </th>
                ))}
                <th className="w-16 px-4 py-3 border-l border-b">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(1).map((row, rowIndex) => (
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
                      onClick={() => startEditing(rowIndex + 1, colIndex)}
                    >
                      {editingCell?.row === rowIndex + 1 && editingCell?.col === colIndex ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit();
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          onBlur={saveEdit}
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
                      onClick={() => deleteRow(rowIndex + 1)}
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

      {/* Theme Selector */}
      <div className="fixed bottom-6 left-6">
        <div className="relative">
          <button
            onClick={() => setShowThemeSelector(!showThemeSelector)}
            className={cn(
              "p-3 rounded-full shadow-lg transition-colors",
              currentTheme.colors.primary
            )}
          >
            <Palette className="h-5 w-5 text-white" />
          </button>
          
          {showThemeSelector && (
            <div className={cn(
              "absolute bottom-full mb-2 left-0 p-4 border rounded-lg shadow-xl",
              currentTheme.colors.background,
              currentTheme.colors.border
            )}>
              <h3 className={cn("font-semibold mb-3", currentTheme.colors.text)}>בחר ערכת נושא</h3>
              <div className="space-y-2">
                {themes.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => {
                      setCurrentTheme(theme);
                      setShowThemeSelector(false);
                    }}
                    className={cn(
                      "w-full text-right px-3 py-2 rounded transition-colors",
                      currentTheme.name === theme.name 
                        ? theme.colors.primary.split(' ')[0] + ' text-white'
                        : theme.colors.secondary
                    )}
                  >
                    {theme.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className={cn("mt-6 text-sm", currentTheme.colors.text)}>
        <p>סך הכל: {filteredData.length - 1} שורות | {columns.filter(col => col.visible).length} עמודות נראות</p>
      </div>
    </div>
  );
};

export default AdvancedTable;
