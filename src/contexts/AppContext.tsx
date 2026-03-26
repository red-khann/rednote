import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AppContextType {
  secretPass: string;
  setSecretPass: (pass: string) => void;
  isSecretUnlocked: boolean;
  setIsSecretUnlocked: (unlocked: boolean) => void;
  disguiseMode: boolean;
  setDisguiseMode: (mode: boolean) => void;
  user: User | null;
  loading: boolean;
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

  const setSecretPass = (pass: string) => {
    setSecretPassState(pass);
    localStorage.setItem('rednote_pass', pass);
  };

  const setDisguiseMode = (mode: boolean) => {
    setDisguiseModeState(mode);
    localStorage.setItem('rednote_disguise', String(mode));
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AppContext.Provider value={{
      secretPass, setSecretPass,
      isSecretUnlocked, setIsSecretUnlocked,
      disguiseMode, setDisguiseMode,
      user, loading
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
