
import React from 'react';
import { Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Theme, themes } from '@/types/theme';

interface ThemeSelectorProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  showThemeSelector: boolean;
  setShowThemeSelector: (show: boolean) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onThemeChange,
  showThemeSelector,
  setShowThemeSelector
}) => {
  return (
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
                    onThemeChange(theme);
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
  );
};
