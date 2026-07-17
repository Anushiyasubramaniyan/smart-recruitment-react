import React, { useEffect, useState } from 'react';

export default function ScoreRing({ score = 0, size = 84 }) {
  const [animatedOffset, setAnimatedOffset] = useState(null);
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (score / 100) * circumference;

  useEffect(() => {
    setAnimatedOffset(circumference); // start fully unfilled
    const t = requestAnimationFrame(() => setAnimatedOffset(targetOffset));
    return () => cancelAnimationFrame(t);
  }, [score, circumference, targetOffset]);

  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle className="bg" cx={size / 2} cy={size / 2} r={radius} />
        <circle
          className="fg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset ?? circumference}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="score-label">{score}%</div>
    </div>
  );
}
