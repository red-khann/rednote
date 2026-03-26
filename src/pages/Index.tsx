import React, { useState, useEffect } from 'react';
import { Plus, Search, Settings, Trash2 } from 'lucide-react';
import NoteCard from '@/components/NoteCard';
import NoteEditor from '@/components/NoteEditor';
import SecretPassSetup from '@/components/SecretPassSetup';
import UsernameSetup from '@/components/UsernameSetup';
import ChatList from '@/components/ChatList';
import ChatRoom from '@/components/ChatRoom';
import ChatSettings from '@/components/ChatSettings';
import NotesSettings, { SortOrder, FontSize, NoteColor } from '@/components/NotesSettings';
import RecycleBin from '@/components/RecycleBin';
import Auth from '@/pages/Auth';
import { useApp } from '@/contexts/AppContext';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt?: number;
  color?: NoteColor;
}

interface DeletedNote extends Note {
  deletedAt: number;
}

type NotesView = 'list' | 'edit' | 'settings' | 'trash';
type ChatView = 'list' | 'room' | 'settings';

const THIRTY_DAYS = 30 * 86400000;

const Index: React.FC = () => {
  const { secretPass, isSecretUnlocked, setIsSecretUnlocked, disguiseMode, user, loading, profile } = useApp();

  // Notes state
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('rednote_notes');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Welcome to RedNote', content: 'Your simple and clean notes app. Create notes, organize thoughts, and stay productive.', createdAt: Date.now() - 86400000 },
      { id: '2', title: 'Shopping List', content: 'Milk\nEggs\nBread\nButter\nCoffee', createdAt: Date.now() - 3600000 },
    ];
  });
  const [deletedNotes, setDeletedNotes] = useState<DeletedNote[]>(() => {
    const saved = localStorage.getItem('rednote_trash');
    return saved ? JSON.parse(saved) : [];
  });
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [notesView, setNotesView] = useState<NotesView>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>(() =>
    (localStorage.getItem('rednote_sort') as SortOrder) || 'newest'
  );
  const [fontSize, setFontSize] = useState<FontSize>(() =>
    (localStorage.getItem('rednote_fontsize') as FontSize) || 'medium'
  );

  // Chat state
  const [chatView, setChatView] = useState<ChatView>('list');
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
  const [activeChatName, setActiveChatName] = useState<string>('');

  // Persist
  useEffect(() => { localStorage.setItem('rednote_notes', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem('rednote_trash', JSON.stringify(deletedNotes)); }, [deletedNotes]);
  useEffect(() => { localStorage.setItem('rednote_sort', sortOrder); }, [sortOrder]);
  useEffect(() => { localStorage.setItem('rednote_fontsize', fontSize); }, [fontSize]);

  // Auto-purge trash older than 30 days
  useEffect(() => {
    const now = Date.now();
    setDeletedNotes(prev => prev.filter(n => now - n.deletedAt < THIRTY_DAYS));
  }, []);

  useEffect(() => {
    if (!disguiseMode && user && !loading) {
      setIsSecretUnlocked(true);
    }
  }, [disguiseMode, user, loading, setIsSecretUnlocked]);

  const handleSaveNote = (noteData: { id?: string; title: string; content: string; color?: NoteColor }) => {
    if (!noteData.title && !noteData.content) return;
    setNotes(prev => {
      if (noteData.id) {
        return prev.map(n => n.id === noteData.id ? { ...n, title: noteData.title, content: noteData.content, color: noteData.color, updatedAt: Date.now() } : n);
      }
      return [{ id: Date.now().toString(), title: noteData.title, content: noteData.content, createdAt: Date.now(), updatedAt: Date.now(), color: noteData.color }, ...prev];
    });
  };

  const handleDeleteNote = (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      setDeletedNotes(prev => [...prev, { ...note, deletedAt: Date.now() }]);
      setNotes(prev => prev.filter(n => n.id !== id));
    }
  };

  const handleRestore = (id: string) => {
    const note = deletedNotes.find(n => n.id === id);
    if (note) {
      const { deletedAt, ...restored } = note;
      setNotes(prev => [restored, ...prev]);
      setDeletedNotes(prev => prev.filter(n => n.id !== id));
    }
  };

  const handlePermanentDelete = (id: string) => {
    setDeletedNotes(prev => prev.filter(n => n.id !== id));
  };

  // Sort notes
  const sortedNotes = [...notes].sort((a, b) => {
    switch (sortOrder) {
      case 'oldest': return a.createdAt - b.createdAt;
      case 'title': return (a.title || '').localeCompare(b.title || '');
      case 'edited': return (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt);
      default: return b.createdAt - a.createdAt;
    }
  });

  const filteredNotes = sortedNotes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fontSizeClass = fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-base' : 'text-sm';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // SECRET LAYER
  if (isSecretUnlocked) {
    if (!secretPass) return <SecretPassSetup onComplete={() => {}} />;
    if (!user) return <Auth />;
    if (!profile) return <UsernameSetup />;
    return (
      <div className="chat-theme min-h-screen bg-background">
        <div className="max-w-lg mx-auto h-screen">
          {chatView === 'list' && (
            <ChatList
              onSelectChat={(contactUserId, name) => {
                setActiveChatUserId(contactUserId);
                setActiveChatName(name);
                setChatView('room');
              }}
              onOpenSettings={() => setChatView('settings')}
            />
          )}
          {chatView === 'room' && activeChatUserId && (
            <ChatRoom
              contactUserId={activeChatUserId}
              contactName={activeChatName}
              onBack={() => { setChatView('list'); setActiveChatUserId(null); }}
            />
          )}
          {chatView === 'settings' && (
            <ChatSettings onBack={() => setChatView('list')} />
          )}
        </div>
      </div>
    );
  }

  // NOTES LAYER
  if (notesView === 'edit') {
    return (
      <div className="max-w-lg mx-auto h-screen">
        <NoteEditor
          note={editingNote}
          onSave={handleSaveNote}
          onDelete={handleDeleteNote}
          onBack={() => { setNotesView('list'); setEditingNote(null); }}
        />
      </div>
    );
  }

  if (notesView === 'settings') {
    return (
      <div className="max-w-lg mx-auto h-screen">
        <NotesSettings
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          fontSize={fontSize}
          setFontSize={setFontSize}
          onBack={() => setNotesView('list')}
        />
      </div>
    );
  }

  if (notesView === 'trash') {
    return (
      <div className="max-w-lg mx-auto h-screen">
        <RecycleBin
          deletedNotes={deletedNotes}
          onRestore={handleRestore}
          onPermanentDelete={handlePermanentDelete}
          onBack={() => setNotesView('list')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto p-4">
        <div className="flex items-center justify-between mb-6 pt-2">
          <h1 className="text-3xl font-bold text-foreground">Notes</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setNotesView('trash')}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
            >
              <Trash2 className="text-muted-foreground" size={18} />
            </button>
            <button
              onClick={() => setNotesView('settings')}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
            >
              <Settings className="text-muted-foreground" size={18} />
            </button>
            <button
              onClick={() => { setEditingNote(null); setNotesView('edit'); }}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center note-shadow"
            >
              <Plus className="text-primary-foreground" size={22} />
            </button>
          </div>
        </div>

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

        <div className="space-y-3">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              title={note.title}
              content={note.content}
              date={new Date(note.createdAt).toLocaleDateString()}
              color={note.color}
              fontSize={fontSizeClass}
              onClick={() => { setEditingNote(note); setNotesView('edit'); }}
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
