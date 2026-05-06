const fs = require('fs');

const colors = [
  { name: 'radiant_cartoon', color: '#E9D8FD', bg: '#FAF5FF', detail: 'aura' },
  { name: 'clear_cartoon', color: '#C6F6D5', bg: '#F0FFF4', detail: 'sparkle' },
  { name: 'youthful_cartoon', color: '#BEE3F8', bg: '#EBF8FF', detail: 'dew' },
  { name: 'bright_eyes_cartoon', color: '#FEFCBF', bg: '#FFFFF0', detail: 'eyes' },
  { name: 'calm_cartoon', color: '#E2E8F0', bg: '#F7FAFC', detail: 'none' },
  { name: 'spotfree_cartoon', color: '#D6BCFA', bg: '#FAF5FF', detail: 'sparkle' }
];

colors.forEach(item => {
  let extra = '';
  if (item.detail === 'aura') {
    extra = `<circle cx="100" cy="100" r="85" fill="none" stroke="#D6BCFA" stroke-width="4" opacity="0.5" stroke-dasharray="10 10" />`;
  } else if (item.detail === 'sparkle') {
    extra = `
      <path d="M 40 50 Q 50 50 50 40 Q 50 50 60 50 Q 50 50 50 60 Q 50 50 40 50" fill="#ECC94B" opacity="0.6"/>
      <path d="M 150 140 Q 155 140 155 135 Q 155 140 160 140 Q 155 140 155 145 Q 155 140 150 140" fill="#ECC94B" opacity="0.6"/>
    `;
  }

  const svg = `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="${item.bg}" rx="32" />
  ${extra}
  <!-- Face Base (Hairless oval) -->
  <ellipse cx="100" cy="100" rx="55" ry="70" fill="${item.color}" />
  
  <!-- Cheeks -->
  <ellipse cx="70" cy="110" rx="10" ry="6" fill="#F687B3" opacity="0.3" />
  <ellipse cx="130" cy="110" rx="10" ry="6" fill="#F687B3" opacity="0.3" />
  
  <!-- Eyes -->
  <circle cx="75" cy="95" r="${item.detail === 'eyes' ? 7 : 5}" fill="#4A5568" />
  <circle cx="125" cy="95" r="${item.detail === 'eyes' ? 7 : 5}" fill="#4A5568" />
  
  <!-- Eyebrows (Soft dots/arcs) -->
  <path d="M 65 80 Q 75 75 85 80" fill="none" stroke="#4A5568" stroke-width="3" stroke-linecap="round" opacity="0.6" />
  <path d="M 115 80 Q 125 75 135 80" fill="none" stroke="#4A5568" stroke-width="3" stroke-linecap="round" opacity="0.6" />
  
  <!-- Smile -->
  <path d="M 88 130 Q 100 140 112 130" fill="none" stroke="#4A5568" stroke-width="3.5" stroke-linecap="round" />
</svg>`;

  fs.writeFileSync(`public/glow-ups/${item.name}.svg`, svg);
});
console.log('SVGs generated successfully!');
