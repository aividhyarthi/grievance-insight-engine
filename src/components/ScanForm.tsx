import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { ScanResult } from '@shared/types';

const ACCEPTED_TYPES: Record<string, string> = {
  image: 'image/jpeg,image/png,image/gif,image/webp,image/bmp',
  video: 'video/mp4,video/webm,video/quicktime',
  audio: 'audio/mpeg,audio/wav,audio/ogg,audio/flac,audio/aac',
};

export default function ScanForm() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<'file' | 'text'>('file');
  const [textContent, setTextContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [labels, setLabels] = useState('');
  const [publisherName, setPublisherName] = useState('');
  const [platformName, setPlatformName] = useState('');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setScanning(true);

    try {
      let result: ScanResult;

      if (mode === 'text') {
        if (textContent.trim().length < 10) {
          throw new Error('Text must be at least 10 characters');
        }
        const res = await fetch('/api/scan/text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            textContent,
            labels: labels ? labels.split(',').map((l) => l.trim()) : [],
            publisherName: publisherName || undefined,
            platformName: platformName || undefined,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        result = data.data;
      } else {
        if (!file) throw new Error('Please select a file');
        const formData = new FormData();
        formData.append('file', file);
        if (labels) formData.append('labels', JSON.stringify(labels.split(',').map((l) => l.trim())));
        if (publisherName) formData.append('publisherName', publisherName);
        if (platformName) formData.append('platformName', platformName);

        const res = await fetch('/api/scan/file', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        result = data.data;
      }

      navigate(`/scan/${result.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setMode('file');
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Scan Content</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload content or paste text to check AI detection and IT Rules 2026 compliance.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mode toggle */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
          <button
            type="button"
            onClick={() => setMode('file')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              mode === 'file' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setMode('text')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              mode === 'text' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Paste Text
          </button>
        </div>

        {/* File upload */}
        {mode === 'file' && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-primary-400 bg-primary-50'
                : file
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={Object.values(ACCEPTED_TYPES).join(',')}
              onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); }}
            />
            {file ? (
              <div>
                <div className="text-lg font-medium text-green-700">{file.name}</div>
                <div className="text-sm text-green-600 mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB &middot; {file.type}
                </div>
                <div className="text-xs text-gray-400 mt-2">Click or drag to replace</div>
              </div>
            ) : (
              <div>
                <div className="text-gray-400 text-4xl mb-3">+</div>
                <div className="text-sm font-medium text-gray-700">
                  Drop file here or click to browse
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Images, videos, audio files up to 50MB
                </div>
              </div>
            )}
          </div>
        )}

        {/* Text input */}
        {mode === 'text' && (
          <div>
            <label className="label">Content Text</label>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              rows={10}
              className="input font-mono text-sm resize-y"
              placeholder="Paste the content you want to check for AI generation and compliance..."
            />
            <div className="text-xs text-gray-400 mt-1 text-right">
              {textContent.length.toLocaleString()} characters
            </div>
          </div>
        )}

        {/* Optional fields */}
        <div className="card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Optional Context (improves compliance check)</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Existing Labels</label>
              <input
                type="text"
                value={labels}
                onChange={(e) => setLabels(e.target.value)}
                className="input"
                placeholder="AI-generated, color corrected..."
              />
              <div className="text-xs text-gray-400 mt-1">Comma-separated labels already on the content</div>
            </div>
            <div>
              <label className="label">Publisher Name</label>
              <input
                type="text"
                value={publisherName}
                onChange={(e) => setPublisherName(e.target.value)}
                className="input"
                placeholder="e.g., Times of India"
              />
            </div>
          </div>

          <div>
            <label className="label">Platform Name</label>
            <input
              type="text"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="input"
              placeholder="e.g., Instagram, YouTube, X (Twitter)"
            />
            <div className="text-xs text-gray-400 mt-1">Enables platform-specific obligation checks</div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={scanning || (mode === 'file' && !file) || (mode === 'text' && textContent.length < 10)}
          className="btn-primary w-full py-3 text-base"
        >
          {scanning ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Scanning & Checking Compliance...
            </span>
          ) : (
            'Scan & Check Compliance'
          )}
        </button>
      </form>
    </div>
  );
}
