import React from 'react';
import { fmtDate, fmt } from '../../utils/helpers';

export default function TaskCard({ task, onToggle, onDelete, className = '' }) {
  const isCompleted = task.status === 'completed';
  return (
    <div className={`glass-panel ${className}`} style={{
      padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
      opacity: isCompleted ? 0.55 : 1,
      transition: 'var(--transition)',
    }}>
      <button
        onClick={() => onToggle(task._id)}
        style={{
          width: 22, height: 22, borderRadius: 4, flexShrink: 0,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isCompleted ? 'var(--success)' : 'transparent',
          border: isCompleted ? 'none' : '1px solid rgba(0, 234, 255, 0.15)',
          transition: 'var(--transition)',
          color: isCompleted ? '#050816' : 'transparent',
          fontSize: 11, fontWeight: 900,
        }}
        title={isCompleted ? 'Mark pending' : 'Mark complete'}
      >
        {isCompleted ? '✓' : ''}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600,
          color: isCompleted ? 'var(--text-tertiary)' : 'var(--text-primary)',
          textDecoration: isCompleted ? 'line-through' : 'none',
          fontFamily: 'var(--font-display)',
          letterSpacing: '0.02em',
        }}>
          {task.title}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap',
        }}>
          <span className="system-tag" style={{
            fontSize: 8, borderColor: 'rgba(0, 234, 255, 0.1)',
            color: 'var(--accent)', background: 'rgba(0, 234, 255, 0.04)',
          }}>
            {task.category || 'General'}
          </span>
          {task.amount > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 700, color: 'var(--accent)',
              fontFamily: 'var(--font-display)',
            }}>
              {fmt(task.amount)}
            </span>
          )}
          <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>
            {fmtDate(task.taskDate || task.createdAt)}
          </span>
        </div>
        {task.note && (
          <div style={{
            fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4,
            fontStyle: 'italic',
          }}>
            {task.note}
          </div>
        )}
      </div>

      <button
        onClick={() => onDelete(task._id)}
        style={{
          width: 28, height: 28, borderRadius: 4, flexShrink: 0,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'transparent',
          border: '1px solid transparent',
          color: 'var(--text-muted)', fontSize: 13,
          transition: 'var(--transition)',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = 'var(--danger)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        title="Delete task"
      >
        ✕
      </button>
    </div>
  );
}
