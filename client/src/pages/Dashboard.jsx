import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { fmt, fmtDate } from '../utils/helpers';
import { CAT_COLORS, CAT_EMOJI } from '../utils/constants';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import ProgressBar from '../components/ui/ProgressBar';
import Badge from '../components/ui/Badge';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import SystemQuestBox from '../components/ui/SystemQuestBox';
import BarChart from '../components/charts/BarChart';
import PieChart from '../components/charts/PieChart';

function getRank(score) {
  if (score >= 90) return { label: 'Monarch', color: '#facc15', css: 'rank-Monarch' };
  if (score >= 75) return { label: 'S-Rank', color: '#00eaff', css: 'rank-S' };
  if (score >= 60) return { label: 'A-Rank', color: '#ef4444', css: 'rank-A' };
  if (score >= 45) return { label: 'B-Rank', color: '#facc15', css: 'rank-B' };
  if (score >= 30) return { label: 'C-Rank', color: '#7c3aed', css: 'rank-C' };
  if (score >= 15) return { label: 'D-Rank', color: '#38bdf8', css: 'rank-D' };
  return { label: 'E-Rank', color: '#6a9bb8', css: 'rank-E' };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [bills, setBills] = useState([]);
  const [health, setHealth] = useState(null);
  const [motivation, setMotivation] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, e, i, b, g, bl, h, m] = await Promise.all([
        api.get('/expenses/summary'),
        api.get('/expenses'),
        api.get('/income'),
        api.get('/budgets'),
        api.get('/goals'),
        api.get('/bills'),
        api.get('/ai/health-score'),
        api.get('/gamification/motivation'),
      ]);
      setSummary(s);
      setExpenses(e);
      setIncomes(i);
      setBudgets(b);
      setGoals(g);
      setBills(bl);
      setHealth(h);
      setMotivation(m);
    } catch (err) {
      console.error('Dashboard load error', err);
    }
    setLoading(false);
  };

  if (loading) return <LoadingOverlay message="Initializing Command Center..." />;

  const bal = summary?.allTimeBalance || 0;
  const mInc = summary?.monthlyIncome || 0;
  const mExp = summary?.monthlyExpense || 0;
  const mBal = mInc - mExp;
  const sr = mInc > 0 ? Math.round((mBal / mInc) * 100) : 0;
  const healthScore = health?.score || 0;
  const rank = getRank(healthScore);

  let oracleMsg = '';
  if (bal <= 0) oracleMsg = '⚠ Your vault is empty. Channel power inflow to begin your ascent.';
  else if (sr >= 30) oracleMsg = '◈ Masterful control. You save <strong>' + sr + '%</strong>. The Monarch rank watches.';
  else if (sr >= 10) oracleMsg = '◈ You channel <strong>' + sr + '%</strong> to the vault. Push to 20% for rank ascension.';
  else if (mExp > 0) oracleMsg = '◈ Savings rate at <strong>' + sr + '%</strong>. Review your shadow outflows.';
  else oracleMsg = '◈ Welcome, hunter. The system awaits your command.';

  const alerts = [];
  if (bal <= 0) alerts.push({ type: 'danger', title: 'Vault Depleted', message: 'Your vault reserve is empty. Add power inflow before any spending.' });
  else if (bal < 5000) alerts.push({ type: 'warning', title: 'Low Reserve', message: 'Vault reserve at ' + fmt(bal) + '. Channel more income to stabilize.' });
  const overBudget = budgets.filter(b => b.spentAmount > b.budgetAmount);
  if (overBudget.length) alerts.push({ type: 'danger', title: 'Limit Breach Detected', message: 'Control limit breached: <strong>' + overBudget.map(b => b.category).join(', ') + '</strong>' });

  const overdueCount = bills.filter(b => b.status === 'Overdue').length;
  const dueTodayCount = bills.filter(b => b.status === 'Due Today').length;
  if (overdueCount) alerts.push({ type: 'danger', title: 'Overdue Missions', message: overdueCount + ' mission(s) past deadline. Complete them to avoid penalties.' });
  if (dueTodayCount) alerts.push({ type: 'mission', title: 'Missions Due Today', message: dueTodayCount + ' mission(s) require action today.' });

  const recent = [...expenses.slice(0, 4).map(e => ({ ...e, txType: 'expense' })), ...incomes.slice(0, 2).map(i => ({ ...i, txType: 'income' }))]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  const barData = summary?.trend ? {
    labels: summary.trend.map(t => t.month),
    datasets: [
      { label: 'Power Inflow', data: summary.trend.map(t => t.income), backgroundColor: 'rgba(0, 234, 255, 0.5)', borderRadius: 4 },
      { label: 'Shadow Outflow', data: summary.trend.map(t => t.expense), backgroundColor: 'rgba(239,68,68,0.4)', borderRadius: 4 },
    ],
  } : null;

  const pieData = summary?.catBreakdown?.length ? {
    labels: summary.catBreakdown.map(c => c._id),
    values: summary.catBreakdown.map(c => c.total),
  } : null;

  const pieColors = summary?.catBreakdown?.map(c => CAT_COLORS[c._id] || '#64748b');

  const completedGoals = goals.filter(g => g.status === 'Completed').length;
  const activeGoals = goals.filter(g => g.status !== 'Completed').length;
  const unpaidBills = bills.filter(b => !b.paid);
  const totalUnpaid = unpaidBills.reduce((s, b) => s + b.amount, 0);

  return (
    <div>
      {/* Hero Status Panel */}
      <Card glow className="electric-surface" style={{ marginBottom: 20, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 8,
              background: `linear-gradient(135deg, ${rank.color}22, ${rank.color}44)`,
              border: `2px solid ${rank.color}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 900, color: rank.color,
              fontFamily: 'var(--font-display)',
              boxShadow: `0 0 25px ${rank.color}22`,
              flexShrink: 0,
            }}>
              {rank.label[0]}
            </div>
            <div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2,
              }}>
                <Badge variant="cyan">SYSTEM ONLINE</Badge>
                <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>
                  RANK: <span className={rank.css} style={{ fontWeight: 700 }}>{rank.label}</span>
                </span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                {rank.label} · {healthScore}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                Financial Stability Score · Grade: {health?.grade || '...'}
              </div>
            </div>
          </div>
          {motivation?.quote && (
            <div style={{
              padding: '8px 14px',
              background: 'rgba(0, 234, 255, 0.03)',
              border: '1px solid rgba(0, 234, 255, 0.06)',
              borderRadius: 'var(--radius-sm)',
              maxWidth: 320, fontSize: 11,
              color: 'var(--text-tertiary)',
              fontStyle: 'italic',
              lineHeight: 1.6,
            }}>
              ❝ {motivation.quote}❞
            </div>
          )}
        </div>
      </Card>

      {/* Oracle Message */}
      <Card className="electric-surface electric-hover-node" style={{ marginBottom: 20, padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 4,
            background: 'linear-gradient(135deg, #0099cc, #00eaff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, flexShrink: 0, color: '#050816',
          }}>
            ◈
          </div>
          <div style={{
            fontSize: 12,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }} dangerouslySetInnerHTML={{ __html: oracleMsg }} />
        </div>
      </Card>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {alerts.map((a, i) => (
            <SystemQuestBox key={i} type={a.type} title={a.title} message={a.message} />
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 14,
        marginBottom: 20,
      }}>
        <StatCard className="electric-surface-soft electric-hover-node" label="VAULT RESERVE" value={fmt(bal)} icon="◈" color={bal <= 0 ? 'var(--danger)' : 'var(--accent)'} sub={bal <= 0 ? 'Depleted' : `${mInc > 0 ? sr + '% saved' : 'No income'}`} glow />
        <StatCard className="electric-surface-soft electric-hover-node" label="POWER INFLOW" value={fmt(mInc)} icon="↑" color="var(--success)" sub={incomes.filter(i => { const d = new Date(i.date); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); }).length + ' entries this month'} />
        <StatCard className="electric-surface-soft electric-hover-node" label="SHADOW OUTFLOW" value={fmt(mExp)} icon="↓" color="var(--danger)" sub={expenses.filter(e => { const d = new Date(e.date); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); }).length + ' entries this month'} />
        <StatCard className="electric-surface-soft electric-hover-node" label="SHADOW RANK" value={health ? healthScore : '--'} icon={rank.label[0]} color={rank.color} rank={rank.label} sub={'Grade: ' + (health?.grade || '...')} glow />
      </div>

      {/* Charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: 16, marginBottom: 20,
      }}>
        <Card className="electric-surface">
          <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 12, fontFamily: 'var(--font-display)', letterSpacing: '0.06em', color: 'var(--text-tertiary)' }}>
            INFLOW vs OUTFLOW TREND
          </div>
          <div style={{ height: 210 }}>
            <BarChart data={barData} />
          </div>
        </Card>
        <Card className="electric-surface">
          <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 12, fontFamily: 'var(--font-display)', letterSpacing: '0.06em', color: 'var(--text-tertiary)' }}>
            OUTFLOW CATEGORIES
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ height: 170, width: 170, flexShrink: 0 }}>
              <PieChart data={pieData} colors={pieColors} />
            </div>
            {pieData && (
              <div style={{ fontSize: 11, flex: 1 }}>
                {pieData.labels.map((l, i) => {
                  const total = pieData.values.reduce((a, b) => a + b, 0);
                  return (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: 1, background: (pieColors || [])[i] || '#64748b', flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-secondary)', fontSize: 10 }}>{l}</span>
                      <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: 10, color: 'var(--text-primary)' }}>{Math.round((pieData.values[i] / total) * 100)}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Quest + Activity */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: 16, marginBottom: 20,
      }}>
        <Card className="electric-surface electric-hover-node">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.06em', color: 'var(--text-tertiary)' }}>
              ACTIVE QUESTS
            </div>
            <button onClick={() => navigate('/goals')} style={{
              background: 'transparent', border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-sm)', padding: '3px 8px',
              color: 'var(--text-tertiary)', fontSize: 9, cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontWeight: 600,
              letterSpacing: '0.06em',
            }}>
              VIEW ALL
            </button>
          </div>
          {goals.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {goals.slice(0, 4).map(g => {
                const pct = g.target > 0 ? Math.min((g.saved / g.target) * 100, 100) : 0;
                return (
                  <div key={g._id} onClick={() => navigate('/goals')} style={{ cursor: 'pointer', padding: '6px 0', borderBottom: '1px solid var(--border-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11 }}>
                      <span style={{ fontWeight: 600 }}>⚔ {g.title}</span>
                      <span style={{ color: pct >= 100 ? 'var(--success)' : 'var(--text-tertiary)', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{fmt(g.saved)} / {fmt(g.target)}</span>
                    </div>
                    <ProgressBar value={pct} height={4} glow={pct >= 75} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ color: 'var(--text-tertiary)', fontSize: 12, textAlign: 'center', padding: 24 }}>
              No quests active. <span onClick={() => navigate('/goals')} style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>Start a quest →</span>
            </div>
          )}
        </Card>
        <Card className="electric-surface electric-hover-node">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.06em', color: 'var(--text-tertiary)' }}>
              RECENT ACTIVITY
            </div>
            <button onClick={() => navigate('/expenses')} style={{
              background: 'transparent', border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-sm)', padding: '3px 8px',
              color: 'var(--text-tertiary)', fontSize: 9, cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontWeight: 600,
              letterSpacing: '0.06em',
            }}>
              VIEW ALL
            </button>
          </div>
          {recent.length > 0 ? recent.map(tx => (
            <div key={tx._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid var(--border-primary)' }}>
              <div style={{
                width: 30, height: 30, borderRadius: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, background: tx.txType === 'income' ? 'rgba(0,234,255,0.06)' : 'rgba(239,68,68,0.06)',
                border: '1px solid ' + (tx.txType === 'income' ? 'rgba(0,234,255,0.1)' : 'rgba(239,68,68,0.1)'),
              }}>
                {tx.txType === 'income' ? '↑' : '↓'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.title}</div>
                <div style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>{fmtDate(tx.date)}{tx.txType === 'expense' ? ' · ' + tx.category : ''}</div>
              </div>
              <div style={{ fontWeight: 700, color: tx.txType === 'income' ? 'var(--accent)' : 'var(--danger)', fontSize: 11, flexShrink: 0, fontFamily: 'var(--font-display)' }}>
                {tx.txType === 'income' ? '+' : '-'}{fmt(tx.amount)}
              </div>
            </div>
          )) : (
            <div style={{ color: 'var(--text-tertiary)', fontSize: 12, textAlign: 'center', padding: 24 }}>No activity recorded.</div>
          )}
        </Card>
      </div>

      {/* Missions + Budget Health */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: 16,
      }}>
        <Card className="electric-surface electric-hover-node">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.06em', color: 'var(--text-tertiary)' }}>
              DUE MISSIONS
            </div>
            <button onClick={() => navigate('/bills')} style={{
              background: 'transparent', border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-sm)', padding: '3px 8px',
              color: 'var(--text-tertiary)', fontSize: 9, cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontWeight: 600,
              letterSpacing: '0.06em',
            }}>
              VIEW ALL
            </button>
          </div>
          {unpaidBills.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {unpaidBills.slice(0, 4).map(b => (
                <div key={b._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--border-primary)' }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: 1, flexShrink: 0,
                    background: b.status === 'Overdue' ? 'var(--danger)' : b.status === 'Due Today' ? 'var(--warning)' : 'rgba(0,234,255,0.3)',
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600 }}>{b.title}</div>
                    <div style={{ fontSize: 9, color: b.status === 'Overdue' ? 'var(--danger)' : b.status === 'Due Today' ? 'var(--warning)' : 'var(--text-tertiary)' }}>
                      {b.status === 'Overdue' ? 'OVERDUE' : b.status === 'Due Today' ? 'DUE TODAY' : 'Upcoming'} · {fmtDate(b.dueDate)}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 11, fontFamily: 'var(--font-display)' }}>{fmt(b.amount)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--text-tertiary)', fontSize: 12, textAlign: 'center', padding: 24 }}>
              No pending missions. <span onClick={() => navigate('/bills')} style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>Add one →</span>
            </div>
          )}
        </Card>
        <Card className="electric-surface electric-hover-node">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.06em', color: 'var(--text-tertiary)' }}>
              CONTROL LIMITS
            </div>
            <button onClick={() => navigate('/budget')} style={{
              background: 'transparent', border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-sm)', padding: '3px 8px',
              color: 'var(--text-tertiary)', fontSize: 9, cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontWeight: 600,
              letterSpacing: '0.06em',
            }}>
              MANAGE
            </button>
          </div>
          {budgets.length > 0 ? budgets.slice(0, 4).map(b => {
            const pct = Math.min(100, Math.round((b.spentAmount / b.budgetAmount) * 100));
            const barColor = pct >= 100 ? 'var(--danger)' : pct >= 80 ? 'var(--warning)' : 'var(--accent)';
            return (
              <div key={b._id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                  <span style={{ fontWeight: 600 }}>{b.category}</span>
                  <span style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)' }}>{fmt(b.spentAmount)} / {fmt(b.budgetAmount)}</span>
                </div>
                <ProgressBar value={pct} color={barColor} height={4} glow={pct >= 80} />
              </div>
            );
          }) : (
            <div style={{ color: 'var(--text-tertiary)', fontSize: 12, textAlign: 'center', padding: 24 }}>
              No limits set. <span onClick={() => navigate('/budget')} style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>Set controls →</span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
