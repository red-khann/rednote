import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import NoteCard from '@/components/NoteCard';
import NoteEditor from '@/components/NoteEditor';
import SecretPassSetup from '@/components/SecretPassSetup';
import ChatList from '@/components/ChatList';
import ChatRoom from '@/components/ChatRoom';
import ChatSettings from '@/components/ChatSettings';
import Auth from '@/pages/Auth';
import { useApp } from '@/contexts/AppContext';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

type ChatView = 'list' | 'room' | 'settings';

const Index: React.FC = () => {
  const { secretPass, isSecretUnlocked, setIsSecretUnlocked, disguiseMode, user, loading } = useApp();
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('rednote_notes');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Welcome to RedNote', content: 'Your simple and clean notes app. Create notes, organize thoughts, and stay productive.', createdAt: Date.now() - 86400000 },
      { id: '2', title: 'Shopping List', content: 'Milk\nEggs\nBread\nButter\nCoffee', createdAt: Date.now() - 3600000 },
    ];
  });
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Chat state
  const [chatView, setChatView] = useState<ChatView>('list');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('rednote_notes', JSON.stringify(notes));
  }, [notes]);

  // If disguise mode is off and user is authenticated, go straight to chat
  useEffect(() => {
    if (!disguiseMode && user && !loading) {
      setIsSecretUnlocked(true);
    }
  }, [disguiseMode, user, loading, setIsSecretUnlocked]);

  const handleSaveNote = (noteData: { id?: string; title: string; content: string }) => {
    if (!noteData.title && !noteData.content) return;
    setNotes(prev => {
      if (noteData.id) {
        return prev.map(n => n.id === noteData.id ? { ...n, ...noteData } : n);
      }
      return [{ id: Date.now().toString(), ...noteData, createdAt: Date.now() }, ...prev];
    });
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // SECRET LAYER: Chat interface
  if (isSecretUnlocked) {
    // Need to set up secret pass first
    if (!secretPass) {
      return <SecretPassSetup onComplete={() => {}} />;
    }

    // Need to authenticate
    if (!user) {
      return <Auth />;
    }

    // Chat interface
    return (
      <div className="chat-theme min-h-screen bg-background">
        <div className="max-w-lg mx-auto h-screen">
          {chatView === 'list' && (
            <ChatList
              onSelectChat={(id) => { setActiveChatId(id); setChatView('room'); }}
              onOpenSettings={() => setChatView('settings')}
            />
          )}
          {chatView === 'room' && activeChatId && (
            <ChatRoom
              chatId={activeChatId}
              onBack={() => { setChatView('list'); setActiveChatId(null); }}
            />
          )}
          {chatView === 'settings' && (
            <ChatSettings onBack={() => setChatView('list')} />
          )}
        </div>
      </div>
    );
  }

  // NOTES LAYER: Normal notes interface
  if (isEditing) {
    return (
      <div className="max-w-lg mx-auto h-screen">
        <NoteEditor
          note={editingNote}
          onSave={handleSaveNote}
          onDelete={handleDeleteNote}
          onBack={() => { setIsEditing(false); setEditingNote(null); }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-2">
          <h1 className="text-3xl font-bold text-foreground">Notes</h1>
          <button
            onClick={() => { setEditingNote(null); setIsEditing(true); }}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center note-shadow"
          >
            <Plus className="text-primary-foreground" size={22} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground border-none outline-none text-sm"
          />
        </div>

        {/* Notes Grid */}
        <div className="space-y-3">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              title={note.title}
              content={note.content}
              date={new Date(note.createdAt).toLocaleDateString()}
              onClick={() => { setEditingNote(note); setIsEditing(true); }}
            />
          ))}
          {filteredNotes.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              {searchQuery ? 'No notes found' : 'No notes yet. Create one!'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
