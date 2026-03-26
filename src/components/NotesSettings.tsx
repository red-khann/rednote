import React from 'react';
import { ArrowLeft, Type, ArrowUpDown, Palette } from 'lucide-react';

export type SortOrder = 'newest' | 'oldest' | 'title' | 'edited';
export type FontSize = 'small' | 'medium' | 'large';
export type NoteColor = 'default' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink';

export const NOTE_COLORS: Record<NoteColor, string> = {
  default: 'hsl(40, 30%, 95%)',
  red: 'hsl(0, 70%, 94%)',
  orange: 'hsl(30, 80%, 93%)',
  yellow: 'hsl(50, 85%, 92%)',
  green: 'hsl(140, 50%, 92%)',
  blue: 'hsl(210, 60%, 93%)',
  purple: 'hsl(270, 50%, 93%)',
  pink: 'hsl(330, 60%, 94%)',
};

interface NotesSettingsProps {
  sortOrder: SortOrder;
  setSortOrder: (s: SortOrder) => void;
  fontSize: FontSize;
  setFontSize: (f: FontSize) => void;
  onBack: () => void;
}

const NotesSettings: React.FC<NotesSettingsProps> = ({ sortOrder, setSortOrder, fontSize, setFontSize, onBack }) => {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-primary p-1">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-foreground">Notes Settings</h1>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {/* Sort Order */}
        <div className="bg-secondary rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <ArrowUpDown className="text-primary" size={20} />
            </div>
            <p className="font-semibold text-foreground">Sort Order</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {([['newest', 'Newest First'], ['oldest', 'Oldest First'], ['title', 'By Title'], ['edited', 'Last Edited']] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSortOrder(key)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortOrder === key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div className="bg-secondary rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Type className="text-primary" size={20} />
            </div>
            <p className="font-semibold text-foreground">Font Size</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {([['small', 'Small'], ['medium', 'Medium'], ['large', 'Large']] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFontSize(key)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  fontSize === key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesSettings;
