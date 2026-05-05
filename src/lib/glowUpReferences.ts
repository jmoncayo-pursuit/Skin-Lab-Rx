/**
 * Glow-Up Reference Library
 * 
 * Maps skin concerns to curated "glow up" reference looks.
 * These reference images represent the "ideal after" state for each concern.
 * The mu-transfer API will blend the reference's skin qualities onto the user's selfie.
 * 
 * For the hackathon, we use the user's OWN selfie as a baseline and let
 * the mu-transfer API blend skin-smoothing from high-quality reference faces.
 */

export interface GlowUpLook {
  id: string;
  name: string;
  description: string;
  concerns: string[];
  emoji: string;
  /** The reference image URL for mu-transfer */
  referenceUrl: string;
}

/**
 * Curated glow-up looks — each targets specific skin concerns.
 * The mu-transfer API transfers makeup + skin texture from reference → target.
 * For skincare, we use references with flawless skin in the concern area,
 * producing a subtle but visible improvement.
 */
export const GLOW_UP_LOOKS: GlowUpLook[] = [
  {
    id: 'radiant-glow',
    name: 'Radiant Glow',
    description: 'Dewy, luminous skin with even tone and natural radiance',
    concerns: ['radiance', 'moisture', 'texture', 'age_spot'],
    emoji: '✨',
    referenceUrl: '/glow-ups/radiant.jpg',
  },
  {
    id: 'clear-skin',
    name: 'Clear & Smooth',
    description: 'Poreless, blemish-free complexion with refined texture',
    concerns: ['acne', 'pore', 'texture', 'oiliness'],
    emoji: '🪞',
    referenceUrl: '/glow-ups/clear.jpg',
  },
  {
    id: 'youthful-firm',
    name: 'Youthful & Firm',
    description: 'Plump, firm skin with minimized fine lines',
    concerns: ['wrinkle', 'firmness', 'moisture'],
    emoji: '🌸',
    referenceUrl: '/glow-ups/youthful.jpg',
  },
  {
    id: 'bright-eyes',
    name: 'Bright Eyes',
    description: 'Refreshed under-eye area, reduced puffiness and circles',
    concerns: ['dark_circle_v2', 'eye_bag'],
    emoji: '👁️',
    referenceUrl: '/glow-ups/bright-eyes.jpg',
  },
  {
    id: 'calm-even',
    name: 'Calm & Even',
    description: 'Soothed, redness-free skin with balanced tone',
    concerns: ['redness', 'texture', 'moisture'],
    emoji: '🩷',
    referenceUrl: '/glow-ups/calm.jpg',
  },
  {
    id: 'spot-free',
    name: 'Spot-Free Glow',
    description: 'Even-toned complexion without dark spots or discoloration',
    concerns: ['age_spot', 'radiance', 'texture'],
    emoji: '☀️',
    referenceUrl: '/glow-ups/spotfree.jpg',
  },
];

/**
 * Find the best glow-up look(s) for a given set of skin concerns.
 */
export function matchGlowUps(concerns: string[]): GlowUpLook[] {
  const scored = GLOW_UP_LOOKS.map(look => {
    let score = 0;
    look.concerns.forEach(c => {
      if (concerns.includes(c)) score += 1;
    });
    return { ...look, score };
  });

  return scored
    .filter(l => l.score > 0)
    .sort((a, b) => b.score - a.score);
}

/**
 * Find the best glow-up look for a specific product based on its concerns.
 */
export function matchGlowUpForProduct(productConcerns: string[]): GlowUpLook | null {
  const matches = matchGlowUps(productConcerns);
  return matches.length > 0 ? matches[0] : null;
}
