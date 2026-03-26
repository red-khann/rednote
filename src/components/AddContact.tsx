import React, { useState } from 'react';
import { UserPlus, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

interface AddContactProps {
  onClose: () => void;
}

const AddContact: React.FC<AddContactProps> = ({ onClose }) => {
  const { user, refreshContacts, contacts } = useApp();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleSearch = async () => {
    if (!query.trim() || !user) return;
    setSearching(true);
    setResult(null);

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', query.trim().toLowerCase())
      .maybeSingle();

    if (!data) {
      toast.error('User not found');
    } else if (data.user_id === user.id) {
      toast.error("That's you!");
    } else {
      setResult(data);
    }
    setSearching(false);
  };

  const handleAdd = async () => {
    if (!result || !user) return;
    
    // Check if already a contact
    if (contacts.some(c => c.contact_user_id === result.user_id)) {
      toast.info('Already in your contacts');
      return;
    }

    setAdding(true);
    const { error } = await supabase
      .from('contacts')
      .insert({ user_id: user.id, contact_user_id: result.user_id });

    if (error) {
      if (error.code === '23505') {
        toast.info('Already in your contacts');
      } else {
        toast.error(error.message);
      }
    } else {
      // Also add reverse contact so both can see each other
      await supabase
        .from('contacts')
        .insert({ user_id: result.user_id, contact_user_id: user.id })
        .then(() => {}); // Ignore if already exists
      
      toast.success(`${result.display_name || result.username} added!`);
      await refreshContacts();
      onClose();
    }
    setAdding(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-bold text-foreground">Add Contact</h2>
        <button onClick={onClose} className="text-muted-foreground p-1">
          <X size={20} />
        </button>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Enter username..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground border border-border outline-none text-sm focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <Button onClick={handleSearch} disabled={searching} size="sm" className="rounded-xl px-4">
            {searching ? '...' : 'Find'}
          </Button>
        </div>

        {result && (
          <div className="bg-muted/50 rounded-xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold">
                {(result.display_name || result.username)[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">{result.display_name || result.username}</p>
              <p className="text-xs text-muted-foreground">@{result.username}</p>
            </div>
            <Button onClick={handleAdd} disabled={adding} size="sm" className="rounded-xl">
              <UserPlus size={16} />
              {adding ? '...' : 'Add'}
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Search for people by their exact username
        </p>
      </div>
    </div>
  );
};

export default AddContact;
