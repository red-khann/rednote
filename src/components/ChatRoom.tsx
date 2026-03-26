import React, { useState } from 'react';
import { ArrowLeft, Send, Mic } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sent: boolean;
  time: string;
}

interface ChatRoomProps {
  chatId: string;
  onBack: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ chatId, onBack }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hey! How are you?', sent: false, time: '2:28 PM' },
    { id: '2', text: "I'm good! What's up?", sent: true, time: '2:29 PM' },
    { id: '3', text: 'Are you there?', sent: false, time: '2:30 PM' },
  ]);

  const chatNames: Record<string, string> = { '1': 'Alice', '2': 'Bob', '3': 'Secret Group' };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: input.trim(),
      sent: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-primary p-1">
          <ArrowLeft size={24} />
        </button>
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-primary font-bold text-sm">
            {(chatNames[chatId] || 'U')[0]}
          </span>
        </div>
        <div>
          <h2 className="font-semibold text-foreground">{chatNames[chatId] || 'Unknown'}</h2>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
              msg.sent
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'bg-muted text-foreground rounded-bl-md'
            }`}>
              <p className="text-sm">{msg.text}</p>
              <p className={`text-[10px] mt-1 ${msg.sent ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-full bg-muted text-foreground placeholder:text-muted-foreground border-none outline-none text-sm"
          />
          {input.trim() ? (
            <button onClick={handleSend} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Send className="text-primary-foreground" size={18} />
            </button>
          ) : (
            <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Mic className="text-muted-foreground" size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
