import React from 'react';

export default function ProfileSection({ title, count, summary, expanded, onToggle, children }) {
  return (
    <div className="glass-panel" style={{
      padding: 0, overflow: 'hidden',
      transition: 'var(--transition)',
    }}>
      <div
        onClick={onToggle}
        style={{
          padding: '16px 20px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          userSelect: 'none',
          transition: 'var(--transition)',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0, 234, 255, 0.02)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 2, height: 14, background: 'var(--accent)', borderRadius: 1,
          }} />
          <div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 11,
              fontWeight: 800, letterSpacing: '0.08em',
              color: 'var(--text-primary)',
            }}>
              {title}
            </div>
            {summary && (
              <div style={{
                fontSize: 9, color: 'var(--text-tertiary)',
                fontFamily: 'var(--font-display)', marginTop: 2,
                letterSpacing: '0.04em',
              }}>
                {summary}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {count !== undefined && (
            <span style={{
              fontSize: 10, fontWeight: 800, fontFamily: 'var(--font-display)',
              color: 'var(--accent)', padding: '2px 8px',
              borderRadius: 999, background: 'rgba(0, 234, 255, 0.06)',
              border: '1px solid rgba(0, 234, 255, 0.1)',
            }}>
              {count}
            </span>
          )}
          <span style={{
            fontSize: 14, color: 'var(--text-tertiary)',
            transition: 'transform 0.25s ease', display: 'inline-block',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          }}>
            ▾
          </span>
        </div>
      </div>
      <div style={{
        maxHeight: expanded ? 2000 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.35s ease, opacity 0.25s ease',
        opacity: expanded ? 1 : 0,
      }}>
        <div style={{ padding: '0 20px 16px', borderTop: expanded ? '1px solid var(--glass-border)' : 'none' }}>
          <div style={{ paddingTop: 12 }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
