'use client';
import { useState, useCallback, useEffect } from 'react';
import type { AppState } from '@/app/page';
import ImageUpload from '@/components/ImageUpload';
import { processImageForTryOn } from '@/lib/imageProcessing';
import { GLOW_UP_LOOKS, matchGlowUpForProduct, type GlowUpLook } from '@/lib/glowUpReferences';
import { SKIN_CONCERNS } from '@/lib/types';

interface TryOnViewProps {
  state: AppState;
  updateState: (partial: Partial<AppState>) => void;
  onNavigate: (tab: string) => void;
}

type Phase = 'select-look' | 'processing' | 'result';

export default function TryOnView({ state, updateState, onNavigate }: TryOnViewProps) {
  const [phase, setPhase] = useState<Phase>('select-look');
  const [targetPreview, setTargetPreview] = useState<string | null>(state.selfiePreview);
  const [targetFile, setTargetFile] = useState<File | null>(state.selfieFile);
  const [selectedLook, setSelectedLook] = useState<GlowUpLook | null>(null);
  const [refPreview, setRefPreview] = useState<string | null>(null);
  const [refFile, setRefFile] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useCustomRef, setUseCustomRef] = useState(false);

  // Auto-select the best glow-up look if a product was selected
  const product = state.selectedProduct;

  useEffect(() => {
    if (product && !selectedLook) {
      const bestLook = matchGlowUpForProduct(product.concerns);
      if (bestLook) {
        setSelectedLook(bestLook);
      }
    }
  }, [product, selectedLook]);

  // Get sorted glow-up looks based on user concerns
  const getSortedLooks = () => {
    if (!state.analysisScores) return GLOW_UP_LOOKS;
    const userConcerns = Object.entries(state.analysisScores)
      .sort(([, a], [, b]) => a.ui_score - b.ui_score)
      .map(([key]) => key);
    
    const scored = GLOW_UP_LOOKS.map(look => {
      let score = 0;
      look.concerns.forEach(c => {
        const idx = userConcerns.indexOf(c);
        if (idx !== -1) score += (userConcerns.length - idx);
      });
      return { ...look, _score: score };
    });
    
    return scored.sort((a, b) => b._score - a._score);
  };

  const handleTryOn = useCallback(async () => {
    if (!targetFile) return;
    if (!selectedLook) return;

    setPhase('processing');
    setError(null);

    try {
      // Process the target image
      const targetProcessed = await processImageForTryOn(targetFile);
      setTargetPreview(targetProcessed.preview);

      // Map the concerns of the selected look to VTO effects
      const effects: any[] = [];
      const concerns = selectedLook.concerns;

      // Keep smoothing subtle (max 40) so it doesn't blur facial hair or eyebrows
      if (concerns.includes('wrinkle') || concerns.includes('firmness') || concerns.includes('texture') || concerns.includes('acne') || concerns.includes('pore')) {
        effects.push({
          category: "skin_smooth",
          skinSmoothStrength: 40,
          skinSmoothColorIntensity: 0
        });
      }

      // Targeted under-eye concealer with moderate intensity
      if (concerns.includes('dark_circle_v2') || concerns.includes('eye_bag')) {
        effects.push({
          category: "concealer",
          palettes: [{
            color: "#FFFFFF", // Use white as base, but colorIntensity 0 ensures it only uses coverage logic
            colorIntensity: 0,
            colorUnderEyeIntensity: 55,
            coverageLevel: 50
          }]
        });
      }
      
      // If no specific effect was matched, add a very faint smoothing to simulate a glow
      if (effects.length === 0) {
        effects.push({
          category: "skin_smooth",
          skinSmoothStrength: 25,
          skinSmoothColorIntensity: 0
        });
      }

      const formData = new FormData();
      formData.append('target', new File([targetProcessed.blob], 'target.jpg', { type: 'image/jpeg' }));
      formData.append('effects', JSON.stringify(effects));

      const res = await fetch('/api/makeup-transfer', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Try-on failed');

      // Extract result URL from response
      const results = data.data?.results;
      let url = '';
      if (results?.dst_urls?.length > 0) {
        url = results.dst_urls[0];
      } else if (results?.output?.[0]?.url) {
        url = results.output[0].url;
      } else if (data.data?.dst_urls?.length > 0) {
        url = data.data.dst_urls[0];
      } else if (results?.url) {
        url = results.url;
      }

      if (url) {
        setResultUrl(url);
        setPhase('result');
      } else {
        throw new Error('No result image returned. The API may not have been able to process the images.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setPhase('select-look');
    }
  }, [targetFile, selectedLook]);

  // ── Result Phase ──
  if (phase === 'result' && resultUrl) {
    return (
      <div className="container" style={{ paddingTop: 48 }}>
        {/* Product context header */}
        {product && (
          <div className="glass-card fade-in-up" style={{
            padding: '12px 16px', marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.05))',
          }}>
            <span style={{ fontSize: '1.5rem' }}>
              {SKIN_CONCERNS.find(c => product.concerns.includes(c.key))?.icon || '✨'}
            </span>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{product.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{product.brand} · Glow-Up Preview</div>
            </div>
          </div>
        )}

        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 16 }}>
          {product ? '✨ Your Glow-Up Preview' : '✨ Try-On Result'}
        </h1>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16,
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: 4 }}>Before</div>
            <div style={{
              aspectRatio: '3/4', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
              border: '1px solid var(--border-subtle)',
            }}>
              {targetPreview && <img src={targetPreview} alt="Original" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-accent)', textAlign: 'center', marginBottom: 4, fontWeight: 600 }}>After</div>
            <div style={{
              aspectRatio: '3/4', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
              border: '2px solid rgba(139,92,246,0.4)',
              boxShadow: '0 0 20px rgba(139,92,246,0.15)',
            }}>
              <img src={resultUrl} alt="Try-on result" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>

        {selectedLook && (
          <div className="glass-card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: '1.5rem' }}>{selectedLook.emoji}</span>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{selectedLook.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{selectedLook.description}</div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <button className="btn-primary" style={{ flex: 1 }} onClick={() => {
            setPhase('select-look');
            setResultUrl(null);
            setSelectedLook(null);
            updateState({ selectedProduct: null });
          }}>
            🔄 Try Another Look
          </button>
          <a
            className="btn-secondary"
            href={resultUrl}
            download="glowup-result.jpg"
            target="_blank"
            rel="noopener noreferrer"
            style={{ flex: 1, textDecoration: 'none', textAlign: 'center' }}
          >
            💾 Save
          </a>
        </div>
        {product && (
          <button className="btn-secondary" style={{ width: '100%' }} onClick={() => {
            updateState({ selectedProduct: null });
            onNavigate('products');
          }}>
            ← Back to Recommendations
          </button>
        )}
      </div>
    );
  }

  // ── Processing Phase ──
  if (phase === 'processing') {
    return (
      <div className="container" style={{ paddingTop: 48, textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>
          {product ? 'Creating Your Glow-Up' : 'Applying Look'}
        </h1>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
          {targetPreview && (
            <div style={{ width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border-subtle)' }}>
              <img src={targetPreview} alt="You" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.5rem' }}>→</div>
          <div style={{
            width: 100, height: 100, borderRadius: '50%', overflow: 'hidden',
            border: '2px solid rgba(139,92,246,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.1))',
          }} className="pulse-glow">
            {selectedLook ? (
              <span style={{ fontSize: '2rem' }}>{selectedLook.emoji}</span>
            ) : refPreview ? (
              <img src={refPreview} alt="Look" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '2rem' }}>✨</span>
            )}
          </div>
        </div>

        {product && (
          <div className="glass-card" style={{ padding: 12, marginBottom: 16, display: 'inline-block' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{product.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{product.brand}</div>
          </div>
        )}

        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          {product
            ? `AI is simulating the effect of ${product.name}...`
            : 'AI is transferring the look...'}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 8 }}>This may take 15-45 seconds</p>
      </div>
    );
  }

  // ── Select Look Phase ──
  const sortedLooks = getSortedLooks();

  return (
    <div className="container" style={{ paddingTop: 48 }}>
      {/* Product Context Banner */}
      {product && (
        <div className="glass-card fade-in-up" style={{
          padding: '14px 16px', marginBottom: 20,
          background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.06))',
          border: '1px solid rgba(139,92,246,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: '1.5rem' }}>
              {SKIN_CONCERNS.find(c => product.concerns.includes(c.key))?.icon || '🧴'}
            </span>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{product.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {product.brand} · {product.category}
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
            See how this product&apos;s effect might look on your skin using AI glow-up transfer.
          </p>
        </div>
      )}

      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>
        {product ? '✨ Glow-Up Preview' : 'Virtual Try-On'}
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 24 }}>
        {product
          ? 'Select a glow-up look to see how your skin could improve'
          : 'Choose a reference look or upload your own to see it on your face'
        }
      </p>

      {/* Step 1: Your Photo */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-accent)' }}>
          1. Your Photo
        </div>
        {targetPreview ? (
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '100%', aspectRatio: '1/1', maxHeight: 180, borderRadius: 'var(--radius-lg)',
              overflow: 'hidden', border: '1px solid var(--border-subtle)',
            }}>
              <img src={targetPreview} alt="Your selfie" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <button
              className="btn-icon"
              onClick={() => { setTargetPreview(null); setTargetFile(null); }}
              style={{ position: 'absolute', top: 8, right: 8, width: 32, height: 32, fontSize: '0.8rem' }}
            >✕</button>
          </div>
        ) : (
          <ImageUpload
            onImageSelected={(f, p) => { setTargetFile(f); setTargetPreview(p); }}
            label="Upload your selfie"
            hint="Clear, front-facing • Max 1024×1024"
          />
        )}
      </div>

      {/* Step 2: Choose Glow-Up Look */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-accent)' }}>
            2. {product ? 'Glow-Up Look' : 'Reference Look'}
          </div>
          <button
            onClick={() => { setUseCustomRef(!useCustomRef); setSelectedLook(null); setRefFile(null); setRefPreview(null); }}
            style={{
              fontSize: '0.7rem', color: 'var(--text-muted)',
              background: 'none', border: 'none', cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {useCustomRef ? '← Choose from library' : 'Upload custom →'}
          </button>
        </div>

        {useCustomRef ? (
          /* Custom reference upload */
          refPreview ? (
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '100%', aspectRatio: '1/1', maxHeight: 180, borderRadius: 'var(--radius-lg)',
                overflow: 'hidden', border: '1px solid rgba(139,92,246,0.3)',
              }}>
                <img src={refPreview} alt="Reference look" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <button
                className="btn-icon"
                onClick={() => { setRefPreview(null); setRefFile(null); }}
                style={{ position: 'absolute', top: 8, right: 8, width: 32, height: 32, fontSize: '0.8rem' }}
              >✕</button>
            </div>
          ) : (
            <ImageUpload
              onImageSelected={(f, p) => { setRefFile(f); setRefPreview(p); }}
              label="Upload a makeup look to try"
              hint="Any photo with the makeup style you want"
            />
          )
        ) : (
          /* Glow-Up Look Carousel */
          <div style={{
            display: 'flex', gap: 10, overflowX: 'auto',
            paddingBottom: 8, scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
          }}>
            {sortedLooks.map((look) => {
              const isSelected = selectedLook?.id === look.id;
              return (
                <button
                  key={look.id}
                  onClick={() => setSelectedLook(isSelected ? null : look)}
                  style={{
                    flex: '0 0 auto',
                    width: 140,
                    scrollSnapAlign: 'start',
                    border: isSelected ? '2px solid rgba(139,92,246,0.6)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    background: isSelected
                      ? 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.08))'
                      : 'var(--bg-glass)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: isSelected ? '0 4px 16px rgba(139,92,246,0.2)' : 'none',
                    padding: 0,
                  }}
                >
                  {/* Reference image preview */}
                  <div style={{
                    width: '100%', aspectRatio: '1/1', overflow: 'hidden',
                    position: 'relative',
                  }}>
                    <img
                      src={look.coverUrl || look.referenceUrl}
                      alt={look.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {isSelected && (
                      <div style={{
                        position: 'absolute', top: 6, right: 6,
                        width: 22, height: 22, borderRadius: '50%',
                        background: 'rgba(139,92,246,0.9)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', color: 'white',
                      }}>✓</div>
                    )}
                  </div>
                  {/* Look info */}
                  <div style={{ padding: '8px 10px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: 2 }}>
                      {look.emoji} {look.name}
                    </div>
                    <div style={{
                      fontSize: '0.65rem', color: 'var(--text-muted)',
                      lineHeight: 1.3, display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {look.description}
                    </div>
                    {/* Concern tags */}
                    <div style={{ display: 'flex', gap: 3, marginTop: 6, flexWrap: 'wrap' }}>
                      {look.concerns.slice(0, 2).map(c => {
                        const concern = SKIN_CONCERNS.find(sc => sc.key === c);
                        return (
                          <span key={c} style={{
                            fontSize: '0.55rem',
                            padding: '1px 5px',
                            borderRadius: 20,
                            background: `${concern?.color || '#9BB8CC'}15`,
                            color: concern?.color || '#9BB8CC',
                            border: `1px solid ${concern?.color || '#9BB8CC'}30`,
                          }}>
                            {concern?.label || c}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <div style={{
          marginBottom: 16, padding: 14, borderRadius: 'var(--radius-md)',
          background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
          color: '#f87171', fontSize: '0.85rem',
        }}>
          ⚠️ {error}
        </div>
      )}

      <button
        className="btn-primary"
        style={{ width: '100%' }}
        disabled={!targetFile || (!selectedLook && !refFile)}
        onClick={handleTryOn}
      >
        {product ? '✨ Try On Glow-Up' : '🪞 Apply Look'}
      </button>

      <div style={{
        marginTop: 20, padding: 14, borderRadius: 'var(--radius-md)',
        background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)',
        fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6,
      }}>
        {product ? (
          <>
            💡 The glow-up preview uses AI makeup transfer to simulate how your skin could look after using <strong>{product.name}</strong>. Results are approximate and for visualization only.
          </>
        ) : (
          <>
            💡 For best results, both photos should show a clear, front-facing face with eyes open and no obstructions.
          </>
        )}
      </div>

      {product && (
        <button
          className="btn-secondary"
          style={{ width: '100%', marginTop: 12 }}
          onClick={() => {
            updateState({ selectedProduct: null });
            onNavigate('products');
          }}
        >
          ← Back to Recommendations
        </button>
      )}
    </div>
  );
}
