import { useState, useEffect } from 'react';
import { Wand2, Music, Loader2 } from 'lucide-react';
import apiClient from '../lib/axios';
import { LoadingSpinner } from '../components/ui';
import { toast } from 'sonner';

const Mixer = () => {
  const [tracks, setTracks] = useState<any[]>([]);
  const [selectedTrack, setSelectedTrack] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [enhancedUrl, setEnhancedUrl] = useState('');

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    try {
      const { data } = await apiClient.get('/music');
      setTracks(data.tracks || data || []);
    } catch (error) {
      console.error('Failed to fetch tracks');
    }
  };

  const handleEnhance = async () => {
    if (!selectedTrack) {
      toast.error('Please select a track');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setEnhancedUrl('');

    try {
      const { data } = await apiClient.post('/mix/enhance', { trackId: selectedTrack });
      const jobId = data.jobId || data._id;
      
      // Poll for job status
      const pollInterval = setInterval(async () => {
        try {
          const { data: status } = await apiClient.get(`/mix/jobs/${jobId}`);
          
          if (status.status === 'completed') {
            clearInterval(pollInterval);
            setIsProcessing(false);
            setProgress(100);
            const base = (import.meta as any).env?.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:8085';
            const url = (status.resultUrl && status.resultUrl.startsWith('http')) ? status.resultUrl : `${base}${status.resultUrl || ''}`;
            setEnhancedUrl(url);
            toast.success('Audio enhanced successfully!');
          } else if (status.status === 'failed') {
            clearInterval(pollInterval);
            setIsProcessing(false);
            toast.error('Enhancement failed');
          } else {
            setProgress(status.progress || 50);
          }
        } catch (err) {
          clearInterval(pollInterval);
          setIsProcessing(false);
          toast.error('Failed to check status');
        }
      }, 2000);

      // Timeout after 60 seconds
      setTimeout(() => {
        clearInterval(pollInterval);
        if (isProcessing) {
          setIsProcessing(false);
          toast.error('Enhancement timed out');
        }
      }, 60000);
    } catch (error: any) {
      setIsProcessing(false);
      toast.error(error.response?.data?.message || 'Enhancement failed');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold mb-2">AI Mixer</h1>
        <p className="text-muted-foreground">Enhance your audio with AI-powered processing</p>
      </div>

      <div className="bg-card border rounded-lg p-8 space-y-6 ">
        {/* Track Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Select Track</label>
          <select
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
            className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary     bg-black"
            disabled={isProcessing}
          >
            <option value="">Choose a track...</option>
            {tracks.map((track) => (
              <option key={track._id} value={track._id}>
                {track.title} - {track.artist}
              </option>
            ))}
          </select>
        </div>

        {/* Enhancement Options */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Enhancement Options</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm">Auto-mix (balance levels)</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm">Loudness optimization</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm">Noise reduction</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Vocal enhancement</span>
            </label>
          </div>
        </div>

        {/* Process Button */}
        <button
          onClick={handleEnhance}
          disabled={isProcessing || !selectedTrack}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing... {progress}%
            </>
          ) : (
            <>
              <Wand2 className="h-5 w-5" />
              Enhance Audio
            </>
          )}
        </button>

        {/* Progress Bar */}
        {isProcessing && (
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Enhanced Audio Player */}
        {enhancedUrl && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Enhanced Audio</h3>
            <audio
              src={enhancedUrl}
              controls
              className="w-full"
            />
            <div className="flex gap-3 mt-4">
              <a
                href={enhancedUrl}
                download
                className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition"
              >
                Download
              </a>
              <button
                onClick={() => toast.success('Save feature coming soon!')}
                className="px-4 py-2 border border-input rounded-lg hover:bg-secondary transition"
              >
                Save to Library
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-lg">
        <h3 className="font-semibold mb-2">🎵 AI-Powered Audio Enhancement</h3>
        <p className="text-sm text-muted-foreground">
          Our AI mixer automatically optimizes your audio with professional-grade processing.
          It balances levels, reduces noise, and enhances clarity - all in seconds.
        </p>
      </div>
    </div>
  );
};

export default Mixer;
