'use client';
import { useState, useCallback } from 'react';
import type { AppState } from '@/app/page';
import ImageUpload from '@/components/ImageUpload';
import ScoreRing from '@/components/ScoreRing';
import { SKIN_CONCERNS, getScoreColor, getScoreLabel } from '@/lib/types';
import { processImageForAnalysis } from '@/lib/imageProcessing';

interface AnalyzeViewProps {
  state: AppState;
  updateState: (partial: Partial<AppState>) => void;
  onNavigate: (tab: string) => void;
}

type Phase = 'upload' | 'analyzing' | 'results';

export default function AnalyzeView({ state, updateState, onNavigate }: AnalyzeViewProps) {
  const [phase, setPhase] = useState<Phase>(state.analysisScores ? 'results' : 'upload');
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(state.selfiePreview);
  const [expandedConcern, setExpandedConcern] = useState<string | null>(null);

  const handleAnalyze = useCallback(async (file: File, _previewUrl: string) => {
    setPhase('analyzing');
    setError(null);

    try {
      // Process image: center-crop to 3:4 portrait, cap at 1024px
      // This ensures face fills ≥60% of image width as required by the API
      const { blob, preview: processedPreview } = await processImageForAnalysis(file);
      setPreview(processedPreview);
      const processedFile = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
      updateState({ selfiePreview: processedPreview, selfieFile: processedFile });

      // --- HACKATHON TEST MODE BYPASS ---
      // Run this in browser console to enable: localStorage.setItem('TEST_MODE', 'true')
      if (typeof window !== 'undefined' && localStorage.getItem('TEST_MODE') === 'true') {
        console.warn("TEST_MODE IS ACTIVE: Bypassing real API to save credits.");
        setTimeout(() => {
          updateState({
            analysisScores: {
              redness: { ui_score: 35, raw_score: 0 },
              dark_circle_v2: { ui_score: 42, raw_score: 0 },
              wrinkle: { ui_score: 65, raw_score: 0 },
              texture: { ui_score: 72, raw_score: 0 },
              radiance: { ui_score: 55, raw_score: 0 }
            },
            overallScore: 54,
            skinAge: 32,
            selfiePreview: processedPreview
          });
          setPhase('results');
        }, 2000);
        return;
      }

      const formData = new FormData();
      formData.append('image', processedFile);

      const res = await fetch('/api/skin-analysis', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Analysis failed');

      // Parse the results — handle multiple response shapes
      // Known skin concern keys (SD analysis)
      const KNOWN_CONCERNS = new Set([
        'wrinkle', 'pore', 'texture', 'acne', 'moisture', 'oiliness',
        'redness', 'firmness', 'dark_circle_v2', 'age_spot', 'radiance',
        'eye_bag', 'droopy_upper_eyelid', 'droopy_lower_eyelid',
      ]);

      let scores: Record<string, { raw_score: number; ui_score: number }> = {};
      let overall = 0;
      let skinAge = 0;

      // Helper to extract scores from an object
      const extractFromObj = (obj: Record<string, unknown>) => {
        Object.entries(obj).forEach(([key, val]) => {
          if (key === 'all' && typeof val === 'object' && val !== null && 'score' in val) {
            overall = (val as { score: number }).score;
          } else if (key === 'all' && typeof val === 'number') {
            overall = val;
          } else if (key === 'skin_age' && typeof val === 'number') {
            skinAge = val;
          } else if (KNOWN_CONCERNS.has(key) && typeof val === 'object' && val !== null && 'ui_score' in val) {
            scores[key] = val as { raw_score: number; ui_score: number };
          }
        });
      };

      // Try results.output array format
      const results = data.data?.results;
      if (results?.output && Array.isArray(results.output)) {
        results.output.forEach((item: { type: string; ui_score: number; raw_score: number }) => {
          if (KNOWN_CONCERNS.has(item.type)) {
            scores[item.type] = { ui_score: item.ui_score, raw_score: item.raw_score };
          }
        });
        if (results.overall_score) overall = results.overall_score;
        if (results.skin_age) skinAge = results.skin_age;
      }

      // Try results as score_info object
      if (Object.keys(scores).length === 0 && results && typeof results === 'object') {
        extractFromObj(results as Record<string, unknown>);
      }

      // Try top-level data fields (some responses put scores directly in data)
      if (Object.keys(scores).length === 0 && data.data) {
        extractFromObj(data.data as Record<string, unknown>);
      }

      // Compute overall from individual scores if API didn't provide it
      if (overall === 0 && Object.keys(scores).length > 0) {
        const scoreValues = Object.values(scores).map(s => s.ui_score);
        overall = Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length);
      }

      console.log('[SkinLabRx] Parsed scores:', { overall, skinAge, concernCount: Object.keys(scores).length });

      updateState({
        analysisScores: scores,
        overallScore: overall,
        skinAge: skinAge,
      });
      setPhase('results');
    } catch (err) {
      let msg = err instanceof Error ? err.message : 'Something went wrong';
      // Map API error codes to friendly messages
      if (msg.includes('error_src_face_too_small')) {
        msg = 'Scan rejected: Face too small or obstructed. Please upload a closer selfie. If you are wearing glasses, please remove them for the analysis.';
      } else if (msg.includes('error_lighting_dark')) {
        msg = 'Scan rejected: The photo is too dark. Please retake in a well-lit environment.';
      } else if (msg.includes('error_src_face_out_of_bound') || msg.includes('error_src_no_face_detected') || msg.includes('error')) {
        msg = 'Scan rejected: We could not properly detect your face. Please ensure you are looking straight at the camera. If you are wearing glasses, please remove them for the analysis.';
      }
      setError(msg);
      setPhase('upload');
    }
  }, [updateState]);

  // ── Upload Phase ──
  if (phase === 'upload') {
    return (
      <div className="container" style={{ paddingTop: 48 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>Skin Analysis</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 24 }}>
          Upload a clear, front-facing selfie for AI-powered diagnostics.
        </p>

        {preview && (
          <div style={{
            width: '100%', aspectRatio: '3/4', borderRadius: 'var(--radius-xl)',
            overflow: 'hidden', marginBottom: 16, border: '1px solid var(--border-subtle)',
          }}>
            <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        <ImageUpload
          onImageSelected={handleAnalyze}
          label={preview ? 'Tap to upload a different photo' : 'Tap to upload a selfie'}
          hint="JPG/PNG • Face should fill 60-80% of frame"
        />

        {error && (
          <div style={{
            marginTop: 16, padding: 14, borderRadius: 'var(--radius-md)',
            background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
            color: '#f87171', fontSize: '0.85rem',
          }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{
          marginTop: 24, padding: 16, borderRadius: 'var(--radius-md)',
          background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)',
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-accent)' }}>
            📋 Tips for best results
          </div>
          <ul style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 16 }}>
            <li>Remove glasses and pull hair back</li>
            <li>Use even, bright lighting (no harsh shadows)</li>
            <li>Remove makeup for accurate readings</li>
            <li>Look straight into the camera, neutral expression</li>
          </ul>
        </div>
      </div>
    );
  }

  // ── Analyzing Phase ──
  if (phase === 'analyzing') {
    return (
      <div className="container" style={{ paddingTop: 48, textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>Analyzing Your Skin</h1>

        {preview && (
          <div style={{
            width: 160, height: 160, borderRadius: '50%', overflow: 'hidden',
            margin: '0 auto 24px', border: '3px solid rgba(155,184,204,0.3)',
          }} className="pulse-glow">
            <img src={preview} alt="Analyzing" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          AI is scanning 14 skin metrics...
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 8 }}>
          This typically takes 10-30 seconds
        </p>
      </div>
    );
  }

  // ── Results Phase ──
  const scores = state.analysisScores || {};
  const sortedScores = Object.entries(scores)
    .sort(([, a], [, b]) => a.ui_score - b.ui_score);

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 24 }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>Your Results</h1>

      {/* Overall Score & Analyzed Photo */}
      <div className="glass-card fade-in-up" style={{
        padding: '16px 24px', textAlign: 'center', marginBottom: 20,
        background: 'linear-gradient(135deg, rgba(155,184,204,0.06), rgba(139,175,160,0.04))',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, alignItems: 'center' }}>
          {state.selfiePreview && (
            <div style={{ width: 72, height: 96, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-accent)', flexShrink: 0, boxShadow: 'var(--shadow-card)' }}>
              <img src={state.selfiePreview} alt="Analyzed" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <ScoreRing score={Math.round(state.overallScore || 0)} label="Overall" size={100} />
            {state.skinAge !== null && state.skinAge > 0 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Outfit', fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-accent)', lineHeight: 1 }}>
                  {state.skinAge}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>
                  Skin Age
                </div>
              </div>
            )}
          </div>
        </div>
        <div style={{ marginTop: 12, fontSize: '0.7rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
          *Note: Clinical results may vary if wearing eyewear or heavy makeup.
        </div>
      </div>

      {/* Top Concerns */}
      {sortedScores.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="section-header">
            <span className="section-title">Concern Breakdown</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Lower = needs attention
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sortedScores.map(([key, val], i) => {
              const concern = SKIN_CONCERNS.find(c => c.key === key);
              const color = getScoreColor(val.ui_score);
              const label = getScoreLabel(val.ui_score);
              const isExpanded = expandedConcern === key;
              return (
                <div key={key} className={`glass-card fade-in-up stagger-${Math.min(i + 1, 6)}`}
                  style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 0, cursor: 'pointer', transition: 'all 0.3s ease' }}
                  onClick={() => setExpandedConcern(isExpanded ? null : key)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                    <span style={{ fontSize: '1.2rem', width: 28, textAlign: 'center' }}>
                      {concern?.icon || '•'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                          {concern?.label || key}
                        </span>
                        <span style={{ fontSize: '0.75rem', color, fontWeight: 700 }}>
                          {val.ui_score} · {label}
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div className="fill" style={{
                          width: `${val.ui_score}%`,
                          background: `linear-gradient(90deg, ${color}, ${color}88)`,
                        }} />
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }} onClick={e => e.stopPropagation()}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }}>Analysis Detail</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>
                        Based on your scan, your score for <strong>{concern?.label || key}</strong> is {val.ui_score}/100. 
                        {val.ui_score < 70 ? ` This is an area that would benefit from targeted care. ${concern?.description || ''}` : ` Your skin is performing very well here. Maintaining a solid routine will help preserve these results.`}
                      </p>
                      
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }}>Recommendation</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>
                        {val.ui_score < 70 ? `Consider incorporating active ingredients designed to address ${concern?.label.toLowerCase() || key}.` : `Continue your current regimen to support ${concern?.label.toLowerCase() || key}.`}
                      </p>
                      
                      <button className="btn-secondary" style={{ width: '100%', fontSize: '0.8rem', padding: '10px', background: 'var(--bg-primary)' }} onClick={() => {
                        updateState({ 
                          selectedProduct: { 
                            id: `target-${key}`, 
                            name: `Targeted ${concern?.label || key} Treatment`, 
                            brand: 'SkinLab Clinical', 
                            category: 'Treatment', 
                            concerns: [key], 
                            description: `Targeted formula for ${concern?.label.toLowerCase() || key}.`, 
                            ingredients: [], 
                            imageUrl: '' 
                          } 
                        });
                        onNavigate('tryon');
                      }}>
                        🪞 Try On Virtual Treatment
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <button className="btn-primary" style={{ flex: 1 }} onClick={() => onNavigate('products')}>
          ✨ View Recommendations
        </button>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn-secondary" style={{ flex: 1 }} onClick={() => { setPhase('upload'); setPreview(null); }}>
          📸 Re-analyze
        </button>
        <button className="btn-secondary" style={{ flex: 1 }} onClick={() => onNavigate('tryon')}>
          💆 Glow-Up
        </button>
      </div>
    </div>
  );
}
