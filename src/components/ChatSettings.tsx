import React, { useState } from 'react';
import { ArrowLeft, Shield, Eye, EyeOff, Key, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';

interface ChatSettingsProps {
  onBack: () => void;
}

const ChatSettings: React.FC<ChatSettingsProps> = ({ onBack }) => {
  const { secretPass, setSecretPass, disguiseMode, setDisguiseMode, profile } = useApp();
  const [newPass, setNewPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const handleChangePass = () => {
    if (newPass.trim().length >= 3) {
      setSecretPass(newPass.trim());
      setNewPass('');
      setChangingPass(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-primary p-1">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {/* Profile Info */}
        {profile && (
          <div className="bg-muted/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold text-lg">
                  {(profile.display_name || profile.username)[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-foreground">{profile.display_name || profile.username}</p>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <AtSign size={12} />
                  <span className="text-xs">{profile.username}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Disguise Mode */}
        <div className="bg-muted/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Shield className="text-primary" size={20} />
              </div>
              <div>
                <p className="font-semibold text-foreground">Disguise Mode</p>
                <p className="text-xs text-muted-foreground">
                  {disguiseMode ? 'App opens as Notes' : 'App opens as Chat'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setDisguiseMode(!disguiseMode)}
              className={`w-12 h-7 rounded-full transition-colors relative ${
                disguiseMode ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            >
              <div className={`absolute top-0.5 w-6 h-6 rounded-full transition-transform ${
                disguiseMode ? 'translate-x-5 bg-background' : 'translate-x-0.5 bg-foreground/80'
              }`} />
            </button>
          </div>
        </div>

        {/* Secret Pass */}
        <div className="bg-muted/50 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Key className="text-primary" size={20} />
            </div>
            <div>
              <p className="font-semibold text-foreground">Secret Pass</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground font-mono">
                  {showPass ? secretPass : '••••••'}
                </p>
                <button onClick={() => setShowPass(!showPass)} className="text-muted-foreground">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>
          
          {changingPass ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New pass (min 3 chars)"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-background text-foreground text-sm border border-border outline-none"
              />
              <Button onClick={handleChangePass} size="sm">Save</Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setChangingPass(true)} className="w-full">
              Change Pass
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSettings;
