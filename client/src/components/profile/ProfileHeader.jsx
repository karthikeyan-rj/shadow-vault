import React from 'react';
import { initials } from '../../utils/helpers';

export default function ProfileHeader({ user }) {
  if (!user) return null;
  return (
    <div className="glass-panel" style={{
      padding: 28, display: 'flex', alignItems: 'center', gap: 20,
      flexWrap: 'wrap',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 12,
        background: 'linear-gradient(135deg, #0099cc, #00eaff)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, fontWeight: 900, color: '#050816', flexShrink: 0,
        fontFamily: 'var(--font-display)',
        boxShadow: '0 0 25px rgba(0, 234, 255, 0.2)',
      }}>
        {initials(user.name)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 20, fontWeight: 800, color: 'var(--text-primary)',
          fontFamily: 'var(--font-display)', letterSpacing: '-0.3px',
        }}>
          {user.name}
        </div>
        <div style={{
          fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4,
          fontFamily: 'var(--font-display)', letterSpacing: '0.02em',
        }}>
          {user.email}
        </div>
        <div style={{
          marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        }}>
          <span className="system-tag" style={{
            background: 'rgba(0, 234, 255, 0.06)', borderColor: 'rgba(0, 234, 255, 0.12)',
            color: 'var(--accent)',
          }}>
            Shadow Vault Operator
          </span>
          <span className="system-tag" style={{
            background: 'rgba(250, 204, 21, 0.06)', borderColor: 'rgba(250, 204, 21, 0.12)',
            color: 'var(--gold)',
          }}>
            Joined {new Date(user.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  );
}
