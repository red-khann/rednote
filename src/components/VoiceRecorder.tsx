import React, { useState, useRef, useCallback } from 'react';
import { Mic, Send, X } from 'lucide-react';

interface VoiceRecorderProps {
  onSend: (blob: Blob, duration: number) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSend }) => {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recorded, setRecorded] = useState<Blob | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTime = useRef(0);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorder.current = recorder;
      chunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        setRecorded(blob);
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      startTime.current = Date.now();
      setRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime.current) / 1000));
      }, 200);
    } catch {
      console.error('Microphone access denied');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current?.state === 'recording') {
      mediaRecorder.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
  }, []);

  const handleSend = () => {
    if (recorded) {
      onSend(recorded, duration);
      setRecorded(null);
      setDuration(0);
    }
  };

  const handleCancel = () => {
    if (recording) stopRecording();
    setRecorded(null);
    setDuration(0);
  };

  const formatDuration = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (recorded) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-full">
        <button onClick={handleCancel} className="text-destructive p-1">
          <X size={18} />
        </button>
        <div className="flex-1 flex items-center gap-2">
          <div className="flex gap-0.5 items-end h-5">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="w-1 bg-primary rounded-full"
                style={{ height: `${Math.random() * 16 + 4}px` }}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">{formatDuration(duration)}</span>
        </div>
        <button onClick={handleSend} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Send className="text-primary-foreground" size={14} />
        </button>
      </div>
    );
  }

  if (recording) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-destructive/10 rounded-full">
        <button onClick={handleCancel} className="text-destructive p-1">
          <X size={18} />
        </button>
        <div className="flex-1 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          <span className="text-sm text-destructive font-medium">Recording {formatDuration(duration)}</span>
        </div>
        <button onClick={stopRecording} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Send className="text-primary-foreground" size={14} />
        </button>
      </div>
    );
  }

  return (
    <button
      onMouseDown={startRecording}
      onTouchStart={startRecording}
      className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 hover:bg-muted/80 transition-colors"
    >
      <Mic className="text-muted-foreground" size={18} />
    </button>
  );
};

export default VoiceRecorder;
