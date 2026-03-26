import React from 'react';
import { ArrowLeft, RotateCcw, Trash2 } from 'lucide-react';

interface DeletedNote {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  deletedAt: number;
  color?: string;
}

interface RecycleBinProps {
  deletedNotes: DeletedNote[];
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onBack: () => void;
}

const RecycleBin: React.FC<RecycleBinProps> = ({ deletedNotes, onRestore, onPermanentDelete, onBack }) => {
  const daysLeft = (deletedAt: number) => {
    const elapsed = Date.now() - deletedAt;
    const remaining = 30 - Math.floor(elapsed / 86400000);
    return Math.max(0, remaining);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-primary p-1">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-foreground">Recycle Bin</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {deletedNotes.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Recycle bin is empty</p>
        ) : (
          deletedNotes.map((note) => (
            <div key={note.id} className="p-4 bg-card rounded-lg border border-border/50 space-y-2">
              <h3 className="font-semibold text-card-foreground truncate">{note.title || 'Untitled'}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{note.content || 'No content'}</p>
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-destructive">{daysLeft(note.deletedAt)} days left</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => onRestore(note.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <RotateCcw size={12} /> Restore
                  </button>
                  <button
                    onClick={() => onPermanentDelete(note.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecycleBin;
