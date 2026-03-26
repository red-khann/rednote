import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  is_online: boolean | null;
  last_seen: string | null;
}

interface Contact {
  id: string;
  contact_user_id: string;
  profile: Profile;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: string;
  status: string;
  created_at: string;
}

interface AppContextType {
  secretPass: string;
  setSecretPass: (pass: string) => void;
  isSecretUnlocked: boolean;
  setIsSecretUnlocked: (unlocked: boolean) => void;
  disguiseMode: boolean;
  setDisguiseMode: (mode: boolean) => void;
  user: User | null;
  loading: boolean;
  profile: Profile | null;
  setProfile: (p: Profile | null) => void;
  contacts: Contact[];
  refreshContacts: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [secretPass, setSecretPassState] = useState(() =>
    localStorage.getItem('rednote_pass') || ''
  );
  const [isSecretUnlocked, setIsSecretUnlocked] = useState(false);
  const [disguiseMode, setDisguiseModeState] = useState(() =>
    localStorage.getItem('rednote_disguise') !== 'false'
  );
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);

  const setSecretPass = (pass: string) => {
    setSecretPassState(pass);
    localStorage.setItem('rednote_pass', pass);
  };

  const setDisguiseMode = (mode: boolean) => {
    setDisguiseModeState(mode);
    localStorage.setItem('rednote_disguise', String(mode));
  };

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    setProfile(data as Profile | null);
  }, []);

  const refreshContacts = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('contacts')
      .select('id, contact_user_id')
      .eq('user_id', user.id);
    
    if (data && data.length > 0) {
      const contactUserIds = data.map(c => c.contact_user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', contactUserIds);
      
      const contactList: Contact[] = data.map(c => ({
        id: c.id,
        contact_user_id: c.contact_user_id,
        profile: (profiles?.find(p => p.user_id === c.contact_user_id) || {}) as Profile,
      }));
      setContacts(contactList);
    } else {
      setContacts([]);
    }
  }, [user]);

  // Update online status
  const updateOnlineStatus = useCallback(async (online: boolean) => {
    if (!user) return;
    await supabase
      .from('profiles')
      .update({ is_online: online, last_seen: new Date().toISOString() })
      .eq('user_id', user.id);
  }, [user]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setContacts([]);
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });
    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // Online status management
  useEffect(() => {
    if (user && profile) {
      updateOnlineStatus(true);
      const interval = setInterval(() => updateOnlineStatus(true), 30000);
      const handleBeforeUnload = () => updateOnlineStatus(false);
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        clearInterval(interval);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        updateOnlineStatus(false);
      };
    }
  }, [user, profile, updateOnlineStatus]);

  // Fetch contacts when user is ready
  useEffect(() => {
    if (user && profile) {
      refreshContacts();
    }
  }, [user, profile, refreshContacts]);

  return (
    <AppContext.Provider value={{
      secretPass, setSecretPass,
      isSecretUnlocked, setIsSecretUnlocked,
      disguiseMode, setDisguiseMode,
      user, loading,
      profile, setProfile,
      contacts, refreshContacts,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
