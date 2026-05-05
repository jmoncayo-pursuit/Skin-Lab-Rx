import { Product } from './types';

/**
 * Curated product database.
 * Each product maps to specific skin concerns detected by the AI analysis.
 * Products are matched to users based on their lowest-scoring (most severe) concerns.
 */
export const PRODUCT_DATABASE: Product[] = [
  // ── Acne ──
  {
    id: 'sa-cleanser',
    name: 'Salicylic Acid 2% Cleanser',
    brand: 'CeraVe',
    category: 'Cleanser',
    concerns: ['acne', 'pore', 'oiliness'],
    description: 'Medicated gel cleanser with 2% salicylic acid, niacinamide, and ceramides to clear breakouts without stripping skin.',
    ingredients: ['Salicylic Acid', 'Niacinamide', 'Ceramides'],
    imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'bp-treatment',
    name: 'Benzoyl Peroxide 2.5% Spot Treatment',
    brand: 'Paula\'s Choice',
    category: 'Treatment',
    concerns: ['acne'],
    description: 'Targeted spot treatment that kills acne-causing bacteria while soothing redness.',
    ingredients: ['Benzoyl Peroxide', 'Bisabolol', 'Allantoin'],
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80',
  },

  // ── Wrinkles & Firmness ──
  {
    id: 'retinol-serum',
    name: 'Retinol 0.5% Serum',
    brand: 'The Ordinary',
    category: 'Serum',
    concerns: ['wrinkle', 'firmness', 'texture'],
    description: 'Water-free retinol solution that targets fine lines and improves skin renewal.',
    ingredients: ['Retinol', 'Squalane'],
    imageUrl: 'https://images.unsplash.com/photo-1615397323864-777e4860bca7?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'peptide-cream',
    name: 'Multi-Peptide + HA Serum',
    brand: 'The Ordinary',
    category: 'Serum',
    concerns: ['wrinkle', 'firmness'],
    description: 'Multi-technology peptide serum targeting signs of aging with hyaluronic acid.',
    ingredients: ['Matrixyl', 'Argireline', 'Hyaluronic Acid'],
    imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=400&q=80',
  },

  // ── Pores & Texture ──
  {
    id: 'niacinamide-serum',
    name: 'Niacinamide 10% + Zinc 1%',
    brand: 'The Ordinary',
    category: 'Serum',
    concerns: ['pore', 'oiliness', 'texture', 'acne'],
    description: 'High-strength niacinamide serum to minimize pore appearance and balance oil.',
    ingredients: ['Niacinamide', 'Zinc PCA'],
    imageUrl: 'https://images.unsplash.com/photo-1608248593836-829d661e1bd9?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'bha-exfoliant',
    name: '2% BHA Liquid Exfoliant',
    brand: 'Paula\'s Choice',
    category: 'Exfoliant',
    concerns: ['pore', 'texture', 'acne'],
    description: 'Leave-on exfoliant that unclogs pores and smooths skin texture.',
    ingredients: ['Salicylic Acid', 'Green Tea', 'Methylpropanediol'],
    imageUrl: 'https://images.unsplash.com/photo-1571781526291-c277f52a48b8?auto=format&fit=crop&w=400&q=80',
  },

  // ── Hydration & Moisture ──
  {
    id: 'ha-serum',
    name: 'Hyaluronic Acid 2% + B5',
    brand: 'The Ordinary',
    category: 'Serum',
    concerns: ['moisture', 'texture'],
    description: 'Multi-weight hyaluronic acid serum for deep, lasting hydration.',
    ingredients: ['Hyaluronic Acid', 'Panthenol', 'Vitamin B5'],
    imageUrl: 'https://images.unsplash.com/photo-1615397323864-777e4860bca7?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'moisturizer-pm',
    name: 'PM Facial Moisturizing Lotion',
    brand: 'CeraVe',
    category: 'Moisturizer',
    concerns: ['moisture', 'firmness', 'redness'],
    description: 'Lightweight moisturizer with ceramides and niacinamide for overnight repair.',
    ingredients: ['Ceramides', 'Niacinamide', 'Hyaluronic Acid'],
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&q=80',
  },

  // ── Redness & Sensitivity ──
  {
    id: 'azelaic-acid',
    name: 'Azelaic Acid Suspension 10%',
    brand: 'The Ordinary',
    category: 'Treatment',
    concerns: ['redness', 'acne', 'texture'],
    description: 'Multi-functional brightening formula that targets redness, blemishes, and texture.',
    ingredients: ['Azelaic Acid'],
    imageUrl: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'cica-cream',
    name: 'Cicaplast Baume B5+',
    brand: 'La Roche-Posay',
    category: 'Moisturizer',
    concerns: ['redness', 'moisture'],
    description: 'Ultra-repairing balm for sensitive, irritated, or compromised skin barrier.',
    ingredients: ['Panthenol', 'Madecassoside', 'Shea Butter'],
    imageUrl: 'https://images.unsplash.com/photo-1556228720-1c2a4684c908?auto=format&fit=crop&w=400&q=80',
  },

  // ── Dark Circles & Eye Bags ──
  {
    id: 'caffeine-eye',
    name: 'Caffeine Solution 5% + EGCG',
    brand: 'The Ordinary',
    category: 'Eye Care',
    concerns: ['dark_circle_v2', 'eye_bag'],
    description: 'Concentrated caffeine formula targeting puffiness and dark circles.',
    ingredients: ['Caffeine', 'EGCG', 'Glycerin'],
    imageUrl: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=400&q=80',
  },

  // ── Dark Spots & Radiance ──
  {
    id: 'vitamin-c',
    name: 'Vitamin C Suspension 23% + HA Spheres 2%',
    brand: 'The Ordinary',
    category: 'Serum',
    concerns: ['age_spot', 'radiance', 'wrinkle'],
    description: 'High-concentration vitamin C for brightening dark spots and boosting radiance.',
    ingredients: ['Ascorbic Acid', 'Hyaluronic Acid'],
    imageUrl: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'alpha-arbutin',
    name: 'Alpha Arbutin 2% + HA',
    brand: 'The Ordinary',
    category: 'Serum',
    concerns: ['age_spot', 'radiance'],
    description: 'Concentrated alpha arbutin to reduce dark spots and even skin tone.',
    ingredients: ['Alpha Arbutin', 'Hyaluronic Acid'],
    imageUrl: 'https://images.unsplash.com/photo-1608248593836-829d661e1bd9?auto=format&fit=crop&w=400&q=80',
  },

  // ── Oiliness ──
  {
    id: 'clay-mask',
    name: 'Rare Earth Deep Pore Cleansing Mask',
    brand: 'Kiehl\'s',
    category: 'Mask',
    concerns: ['oiliness', 'pore'],
    description: 'Mineral clay mask that draws out impurities and absorbs excess oil.',
    ingredients: ['Amazonian White Clay', 'Bentonite', 'Oat Kernel'],
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&q=80',
  },

  // ── SPF (recommended for everyone) ──
  {
    id: 'sunscreen',
    name: 'UV Essence SPF 50+ PA++++',
    brand: 'Bioré',
    category: 'Sunscreen',
    concerns: ['age_spot', 'wrinkle', 'radiance', 'redness'],
    description: 'Lightweight, watery sunscreen that protects against UV damage without white cast.',
    ingredients: ['Octinoxate', 'Tinosorb S', 'Hyaluronic Acid'],
    imageUrl: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=400&q=80',
  },
];

/**
 * Match products to detected skin concerns.
 * Scores are inverted: lower AI score = more severe concern = higher priority.
 */
export function matchProducts(
  scores: Record<string, { raw_score: number; ui_score: number }>,
  limit = 6
): Product[] {
  // Find concerns with lowest scores (most problematic)
  const sortedConcerns = Object.entries(scores)
    .filter(([key]) => !['all', 'skin_age'].includes(key))
    .sort(([, a], [, b]) => a.ui_score - b.ui_score)
    .map(([key]) => key);

  const topConcerns = sortedConcerns.slice(0, 4);

  // Score each product based on concern overlap
  const scored = PRODUCT_DATABASE.map(product => {
    let matchScore = 0;
    product.concerns.forEach(concern => {
      const idx = topConcerns.indexOf(concern);
      if (idx !== -1) {
        // Higher weight for more severe concerns
        matchScore += (topConcerns.length - idx) * 25;
      }
    });
    return { ...product, matchScore };
  });

  return scored
    .filter(p => p.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}
