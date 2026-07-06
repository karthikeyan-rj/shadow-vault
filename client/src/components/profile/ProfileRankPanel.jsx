import React from 'react';

function getRank(score) {
  if (score >= 95) return { label: 'Monarch', cls: 'rank-Monarch', color: '#facc15' };
  if (score >= 85) return { label: 'S', cls: 'rank-S', color: '#00eaff' };
  if (score >= 75) return { label: 'A', cls: 'rank-A', color: '#ef4444' };
  if (score >= 60) return { label: 'B', cls: 'rank-B', color: '#facc15' };
  if (score >= 45) return { label: 'C', cls: 'rank-C', color: '#7c3aed' };
  if (score >= 30) return { label: 'D', cls: 'rank-D', color: '#38bdf8' };
  return { label: 'E', cls: 'rank-E', color: '#6a9bb8' };
}

export default function ProfileRankPanel({ points, streak, financialScore, level, nextLevelPoints }) {
  const rank = getRank(financialScore || 0);
  return (
    <div className="glass-panel" style={{ padding: 20 }}>
      <div className="system-header" style={{ marginBottom: 16 }}>RANK & STATUS</div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{
          flex: 1, minWidth: 100,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          padding: 16, borderRadius: 'var(--radius-sm)',
          background: 'rgba(0, 234, 255, 0.03)',
          border: '1px solid rgba(0, 234, 255, 0.08)',
        }}>
          <span style={{
            fontSize: 28, fontWeight: 900, fontFamily: 'var(--font-display)',
            color: rank.color,
            textShadow: financialScore >= 75 ? `0 0 20px ${rank.color}40` : 'none',
          }}>
            {rank.label}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>
            SHADOW RANK
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
            {financialScore || '-'}/100
          </span>
        </div>
        <div style={{
          flex: 1, minWidth: 100,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          padding: 16, borderRadius: 'var(--radius-sm)',
          background: 'rgba(0, 234, 255, 0.03)',
          border: '1px solid rgba(0, 234, 255, 0.08)',
        }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--gold)', fontFamily: 'var(--font-display)' }}>
            {points || 0}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>
            REPUTATION
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
            Level {level || 1}
          </span>
        </div>
        <div style={{
          flex: 1, minWidth: 100,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          padding: 16, borderRadius: 'var(--radius-sm)',
          background: 'rgba(0, 234, 255, 0.03)',
          border: '1px solid rgba(0, 234, 255, 0.08)',
        }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
            {streak || 0}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>
            DAY STREAK
          </span>
        </div>
      </div>
    </div>
  );
}
