import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface Note {
  id: string;
  title: string;
  content: string;
}

interface NoteEditorProps {
  note: Note | null;
  onSave: (note: { id?: string; title: string; content: string }) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onDelete, onBack }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const { secretPass, setIsSecretUnlocked } = useApp();

  useEffect(() => {
    setTitle(note?.title || '');
    setContent(note?.content || '');
  }, [note]);

  const handleTitleBlur = () => {
    // Check if title matches secret pass
    if (secretPass && title.trim() === secretPass) {
      setIsSecretUnlocked(true);
      setTitle('');
      return;
    }
    handleSave();
  };

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return;
    onSave({ id: note?.id, title: title.trim(), content: content.trim() });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button onClick={() => { handleSave(); onBack(); }} className="text-primary p-1">
          <ArrowLeft size={24} />
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
          onBlur={handleSave}
          className="flex-1 bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground/50 leading-relaxed"
        />
      </div>
    </div>
  );
};

export default NoteEditor;
