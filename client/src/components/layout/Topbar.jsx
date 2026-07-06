import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { initials } from '../../utils/helpers';

export default function Topbar({ title, onMenuToggle, balance }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header style={{
      padding: '12px 24px',
      background: 'rgba(5, 8, 22, 0.8)',
      backdropFilter: 'blur(22px) saturate(160%)',
      WebkitBackdropFilter: 'blur(22px) saturate(160%)',
      borderBottom: '1px solid var(--glass-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onMenuToggle}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition)',
            flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,234,255,0.2)'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          title="Open Mission Board"
        >
          <div style={{ position: 'relative', width: 14, height: 12 }}>
            <span style={{
              position: 'absolute', left: 0, top: 0,
              width: '100%', height: 2,
              background: 'currentColor', borderRadius: 1,
              transition: 'var(--transition)',
            }} />
            <span style={{
              position: 'absolute', left: 0, top: 5,
              width: '100%', height: 2,
              background: 'currentColor', borderRadius: 1,
              transition: 'var(--transition)',
            }} />
            <span style={{
              position: 'absolute', left: 0, bottom: 0,
              width: '100%', height: 2,
              background: 'currentColor', borderRadius: 1,
              transition: 'var(--transition)',
            }} />
          </div>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 2, height: 16,
            background: 'var(--accent)',
            borderRadius: 1,
          }} />
          <h1 style={{
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: '-0.3px',
            fontFamily: 'var(--font-display)',
            color: 'var(--text-primary)',
          }}>
            {title}
          </h1>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="hide-mobile" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '5px 10px',
        }}>
          <span style={{
            fontSize: 8,
            color: 'var(--text-tertiary)',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.1em',
          }}>
            VAULT
          </span>
          <span style={{
            fontWeight: 800,
            fontSize: 13,
            color: 'var(--accent)',
            fontFamily: 'var(--font-display)',
          }}>
            {balance}
          </span>
        </div>

        <button
          onClick={() => navigate('/profile')}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '4px 10px 4px 4px',
            borderRadius: 6,
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--glass-border)',
            cursor: 'pointer',
            transition: 'var(--transition)',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,234,255,0.2)'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <div style={{
            width: 24, height: 24, borderRadius: 4,
            background: 'linear-gradient(135deg, #0099cc, #00eaff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 700, color: '#050816', flexShrink: 0,
            fontFamily: 'var(--font-display)',
            boxShadow: '0 0 8px rgba(0, 234, 255, 0.15)',
          }}>
            {user ? initials(user.name) : '?'}
          </div>
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.04em',
            fontFamily: 'var(--font-display)',
          }}>
            Profile
          </span>
        </button>
      </div>
    </header>
  );
}
