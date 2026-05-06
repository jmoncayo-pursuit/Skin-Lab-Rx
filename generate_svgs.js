const fs = require('fs');

const baseColor = '#FFFBF0'; // Very light, neutral cream (clear color)
const stroke = '#2D3748';
const strokeWidth = 5;

const items = [
  { 
    name: 'radiant_cartoon', 
    bg: '#FFF5F5',
    detail: `
      <!-- Radiating aura lines -->
      <path d="M 0 -85 Q 10 -100 0 -115" fill="none" stroke="#F6AD55" stroke-width="4" stroke-linecap="round" />
      <path d="M 0 85 Q -10 100 0 115" fill="none" stroke="#F6AD55" stroke-width="4" stroke-linecap="round" />
      <path d="M -85 0 Q -100 -10 -115 0" fill="none" stroke="#F6AD55" stroke-width="4" stroke-linecap="round" />
      <path d="M 85 0 Q 100 10 115 0" fill="none" stroke="#F6AD55" stroke-width="4" stroke-linecap="round" />
      <path d="M -60 -60 Q -75 -75 -90 -60" fill="none" stroke="#F6AD55" stroke-width="4" stroke-linecap="round" />
      <path d="M 60 60 Q 75 75 90 60" fill="none" stroke="#F6AD55" stroke-width="4" stroke-linecap="round" />
      
      <!-- Base Face -->
      <ellipse cx="0" cy="0" rx="60" ry="75" fill="${baseColor}" stroke="${stroke}" stroke-width="${strokeWidth}" />
      
      <!-- Sparkle -->
      <path d="M -40 -40 Q -30 -40 -30 -50 Q -30 -40 -20 -40 Q -30 -40 -30 -30 Q -30 -40 -40 -40" fill="#F6AD55" />
      
      <!-- Cheeks -->
      <ellipse cx="-30" cy="15" rx="10" ry="6" fill="#FFB6C1" opacity="0.6" />
      <ellipse cx="30" cy="15" rx="10" ry="6" fill="#FFB6C1" opacity="0.6" />
      
      <!-- Eyes & Smile -->
      <circle cx="-20" cy="-5" r="5" fill="${stroke}" />
      <circle cx="20" cy="-5" r="5" fill="${stroke}" />
      <path d="M -8 15 Q 0 25 8 15" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round" />
    ` 
  },
  { 
    name: 'clear_cartoon', 
    bg: '#F0FFF4',
    detail: `
      <!-- Base Face with split line -->
      <ellipse cx="0" cy="0" rx="60" ry="75" fill="${baseColor}" stroke="${stroke}" stroke-width="${strokeWidth}" />
      <line x1="0" y1="-75" x2="0" y2="75" stroke="${stroke}" stroke-width="3" />
      
      <!-- Dots/Pores on the right side -->
      <circle cx="25" cy="-30" r="3" fill="#A0AEC0" />
      <circle cx="40" cy="-10" r="2" fill="#A0AEC0" />
      <circle cx="15" cy="10" r="4" fill="#A0AEC0" />
      <circle cx="35" cy="30" r="3" fill="#A0AEC0" />
      <circle cx="20" cy="45" r="2" fill="#A0AEC0" />
      <circle cx="45" cy="15" r="2.5" fill="#A0AEC0" />
      
      <!-- Cheeks -->
      <ellipse cx="-30" cy="15" rx="10" ry="6" fill="#FFB6C1" opacity="0.6" />
      <ellipse cx="30" cy="15" rx="10" ry="6" fill="#FFB6C1" opacity="0.6" />
      
      <!-- Eyes & Smile -->
      <circle cx="-20" cy="-5" r="5" fill="${stroke}" />
      <circle cx="20" cy="-5" r="5" fill="${stroke}" />
      <path d="M -8 15 Q 0 25 8 15" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round" />
      
      <!-- Magnifying glass icon top left -->
      <circle cx="-60" cy="-60" r="15" fill="#EBF8FF" stroke="${stroke}" stroke-width="3" />
      <line x1="-50" y1="-50" x2="-35" y2="-35" stroke="${stroke}" stroke-width="5" stroke-linecap="round" />
    ` 
  },
  { 
    name: 'youthful_cartoon', 
    bg: '#FFF5F7',
    detail: `
      <!-- Base Face with squiggly plump cheeks -->
      <path d="M 0 -75 C 40 -75 60 -40 60 0 C 60 10 75 20 75 35 C 75 50 60 60 50 65 C 30 75 0 75 0 75 C 0 75 -30 75 -50 65 C -60 60 -75 50 -75 35 C -75 20 -60 10 -60 0 C -60 -40 -40 -75 0 -75 Z" fill="${baseColor}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round" />
      
      <!-- Squiggle motion lines next to cheeks -->
      <path d="M -85 20 Q -95 30 -85 40" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round" />
      <path d="M 85 20 Q 95 30 85 40" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round" />
      
      <!-- Cheeks -->
      <ellipse cx="-40" cy="20" rx="12" ry="8" fill="#FFB6C1" opacity="0.6" />
      <ellipse cx="40" cy="20" rx="12" ry="8" fill="#FFB6C1" opacity="0.6" />
      
      <!-- Eyes & Smile -->
      <circle cx="-20" cy="-5" r="5" fill="${stroke}" />
      <circle cx="20" cy="-5" r="5" fill="${stroke}" />
      
      <!-- Wavy smile -->
      <path d="M -15 25 Q -5 35 0 25 Q 5 35 15 25" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round" />
    ` 
  },
  { 
    name: 'bright_eyes_cartoon', 
    bg: '#FFFFF0',
    detail: `
      <!-- Base Face -->
      <ellipse cx="0" cy="0" rx="60" ry="75" fill="${baseColor}" stroke="${stroke}" stroke-width="${strokeWidth}" />
      
      <!-- Under-eye brightening swooshes -->
      <path d="M -35 15 Q -20 25 -5 15" fill="none" stroke="#90CDF4" stroke-width="6" stroke-linecap="round" opacity="0.7" />
      <path d="M 5 15 Q 20 25 35 15" fill="none" stroke="#90CDF4" stroke-width="6" stroke-linecap="round" opacity="0.7" />
      
      <!-- Giant Sparkly Anime Eyes -->
      <circle cx="-20" cy="-5" r="16" fill="${stroke}" />
      <circle cx="-24" cy="-9" r="6" fill="#FFFFFF" />
      <circle cx="-14" cy="2" r="3" fill="#FFFFFF" />
      
      <circle cx="20" cy="-5" r="16" fill="${stroke}" />
      <circle cx="16" cy="-9" r="6" fill="#FFFFFF" />
      <circle cx="26" cy="2" r="3" fill="#FFFFFF" />
      
      <!-- Sparkle top right -->
      <path d="M 50 -50 Q 60 -50 60 -60 Q 60 -50 70 -50 Q 60 -50 60 -40 Q 60 -50 50 -50" fill="#F6AD55" />
      
      <!-- Smile -->
      <path d="M -6 25 Q 0 32 6 25" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round" />
    ` 
  },
  { 
    name: 'calm_cartoon', 
    bg: '#F7FAFC',
    detail: `
      <!-- Base Face -->
      <ellipse cx="0" cy="0" rx="60" ry="75" fill="${baseColor}" stroke="${stroke}" stroke-width="${strokeWidth}" />
      
      <!-- Little Hearts -->
      <path d="M -60 -40 A 5 5 0 0 1 -50 -40 A 5 5 0 0 1 -40 -40 Q -40 -30 -50 -20 Q -60 -30 -60 -40 Z" fill="#FC8181" stroke="${stroke}" stroke-width="2" />
      <path d="M 50 -10 A 4 4 0 0 1 58 -10 A 4 4 0 0 1 66 -10 Q 66 -2 58 6 Q 50 -2 50 -10 Z" fill="#FC8181" stroke="${stroke}" stroke-width="2" />
      <path d="M 60 30 A 3 3 0 0 1 66 30 A 3 3 0 0 1 72 30 Q 72 36 66 42 Q 60 36 60 30 Z" fill="#FC8181" stroke="${stroke}" stroke-width="2" />
      
      <!-- Cheeks -->
      <ellipse cx="-30" cy="15" rx="10" ry="6" fill="#FFB6C1" opacity="0.6" />
      <ellipse cx="30" cy="15" rx="10" ry="6" fill="#FFB6C1" opacity="0.6" />
      
      <!-- Eyes & Smile -->
      <circle cx="-20" cy="-5" r="5" fill="${stroke}" />
      <circle cx="20" cy="-5" r="5" fill="${stroke}" />
      <path d="M -8 15 Q 0 25 8 15" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round" />
    ` 
  },
  { 
    name: 'spotfree_cartoon', 
    bg: '#FFFAF0',
    detail: `
      <!-- Split diagonal Face -->
      <clipPath id="spotfree-clip">
        <ellipse cx="0" cy="0" rx="60" ry="75" />
      </clipPath>
      
      <ellipse cx="0" cy="0" rx="60" ry="75" fill="${baseColor}" stroke="${stroke}" stroke-width="${strokeWidth}" />
      
      <!-- Spots on bottom right diagonal -->
      <g clip-path="url(#spotfree-clip)">
        <polygon points="60,-75 60,75 -60,75" fill="#FEEBC8" />
        <line x1="60" y1="-75" x2="-60" y2="75" stroke="${stroke}" stroke-width="3" />
        
        <!-- Freckles/Spots -->
        <circle cx="10" cy="10" r="2.5" fill="#9C4221" opacity="0.6" />
        <circle cx="30" cy="5" r="3.5" fill="#9C4221" opacity="0.5" />
        <circle cx="20" cy="25" r="2" fill="#9C4221" opacity="0.7" />
        <circle cx="45" cy="20" r="4" fill="#9C4221" opacity="0.4" />
        <circle cx="35" cy="40" r="2.5" fill="#9C4221" opacity="0.6" />
        <circle cx="15" cy="45" r="3" fill="#9C4221" opacity="0.5" />
        <circle cx="0" cy="30" r="2" fill="#9C4221" opacity="0.5" />
      </g>
      
      <!-- Re-stroke the base to be above the clip -->
      <ellipse cx="0" cy="0" rx="60" ry="75" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" />
      
      <!-- Cheeks -->
      <ellipse cx="-30" cy="15" rx="10" ry="6" fill="#FFB6C1" opacity="0.6" />
      <ellipse cx="30" cy="15" rx="10" ry="6" fill="#FFB6C1" opacity="0.6" />
      
      <!-- Eyes & Smile -->
      <circle cx="-20" cy="-5" r="5" fill="${stroke}" />
      <circle cx="20" cy="-5" r="5" fill="${stroke}" />
      <path d="M -8 15 Q 0 25 8 15" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round" />
    ` 
  }
];

items.forEach(item => {
  const svg = `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <!-- Rounded container background -->
  <rect width="200" height="200" fill="${item.bg}" rx="32" />
  
  <g transform="translate(100, 100)">
    ${item.detail}
  </g>
</svg>`;

  fs.writeFileSync(`public/glow-ups/${item.name}.svg`, svg);
});
console.log('Goal-oriented SVGs generated successfully!');
