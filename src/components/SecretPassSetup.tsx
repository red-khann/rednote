import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';

interface SecretPassSetupProps {
  onComplete: () => void;
}

const SecretPassSetup: React.FC<SecretPassSetupProps> = ({ onComplete }) => {
  const { setSecretPass } = useApp();
  const [pass, setPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass.length < 3) {
      setError('Pass must be at least 3 characters');
      return;
    }
    if (pass !== confirmPass) {
      setError('Passes do not match');
      return;
    }
    setSecretPass(pass);
    onComplete();
  };

  return (
    <div className="chat-theme min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
            <Lock className="text-primary" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Set Your Secret Pass</h1>
          <p className="text-muted-foreground text-center mt-2 text-sm">
            Type this as a note title to unlock your hidden chats
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Enter secret pass"
              value={pass}
              onChange={(e) => { setPass(e.target.value); setError(''); }}
              className="w-full px-4 py-3 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground border border-border outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <input
            type={showPass ? 'text' : 'password'}
            placeholder="Confirm secret pass"
            value={confirmPass}
            onChange={(e) => { setConfirmPass(e.target.value); setError(''); }}
            className="w-full px-4 py-3 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground border border-border outline-none focus:ring-2 focus:ring-primary/50"
          />
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold">
            Set Pass
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SecretPassSetup;
