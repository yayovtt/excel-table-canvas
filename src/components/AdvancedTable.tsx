
import React, { useState, useRef, useCallback, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { cn } from '@/lib/utils';
import { useTableData } from '@/hooks/useTableData';
import { Toaster } from '@/components/ui/toaster';
import { ThemeSelector } from '@/components/ThemeSelector';
import { ColumnSettings } from '@/components/ColumnSettings';
import { TableControls } from '@/components/TableControls';
import { DataTable } from '@/components/DataTable';
import { Theme, themes } from '@/types/theme';

type CellValue = string | number;
type TableData = CellValue[][];

interface Column {
  id: string;
  name: string;
  width: number;
  visible: boolean;
}

const AdvancedTable: React.FC = () => {
  const { 
    data, 
    columns, 
    isLoading, 
    updateData, 
    updateColumns, 
    updateBoth,
    setColumns 
  } = useTableData();

  const [editingCell, setEditingCell] = useState<{row: number, col: number} | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [resizingColumn, setResizingColumn] = useState<number | null>(null);
  const [resizeStart, setResizeStart] = useState<{x: number, width: number} | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
        
        {/* File Input (hidden) */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileImport}
          accept=".xlsx,.xls,.txt"
          className="hidden"
        />

        {/* Controls */}
        <TableControls
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          currentTheme={currentTheme}
          onFileImport={() => fileInputRef.current?.click()}
          onAddColumn={addColumn}
          onAddRow={addRow}
          onExport={exportToExcel}
          showColumnSettings={showColumnSettings}
          onToggleColumnSettings={() => setShowColumnSettings(!showColumnSettings)}
        />

        {/* Column Settings Panel */}
        {showColumnSettings && (
          <ColumnSettings
            columns={columns}
            currentTheme={currentTheme}
            onColumnsUpdate={updateColumns}
          />
        )}
      </div>

      {/* Table */}
      <DataTable
        data={filteredData}
        columns={columns}
        currentTheme={currentTheme}
        editingCell={editingCell}
        editValue={editValue}
        onStartEditing={startEditing}
        onEditValueChange={setEditValue}
        onSaveEdit={saveEdit}
        onCancelEdit={cancelEdit}
        onDeleteRow={deleteRow}
        onColumnResize={handleMouseDown}
      />

      {/* Theme Selector */}
      <ThemeSelector
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
        showThemeSelector={showThemeSelector}
        setShowThemeSelector={setShowThemeSelector}
      />

      {/* Stats */}
      <div className={cn("mt-6 text-sm", currentTheme.colors.text)}>
        <p>סך הכל: {filteredData.length - 1} שורות | {columns.filter(col => col.visible).length} עמודות נראות</p>
      </div>
    </div>
  );
};

export default AdvancedTable;
