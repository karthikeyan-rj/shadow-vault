import React from 'react';

export default function ProgressBar({ value, color, height = 6, glow = false, style }) {
  const barColor = color || (value >= 100 ? 'var(--danger)' : value >= 80 ? 'var(--warning)' : 'var(--accent)');
  return (
    <div
      style={{
        background: 'rgba(0, 234, 255, 0.03)',
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(0, 234, 255, 0.04)',
        borderRadius: 99,
        overflow: 'hidden',
        height,
        position: 'relative',
        ...style,
      }}
    >
      <div
        style={{
          height: '100%',
          borderRadius: 99,
          width: `${Math.min(100, value)}%`,
          background: `linear-gradient(90deg, ${barColor}, ${barColor}88)`,
          boxShadow: glow ? `0 0 8px ${barColor}44` : 'none',
          transition: 'width 0.8s cubic-bezier(.4,0,.2,1)',
          position: 'relative',
        }}
      >
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2.5s infinite',
        }} />
      </div>
    </div>
  );
}
