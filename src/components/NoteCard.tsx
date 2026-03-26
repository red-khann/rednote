import React from 'react';

interface NoteCardProps {
  title: string;
  content: string;
  date: string;
  onClick: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ title, content, date, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 bg-card rounded-lg note-shadow hover:scale-[1.02] transition-transform duration-200 border border-border/50"
    >
      <h3 className="font-semibold text-card-foreground truncate">{title || 'Untitled'}</h3>
      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{content || 'No content'}</p>
      <p className="text-xs text-muted-foreground/60 mt-2">{date}</p>
    </button>
  );
};

export default NoteCard;
