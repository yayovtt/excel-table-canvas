
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
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  // Load data from Supabase on component mount
  useEffect(() => {
    loadTableData();
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('table-data-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'table_data'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          
          if (payload.eventType === 'UPDATE' && payload.new) {
            const newData = Array.isArray(payload.new.data) ? payload.new.data as TableData : data;
            
            let newColumns = columns;
            if (Array.isArray(payload.new.columns)) {
              newColumns = (payload.new.columns as any[])
                .filter(col => col && typeof col === 'object' && col.id && col.name)
                .map(col => ({
                  id: String(col.id || ''),
                  name: String(col.name || ''),
                  width: Number(col.width) || 120,
                  visible: Boolean(col.visible !== false)
                }));
            }
            
            setData(newData);
            setColumns(newColumns);
            setTableId(payload.new.id);
            
            toast({
              title: "עדכון מרחוק",
              description: "הטבלה עודכנה על ידי משתמש אחר",
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
        
        if (status === 'SUBSCRIBED') {
          toast({
            title: "התחברות בוצעה",
            description: "מחובר לעדכונים בזמן אמת",
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [toast]);

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
        const loadedData = Array.isArray(tableData.data) ? tableData.data as TableData : data;
        
        let loadedColumns = columns;
        if (Array.isArray(tableData.columns)) {
          loadedColumns = (tableData.columns as any[])
            .filter(col => col && typeof col === 'object' && col.id && col.name)
            .map(col => ({
              id: String(col.id || ''),
              name: String(col.name || ''),
              width: Number(col.width) || 120,
              visible: Boolean(col.visible !== false)
            }));
        }
        
        setData(loadedData);
        setColumns(loadedColumns);
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
      const dataJson = JSON.parse(JSON.stringify(newData));
      const columnsJson = JSON.parse(JSON.stringify(newColumns.filter(col => col && col.id)));

      if (tableId) {
        const { error } = await supabase
          .from('table_data')
          .update({
            data: dataJson,
            columns: columnsJson,
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
        const { data: insertedData, error } = await supabase
          .from('table_data')
          .insert({
            data: dataJson,
            columns: columnsJson
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
        description: "הנתונים נשמרו ונשלחו לכל המשתמשים",
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
    const validColumns = newColumns.filter(col => col && col.id);
    setColumns(validColumns);
    saveTableData(data, validColumns);
  };

  const updateBoth = (newData: TableData, newColumns: Column[]) => {
    const validColumns = newColumns.filter(col => col && col.id);
    setData(newData);
    setColumns(validColumns);
    saveTableData(newData, validColumns);
  };

  return {
    data,
    columns: columns.filter(col => col && col.id),
    isLoading,
    isConnected,
    updateData,
    updateColumns,
    updateBoth,
    setData,
    setColumns: (newColumns: Column[]) => setColumns(newColumns.filter(col => col && col.id))
  };
};
