'use client';

interface BottomNavProps {
  active: string;
  onNavigate: (tab: string) => void;
}

const tabs = [
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'analyze', icon: '🔬', label: 'Analyze' },
  { id: 'products', icon: '✨', label: 'Products' },
  { id: 'tryon', icon: '🪄', label: 'Try On' },
];

export default function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <nav className="bottom-nav" id="bottom-nav">
      {tabs.map(tab => (
        <button
          key={tab.id}
          id={`nav-${tab.id}`}
          className={`nav-item${active === tab.id ? ' active' : ''}`}
          onClick={() => onNavigate(tab.id)}
        >
          <span className="nav-icon">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
