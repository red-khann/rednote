import React, { useState } from 'react';
import { User, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

const UsernameSetup: React.FC = () => {
  const { user, setProfile } = useApp();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const trimmed = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(trimmed)) {
      setError('Username must be 3-20 chars: lowercase letters, numbers, underscores');
      return;
    }

    setLoading(true);
    setError('');

    const { data, error: dbError } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        username: trimmed,
        display_name: displayName.trim() || trimmed,
      })
      .select()
      .single();

    if (dbError) {
      if (dbError.code === '23505') {
        setError('Username already taken');
      } else {
        setError(dbError.message);
      }
      setLoading(false);
      return;
    }

    setProfile(data as any);
    toast.success('Profile created!');
    setLoading(false);
  };

  return (
    <div className="chat-theme min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
            <User className="text-primary" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Choose Your Username</h1>
          <p className="text-muted-foreground text-center mt-2 text-sm">
            Others will find you by this name
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="username"
              value={username}
              onChange={(e) => { setUsername(e.target.value.toLowerCase()); setError(''); }}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground border border-border outline-none focus:ring-2 focus:ring-primary/50"
              maxLength={20}
            />
          </div>
          <input
            type="text"
            placeholder="Display name (optional)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground border border-border outline-none focus:ring-2 focus:ring-primary/50"
            maxLength={50}
          />
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-base font-semibold">
            {loading ? 'Creating...' : 'Continue'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UsernameSetup;
