/**
 * Image processing for Perfect Corp APIs.
 *
 * Philosophy:
 *   - If the photo is already a close headshot → DON'T crop, just resize.
 *   - If the face is small in a wide shot → crop around it.
 *   - Never zoom in beyond the original pixels.
 */

/* ──────────────────────────────────────────────
 *  Helpers
 * ────────────────────────────────────────────── */

interface FaceRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

async function detectFace(img: HTMLImageElement): Promise<FaceRect | null> {
  if (!('FaceDetector' in window)) return null;
  try {
    // @ts-expect-error FaceDetector is not yet in TS lib types
    const detector = new window.FaceDetector({ maxDetectedFaces: 1 });
    const faces = await detector.detect(img);
    return faces.length > 0 ? faces[0].boundingBox : null;
  } catch {
    return null;
  }
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

/* ──────────────────────────────────────────────
 *  processImageForAnalysis
 *
 *  API constraint: face width ≥ 60% of image width,
 *                  long side < 1920, face width ≥ 100px.
 *
 *  Output: 3:4 portrait, max 1024 tall.
 * ────────────────────────────────────────────── */
export function processImageForAnalysis(
  file: File,
): Promise<{ blob: Blob; preview: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(url);
      try {
        const srcW = img.naturalWidth;
        const srcH = img.naturalHeight;
        const face = await detectFace(img);

        let cropX: number, cropY: number, cropW: number, cropH: number;

        if (face) {
          const faceRatio = face.width / srcW;

          if (faceRatio >= 0.35) {
            // ── Face already fills the frame ──
            // Don't crop at all. Just fit the entire image into a 3:4 box.
            const imgAspect = srcW / srcH;
            const targetAspect = 3 / 4;

            if (imgAspect > targetAspect) {
              // Image is wider than 3:4 → trim sides
              cropH = srcH;
              cropW = Math.round(srcH * targetAspect);
              cropX = Math.round((srcW - cropW) / 2);
              cropY = 0;
            } else {
              // Image is taller than 3:4 → trim top/bottom, bias slightly upward
              cropW = srcW;
              cropH = Math.round(srcW / targetAspect);
              cropX = 0;
              // Center vertically but nudge up a bit for forehead
              cropY = Math.max(0, Math.round((srcH - cropH) / 2 - srcH * 0.03));
            }
          } else {
            // ── Face is small in a wide/full-body shot ──
            // Crop around the face so it fills ~62% of the output width
            const desiredCropW = face.width / 0.62;
            const desiredCropH = desiredCropW / (3 / 4);

            cropW = desiredCropW;
            cropH = desiredCropH;

            const cx = face.x + face.width / 2;
            const cy = face.y + face.height / 2;
            cropX = cx - cropW / 2;
            cropY = cy - cropH * 0.4; // bias upward for forehead
          }
        } else {
          // ── No face detector available ──
          // Gentle center crop to 3:4 (keep as much as possible)
          const imgAspect = srcW / srcH;
          const targetAspect = 3 / 4;

          if (imgAspect > targetAspect) {
            cropH = srcH;
            cropW = Math.round(srcH * targetAspect);
            cropX = Math.round((srcW - cropW) / 2);
            cropY = 0;
          } else {
            cropW = srcW;
            cropH = Math.round(srcW / targetAspect);
            cropX = 0;
            cropY = Math.max(0, Math.round((srcH - cropH) / 2 - srcH * 0.05));
          }
        }

        // Clamp to image bounds
        cropX = clamp(Math.round(cropX), 0, srcW - 1);
        cropY = clamp(Math.round(cropY), 0, srcH - 1);
        cropW = clamp(Math.round(cropW), 100, srcW - cropX);
        cropH = clamp(Math.round(cropH), 100, srcH - cropY);

        // Scale output: min short side 480, max long side 4096
        let outW = cropW;
        let outH = cropH;
        const shortSide = Math.min(outW, outH);
        
        if (shortSide < 480) {
          const upScale = 480 / shortSide;
          outW = Math.round(outW * upScale);
          outH = Math.round(outH * upScale);
        }
        
        const longSide = Math.max(outW, outH);
        if (longSide > 4096) {
          const downScale = 4096 / longSide;
          outW = Math.round(outW * downScale);
          outH = Math.round(outH * downScale);
        }

        const canvas = document.createElement('canvas');
        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, outW, outH);

        const preview = canvas.toDataURL('image/jpeg', 0.9);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve({ blob, preview });
            else reject(new Error('Failed to process image'));
          },
          'image/jpeg',
          0.92,
        );
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

/* ──────────────────────────────────────────────
 *  processImageForTryOn
 *
 *  For the VTO API. Same idea: don't over-crop headshots.
 *  Output: max 1024×1024 (aspect-preserved, NOT forced square).
 * ────────────────────────────────────────────── */
export function processImageForTryOn(
  file: File,
): Promise<{ blob: Blob; preview: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(url);
      try {
        const srcW = img.naturalWidth;
        const srcH = img.naturalHeight;
        const face = await detectFace(img);

        let cropX: number, cropY: number, cropW: number, cropH: number;

        if (face) {
          const faceRatio = face.width / srcW;

          if (faceRatio >= 0.30) {
            // ── Already a close-up ── keep the whole image
            cropX = 0;
            cropY = 0;
            cropW = srcW;
            cropH = srcH;
          } else {
            // ── Face is small ── crop around it with generous padding
            const pad = Math.max(face.width, face.height) * 0.9;
            const size = Math.max(face.width, face.height) + pad * 2;

            cropW = size;
            cropH = size;
            cropX = face.x + face.width / 2 - size / 2;
            cropY = face.y + face.height / 2 - size / 2;
          }
        } else {
          // No face detector — use the full image
          cropX = 0;
          cropY = 0;
          cropW = srcW;
          cropH = srcH;
        }

        // Clamp to image bounds
        cropX = clamp(Math.round(cropX), 0, srcW - 1);
        cropY = clamp(Math.round(cropY), 0, srcH - 1);
        cropW = clamp(Math.round(cropW), 100, srcW - cropX);
        cropH = clamp(Math.round(cropH), 100, srcH - cropY);

        // Scale output: min short side 480, max long side 4096
        let outW = cropW;
        let outH = cropH;
        const shortSide = Math.min(outW, outH);
        
        if (shortSide < 480) {
          const upScale = 480 / shortSide;
          outW = Math.round(outW * upScale);
          outH = Math.round(outH * upScale);
        }
        
        const longSide = Math.max(outW, outH);
        if (longSide > 4096) {
          const downScale = 4096 / longSide;
          outW = Math.round(outW * downScale);
          outH = Math.round(outH * downScale);
        }

        const canvas = document.createElement('canvas');
        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, outW, outH);

        const preview = canvas.toDataURL('image/jpeg', 0.9);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve({ blob, preview });
            else reject(new Error('Failed to process image'));
          },
          'image/jpeg',
          0.92,
        );
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}
