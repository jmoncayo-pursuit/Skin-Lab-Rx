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
  const [alignmentState, setAlignmentState] = useState<'scanning' | 'aligned'>('scanning');

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

  // Real-time Face Detection Loop (or Smart Timer Fallback)
  useEffect(() => {
    if (!isCameraOpen || !videoRef.current) {
      setAlignmentState('scanning');
      return;
    }

    let isActive = true;
    let checkInterval: NodeJS.Timeout;
    let fallbackTimer: NodeJS.Timeout;

    const startDetection = () => {
      if (!isActive) return;

      if ('FaceDetector' in window) {
        try {
          // @ts-ignore - FaceDetector is experimental and not in standard TS types yet
          const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
          
          checkInterval = setInterval(async () => {
            if (!isActive || !videoRef.current) return;
            try {
              const video = videoRef.current;
              const faces = await detector.detect(video);
              
              if (faces.length > 0) {
                // Check if the face is somewhat centered
                const face = faces[0];
                const box = face.boundingBox;
                
                // Calculate center of face and center of video
                const faceCenterX = box.x + (box.width / 2);
                const faceCenterY = box.y + (box.height / 2);
                
                // Video dimensions (intrinsic)
                const vidW = video.videoWidth;
                const vidH = video.videoHeight;
                
                // Acceptable center zone (middle 40%)
                const minX = vidW * 0.3;
                const maxX = vidW * 0.7;
                const minY = vidH * 0.2;
                const maxY = vidH * 0.8;
                
                const isCentered = faceCenterX >= minX && faceCenterX <= maxX && 
                                   faceCenterY >= minY && faceCenterY <= maxY;
                                   
                // Face must also take up a reasonable portion of the screen (not too far)
                const isGoodSize = box.width >= vidW * 0.25;
                
                setAlignmentState((isCentered && isGoodSize) ? 'aligned' : 'scanning');
              } else {
                setAlignmentState('scanning');
              }
            } catch (err) {
              console.warn("Face detection failed, using fallback", err);
              clearInterval(checkInterval);
            }
          }, 500); // Check twice a second to save battery
        } catch (err) {
          // Fallback if instantiation fails
          fallbackTimer = setTimeout(() => isActive && setAlignmentState('aligned'), 2500);
        }
      } else {
        // Fallback for iOS/Safari: Motion Detection (Holding still = Aligned)
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        let lastImageData: ImageData | null = null;
        let stillnessFrames = 0;

        checkInterval = setInterval(() => {
          if (!isActive || !videoRef.current || !ctx) return;
          const video = videoRef.current;
          if (video.videoWidth === 0 || video.videoHeight === 0) return;

          // Downsample heavily for fast processing
          canvas.width = 64;
          canvas.height = 64;
          ctx.drawImage(video, 0, 0, 64, 64);
          const currentData = ctx.getImageData(0, 0, 64, 64);

          if (lastImageData) {
            let diff = 0;
            for (let i = 0; i < currentData.data.length; i += 4) {
              diff += Math.abs(currentData.data[i] - lastImageData.data[i]);
              diff += Math.abs(currentData.data[i+1] - lastImageData.data[i+1]);
              diff += Math.abs(currentData.data[i+2] - lastImageData.data[i+2]);
            }
            
            // Average pixel color difference
            const avgDiff = diff / (64 * 64 * 3);
            
            // If avgDiff is low, the user is holding still
            if (avgDiff < 15) {
              stillnessFrames++;
            } else {
              stillnessFrames = 0;
            }

            // If held still for 3 consecutive intervals (1.5 seconds) -> Aligned!
            // If they move the camera away -> back to Scanning!
            if (stillnessFrames >= 3) {
              setAlignmentState('aligned');
            } else {
              setAlignmentState('scanning');
            }
          }
          lastImageData = currentData;
        }, 500);
      }
    };

    // We must wait until the video is playing to detect
    const videoEl = videoRef.current;
    videoEl.addEventListener('playing', startDetection);

    return () => {
      isActive = false;
      videoEl.removeEventListener('playing', startDetection);
      if (checkInterval) clearInterval(checkInterval);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [isCameraOpen]);

  if (isCameraOpen) {
    return (
      <div className="upload-zone" style={{ position: 'relative', overflow: 'hidden', padding: 0 }}>
        <video 
          ref={videoRef} 
          playsInline 
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} 
        />
        {/* Face Alignment Guide Overlay */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease' }}>
          <svg width="200" height="280" viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: alignmentState === 'aligned' ? 0.9 : 0.6 }}>
            <ellipse 
              cx="100" cy="140" rx="85" ry="120" 
              stroke={alignmentState === 'aligned' ? '#4ade80' : 'white'} 
              strokeWidth="4" 
              strokeDasharray={alignmentState === 'aligned' ? 'none' : '10 10'} 
              style={{ transition: 'all 0.4s ease' }}
            />
            <path d="M 80 120 Q 100 130 120 120" stroke={alignmentState === 'aligned' ? '#4ade80' : 'white'} strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />
            <text x="100" y="30" fill={alignmentState === 'aligned' ? '#4ade80' : 'white'} fontSize="16" fontWeight="700" textAnchor="middle" opacity="0.9" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)', transition: 'all 0.3s ease' }}>
              {alignmentState === 'aligned' ? '✓ Perfect' : 'Align Face Here'}
            </text>
          </svg>
        </div>
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
