import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Check, CheckCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import VoiceRecorder from '@/components/VoiceRecorder';
import VoiceMessage from '@/components/VoiceMessage';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: string;
  status: string;
  created_at: string;
}

interface ChatRoomProps {
  contactUserId: string;
  contactName: string;
  onBack: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ contactUserId, contactName, onBack }) => {
  const { user } = useApp();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [contactOnline, setContactOnline] = useState(false);
  const [contactLastSeen, setContactLastSeen] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${contactUserId}),and(sender_id.eq.${contactUserId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();

    supabase.from('messages').update({ status: 'seen' })
      .eq('sender_id', contactUserId).eq('receiver_id', user.id).neq('status', 'seen').then(() => {});

    supabase.from('profiles').select('is_online, last_seen').eq('user_id', contactUserId).single()
      .then(({ data }) => {
        if (data) { setContactOnline(data.is_online || false); setContactLastSeen(data.last_seen); }
      });
  }, [user, contactUserId]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`chat-${user.id}-${contactUserId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new as Message;
        if ((msg.sender_id === user.id && msg.receiver_id === contactUserId) ||
            (msg.sender_id === contactUserId && msg.receiver_id === user.id)) {
          setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
          if (msg.sender_id === contactUserId) {
            supabase.from('messages').update({ status: 'seen' }).eq('id', msg.id).then(() => {});
          }
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
        const updated = payload.new as Message;
        setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
      })
      .subscribe();

    const profileChannel = supabase.channel(`profile-${contactUserId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `user_id=eq.${contactUserId}` }, (payload) => {
        const p = payload.new as any;
        setContactOnline(p.is_online || false);
        setContactLastSeen(p.last_seen);
      }).subscribe();

    return () => { supabase.removeChannel(channel); supabase.removeChannel(profileChannel); };
  }, [user, contactUserId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;
    const content = input.trim();
    setInput('');
    await supabase.from('messages').insert({ sender_id: user.id, receiver_id: contactUserId, content });
  };

  const handleVoiceSend = async (blob: Blob, duration: number) => {
    if (!user) return;
    const fileName = `${user.id}/${Date.now()}.webm`;
    const { error } = await supabase.storage.from('voice-messages').upload(fileName, blob, { contentType: 'audio/webm' });
    if (error) { console.error('Upload error:', error); return; }
    const { data: urlData } = supabase.storage.from('voice-messages').getPublicUrl(fileName);
    await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: contactUserId,
      content: JSON.stringify({ url: urlData.publicUrl, duration }),
      message_type: 'voice',
    });
  };

  const formatTime = (d: string) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const getStatusIcon = (status: string) => {
    if (status === 'seen') return <CheckCheck size={14} className="text-primary" />;
    if (status === 'delivered') return <CheckCheck size={14} className="text-muted-foreground" />;
    return <Check size={14} className="text-muted-foreground" />;
  };

  const getSubtitle = () => {
    if (contactOnline) return 'Online';
    if (contactLastSeen) {
      const diff = Date.now() - new Date(contactLastSeen).getTime();
      if (diff < 60000) return 'Last seen just now';
      if (diff < 3600000) return `Last seen ${Math.floor(diff / 60000)}m ago`;
      return `Last seen ${new Date(contactLastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return 'Offline';
  };

  const renderMessageContent = (msg: Message) => {
    const isSent = msg.sender_id === user?.id;
    if (msg.message_type === 'voice') {
      try {
        const { url, duration } = JSON.parse(msg.content);
        return <VoiceMessage audioUrl={url} duration={duration} isSent={isSent} />;
      } catch { return <p className="text-sm">Voice message</p>; }
    }
    return <p className="text-sm whitespace-pre-wrap">{msg.content}</p>;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-primary p-1"><ArrowLeft size={24} /></button>
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">{contactName[0].toUpperCase()}</span>
          </div>
          {contactOnline && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />}
        </div>
        <div>
          <h2 className="font-semibold text-foreground">{contactName}</h2>
          <p className={`text-xs ${contactOnline ? 'text-green-400' : 'text-muted-foreground'}`}>{getSubtitle()}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && <p className="text-center text-muted-foreground text-sm py-12">No messages yet. Say hi! 👋</p>}
        {messages.map((msg) => {
          const isSent = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                isSent ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted text-foreground rounded-bl-md'
              }`}>
                {renderMessageContent(msg)}
                <div className={`flex items-center gap-1 mt-1 ${isSent ? 'justify-end' : ''}`}>
                  <p className={`text-[10px] ${isSent ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>{formatTime(msg.created_at)}</p>
                  {isSent && getStatusIcon(msg.status)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2">
          <VoiceRecorder onSend={handleVoiceSend} />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-full bg-muted text-foreground placeholder:text-muted-foreground border-none outline-none text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${input.trim() ? 'bg-primary' : 'bg-muted'}`}
          >
            <Send className={input.trim() ? 'text-primary-foreground' : 'text-muted-foreground'} size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
