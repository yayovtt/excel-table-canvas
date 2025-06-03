
import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Theme } from '@/types/theme';

interface ConnectionStatusProps {
  isConnected: boolean;
  currentTheme: Theme;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  currentTheme
}) => {
  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
      currentTheme.colors.accent,
      currentTheme.colors.text
    )}>
      {isConnected ? (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          <span>מחובר - עדכונים בזמן אמת</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-500" />
          <span>לא מחובר</span>
        </>
      )}
    </div>
  );
};
