import React from 'react';

export default function Card({ children, style, hover = true, glow = false, className = '', ...props }) {
  return (
    <div
      className={className}
      style={{
        background: 'rgba(8, 20, 40, 0.55)',
        backdropFilter: 'blur(22px) saturate(160%)',
        WebkitBackdropFilter: 'blur(22px) saturate(160%)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-md)',
        padding: 20,
        transition: 'var(--transition)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: glow
          ? '0 8px 32px rgba(0,0,0,0.45), 0 0 20px rgba(0, 234, 255, 0.06), inset 0 1px 0 rgba(255,255,255,0.025)'
          : '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.025)',
        ...style,
      }}
      onMouseEnter={e => {
        if (hover) {
          e.currentTarget.style.borderColor = 'rgba(0, 234, 255, 0.18)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.45), 0 0 25px rgba(0, 234, 255, 0.06), inset 0 1px 0 rgba(255,255,255,0.03)';
        }
      }}
      onMouseLeave={e => {
        if (hover) {
          e.currentTarget.style.borderColor = 'var(--glass-border)';
          e.currentTarget.style.boxShadow = glow
            ? '0 8px 32px rgba(0,0,0,0.45), 0 0 20px rgba(0, 234, 255, 0.06), inset 0 1px 0 rgba(255,255,255,0.025)'
            : '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.025)';
        }
      }}
      {...props}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(ellipse at 20% 15%, rgba(0, 234, 255, 0.04) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
