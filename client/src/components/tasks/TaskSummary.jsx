import React from 'react';
import { fmt } from '../../utils/helpers';

export default function TaskSummary({ tasks }) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const pending = total - completed;
  const totalAmount = tasks.reduce((s, t) => s + (t.amount || 0), 0);
  const completedAmount = tasks.filter(t => t.status === 'completed').reduce((s, t) => s + (t.amount || 0), 0);

  const items = [
    { label: 'Total Missions', value: total, color: 'var(--text-primary)' },
    { label: 'Completed', value: completed, color: 'var(--success)' },
    { label: 'Pending', value: pending, color: pending > 0 ? 'var(--gold)' : 'var(--text-tertiary)' },
    { label: 'Total Amount', value: totalAmount > 0 ? fmt(totalAmount) : '-', color: 'var(--accent)' },
    { label: 'Completed Value', value: completedAmount > 0 ? fmt(completedAmount) : '-', color: 'var(--success)' },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
      gap: 10,
    }}>
      {items.map((item, i) => (
        <div key={i} className="glass-panel electric-surface-soft electric-hover-node" style={{
          padding: '12px 14px', textAlign: 'center',
        }}>
          <div style={{
            fontSize: 9, color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-display)', letterSpacing: '0.06em',
            marginBottom: 4, fontWeight: 700,
          }}>
            {item.label}
          </div>
          <div style={{
            fontSize: 18, fontWeight: 900, color: item.color,
            fontFamily: 'var(--font-display)',
          }}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}
