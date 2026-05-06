export interface SkinConcern {
  key: string;
  label: string;
  icon: string;
  description: string;
  color: string;
}

export interface SkinScore {
  type: string;
  ui_score: number;
  raw_score: number;
  mask_urls?: string[];
}

export interface AnalysisResult {
  scores: Record<string, {
    raw_score: number;
    ui_score: number;
    output_mask_name?: string;
  }>;
  overall: number;
  skinAge: number;
  topConcerns: string[];
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  concerns: string[];
  description: string;
  ingredients: string[];
  imageUrl: string;
  referenceImageUrl?: string;
  matchScore?: number;
}

export interface TryOnResult {
  originalUrl: string;
  resultUrl: string;
}

export const SKIN_CONCERNS: SkinConcern[] = [
  { key: 'acne', label: 'Acne', icon: '🫧', description: 'Breakouts & blemishes', color: '#C48B8B' },
  { key: 'wrinkle', label: 'Wrinkles', icon: '〰️', description: 'Fine lines & creases', color: '#C4AA7B' },
  { key: 'pore', label: 'Pores', icon: '◌', description: 'Enlarged or visible pores', color: '#C4997B' },
  { key: 'texture', label: 'Texture', icon: '✦', description: 'Uneven skin texture', color: '#9BAAC4' },
  { key: 'moisture', label: 'Hydration', icon: '💧', description: 'Dryness & dehydration', color: '#7BB8C4' },
  { key: 'oiliness', label: 'Oiliness', icon: '✨', description: 'Excess oil production', color: '#8BAFA0' },
  { key: 'redness', label: 'Redness', icon: '🌸', description: 'Irritation & redness', color: '#C4A7A7' },
  { key: 'dark_circle_v2', label: 'Dark Circles', icon: '🌙', description: 'Under-eye discoloration', color: '#8B9BC4' },
  { key: 'age_spot', label: 'Dark Spots', icon: '🤎', description: 'Hyperpigmentation', color: '#B09070' },
  { key: 'radiance', label: 'Radiance', icon: '🌟', description: 'Dullness & lack of glow', color: '#C4B87B' },
  { key: 'firmness', label: 'Firmness', icon: '🛡️', description: 'Loss of elasticity', color: '#7BA4C4' },
  { key: 'eye_bag', label: 'Eye Bags', icon: '🧊', description: 'Puffiness under eyes', color: '#A78BC4' },
];

export function getScoreColor(score: number): string {
  if (score >= 85) return '#8BAFA0'; // Green
  if (score >= 70) return '#C4B87B'; // Yellowish green
  if (score >= 50) return '#C4997B'; // Orange
  if (score >= 30) return '#C48B8B'; // Red
  return '#A86E6E'; // Dark Red (Extreme)
}

export function getScoreLabel(score: number): string {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  if (score >= 30) return 'Needs Work';
  return 'Extreme';
}

export function getConcernSeverity(score: number): 'low' | 'moderate' | 'high' | 'extreme' {
  // Lower score = more severe concern
  if (score >= 75) return 'low';
  if (score >= 50) return 'moderate';
  if (score >= 30) return 'high';
  return 'extreme';
}
