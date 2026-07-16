import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, X, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const FileUpload = ({
  onFileSelect,
  accept = '.pdf,.doc,.docx,.csv',
  maxSizeMB = 5,
  label = 'Upload attachments or CSV files',
  sublabel = 'Drag & drop your files here, or click to browse',
  className = ''
}) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file) => {
    setError('');
    if (!file) return;

    // Check file size
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSizeMB) {
      setError(`File size exceeds the ${maxSizeMB}MB limit.`);
      return;
    }

    // Check extension
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    const acceptedExtensions = accept.split(',').map(ext => ext.trim());
    if (accept !== '*' && !acceptedExtensions.includes(extension)) {
      setError(`Unsupported file type. Accepted extensions: ${accept}`);
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress using a local tracking variable to prevent React StrictMode double-execution bug
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        if (onFileSelect) {
          onFileSelect(file);
        }
        // Reset the upload dropzone state so the file is not shown twice
        setSelectedFile(null);
        setUploadProgress(0);
      } else {
        setUploadProgress(currentProgress);
      }
    }, 150);
  };

  const onDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileSelect) {
      onFileSelect(null);
    }
  };

  const triggerInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {!selectedFile ? (
        <motion.div
          onClick={triggerInput}
          onDragEnter={onDrag}
          onDragOver={onDrag}
          onDragLeave={onDrag}
          onDrop={onDrop}
          whileHover={{ scale: 1.005 }}
          className={`w-full p-8 rounded-card border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 cursor-pointer text-center
            ${dragActive
              ? 'border-primary bg-primary/5 dark:bg-primary/5'
              : 'border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/10'
            }`}
        >
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-primary rounded-full">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {label}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {sublabel}
            </span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-medium">
            Max file size {maxSizeMB}MB
          </span>
        </motion.div>
      ) : (
        <div className="w-full p-4 rounded-card border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                {selectedFile.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </span>
                {isUploading && (
                  <span className="text-xs text-primary font-medium animate-pulse">
                    Uploading ({uploadProgress}%)
                  </span>
                )}
              </div>
              {isUploading && (
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
          <button
            onClick={removeFile}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-danger mt-2.5">
          <AlertCircle className="w-4 h-4" />
          <span className="text-xs font-semibold">{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
