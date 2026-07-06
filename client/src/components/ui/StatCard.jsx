import React from 'react';

export default function StatCard({ label, value, icon, color, sub, glow, style, rank, className = '' }) {
  return (
    <div
      className={className}
      style={{
        background: 'rgba(8, 20, 40, 0.55)',
        backdropFilter: 'blur(22px) saturate(160%)',
        WebkitBackdropFilter: 'blur(22px) saturate(160%)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-md)',
        padding: 18,
        position: 'relative',
        overflow: 'hidden',
        transition: 'var(--transition)',
        boxShadow: glow
          ? '0 8px 32px rgba(0,0,0,0.45), 0 0 15px rgba(0, 234, 255, 0.05), inset 0 1px 0 rgba(255,255,255,0.025)'
          : '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.025)',
        ...style,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'rgba(0, 234, 255, 0.18)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.45), 0 0 25px rgba(0, 234, 255, 0.06), inset 0 1px 0 rgba(255,255,255,0.03)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.borderColor = 'var(--glass-border)';
        e.currentTarget.style.boxShadow = glow
          ? '0 8px 32px rgba(0,0,0,0.45), 0 0 15px rgba(0, 234, 255, 0.05), inset 0 1px 0 rgba(255,255,255,0.025)'
          : '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.025)';
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(ellipse at 20% 15%, rgba(0, 234, 255, 0.04) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 9,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            marginBottom: 6,
          }}>
            {label}
          </div>
          <div style={{
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: '-0.5px',
            color: color || 'var(--text-primary)',
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {value}
            {rank && <span style={{ fontSize: 9, fontWeight: 700, marginLeft: 6, opacity: 0.6, fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>{rank}</span>}
          </div>
          {sub && (
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
              {sub}
            </div>
          )}
        </div>
        {icon && (
          <div style={{
            width: 38,
            height: 38,
            background: 'rgba(0, 234, 255, 0.06)',
            backdropFilter: 'blur(8px)',
            borderRadius: 8,
            border: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            flexShrink: 0,
          }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
