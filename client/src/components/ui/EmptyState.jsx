import React from 'react';
import Button from './Button';

export default function EmptyState({ icon = '📄', title, message, actionLabel, onAction }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '40px 24px',
      color: 'var(--text-tertiary)',
      background: 'rgba(8, 20, 40, 0.55)',
      backdropFilter: 'blur(22px) saturate(160%)',
      WebkitBackdropFilter: 'blur(22px) saturate(160%)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--glass-border)',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.025)',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(ellipse at 50% 30%, rgba(0, 234, 255, 0.03) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.5 }}>{icon}</div>
        {title && <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-secondary)', marginBottom: 6, fontFamily: 'var(--font-display)' }}>{title}</div>}
        {message && <div style={{ fontSize: 13, marginBottom: 20, color: 'var(--text-tertiary)' }}>{message}</div>}
        {actionLabel && onAction && (
          <Button variant="primary" onClick={onAction}>{actionLabel}</Button>
        )}
      </div>
    </div>
  );
}
