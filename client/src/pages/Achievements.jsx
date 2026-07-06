import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import Badge from '../components/ui/Badge';
import LoadingOverlay from '../components/ui/LoadingOverlay';

const RANKS = [
  { name: 'E-Rank', color: '#6a9bb8', minScore: 0, desc: 'Novice Hunter', icon: 'E' },
  { name: 'D-Rank', color: '#38bdf8', minScore: 15, desc: 'Apprentice', icon: 'D' },
  { name: 'C-Rank', color: '#7c3aed', minScore: 30, desc: 'Seasoned', icon: 'C' },
  { name: 'B-Rank', color: '#facc15', minScore: 50, desc: 'Elite', icon: 'B' },
  { name: 'A-Rank', color: '#ef4444', minScore: 70, desc: 'Master', icon: 'A' },
  { name: 'S-Rank', color: '#00eaff', minScore: 85, desc: 'Legendary', icon: 'S' },
  { name: 'Monarch', color: '#facc15', minScore: 95, desc: 'Shadow Lord', icon: 'M' },
];

const ACHIEVEMENTS_LIST = [
  { id: '1st_income', title: 'First Power Inflow', desc: 'Add your first income entry', threshold: 1 },
  { id: '1st_expense', title: 'First Shadow Outflow', desc: 'Track your first expense', threshold: 1 },
  { id: '10_expenses', title: 'Trace Collector', desc: 'Log 10 expenses', threshold: 10 },
  { id: '50_expenses', title: 'Shadow Tracker', desc: 'Log 50 expenses', threshold: 50 },
  { id: '1st_budget', title: 'Control Architect', desc: 'Set your first budget limit', threshold: 1 },
  { id: '3_budgets', title: 'Limit Master', desc: 'Set budgets for 3 categories', threshold: 3 },
  { id: '1st_goal', title: 'Quest Initiate', desc: 'Create your first savings goal', threshold: 1 },
  { id: 'goal_complete', title: 'Quest Conqueror', desc: 'Complete a savings goal', threshold: 1 },
  { id: '1st_bill', title: 'Mission Accepted', desc: 'Add your first bill', threshold: 1 },
  { id: 'bill_paid', title: 'Mission Complete', desc: 'Mark a bill as paid', threshold: 1 },
  { id: 'streak_3', title: 'Consistent Hunter', desc: 'Login for 3 consecutive days', threshold: 3 },
  { id: 'streak_7', title: 'Relentless', desc: 'Login for 7 consecutive days', threshold: 7 },
  { id: 'income_100k', title: 'Power Accumulator', desc: 'Reach ₹1,00,000 total income', threshold: 100000 },
  { id: 'balance_50k', title: 'Vault Guardian', desc: 'Achieve ₹50,000 vault reserve', threshold: 50000 },
];

