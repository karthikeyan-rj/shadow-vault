import React from 'react';

const badgeStyles = {
  green: { background: 'rgba(34,197,94,0.08)', color: 'var(--success)', border: '1px solid rgba(34,197,94,0.15)' },
  red: { background: 'rgba(239,68,68,0.08)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.15)' },
  amber: { background: 'rgba(250,204,21,0.08)', color: 'var(--warning)', border: '1px solid rgba(250,204,21,0.15)' },
  blue: { background: 'rgba(56,189,248,0.08)', color: 'var(--info)', border: '1px solid rgba(56,189,248,0.15)' },
  purple: { background: 'rgba(124,58,237,0.08)', color: 'var(--purple-light)', border: '1px solid rgba(124,58,237,0.15)' },
  slate: { background: 'rgba(106,155,184,0.06)', color: 'var(--text-secondary)', border: '1px solid rgba(106,155,184,0.08)' },
  gold: { background: 'rgba(250,204,21,0.1)', color: 'var(--gold)', border: '1px solid rgba(250,204,21,0.18)' },
  cyan: { background: 'rgba(0,234,255,0.08)', color: 'var(--accent)', border: '1px solid rgba(0,234,255,0.15)' },
};

export default function Badge({ children, variant = 'slate', style }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 2,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '0.06em',
        whiteSpace: 'nowrap',
        textTransform: 'uppercase',
        fontFamily: 'var(--font-display)',
        backdropFilter: 'blur(8px)',
        ...badgeStyles[variant],
        ...style,
      }}
    >
      {children}
    </span>
  );
}
