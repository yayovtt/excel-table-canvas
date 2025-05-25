
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type CellValue = string | number;
type TableData = CellValue[][];

interface Column {
  id: string;
  name: string;
  width: number;
  visible: boolean;
}

export const useTableData = () => {
  const [data, setData] = useState<TableData>([
    ['שם', 'תפקיד', 'מחלקה', 'סטטוס', 'עדיפות'],
    ['אחמד כהן', 'מפתח', 'טכנולוגיה', 'פעיל', 'גבוהה'],
    ['שרה לוי', 'מעצבת', 'עיצוב', 'פעיל', 'בינונית'],
    ['יוסף אבידן', 'מנהל', 'ניהול', 'בחופשה', 'נמוכה'],
  ]);

  const [columns, setColumns] = useState<Column[]>([
    { id: '0', name: 'שם', width: 150, visible: true },
    { id: '1', name: 'תפקיד', width: 120, visible: true },
    { id: '2', name: 'מחלקה', width: 100, visible: true },
    { id: '3', name: 'סטטוס', width: 100, visible: true },
    { id: '4', name: 'עדיפות', width: 100, visible: true },
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [tableId, setTableId] = useState<string | null>(null);
  const { toast } = useToast();

  // Load data from Supabase on component mount
  useEffect(() => {
    loadTableData();
  }, []);

  const loadTableData = async () => {
    try {
      const { data: tableData, error } = await supabase
        .from('table_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error loading table data:', error);
        toast({
          title: "שגיאה בטעינת הנתונים",
          description: "לא ניתן לטעון את נתוני הטבלה",
          variant: "destructive",
        });
      } else if (tableData) {
        setData(tableData.data as TableData);
        setColumns(tableData.columns as Column[]);
        setTableId(tableData.id);
      }
    } catch (error) {
      console.error('Error loading table data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTableData = async (newData: TableData, newColumns: Column[]) => {
    try {
      if (tableId) {
        // Update existing record
        const { error } = await supabase
          .from('table_data')
          .update({
            data: newData,
            columns: newColumns,
            updated_at: new Date().toISOString()
          })
          .eq('id', tableId);

        if (error) {
          console.error('Error updating table data:', error);
          toast({
            title: "שגיאה בשמירה",
            description: "לא ניתן לשמור את השינויים",
            variant: "destructive",
          });
          return;
        }
      } else {
        // Create new record
        const { data: insertedData, error } = await supabase
          .from('table_data')
          .insert({
            data: newData,
            columns: newColumns
          })
          .select()
          .single();

        if (error) {
          console.error('Error inserting table data:', error);
          toast({
            title: "שגיאה בשמירה",
            description: "לא ניתן לשמור את הנתונים",
            variant: "destructive",
          });
          return;
        }

        setTableId(insertedData.id);
      }

      toast({
        title: "נשמר בהצלחה",
        description: "הנתונים נשמרו במסד הנתונים",
      });
    } catch (error) {
      console.error('Error saving table data:', error);
      toast({
        title: "שגיאה בשמירה",
        description: "אירעה שגיאה בלתי צפויה",
        variant: "destructive",
      });
    }
  };

  const updateData = (newData: TableData) => {
    setData(newData);
    saveTableData(newData, columns);
  };

  const updateColumns = (newColumns: Column[]) => {
    setColumns(newColumns);
    saveTableData(data, newColumns);
  };

  const updateBoth = (newData: TableData, newColumns: Column[]) => {
    setData(newData);
    setColumns(newColumns);
    saveTableData(newData, newColumns);
  };

  return {
    data,
    columns,
    isLoading,
    updateData,
    updateColumns,
    updateBoth,
    setData,
    setColumns
  };
};
