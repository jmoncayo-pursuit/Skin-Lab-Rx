'use client';
import { useRef, useState, useCallback, useEffect } from 'react';

interface ImageUploadProps {
  onImageSelected: (file: File, preview: string) => void;
  label?: string;
  hint?: string;
  accept?: string;
}

export default function ImageUpload({ onImageSelected, label, hint, accept = 'image/jpeg,image/png' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => onImageSelected(file, reader.result as string);
    reader.readAsDataURL(file);
  }, [onImageSelected]);

  const startCamera = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } } 
      });
      setIsCameraOpen(true);
      // Wait a tick for the video element to mount
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 50);
    } catch (err) {
      console.error("Camera access denied or unavailable", err);
      setCameraError("Camera access denied. Please allow permissions or upload a file.");
    }
  };

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  }, []);

  const takePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      // Handle mirroring since front-camera is mirrored via CSS
      ctx?.translate(canvas.width, 0);
      ctx?.scale(-1, 1);
      
      ctx?.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
           const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
           onImageSelected(file, canvas.toDataURL('image/jpeg', 0.9));
           stopCamera();
        }
      }, 'image/jpeg', 0.9);
    }
  };

  // Ensure camera stops if component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  if (isCameraOpen) {
    return (
      <div className="upload-zone" style={{ position: 'relative', overflow: 'hidden', padding: 0 }}>
        <video 
          ref={videoRef} 
          playsInline 
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} 
        />
        <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 16 }}>
          <button className="btn-secondary" onClick={(e) => { e.stopPropagation(); stopCamera(); }}>
            Cancel
          </button>
          <button className="btn-primary" onClick={takePhoto}>
            📸 Snap
          </button>
        </div>
      </div>
    );
  }

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
      <div style={{ position: 'absolute', top: 16, left: 16, width: 20, height: 20, borderTop: '3px solid var(--border-subtle)', borderLeft: '3px solid var(--border-subtle)', borderRadius: '4px 0 0 0' }}></div>
      <div style={{ position: 'absolute', top: 16, right: 16, width: 20, height: 20, borderTop: '3px solid var(--border-subtle)', borderRight: '3px solid var(--border-subtle)', borderRadius: '0 4px 0 0' }}></div>
      <div style={{ position: 'absolute', bottom: 16, left: 16, width: 20, height: 20, borderBottom: '3px solid var(--border-subtle)', borderLeft: '3px solid var(--border-subtle)', borderRadius: '0 0 0 4px' }}></div>
      <div style={{ position: 'absolute', bottom: 16, right: 16, width: 20, height: 20, borderBottom: '3px solid var(--border-subtle)', borderRight: '3px solid var(--border-subtle)', borderRadius: '0 0 4px 0' }}></div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', zIndex: 1, position: 'relative' }}>
        <span className="upload-icon" style={{ fontSize: '3rem', marginBottom: '8px', opacity: 0.9 }}>📸</span>
        <span className="upload-text" style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label || 'Upload your photo'}</span>
        <span className="upload-hint" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: '16px', maxWidth: '80%', textAlign: 'center' }}>
          {hint || 'Ensure good lighting and remove glasses'}
        </span>
        
        {cameraError && (
          <div style={{ fontSize: '0.75rem', color: '#ff6b6b', marginBottom: '12px', textAlign: 'center', maxWidth: '90%' }}>
            {cameraError}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-secondary" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
            📂 Upload File
          </button>
          <button className="btn-primary" onClick={startCamera}>
            📷 Use Camera
          </button>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
        style={{ display: 'none' }}
      />
    </div>
  );
}
