import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { fmt } from '../utils/helpers';
import { CAT_COLORS } from '../utils/constants';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import LoadingOverlay from '../components/ui/LoadingOverlay';

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [allExpenses, setAllExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, e] = await Promise.all([api.get('/expenses/summary'), api.get('/expenses')]);
      setSummary(s);
      setAllExpenses(e);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  if (loading) return <LoadingOverlay message="Generating intelligence reports..." />;

  const now = new Date();
  const periodStart = new Date(now);
  if (period === 'week') periodStart.setDate(now.getDate() - 7);
  else if (period === 'month') periodStart.setMonth(now.getMonth() - 1);
  else if (period === 'quarter') periodStart.setMonth(now.getMonth() - 3);
  else if (period === 'year') periodStart.setFullYear(now.getFullYear() - 1);

  const filtered = allExpenses.filter(e => e.date && new Date(e.date) >= periodStart);
  const total = filtered.reduce((s, e) => s + e.amount, 0);
  const avg = filtered.length ? Math.round(total / filtered.length) : 0;

  const catTotals = {};
  filtered.forEach(e => {
    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
  });
  const catEntries = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const catTotal = catEntries.reduce((s, [, v]) => s + v, 0);
  const dominantCat = catEntries[0]?.[0] || null;
  const dominantPct = dominantCat ? ((catTotals[dominantCat] / catTotal) * 100).toFixed(1) : 0;

  const monthIncome = summary?.totalIncome || 0;
  const monthExpense = summary?.totalExpense || 0;
  const savingsRate = monthIncome > 0 ? ((1 - monthExpense / monthIncome) * 100).toFixed(1) : 0;

  const insights = [];
  if (dominantCat) insights.push(`◈ ${dominantCat} leads your outflow at ${dominantPct}% — consider setting a control limit.`);
  if (parseFloat(savingsRate) < 20 && monthIncome > 0) insights.push(`⚠ Savings rate is ${savingsRate}% at current. Target 20%+ for rank progression.`);
  if (avg > 0) insights.push(`◉ Average outbound transaction: ${fmt(avg)} — ${avg > 500 ? 'review small expenses for savings potential' : 'transaction discipline appears stable'}.`);
  if (catEntries.length >= 3) {
    insights.push(`◆ Top 3 categories: ${catEntries.slice(0, 3).map(([c]) => c).join(', ')} — evaluate for possible reduction.`);
  }
  if (monthIncome > monthExpense) {
    insights.push(`↑ Vault is growing — income exceeds outflows by ${fmt(monthIncome - monthExpense)} (${savingsRate}% rate).`);
  } else {
    insights.push(`↓ Vault is draining — outflows exceed income by ${fmt(monthExpense - monthIncome)}. Reduce non-essential spending.`);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 2, height: 16, background: 'var(--accent-light)', borderRadius: 1 }} />
            <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px', fontFamily: 'var(--font-display)' }}>INTELLIGENCE REPORTS</h2>
            <Badge variant="cyan" style={{ fontSize: 8 }}>◈ ANALYTICS</Badge>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>Strategic analysis of your financial operations</p>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[{k:'week',l:'1W'},{k:'month',l:'1M'},{k:'quarter',l:'3M'},{k:'year',l:'1Y'}].map(p => (
            <button key={p.k} onClick={() => setPeriod(p.k)}
              style={{
                padding: '5px 12px', borderRadius: 'var(--radius-sm)',
                background: period === p.k ? 'var(--accent)' : 'var(--bg-tertiary)',
                border: '1px solid ' + (period === p.k ? 'var(--accent)' : 'var(--border-primary)'),
                color: period === p.k ? '#050816' : 'var(--text-primary)',
                cursor: 'pointer', fontSize: 11, fontWeight: 700,
                fontFamily: 'var(--font-display)',
                transition: 'var(--transition)',
              }}>
              {p.l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard label="TOTAL OUTFLOW" value={fmt(total)} className="electric-surface-soft electric-hover-node" />
        <StatCard label="TRANSACTIONS" value={filtered.length} glow className="electric-surface-soft electric-hover-node" />
        <StatCard label="AVG AMOUNT" value={fmt(avg)} className="electric-surface-soft electric-hover-node" />
        <StatCard label="SAVINGS RATE" value={savingsRate + '%'} color={parseFloat(savingsRate) >= 20 ? 'var(--success)' : 'var(--danger)'} className="electric-surface-soft electric-hover-node" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        <Card className="electric-surface electric-hover-node">
          <div style={{ fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: 12 }}>
            CATEGORY BREAKDOWN
          </div>
          {catEntries.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {catEntries.map(([cat, amt]) => {
                const pct = catTotal > 0 ? (amt / catTotal * 100).toFixed(1) : 0;
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: 1, background: CAT_COLORS[cat] || '#64748b', display: 'inline-block' }} />
                        <span style={{ fontSize: 11, fontWeight: 500 }}>{cat}</span>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
                        {fmt(amt)} ({pct}%)
                      </span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(0,234,255,0.02)', border: '1px solid rgba(0,234,255,0.03)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: pct + '%', background: `linear-gradient(90deg, ${CAT_COLORS[cat] || '#64748b'}, ${CAT_COLORS[cat] || '#64748b'}66)`, borderRadius: 99, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ color: 'var(--text-tertiary)', fontSize: 12, textAlign: 'center', padding: 24 }}>No data for this period</div>
          )}
        </Card>

        <Card className="electric-surface electric-hover-node">
          <div style={{ fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: 12 }}>
            ORACLE INSIGHTS
          </div>
          {insights.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {insights.map((insight, i) => (
                <div key={i} style={{
                  padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                  background: 'rgba(0,234,255,0.02)', border: '1px solid rgba(0,234,255,0.04)',
                  fontSize: 11, lineHeight: 1.5, color: 'var(--text-secondary)',
                }}>
                  {insight}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--text-tertiary)', fontSize: 12, textAlign: 'center', padding: 24 }}>
              Insufficient data for analysis. Add more transactions.
            </div>
          )}
        </Card>
      </div>

      <Card className="electric-surface electric-hover-node">
        <div style={{ fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: 10 }}>
          VAULT FINANCIAL SUMMARY
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(0,234,255,0.03)', border: '1px solid rgba(0,234,255,0.06)' }}>
            <div style={{ fontSize: 8, color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', marginBottom: 4 }}>POWER INFLOW</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>+{fmt(monthIncome)}</div>
          </div>
          <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.06)' }}>
            <div style={{ fontSize: 8, color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', marginBottom: 4 }}>SHADOW OUTFLOW</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--danger)', fontFamily: 'var(--font-display)' }}>-{fmt(monthExpense)}</div>
          </div>
          <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(124,58,237,0.03)', border: '1px solid rgba(124,58,237,0.06)' }}>
            <div style={{ fontSize: 8, color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', marginBottom: 4 }}>VAULT RESERVE</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--purple-light)', fontFamily: 'var(--font-display)' }}>{fmt(summary?.allTimeBalance || 0)}</div>
          </div>
          <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(250,204,21,0.03)', border: '1px solid rgba(250,204,21,0.06)' }}>
            <div style={{ fontSize: 8, color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', marginBottom: 4 }}>SHADOW RANK</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--font-display)' }}>{summary?.rank || 'E-Rank'}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
