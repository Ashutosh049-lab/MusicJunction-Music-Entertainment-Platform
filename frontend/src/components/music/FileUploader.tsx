import { useState, useCallback } from 'react';
import { Upload, X, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploaderProps {
  accept?: string;
  maxSize?: number; // in MB
  onFileSelect: (file: File) => void;
  onRemove?: () => void;
  file?: File | null;
}

const FileUploader = ({
  accept = 'audio/mpeg,audio/wav,audio/mp3',
  maxSize = 50,
  onFileSelect,
  onRemove,
  file,
}: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    setError(null);

    // Check file type
    const acceptedTypes = accept.split(',').map((type) => type.trim());
    const isValidType = acceptedTypes.some((type) => {
      if (type.includes('*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(baseType);
      }
      return file.type === type;
    });

    if (!isValidType) {
      setError('Invalid file type. Please upload an audio file.');
      return false;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setError(`File is too large. Maximum size is ${maxSize}MB.`);
      return false;
    }

    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      onFileSelect(file);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFile(droppedFile);
      }
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleRemove = () => {
    setError(null);
    if (onRemove) onRemove();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="uploader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-8 transition ${
              isDragging
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div
                className={`p-4 rounded-full transition ${
                  isDragging ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                }`}
              >
                <Upload className="h-8 w-8" />
              </div>

              <div>
                <p className="text-lg font-medium mb-1">
                  {isDragging ? 'Drop your file here' : 'Upload audio file'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Drag & drop or click to browse
                </p>
              </div>

              <div className="text-xs text-muted-foreground">
                <p>Supported formats: MP3, WAV</p>
                <p>Maximum size: {maxSize}MB</p>
              </div>

              <label className="inline-block">
                <input
                  type="file"
                  accept={accept}
                  onChange={handleInputChange}
                  className="hidden"
                />
                <span className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium cursor-pointer hover:bg-primary/90 transition inline-block">
                  Choose File
                </span>
              </label>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="border rounded-lg p-6 bg-card"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1 min-w-0">
                <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                  <Music className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemove}
                className="p-2 hover:bg-secondary rounded-lg transition flex-shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-destructive"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default FileUploader;
