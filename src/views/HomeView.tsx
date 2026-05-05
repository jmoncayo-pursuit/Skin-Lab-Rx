'use client';
import type { AppState } from '@/app/page';

interface HomeViewProps {
  state: AppState;
  onNavigate: (tab: string) => void;
}

export default function HomeView({ state, onNavigate }: HomeViewProps) {
  return (
    <div className="container" style={{ paddingTop: 60 }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 16px', background: 'rgba(155,184,204,0.1)',
          borderRadius: 'var(--radius-full)', marginBottom: 16,
          fontSize: '0.75rem', color: 'var(--text-accent)', fontWeight: 600,
        }}>
          ⚡ Powered by Perfect Corp AI
        </div>
        <h1 className="hero-title">
          Skin Lab Rx
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: 320, margin: '0 auto' }}>
          AI-powered skin analysis, personalized product recommendations, and virtual try-on — all from a single selfie.
        </p>
      </div>

      {/* Action Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
        <button
          className="glass-card"
          id="start-analysis-btn"
          onClick={() => onNavigate('analyze')}
          style={{
            display: 'flex', alignItems: 'center', gap: 16, padding: 20,
            cursor: 'pointer', border: '1px solid var(--border-subtle)',
            textAlign: 'left', width: '100%',
          }}
        >
          <div style={{
            width: 52, height: 52, borderRadius: 'var(--radius-md)',
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', flexShrink: 0,
          }}>🔬</div>
          <div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>
              Analyze My Skin
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Upload a selfie for AI-powered skin diagnostics
            </div>
          </div>
          <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '1.2rem' }}>&#8594;</span>
        </button>

        <button
          className="glass-card"
          id="view-products-btn"
          onClick={() => onNavigate('products')}
          style={{
            display: 'flex', alignItems: 'center', gap: 16, padding: 20,
            cursor: 'pointer', border: '1px solid var(--border-subtle)',
            textAlign: 'left', width: '100%', opacity: state.analysisScores ? 1 : 0.5,
          }}
        >
          <div style={{
            width: 52, height: 52, borderRadius: 'var(--radius-md)',
            background: 'var(--gradient-warm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', flexShrink: 0,
          }}>✨</div>
          <div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>
              Product Recommendations
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {state.analysisScores ? 'View your personalized matches' : 'Complete skin analysis first'}
            </div>
          </div>
          <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '1.2rem' }}>&#8594;</span>
        </button>

        <button
          className="glass-card"
          id="try-on-btn"
          onClick={() => onNavigate('tryon')}
          style={{
            display: 'flex', alignItems: 'center', gap: 16, padding: 20,
            cursor: 'pointer', border: '1px solid var(--border-subtle)',
            textAlign: 'left', width: '100%',
          }}
        >
          <div style={{
            width: 52, height: 52, borderRadius: 'var(--radius-md)',
            background: 'var(--gradient-success)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', flexShrink: 0,
          }}>💆</div>
          <div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>
              Glow-Up Preview
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              See how skincare products improve your skin
            </div>
          </div>
          <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '1.2rem' }}>&#8594;</span>
        </button>
      </div>

      {/* Quick Stats (show if analysis done) */}
      {state.analysisScores && state.overallScore !== null && (
        <div className="glass-card fade-in-up" style={{ padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Last Analysis
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32 }}>
            <div>
              <div style={{ fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 800, color: '#8BAFA0' }}>
                {Math.round(state.overallScore)}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Overall</div>
            </div>
            {state.skinAge !== null && (
              <div>
                <div style={{ fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 800, color: 'var(--text-accent)' }}>
                  {state.skinAge}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Skin Age</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: 40, paddingBottom: 20 }}>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Built for the Perfect Corp × Startup World Cup Hackathon
          <br />
          Powered by YouCam AI APIs
        </p>
      </div>
    </div>
  );
}
