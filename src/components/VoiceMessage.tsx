import React, { useState, useRef } from 'react';
import { Play, Pause } from 'lucide-react';

interface VoiceMessageProps {
  audioUrl: string;
  duration: number;
  isSent: boolean;
}

const VoiceMessage: React.FC<VoiceMessageProps> = ({ audioUrl, duration, isSent }) => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          setProgress(audioRef.current.currentTime / audioRef.current.duration);
        }
      };
      audioRef.current.onended = () => {
        setPlaying(false);
        setProgress(0);
      };
    }

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const formatDuration = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-2 min-w-[160px]">
      <button onClick={togglePlay} className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
        isSent ? 'bg-primary-foreground/20' : 'bg-primary/20'
      }`}>
        {playing
          ? <Pause size={14} className={isSent ? 'text-primary-foreground' : 'text-primary'} />
          : <Play size={14} className={isSent ? 'text-primary-foreground' : 'text-primary'} />
        }
      </button>
      <div className="flex-1 space-y-1">
        <div className="h-1 bg-current/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isSent ? 'bg-primary-foreground/60' : 'bg-primary/60'}`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className={`text-[10px] ${isSent ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
          {formatDuration(duration)}
        </p>
      </div>
    </div>
  );
};

export default VoiceMessage;
