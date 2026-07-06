import React from 'react';
import { fmt } from '../../utils/helpers';

export default function ProfileFinanceStats({ summary, goals, budgets, bills, activeGoals }) {
  if (!summary) return null;
  return (
    <div className="glass-panel" style={{ padding: 20 }}>
      <div className="system-header" style={{ marginBottom: 16 }}>FINANCE OVERVIEW</div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 12,
      }}>
        <StatCard label="Total Income" value={fmt(summary.allTimeIncome)} color="var(--success)" />
        <StatCard label="Total Expenses" value={fmt(summary.allTimeExpense)} color="var(--danger)" />
        <StatCard label="Current Balance" value={fmt(summary.allTimeBalance)} color={summary.allTimeBalance >= 0 ? 'var(--accent)' : 'var(--danger)'} />
        <StatCard label="Monthly Income" value={fmt(summary.monthlyIncome)} color="var(--success)" />
        <StatCard label="Monthly Expenses" value={fmt(summary.monthlyExpense)} color="var(--danger)" />
        <StatCard label="Active Goals" value={activeGoals || 0} color="var(--gold)" />
        <StatCard label="Total Goal Target" value={fmt(goals?.reduce((s, g) => s + g.targetAmount, 0) || 0)} color="var(--gold)" />
        <StatCard label="Total Saved" value={fmt(goals?.reduce((s, g) => s + g.savedAmount, 0) || 0)} color="var(--success)" />
        <StatCard label="Budgets Set" value={budgets?.length || 0} color="var(--purple-light)" />
        <StatCard label="Unpaid Bills" value={bills?.filter(b => b.status === 'Unpaid').length || 0} color="var(--danger)" />
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      padding: '12px 14px',
      borderRadius: 'var(--radius-sm)',
      background: 'rgba(0, 0, 0, 0.2)',
      border: '1px solid var(--glass-border)',
    }}>
      <div style={{
        fontSize: 9, color: 'var(--text-tertiary)',
        fontFamily: 'var(--font-display)', letterSpacing: '0.06em',
        marginBottom: 4, fontWeight: 700,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 16, fontWeight: 800, color,
        fontFamily: 'var(--font-display)',
      }}>
        {value}
      </div>
    </div>
  );
}
