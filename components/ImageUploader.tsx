'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  UploadCloud,
  ImageIcon,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Link as LinkIcon,
} from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  imageType: 'poster' | 'banner';
  videoId?: string;
  required?: boolean;
  helpText?: string;
}

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function ImageUploader({
  label,
  value,
  onChange,
  imageType,
  videoId,
  required = false,
  helpText,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showManualUrl, setShowManualUrl] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Check if current value is an animated GIF
  const isGif = value ? value.toLowerCase().includes('.gif') : false;

  const validateFile = (file: File): string | null => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      return `Unsupported file format (.${ext || ''}). Allowed: JPG, PNG, WEBP, and animated GIF.`;
    }

    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return `Invalid MIME type (${file.type}). Allowed: image/jpeg, image/png, image/webp, image/gif.`;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds limit of ${MAX_FILE_SIZE_MB}MB.`;
    }

    return null;
  };

  const uploadFile = async (file: File) => {
    setUploadError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('imageType', imageType);
    if (videoId) {
      formData.append('videoId', videoId);
    }

    try {
      // Use XMLHttpRequest for accurate upload progress
      const uploadPromise = new Promise<{ url: string; isGif: boolean }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/v1/admin/upload-image');

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 90);
            setUploadProgress(Math.max(15, percent));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = JSON.parse(xhr.responseText);
              if (res.success && res.data?.url) {
                setUploadProgress(100);
                resolve({ url: res.data.url, isGif: res.data.isGif });
              } else {
                reject(new Error(res.error || 'Server rejected file upload'));
              }
            } catch {
              reject(new Error('Invalid response from upload server'));
            }
          } else {
            try {
              const res = JSON.parse(xhr.responseText);
              reject(new Error(res.error || `Upload failed with HTTP ${xhr.status}`));
            } catch {
              reject(new Error(`Upload failed with HTTP ${xhr.status}`));
            }
          }
        };

        xhr.onerror = () => reject(new Error('Network error during file upload'));
        xhr.ontimeout = () => reject(new Error('Upload request timed out'));
        xhr.send(formData);
      });

      const { url } = await uploadPromise;
      onChange(url);
    } catch (err: any) {
      console.error('[Upload Error]:', err.message);
      setUploadError(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        uploadFile(file);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [imageType, videoId]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onChange('');
    setUploadError(null);
  };

  const isPoster = imageType === 'poster';

  return (
    <div className="space-y-2">
      {/* Label and Helper Header */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-300">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setShowManualUrl(!showManualUrl)}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition"
          title="Toggle direct URL input"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showManualUrl ? 'Hide URL' : 'Manual URL'}</span>
        </button>
      </div>

      {/* Main Upload Dropzone & Preview Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-xl border transition-all overflow-hidden ${
          isDragging
            ? 'border-[#e50914] bg-[#e50914]/10 shadow-lg shadow-red-900/20'
            : value
            ? 'border-white/10 bg-[#141824]'
            : 'border-dashed border-white/20 bg-[#161a28] hover:border-white/40 hover:bg-[#181d2e]'
        }`}
      >
        {/* Hidden native file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />

        {/* STATE A: An image is present (Preview Mode) */}
        {value ? (
          <div className="p-3">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Image / Animated GIF Thumbnail */}
                <div
                  className={`relative rounded-lg overflow-hidden border border-white/10 bg-black/40 shrink-0 ${
                    isPoster ? 'w-16 h-24 sm:w-20 sm:h-28' : 'w-28 h-16 sm:w-36 sm:h-20'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={value}
                    alt={label}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {isGif && (
                    <div className="absolute top-1 left-1 bg-purple-600/90 text-[9px] font-black uppercase tracking-wider text-white px-1.5 py-0.5 rounded shadow">
                      GIF
                    </div>
                  )}
                </div>

                {/* Details & Live Indicator */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">
                      {isPoster ? 'Poster Ready' : 'Banner Ready'}
                    </span>
                    {isGif && (
                      <span className="flex items-center gap-1 text-[10px] text-purple-300 bg-purple-500/15 border border-purple-500/30 px-1.5 py-0.2 rounded font-mono">
                        <Sparkles className="w-2.5 h-2.5" />
                        Animated
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 truncate max-w-[220px] sm:max-w-xs font-mono mt-0.5">
                    {value}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <a
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-medium"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Full
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 rounded-lg transition active:scale-95 disabled:opacity-50"
                  title="Replace with new file"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isUploading ? 'animate-spin' : ''}`} />
                  <span>Replace</span>
                </button>

                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={isUploading}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-red-300 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 rounded-lg transition active:scale-95 disabled:opacity-50"
                  title="Remove image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Remove</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* STATE B: Empty Dropzone (Upload Mode) */
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition select-none"
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition shadow-lg ${
                isDragging
                  ? 'bg-[#e50914] text-white shadow-red-600/40'
                  : 'bg-white/5 border border-white/10 text-slate-400 group-hover:text-white group-hover:bg-white/10'
              }`}
            >
              {isUploading ? (
                <RefreshCw className="w-6 h-6 animate-spin text-[#e50914]" />
              ) : isDragging ? (
                <UploadCloud className="w-6 h-6 animate-bounce" />
              ) : (
                <ImageIcon className="w-6 h-6" />
              )}
            </div>

            <p className="text-xs sm:text-sm font-semibold text-white">
              {isUploading ? (
                'Uploading image to Supabase Storage...'
              ) : isDragging ? (
                <span className="text-[#e50914]">Drop file to upload</span>
              ) : (
                <>
                  <span className="text-[#e50914] hover:underline">Click to browse</span> or drag & drop
                </>
              )}
            </p>

            <p className="text-[11px] text-slate-400 mt-1">
              Supports <strong className="text-slate-300">JPG, PNG, WEBP</strong> and{' '}
              <strong className="text-purple-400 font-semibold">Animated GIF</strong> (Up to {MAX_FILE_SIZE_MB}MB)
            </p>

            {helpText && (
              <span className="mt-2 text-[10px] text-slate-500 bg-black/30 px-2 py-0.5 rounded-full border border-white/5">
                {helpText}
              </span>
            )}
          </div>
        )}

        {/* Progress Bar (Visible while uploading) */}
        {isUploading && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#e50914] to-red-500 transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="p-2.5 bg-red-500/15 border border-red-500/30 rounded-xl text-red-200 text-xs flex items-center justify-between gap-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="truncate">{uploadError}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-[11px] font-bold text-red-300 hover:text-white shrink-0 px-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Manual URL Input (Collapsible Override) */}
      {showManualUrl && (
        <div className="pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="relative">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value.trim())}
              placeholder="https://... or /images/sample.jpg"
              className="w-full bg-[#181d2c] border border-white/10 rounded-xl pl-8 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#e50914] transition font-mono placeholder:text-slate-600"
            />
            <LinkIcon className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <p className="text-[10px] text-slate-500 mt-1 pl-1">
            Manual override for external CDN URLs or pre-existing asset paths.
          </p>
        </div>
      )}
    </div>
  );
}
