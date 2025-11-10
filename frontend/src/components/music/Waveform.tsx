import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface WaveformProps {
  audioUrl?: string;
  audioFile?: File;
  height?: number;
  waveColor?: string;
  progressColor?: string;
  cursorColor?: string;
  onReady?: (duration: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onSeek?: (time: number) => void;
  interactive?: boolean;
}

const Waveform = ({
  audioUrl,
  audioFile,
  height = 128,
  waveColor = 'hsl(var(--muted))',
  progressColor = 'hsl(var(--primary))',
  cursorColor = 'hsl(var(--primary))',
  onReady,
  onPlay,
  onPause,
  onSeek,
  interactive = true,
}: WaveformProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize wavesurfer
    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor,
      progressColor,
      cursorColor,
      height,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      cursorWidth: 2,
      normalize: true,
      interact: interactive,
    });

    wavesurferRef.current = wavesurfer;

    // Event listeners
    wavesurfer.on('ready', () => {
      setIsLoading(false);
      if (onReady) {
        onReady(wavesurfer.getDuration());
      }
    });

    wavesurfer.on('error', (err) => {
      setIsLoading(false);
      // Ignore abort errors (happens during cleanup)
      if (err.name === 'AbortError') {
        console.log('Waveform loading was aborted (normal during cleanup)');
        return;
      }
      setError('Failed to load audio');
      console.error('Wavesurfer error:', err);
    });

    wavesurfer.on('play', () => {
      if (onPlay) onPlay();
    });

    wavesurfer.on('pause', () => {
      if (onPause) onPause();
    });

    wavesurfer.on('seeking', (time) => {
      if (onSeek) onSeek(time);
    });

    // Load audio
    if (audioUrl) {
      wavesurfer.load(audioUrl).catch(err => {
        // Ignore abort errors
        if (err.name !== 'AbortError') {
          console.error('Failed to load audio:', err);
        }
      });
    } else if (audioFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          wavesurfer.load(e.target.result as string).catch(err => {
            if (err.name !== 'AbortError') {
              console.error('Failed to load audio:', err);
            }
          });
        }
      };
      reader.onerror = () => {
        console.error('Failed to read audio file');
      };
      reader.readAsDataURL(audioFile);
    }

    return () => {
      wavesurfer.destroy();
    };
  }, [audioUrl, audioFile, height, waveColor, progressColor, cursorColor, interactive, onReady, onPlay, onPause, onSeek]);

  // Expose methods to parent via ref
  useEffect(() => {
    if (!wavesurferRef.current) return;

    // Attach methods to the component instance
    (containerRef.current as any).__wavesurfer = wavesurferRef.current;
  }, []);

  if (error) {
    return (
      <div
        className="flex items-center justify-center bg-secondary/50 rounded"
        style={{ height: `${height}px` }}
      >
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-secondary/50 rounded z-10"
          style={{ height: `${height}px` }}
        >
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
      <div ref={containerRef} className="rounded overflow-hidden" />
    </div>
  );
};

export default Waveform;

// Export helper to get wavesurfer instance from ref
export const getWavesurferInstance = (ref: React.RefObject<HTMLDivElement>): WaveSurfer | null => {
  return (ref.current as any)?.__wavesurfer || null;
};
