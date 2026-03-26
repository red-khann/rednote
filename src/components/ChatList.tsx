import React, { useState, useEffect } from 'react';
import { MessageCircle, Settings, LogOut, UserPlus } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import AddContact from '@/components/AddContact';

interface ChatListProps {
  onSelectChat: (contactUserId: string, name: string) => void;
  onOpenSettings: () => void;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectChat, onOpenSettings }) => {
  const { user, profile, contacts } = useApp();
  const [showAddContact, setShowAddContact] = useState(false);
  const [lastMessages, setLastMessages] = useState<Record<string, { content: string; time: string; unread: number }>>({});

  // Fetch last messages for each contact
  useEffect(() => {
    if (!user || contacts.length === 0) return;

    const fetchLastMessages = async () => {
      const msgs: Record<string, { content: string; time: string; unread: number }> = {};
      
      for (const contact of contacts) {
        const { data } = await supabase
          .from('messages')
          .select('content, created_at, sender_id, status')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${contact.contact_user_id}),and(sender_id.eq.${contact.contact_user_id},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: false })
          .limit(1);

        if (data && data.length > 0) {
          const msg = data[0];
          // Count unread
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('sender_id', contact.contact_user_id)
            .eq('receiver_id', user.id)
            .neq('status', 'seen');

          msgs[contact.contact_user_id] = {
            content: msg.content,
            time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unread: count || 0,
          };
        }
      }
      setLastMessages(msgs);
    };

    fetchLastMessages();

    // Subscribe to new messages for live updates
    const channel = supabase
      .channel('chat-list-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`,
      }, () => {
        fetchLastMessages();
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${user.id}`,
      }, () => {
        fetchLastMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, contacts]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (showAddContact) {
    return <AddContact onClose={() => setShowAddContact(false)} />;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">Chats</h1>
        <div className="flex gap-1">
          <button onClick={() => setShowAddContact(true)} className="p-2 text-muted-foreground hover:text-primary transition-colors">
            <UserPlus size={20} />
          </button>
          <button onClick={onOpenSettings} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Settings size={20} />
          </button>
          <button onClick={handleLogout} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </div>
      <p className="px-4 py-2 text-xs text-muted-foreground">
        @{profile?.username} • {user?.email}
      </p>
      <div className="flex-1 overflow-y-auto">
        {contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-6">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageCircle className="text-muted-foreground" size={24} />
            </div>
            <p className="text-muted-foreground text-sm">No contacts yet</p>
            <button
              onClick={() => setShowAddContact(true)}
              className="text-primary text-sm font-semibold mt-2"
            >
              Add someone by username
            </button>
          </div>
        ) : (
          contacts.map((contact) => {
            const last = lastMessages[contact.contact_user_id];
            const name = contact.profile?.display_name || contact.profile?.username || 'Unknown';
            return (
              <button
                key={contact.id}
                onClick={() => onSelectChat(contact.contact_user_id, name)}
                className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors border-b border-border/50"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold text-sm">
                      {name[0].toUpperCase()}
                    </span>
                  </div>
                  {contact.profile?.is_online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{name}</span>
                    {last && <span className="text-xs text-muted-foreground">{last.time}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {last?.content || 'Start chatting...'}
                  </p>
                </div>
                {last && last.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary-foreground">{last.unread}</span>
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;
