import React, { useState, useRef } from 'react';
import { ArrowLeft, Trash2, Palette } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { NOTE_COLORS, NoteColor } from '@/components/NotesSettings';

interface Note {
  id: string;
  title: string;
  content: string;
  color?: NoteColor;
}

interface NoteEditorProps {
  note: Note | null;
  onSave: (note: { id?: string; title: string; content: string; color?: NoteColor }) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onDelete, onBack }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [color, setColor] = useState<NoteColor>(note?.color || 'default');
  const [showColors, setShowColors] = useState(false);
  const { secretPass, setIsSecretUnlocked } = useApp();
  const savedRef = useRef(false);

  const save = () => {
    if (savedRef.current) return;
    if (!title.trim() && !content.trim()) return;
    savedRef.current = true;
    onSave({ id: note?.id, title: title.trim(), content: content.trim(), color });
  };

  const handleTitleBlur = () => {
    const trimmed = title.trim();
    if (!secretPass && trimmed === '#setup') {
      setIsSecretUnlocked(true);
      setTitle('');
      return;
    }
    if (secretPass && trimmed === secretPass) {
      setIsSecretUnlocked(true);
      setTitle('');
      return;
    }
  };

  const handleBack = () => {
    save();
    onBack();
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button onClick={handleBack} className="text-primary p-1">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowColors(!showColors)}
            className="text-muted-foreground p-1 hover:text-primary transition-colors"
          >
            <Palette size={20} />
          </button>
          {note?.id && (
            <button
              onClick={() => { onDelete(note.id); onBack(); }}
              className="text-destructive p-1"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </div>

      {showColors && (
        <div className="flex gap-2 px-4 py-3 border-b border-border overflow-x-auto">
          {(Object.keys(NOTE_COLORS) as NoteColor[]).map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full shrink-0 border-2 transition-transform ${
                color === c ? 'border-primary scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: NOTE_COLORS[c] }}
            />
          ))}
        </div>
      )}

      <div className="flex-1 flex flex-col p-4 gap-2">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          className="text-2xl font-bold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/50"
        />
        <textarea
          placeholder="Start writing..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground/50 leading-relaxed"
        />
      </div>
    </div>
  );
};

export default NoteEditor;
