'use client';
import type { AppState } from '@/app/page';
import ProductCard from '@/components/ProductCard';
import { matchProducts, PRODUCT_DATABASE } from '@/lib/products';
import { SKIN_CONCERNS, Product } from '@/lib/types';

interface ProductsViewProps {
  state: AppState;
  onNavigate: (tab: string) => void;
  updateState?: (partial: Partial<AppState>) => void;
}

export default function ProductsView({ state, onNavigate, updateState }: ProductsViewProps) {
  const scores = state.analysisScores;

  const handleTryOn = (product: Product) => {
    updateState?.({ selectedProduct: product });
    onNavigate('tryon');
  };

  if (!scores || Object.keys(scores).length === 0) {
    return (
      <div className="container" style={{ paddingTop: 48, textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 12 }}>Product Recommendations</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 32 }}>
          Complete a skin analysis first to get personalized product matches.
        </p>
        <button className="btn-primary" onClick={() => onNavigate('analyze')}>
          🔬 Start Analysis
        </button>
      </div>
    );
  }

  const recommended = matchProducts(scores);

  // Find top 3 worst concerns to display
  const sortedConcerns = Object.entries(scores)
    .filter(([key]) => !['all', 'skin_age'].includes(key))
    .sort(([, a], [, b]) => a.ui_score - b.ui_score)
    .slice(0, 3);

  return (
    <div className="container" style={{ paddingTop: 48 }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>Your Matches</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>
        Products matched to your top skin concerns
      </p>

      {/* Top Concerns Tags */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {sortedConcerns.map(([key, val]) => {
          const concern = SKIN_CONCERNS.find(c => c.key === key);
          return (
            <span key={key} className="concern-tag active">
              {concern?.icon} {concern?.label || key} · {val.ui_score}
            </span>
          );
        })}
      </div>

      <div className="glass-card fade-in-up" style={{ padding: 16, marginBottom: 32, background: 'linear-gradient(135deg, rgba(155,184,204,0.1), rgba(139,175,160,0.05))', border: '1px solid var(--border-accent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: '1.2rem' }}>💡</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700 }}>
            Why these products?
          </span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          Your AI scan identified <strong>{sortedConcerns.map(([k]) => SKIN_CONCERNS.find(c => c.key === k)?.label || k).join(', ')}</strong> as your primary areas for improvement. 
          The products below were specifically filtered because they contain clinical active ingredients proven to target these exact concerns.
        </p>
      </div>

      {/* Recommended Products */}
      <div className="section-header">
        <span className="section-title">Recommended for You</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{recommended.length} products</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        {recommended.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            scores={scores}
            onTryOn={() => handleTryOn(product)}
          />
        ))}
      </div>

      {/* All Products */}
      <div className="section-header">
        <span className="section-title">Full Catalog</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{PRODUCT_DATABASE.length} products</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {PRODUCT_DATABASE.filter(p => !recommended.find(r => r.id === p.id)).map(product => (
          <ProductCard
            key={product.id}
            product={product}
            scores={scores}
            onTryOn={() => handleTryOn(product)}
          />
        ))}
      </div>
    </div>
  );
}
