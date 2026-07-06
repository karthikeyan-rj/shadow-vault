import React, { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, width = 500 }) {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(5, 8, 22, 0.85)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: 'rgba(8, 20, 40, 0.65)',
          backdropFilter: 'blur(22px) saturate(160%)',
          WebkitBackdropFilter: 'blur(22px) saturate(160%)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-md)',
          padding: 24,
          width,
          maxWidth: '96vw',
          maxHeight: '92vh',
          overflowY: 'auto',
          animation: 'slideIn 0.3s ease',
          boxShadow: '0 0 60px rgba(0, 234, 255, 0.05), 0 8px 48px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.025)',
          position: 'relative',
        }}
      >
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, var(--accent-dark), var(--accent), var(--purple-light))',
        }} />
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(ellipse at 20% 15%, rgba(0, 234, 255, 0.04) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          {(title || onClose) && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              {title && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 3, height: 18, background: 'var(--accent)', borderRadius: 2 }} />
                  <h3 style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.3px', fontFamily: 'var(--font-display)' }}>{title}</h3>
                </div>
              )}
              {onClose && (
                <button
                  onClick={onClose}
                  style={{
                    background: 'rgba(0, 234, 255, 0.04)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer',
                    fontSize: 16,
                    width: 30,
                    height: 30,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'var(--transition)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'rgba(0,234,255,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                >
                  ✕
                </button>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
