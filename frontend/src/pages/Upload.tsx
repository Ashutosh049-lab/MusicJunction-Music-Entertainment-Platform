import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import FileUploader from '../components/music/FileUploader';
import Waveform from '../components/music/Waveform';
import apiClient from '../lib/axios';
import { useAuthStore } from '../store/authStore';

const uploadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  genre: z.string().min(1, 'Genre is required'),
  description: z.string().max(500, 'Description too long').optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;

const GENRES = [
  'Rock', 'Pop', 'Hip Hop', 'Electronic', 'Jazz', 'Classical',
  'R&B', 'Country', 'Metal', 'Indie', 'Blues', 'Reggae', 'Other'
];

const Upload = () => {
  const { user, isLoading } = useAuthStore();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
  });

  const handleFileSelect = (file: File) => {
    setAudioFile(file);
  };

  const handleFileRemove = () => {
    setAudioFile(null);
    setAudioDuration(0);
  };

  const onSubmit = async (data: UploadFormData) => {
    if (!audioFile) {
      toast.error('Please select an audio file');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('music', audioFile);
    formData.append('title', data.title);
    formData.append('artist', user?.name || user?.username || 'Unknown Artist');
    formData.append('genre', data.genre);
    if (data.description) {
      formData.append('description', data.description);
    }
    formData.append('duration', audioDuration.toString());

    try {
      const { data: response } = await apiClient.post('/music/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });

      toast.success('Track uploaded successfully!');
      reset();
      setAudioFile(null);
      setUploadProgress(0);
      navigate(`/track/${response.track?._id || response.track?.id || response._id || response.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== 'musician') {
    return (
      <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
        <h1 className="font-display text-3xl font-bold mb-3">Upload unavailable</h1>
        <p className="text-muted-foreground mb-6">Listeners cannot upload tracks. Switch to a musician account to upload.</p>
        <Link to="/dashboard" className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold mb-2">Upload Track</h1>
        <p className="text-muted-foreground">Share your music with the world</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* File Uploader */}
        <div>
          <label className="block text-sm font-medium mb-2">Audio File *</label>
          <FileUploader
            file={audioFile}
            onFileSelect={handleFileSelect}
            onRemove={handleFileRemove}
          />
        </div>

        {/* Waveform Preview */}
        {audioFile && (
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Preview</h3>
            <Waveform
              audioFile={audioFile}
              height={120}
              onReady={(duration) => setAudioDuration(duration)}
            />
          </div>
        )}

        {/* Track Details */}
        <div className="bg-card border rounded-lg p-6 space-y-6">
          <h3 className="font-semibold">Track Details</h3>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title *
            </label>
            <input
              id="title"
              {...register('title')}
              className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
              placeholder="My Awesome Track"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Genre */}
          <div>
            <label htmlFor="genre" className="block text-sm font-medium mb-2">
              Genre *
            </label>
            <select
              id="genre"
              {...register('genre')}
              className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
            >
              <option value="">Select a genre</option>
              {GENRES.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
            {errors.genre && (
              <p className="mt-1 text-sm text-destructive">{errors.genre.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              {...register('description')}
              rows={4}
              className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition resize-none"
              placeholder="Tell us about your track..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Uploading...</span>
              <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-input rounded-lg hover:bg-secondary transition"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!audioFile || isUploading}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <span>Upload Track</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Upload;
