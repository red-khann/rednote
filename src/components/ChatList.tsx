import React from 'react';
import { MessageCircle, Settings, LogOut } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
}

interface ChatListProps {
  onSelectChat: (chatId: string) => void;
  onOpenSettings: () => void;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectChat, onOpenSettings }) => {
  const { user } = useApp();

  // Demo chats for v1
  const chats: Chat[] = [
    { id: '1', name: 'Alice', lastMessage: 'Hey, are you there?', time: '2:30 PM', unread: 2 },
    { id: '2', name: 'Bob', lastMessage: 'Check this out 🔥', time: '1:15 PM', unread: 0 },
    { id: '3', name: 'Secret Group', lastMessage: 'Meeting at 5', time: 'Yesterday', unread: 5 },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">Chats</h1>
        <div className="flex gap-2">
          <button onClick={onOpenSettings} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Settings size={20} />
          </button>
          <button onClick={handleLogout} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </div>
      <p className="px-4 py-2 text-xs text-muted-foreground">
        Logged in as {user?.email}
      </p>
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors border-b border-border/50"
          >
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <MessageCircle className="text-primary" size={20} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">{chat.name}</span>
                <span className="text-xs text-muted-foreground">{chat.time}</span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
            </div>
            {chat.unread > 0 && (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary-foreground">{chat.unread}</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
