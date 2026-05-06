const fs = require('fs');

const items = [
  // Bubblegum / Gold / Squishy Oval
  { name: 'radiant_cartoon', color1: '#FFB6C1', color2: '#FFD700', shape: '<ellipse cx="0" cy="0" rx="65" ry="55" fill="url(#grad)" stroke="#2D3748" stroke-width="5" />' },
  // Mint / Ice / Squircle (BMO-ish)
  { name: 'clear_cartoon', color1: '#9AE6B4', color2: '#E0FFFF', shape: '<rect x="-55" y="-55" width="110" height="110" rx="35" fill="url(#grad)" stroke="#2D3748" stroke-width="5" />' },
  // Plum / Pink / Gumdrop
  { name: 'youthful_cartoon', color1: '#DDA0DD', color2: '#FFB6C1', shape: '<path d="M -50 0 A 50 50 0 1 1 50 0 L 50 30 A 50 30 0 0 1 -50 30 Z" fill="url(#grad)" stroke="#2D3748" stroke-width="5" />' },
  // Lemon / Pink / Wide Pill
  { name: 'bright_eyes_cartoon', color1: '#FAF089', color2: '#FFC0CB', shape: '<rect x="-70" y="-45" width="140" height="90" rx="45" fill="url(#grad)" stroke="#2D3748" stroke-width="5" />' },
  // Lavender / Powder / Rounded Triangle (LSP vibes)
  { name: 'calm_cartoon', color1: '#E6E6FA', color2: '#B0E0E6', shape: '<path d="M 0 -60 Q 60 -60 60 10 Q 60 60 0 50 Q -60 60 -60 10 Q -60 -60 0 -60" fill="url(#grad)" stroke="#2D3748" stroke-width="5" />' },
  // Navajo / Misty / Perfect Circle
  { name: 'spotfree_cartoon', color1: '#FFE4E1', color2: '#FFDEAD', shape: '<circle cx="0" cy="0" r="55" fill="url(#grad)" stroke="#2D3748" stroke-width="5" />' }
];

items.forEach((item, i) => {
  const svg = `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Vibrant split gradient -->
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="30%" stop-color="${item.color1}" />
      <stop offset="100%" stop-color="${item.color2}" />
    </linearGradient>
  </defs>
  
  <rect width="200" height="200" fill="#F7FAFC" rx="32" />
  
  <g transform="translate(100, 100)">
    <!-- Quirky geometric background element -->
    <circle cx="-35" cy="-45" r="18" fill="${item.color2}" opacity="0.8" stroke="#2D3748" stroke-width="3"/>
    <rect x="25" y="35" width="28" height="28" fill="${item.color1}" opacity="0.8" stroke="#2D3748" stroke-width="3" rx="8" transform="rotate(15)" />
    
    <!-- Base Shape -->
    ${item.shape}
    
    <!-- Cheeks (classic AT rosy ovals) -->
    <ellipse cx="-35" cy="10" rx="10" ry="6" fill="#FF69B4" opacity="0.6" />
    <ellipse cx="35" cy="10" rx="10" ry="6" fill="#FF69B4" opacity="0.6" />
    
    <!-- Eyes (Thick black dots, widely spaced) -->
    <circle cx="-25" cy="-5" r="6.5" fill="#2D3748" />
    <circle cx="25" cy="-5" r="6.5" fill="#2D3748" />
    
    <!-- Mouth (Simple cute curve, no nose) -->
    <path d="M -8 18 Q 0 28 8 18" fill="none" stroke="#2D3748" stroke-width="4.5" stroke-linecap="round" />
  </g>
</svg>`;

  fs.writeFileSync(`public/glow-ups/${item.name}.svg`, svg);
});
console.log('Adventure Time SVGs generated successfully!');
