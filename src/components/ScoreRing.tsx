'use client';
import { getScoreColor } from '@/lib/types';

interface ScoreRingProps {
  score: number;
  label: string;
  size?: number;
}

export default function ScoreRing({ score, label, size = 80 }: ScoreRingProps) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle className="track" cx={size/2} cy={size/2} r={radius} strokeWidth={4} />
        <circle
          className="progress"
          cx={size/2} cy={size/2} r={radius}
          strokeWidth={4}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="label">
        <span className="value" style={{ color, fontSize: size > 60 ? '1.4rem' : '1rem' }}>{score}</span>
        <span className="sub">{label}</span>
      </div>
    </div>
  );
}
