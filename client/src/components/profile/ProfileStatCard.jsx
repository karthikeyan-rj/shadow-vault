import React from 'react';

export default function ProfileStatCard({ label, value, color, onClick, className = '' }) {
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        padding: '12px 14px',
        borderRadius: 'var(--radius-sm)',
        background: 'rgba(0, 0, 0, 0.2)',
        border: '1px solid var(--glass-border)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'var(--transition)',
      }}
      onMouseEnter={e => {
        if (onClick) {
          e.currentTarget.style.borderColor = 'rgba(0, 234, 255, 0.2)';
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
        }
      }}
      onMouseLeave={e => {
        if (onClick) {
          e.currentTarget.style.borderColor = 'var(--glass-border)';
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)';
        }
      }}
    >
      <div style={{
        fontSize: 9, color: 'var(--text-tertiary)',
        fontFamily: 'var(--font-display)', letterSpacing: '0.06em',
        marginBottom: 4, fontWeight: 700,
      }}>
        {label}
      </div>
      <div style={{ fontSize: 16, fontWeight: 800, color, fontFamily: 'var(--font-display)' }}>
        {value ?? '-'}
      </div>
    </div>
  );
}