export default function Achievements() {
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [bills, setBills] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, e, i, bl, bu, g, l] = await Promise.all([
        api.get('/expenses/summary'),
        api.get('/expenses'),
        api.get('/income'),
        api.get('/bills'),
        api.get('/budgets'),
        api.get('/goals'),
        api.get('/auth/activity'),
      ]);
      setSummary(s);
      setExpenses(e);
      setIncomes(i);
      setBills(bl);
      setBudgets(bu);
      setGoals(g);
      setStreak(l?.streak || 0);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  if (loading) return <LoadingOverlay message="Loading rank archive..." />;

  const healthScore = summary?.healthScore || 0;
  const currentRank = summary?.rank || 'E-Rank';
  const currentRankIdx = RANKS.findIndex(r => r.name === currentRank);
  const nextRank = currentRankIdx < RANKS.length - 1 ? RANKS[currentRankIdx + 1] : null;
  const progressToNext = nextRank ? ((healthScore - RANKS[currentRankIdx].minScore) / (nextRank.minScore - RANKS[currentRankIdx].minScore) * 100) : 100;
  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const completedGoals = goals.filter(g => g.saved >= g.target).length;

  function checkAchievement(ach) {
    switch (ach.id) {
      case '1st_income': return incomes.length >= 1;
      case '1st_expense': return expenses.length >= 1;
      case '10_expenses': return expenses.length >= 10;
      case '50_expenses': return expenses.length >= 50;
      case '1st_budget': return budgets.length >= 1;
      case '3_budgets': return budgets.length >= 3;
      case '1st_goal': return goals.length >= 1;
      case 'goal_complete': return completedGoals >= 1;
      case '1st_bill': return bills.length >= 1;
      case 'bill_paid': return bills.filter(b => b.paid).length >= 1;
      case 'streak_3': return streak >= 3;
      case 'streak_7': return streak >= 7;
      case 'income_100k': return totalIncome >= 100000;
      case 'balance_50k': return (summary?.allTimeBalance || 0) >= 50000;
      default: return false;
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 2, height: 16, background: 'var(--gold)', borderRadius: 1 }} />
          <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px', fontFamily: 'var(--font-display)' }}>RANK ARCHIVE</h2>
          <Badge variant="gold" style={{ fontSize: 8 }}>◆ ACHIEVEMENTS</Badge>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>Your shadow rank and completed achievements</p>
      </div>

      <Card glow className="electric-surface electric-hover-node" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 8,
            background: `linear-gradient(135deg, ${RANKS[currentRankIdx]?.color || '#6a9bb8'}15, ${RANKS[currentRankIdx]?.color || '#6a9bb8'}30)`,
            border: `2px solid ${RANKS[currentRankIdx]?.color || '#6a9bb8'}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 900,
            color: RANKS[currentRankIdx]?.color,
            fontFamily: 'var(--font-display)',
            flexShrink: 0,
          }}>
            {RANKS[currentRankIdx]?.icon || 'E'}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: RANKS[currentRankIdx]?.color, fontFamily: 'var(--font-display)' }}>
                {currentRank}
              </span>
              <Badge variant="cyan">{RANKS[currentRankIdx]?.desc}</Badge>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6 }}>
              Health Score: <strong style={{ color: RANKS[currentRankIdx]?.color }}>{healthScore.toFixed(1)}</strong>
              {nextRank && (
                <span> — Next: {nextRank.name} ({nextRank.desc})</span>
              )}
            </div>
            <ProgressBar value={progressToNext} glow />
          </div>
        </div>
      </Card>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        {RANKS.map((r, i) => {
          const unlocked = healthScore >= r.minScore || RANKS.indexOf(RANKS.find(x => x.name === currentRank)) >= i;
          return (
            <div key={r.name} style={{
              flex: 1, minWidth: 70, textAlign: 'center', padding: '10px 6px',
              borderRadius: 'var(--radius-sm)',
              background: unlocked ? `${r.color}0a` : 'var(--bg-tertiary)',
              border: `1px solid ${unlocked ? r.color + '30' : 'var(--border-primary)'}`,
              opacity: unlocked ? 1 : 0.35,
            }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: unlocked ? r.color : 'var(--text-tertiary)', fontFamily: 'var(--font-display)', marginBottom: 2 }}>
                {r.icon}
              </div>
              <div style={{ fontSize: 9, fontWeight: 600, color: unlocked ? r.color : 'var(--text-tertiary)', fontFamily: 'var(--font-display)' }}>
                {r.name}
              </div>
            </div>
          );
        })}
      </div>

      <Card className="electric-surface electric-hover-node">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.08em', color: 'var(--text-tertiary)' }}>
            ACHIEVEMENTS
          </div>
          <Badge variant="slate">{ACHIEVEMENTS_LIST.filter(a => checkAchievement(a)).length}/{ACHIEVEMENTS_LIST.length}</Badge>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
          {ACHIEVEMENTS_LIST.map(ach => {
            const done = checkAchievement(ach);
            return (
              <div key={ach.id} style={{
                padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                background: done ? 'rgba(34,197,94,0.03)' : 'var(--bg-tertiary)',
                border: `1px solid ${done ? 'rgba(34,197,94,0.1)' : 'var(--border-primary)'}`,
                display: 'flex', alignItems: 'center', gap: 10,
                opacity: done ? 1 : 0.5,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 4,
                  background: done ? 'rgba(34,197,94,0.08)' : 'rgba(106,155,184,0.03)',
                  border: '1px solid ' + (done ? 'rgba(34,197,94,0.12)' : 'rgba(106,155,184,0.05)'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, flexShrink: 0,
                  color: done ? 'var(--success)' : 'var(--text-tertiary)',
                }}>
                  {done ? '✓' : '◈'}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: done ? 'var(--success)' : 'var(--text-primary)' }}>
                    {ach.title}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{ach.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
