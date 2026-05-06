import { useState } from 'react';
import { Product, getConcernSeverity, SKIN_CONCERNS } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  scores?: Record<string, { ui_score: number }>;
  onTryOn?: (product: Product) => void;
}

export default function ProductCard({ product, scores, onTryOn }: ProductCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const matchPercent = product.matchScore ? Math.min(product.matchScore, 99) : 0;
  
  // Get the first matching concern's icon
  const primaryConcern = SKIN_CONCERNS.find(c => product.concerns.includes(c.key));

  return (
    <div 
      className="product-card fade-in-up" 
      id={`product-${product.id}`}
      onClick={() => setIsExpanded(!isExpanded)}
      style={{ cursor: 'pointer', flexDirection: 'column' }}
    >
      <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 16 }}>
      <div className="product-image">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            onError={(e) => {
              // Fallback to gradient if image fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = `<div style="width: 100%; height: 100%; background: linear-gradient(135deg, ${primaryConcern?.color || '#9BB8CC'}22, ${primaryConcern?.color || '#9BB8CC'}44); display: flex; align-items: center; justify-content: center; font-size: 2rem; color: ${primaryConcern?.color || '#9BB8CC'}">🧴</div>`;
            }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: `linear-gradient(135deg, ${primaryConcern?.color || '#9BB8CC'}22, ${primaryConcern?.color || '#9BB8CC'}44)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem',
            color: primaryConcern?.color || '#9BB8CC'
          }}>
            🧴
          </div>
        )}
      </div>
      <div className="product-info">
        <div className="product-name">{product.name}</div>
        <div className="product-brand">{product.brand} · {product.category}</div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          {matchPercent > 0 && (
            <span className="product-match">
              ✓ {matchPercent}% match
            </span>
          )}
          {product.concerns.slice(0, 2).map(c => {
            const concern = SKIN_CONCERNS.find(sc => sc.key === c);
            const severity = scores?.[c] ? getConcernSeverity(scores[c].ui_score) : 'moderate';
            return (
              <span key={c} className={`badge ${severity === 'high' ? 'danger' : severity === 'moderate' ? 'warning' : 'success'}`}>
                {concern?.label || c}
              </span>
            );
          })}
        </div>
      </div>
      {onTryOn && (
        <button
          className="btn-icon"
          onClick={e => { e.stopPropagation(); onTryOn(product); }}
          title="Virtual Try-On"
          style={{ alignSelf: 'center' }}
        >
          🪞
        </button>
      )}
      </div>

      {isExpanded && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-color)', width: '100%', animation: 'fadeIn 0.3s ease-out' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
            {product.description}
          </p>
          
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Key Ingredients</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
              {product.ingredients?.map(ing => (
                <span key={ing} style={{ fontSize: '0.7rem', background: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: 4, color: 'var(--text-primary)' }}>
                  {ing}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Treats</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
              {product.concerns.map(c => {
                const concern = SKIN_CONCERNS.find(sc => sc.key === c);
                const score = scores?.[c];
                return (
                  <div key={c} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>{concern?.icon} {concern?.label || c}</span>
                    {score && (
                      <strong style={{ color: `var(--color-${getConcernSeverity(score.ui_score)})` }}>
                        Your Score: {score.ui_score}
                      </strong>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
