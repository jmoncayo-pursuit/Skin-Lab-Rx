'use client';
import { useRef, useState, useCallback } from 'react';

interface ImageUploadProps {
  onImageSelected: (file: File, preview: string) => void;
  label?: string;
  hint?: string;
  accept?: string;
}

export default function ImageUpload({ onImageSelected, label, hint, accept = 'image/jpeg,image/png' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => onImageSelected(file, reader.result as string);
    reader.readAsDataURL(file);
  }, [onImageSelected]);

  return (
    <div
      className={`upload-zone${dragOver ? ' drag-over' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
      }}
      style={{
        ...(dragOver ? { borderColor: 'rgba(139,92,246,0.8)', background: 'rgba(139,92,246,0.12)' } : {}),
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer'
      }}
    >
      {/* Viewfinder Corners */}
      <div style={{ position: 'absolute', top: 16, left: 16, width: 20, height: 20, borderTop: '3px solid var(--border-subtle)', borderLeft: '3px solid var(--border-subtle)', borderRadius: '4px 0 0 0' }}></div>
      <div style={{ position: 'absolute', top: 16, right: 16, width: 20, height: 20, borderTop: '3px solid var(--border-subtle)', borderRight: '3px solid var(--border-subtle)', borderRadius: '0 4px 0 0' }}></div>
      <div style={{ position: 'absolute', bottom: 16, left: 16, width: 20, height: 20, borderBottom: '3px solid var(--border-subtle)', borderLeft: '3px solid var(--border-subtle)', borderRadius: '0 0 0 4px' }}></div>
      <div style={{ position: 'absolute', bottom: 16, right: 16, width: 20, height: 20, borderBottom: '3px solid var(--border-subtle)', borderRight: '3px solid var(--border-subtle)', borderRadius: '0 0 4px 0' }}></div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', zIndex: 1, position: 'relative' }}>
        <span className="upload-icon" style={{ fontSize: '3rem', marginBottom: '12px', opacity: 0.9 }}>📸</span>
        <span className="upload-text" style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label || 'Tap to Capture Selfie'}</span>
        <span className="upload-hint" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '80%', textAlign: 'center' }}>
          {hint || 'Ensure good lighting and remove glasses'}
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        capture="user"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
        style={{ display: 'none' }}
      />
    </div>
  );
}
