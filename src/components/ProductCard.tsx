'use client';
import { Product, getConcernSeverity, SKIN_CONCERNS } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  scores?: Record<string, { ui_score: number }>;
  onTryOn?: (product: Product) => void;
}

export default function ProductCard({ product, scores, onTryOn }: ProductCardProps) {
  const matchPercent = product.matchScore ? Math.min(product.matchScore, 99) : 0;
  
  // Get the first matching concern's icon
  const primaryConcern = SKIN_CONCERNS.find(c => product.concerns.includes(c.key));

  return (
    <div className="product-card fade-in-up" id={`product-${product.id}`}>
      <div className="product-image">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            onError={(e) => {
              // Fallback to gradient if image fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = `<div style="width: 100%; height: 100%; background: linear-gradient(135deg, ${primaryConcern?.color || '#9BB8CC'}22, ${primaryConcern?.color || '#9BB8CC'}44); display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">${primaryConcern?.icon || '🧴'}</div>`;
            }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: `linear-gradient(135deg, ${primaryConcern?.color || '#9BB8CC'}22, ${primaryConcern?.color || '#9BB8CC'}44)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem',
          }}>
            {primaryConcern?.icon || '🧴'}
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
          🪄
        </button>
      )}
    </div>
  );
}
