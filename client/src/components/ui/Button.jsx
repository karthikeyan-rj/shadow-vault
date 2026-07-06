import React from 'react';

const variants = {
  primary: {
    background: 'linear-gradient(135deg, #0099cc, #00eaff)',
    color: '#050816',
    border: 'none',
    boxShadow: '0 2px 12px rgba(0, 234, 255, 0.25)',
    fontWeight: 800,
  },
  secondary: {
    background: 'rgba(8, 20, 40, 0.55)',
    backdropFilter: 'blur(12px) saturate(160%)',
    color: 'var(--text-primary)',
    border: '1px solid var(--glass-border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--glass-border)',
    backdropFilter: 'blur(4px)',
  },
  danger: {
    background: 'transparent',
    color: 'var(--danger)',
    border: '1px solid rgba(239,68,68,0.25)',
    backdropFilter: 'blur(4px)',
  },
  success: {
    background: 'rgba(34,197,94,0.06)',
    backdropFilter: 'blur(8px)',
    color: 'var(--success)',
    border: '1px solid rgba(34,197,94,0.18)',
  },
  gold: {
    background: 'linear-gradient(135deg, #a16207, #facc15)',
    color: '#050816',
    border: 'none',
    boxShadow: '0 2px 12px rgba(250, 204, 21, 0.25)',
    fontWeight: 800,
  },
  purple: {
    background: 'linear-gradient(135deg, #5b21b6, #7c3aed)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 2px 12px rgba(124, 58, 237, 0.25)',
  },
};

export default function Button({ children, variant = 'primary', size = 'md', onClick, style, disabled, fullWidth, ...props }) {
  const sizeStyles = {
    sm: { padding: '4px 10px', fontSize: 11, borderRadius: 'var(--radius-sm)' },
    md: { padding: '8px 18px', fontSize: 13, borderRadius: 'var(--radius-sm)' },
    lg: { padding: '11px 24px', fontSize: 14, borderRadius: 'var(--radius-sm)' },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: 'var(--font)',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        transition: 'var(--transition)',
        opacity: disabled ? 0.4 : 1,
        letterSpacing: '0.03em',
        position: 'relative',
        overflow: 'hidden',
        width: fullWidth ? '100%' : undefined,
        ...variants[variant],
        ...sizeStyles[size],
        ...style,
      }}
      onMouseEnter={e => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(-1px)';
          if (variant === 'primary') e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 234, 255, 0.35)';
          if (variant === 'gold') e.currentTarget.style.boxShadow = '0 4px 20px rgba(250, 204, 21, 0.35)';
          if (variant === 'purple') e.currentTarget.style.boxShadow = '0 4px 20px rgba(124, 58, 237, 0.35)';
          if (variant === 'secondary' || variant === 'ghost') { e.currentTarget.style.borderColor = 'rgba(0,234,255,0.2)'; e.currentTarget.style.color = 'var(--accent)'; }
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        if (variant === 'primary') e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 234, 255, 0.25)';
        if (variant === 'gold') e.currentTarget.style.boxShadow = '0 2px 12px rgba(250, 204, 21, 0.25)';
        if (variant === 'purple') e.currentTarget.style.boxShadow = '0 2px 12px rgba(124, 58, 237, 0.25)';
        if (variant === 'secondary' || variant === 'ghost') { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }
      }}
      onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
      {...props}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.04) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
    </button>
  );
}
