import React from 'react';
import Button from './Button';

const typeConfig = {
  notice: {
    icon: 'ℹ',
    label: 'SYSTEM NOTICE',
    borderColor: 'rgba(0, 234, 255, 0.2)',
    bg: 'rgba(0, 234, 255, 0.03)',
    labelColor: 'var(--accent)',
  },
  warning: {
    icon: '⚠',
    label: 'SYSTEM WARNING',
    borderColor: 'rgba(250, 204, 21, 0.2)',
    bg: 'rgba(250, 204, 21, 0.03)',
    labelColor: 'var(--warning)',
  },
  danger: {
    icon: '🚨',
    label: 'SYSTEM ALERT',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    bg: 'rgba(239, 68, 68, 0.03)',
    labelColor: 'var(--danger)',
  },
  success: {
    icon: '✓',
    label: 'QUEST COMPLETE',
    borderColor: 'rgba(34, 197, 94, 0.2)',
    bg: 'rgba(34, 197, 94, 0.03)',
    labelColor: 'var(--success)',
  },
  quest: {
    icon: '⚔',
    label: 'QUEST ACTIVE',
    borderColor: 'rgba(124, 58, 237, 0.2)',
    bg: 'rgba(124, 58, 237, 0.03)',
    labelColor: 'var(--purple-light)',
  },
  mission: {
    icon: '📋',
    label: 'MISSION ALERT',
    borderColor: 'rgba(249, 115, 22, 0.2)',
    bg: 'rgba(249, 115, 22, 0.03)',
    labelColor: 'var(--orange)',
  },
};

export default function SystemQuestBox({
  type = 'notice',
  title,
  message,
  actions,
  glow = false,
  style,
}) {
  const config = typeConfig[type] || typeConfig.notice;

  return (
    <div
      style={{
        background: `rgba(8, 20, 40, 0.5)`,
        backdropFilter: 'blur(16px) saturate(160%)',
        WebkitBackdropFilter: 'blur(16px) saturate(160%)',
        border: `1px solid ${config.borderColor}`,
        borderRadius: 'var(--radius-sm)',
        padding: '12px 16px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'var(--transition)',
        ...(glow ? { boxShadow: `0 0 15px ${config.borderColor}` } : {}),
        ...style,
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(ellipse at 20% 15%, rgba(255,255,255,0.02) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: 2,
        background: config.labelColor,
        opacity: 0.4,
      }} />
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${config.labelColor}15, transparent)`,
      }} />
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
        <div
          style={{
            width: 32, height: 32, borderRadius: 4, flexShrink: 0,
            background: `${config.labelColor}0A`,
            border: `1px solid ${config.borderColor}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
            color: config.labelColor,
            backdropFilter: 'blur(4px)',
          }}
        >
          {config.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: config.labelColor,
            marginBottom: 4,
          }}>
            {config.label}
          </div>
          {title && (
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>
              {title}
            </div>
          )}
          {message && (
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {message}
            </div>
          )}
          {actions && actions.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              {actions.map((action, i) => (
                <Button key={i} variant={action.variant || 'primary'} size="sm" onClick={action.onClick}>
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
