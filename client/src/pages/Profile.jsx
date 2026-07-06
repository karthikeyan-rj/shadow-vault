import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProfileData } from '../hooks/useProfileData';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileRankPanel from '../components/profile/ProfileRankPanel';
import ProfileStatCard from '../components/profile/ProfileStatCard';
import ProfileSection from '../components/profile/ProfileSection';
import { fmt } from '../utils/helpers';

function EmptyState({ msg }) {
  return (
    <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>
      {msg}
    </div>
  );
}

export default function Profile() {
  const { user: authUser } = useAuth();
  const {
    user, summary, gamification, healthScore,
    goals, budgets, bills, tasks,
    totalIncome, totalExpenses, balance,
    activeGoals, unpaidBills, completedTasks, pendingTasks,
    savings, loading, error, refetch,
  } = useProfileData();

  const [financeMode, setFinanceMode] = useState('all');
  const [section, setSection] = useState({});

  const toggle = (key) => setSection(prev => ({ ...prev, [key]: !prev[key] }));

  const display = financeMode === 'all'
    ? { income: totalIncome, expenses: totalExpenses, balance, label: 'ALL TIME' }
    : { income: summary?.monthlyIncome || 0, expenses: summary?.monthlyExpense || 0, balance: (summary?.monthlyIncome || 0) - (summary?.monthlyExpense || 0), label: 'THIS MONTH' };

  const goalTargetTotal = goals.reduce((s, g) => s + (g.targetAmount || 0), 0);
  const goalSavedTotal = goals.reduce((s, g) => s + (g.savedAmount || 0), 0);
  const unpaidTotal = unpaidBills.reduce((s, b) => s + (b.amount || 0), 0);

  const rank = healthScore?.grade || (gamification?.financialScore >= 95 ? 'Monarch' : gamification?.financialScore >= 85 ? 'S' : gamification?.financialScore >= 75 ? 'A' : gamification?.financialScore >= 60 ? 'B' : gamification?.financialScore >= 45 ? 'C' : gamification?.financialScore >= 30 ? 'D' : 'E');
  const nextLevelPct = gamification?.nextLevelPoints != null && gamification?.points != null
    ? Math.min(100, Math.round((1 - gamification.nextLevelPoints / (gamification.nextLevelPoints + 100)) * 100))
    : 0;

  const btnStyle = (active) => ({
    padding: '5px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
    fontSize: 9, fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '0.06em',
    background: active ? 'rgba(0, 234, 255, 0.12)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--text-tertiary)',
    transition: 'var(--transition)',
  });

  const sectionBtnStyle = {
    padding: '8px 16px', borderRadius: 'var(--radius-sm)',
    background: 'linear-gradient(135deg, #0099cc, #00eaff)',
    border: 'none', color: '#050816', cursor: 'pointer',
    fontSize: 11, fontWeight: 800, fontFamily: 'var(--font-display)',
    letterSpacing: '0.04em', transition: 'var(--transition)',
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <div className="spinner-large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel" style={{ padding: 24, textAlign: 'center', maxWidth: 500, margin: '60px auto' }}>
        <div style={{ fontSize: 28, marginBottom: 8, fontFamily: 'var(--font-display)', color: 'var(--danger)' }}>⚠</div>
        <div style={{ fontSize: 13, color: 'var(--danger)', fontWeight: 600, marginBottom: 12 }}>Failed to load profile data</div>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 16 }}>{error}</div>
        <button onClick={refetch} style={sectionBtnStyle}>RETRY</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 3, height: 18, background: 'var(--accent)', borderRadius: 2 }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.15em', fontWeight: 700 }}>
            HUNTER PROFILE
          </span>
        </div>
        <button
          onClick={refetch}
          style={{
            padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
            background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--glass-border)', color: 'var(--accent)',
            fontSize: 10, fontWeight: 800, fontFamily: 'var(--font-display)',
            letterSpacing: '0.06em', transition: 'var(--transition)',
            display: 'flex', alignItems: 'center', gap: 5,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0, 234, 255, 0.2)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 234, 255, 0.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          ⟳ REFRESH
        </button>
      </div>

      <div className="electric-surface electric-hover-node" style={{ borderRadius: 'var(--radius-md)' }}>
        <ProfileHeader user={user || authUser} />
      </div>

      <div className="electric-surface electric-hover-node" style={{ borderRadius: 'var(--radius-md)' }}>
        <ProfileRankPanel
          points={gamification?.points}
          streak={gamification?.currentStreak}
          financialScore={healthScore?.score ?? gamification?.financialScore}
          level={gamification?.level}
          nextLevelPoints={gamification?.nextLevelPoints}
        />
      </div>

      <div className="glass-panel electric-surface electric-hover-node" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 2, height: 14, background: 'var(--accent)', borderRadius: 1 }} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: 'var(--text-primary)' }}>
              FINANCE OVERVIEW
            </span>
            <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', marginLeft: 4 }}>{display.label}</span>
          </div>
          <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.25)', borderRadius: 6, padding: 2 }}>
            <button onClick={() => setFinanceMode('all')} style={btnStyle(financeMode === 'all')}>ALL TIME</button>
            <button onClick={() => setFinanceMode('month')} style={btnStyle(financeMode === 'month')}>THIS MONTH</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
          <ProfileStatCard label="Income" value={fmt(display.income)} color="var(--success)" />
          <ProfileStatCard label="Expenses" value={fmt(display.expenses)} color="var(--danger)" />
          <ProfileStatCard label="Balance" value={fmt(display.balance)} color={display.balance >= 0 ? 'var(--accent)' : 'var(--danger)'} />
          <ProfileStatCard label="Monthly Income" value={fmt(summary?.monthlyIncome || 0)} color="var(--success)" />
          <ProfileStatCard label="Monthly Expenses" value={fmt(summary?.monthlyExpense || 0)} color="var(--danger)" />
          <ProfileStatCard label="Savings" value={fmt(Math.max(0, savings))} color={savings > 0 ? 'var(--success)' : 'var(--text-tertiary)'} />
          <ProfileStatCard label="Active Goals" value={activeGoals.length} color="var(--gold)" />
          <ProfileStatCard label="Goal Target" value={fmt(goalTargetTotal)} color="var(--gold)" />
          <ProfileStatCard label="Saved" value={fmt(goalSavedTotal)} color="var(--success)" />
          <ProfileStatCard label="Budgets Set" value={budgets.length} color="var(--purple-light)" />
          <ProfileStatCard label="Unpaid Bills" value={unpaidBills.length} color="var(--danger)" />
          <ProfileStatCard label="Tasks Today" value={`${completedTasks.length}/${tasks.length}`} color={pendingTasks.length === 0 ? 'var(--success)' : 'var(--accent)'} />
        </div>
      </div>

      <ProfileSection
        title="VAULT QUESTS"
        count={activeGoals.length}
        summary={`${activeGoals.length} active · ${fmt(goalTargetTotal)} target · ${fmt(goalSavedTotal)} saved`}
        expanded={section.goals}
        onToggle={() => toggle('goals')}
      >
        {goals.length === 0 ? (
          <EmptyState msg="No goals yet — set one via Vault Quests" />
        ) : goals.map(g => (
          <div key={g._id} style={{ marginBottom: 10, padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{g.name}</span>
              <span style={{
                fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.04em',
                color: g.status === 'Completed' ? 'var(--success)' : g.status === 'Overdue' ? 'var(--danger)' : 'var(--gold)',
                padding: '2px 6px', borderRadius: 4,
                background: g.status === 'Completed' ? 'rgba(34,197,94,0.1)' : g.status === 'Overdue' ? 'rgba(239,68,68,0.1)' : 'rgba(250,204,21,0.1)',
              }}>
                {g.status?.toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 6 }}>
              {g.category} · Target {fmt(g.targetAmount)} · {fmt(g.savedAmount)} saved
            </div>
            <div style={{ height: 4, background: 'rgba(0,0,0,0.3)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(100, ((g.savedAmount || 0) / (g.targetAmount || 1)) * 100)}%`,
                height: '100%',
                background: g.status === 'Completed' ? 'var(--success)' : 'linear-gradient(90deg, #facc15, #fde047)',
                borderRadius: 2, transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        ))}
      </ProfileSection>

      <ProfileSection
        title="DUE MISSIONS"
        count={unpaidBills.length}
        summary={`${unpaidBills.length} unpaid · ${fmt(unpaidTotal)} total due`}
        expanded={section.bills}
        onToggle={() => toggle('bills')}
      >
        {bills.length === 0 ? (
          <EmptyState msg="No bills tracked" />
        ) : unpaidBills.length === 0 ? (
          <EmptyState msg="All bills are paid ✓" />
        ) : unpaidBills.map(b => (
          <div key={b._id} style={{ marginBottom: 8, padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{b.name}</div>
              <div style={{ fontSize: 9, color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)', marginTop: 2 }}>
                Due {b.dueDate}th · {b.category || 'General'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--danger)', fontFamily: 'var(--font-display)' }}>{fmt(b.amount)}</div>
              <div style={{
                fontSize: 8, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.04em', marginTop: 2,
                color: b.status === 'Overdue' ? 'var(--danger)' : b.status === 'Due Today' ? 'var(--warning)' : 'var(--text-tertiary)',
              }}>
                {b.status?.toUpperCase()}
              </div>
            </div>
          </div>
        ))}
      </ProfileSection>

      <ProfileSection
        title="TODAY'S MISSIONS"
        count={tasks.length}
        summary={`${completedTasks.length} completed · ${pendingTasks.length} pending`}
        expanded={section.tasks}
        onToggle={() => toggle('tasks')}
      >
        {tasks.length === 0 ? (
          <EmptyState msg="No tasks for today" />
        ) : (
          <>
            {pendingTasks.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 9, color: 'var(--gold)', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 6 }}>
                  PENDING — {pendingTasks.length}
                </div>
                {pendingTasks.map(t => (
                  <div key={t._id} style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)', marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{t.title}</span>
                    <span style={{ fontSize: 9, color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)' }}>{t.category}</span>
                  </div>
                ))}
              </div>
            )}
            {completedTasks.length > 0 && (
              <div>
                <div style={{ fontSize: 9, color: 'var(--success)', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 6 }}>
                  COMPLETED — {completedTasks.length}
                </div>
                {completedTasks.map(t => (
                  <div key={t._id} style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)', marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.7 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', textDecoration: 'line-through' }}>{t.title}</span>
                    <span style={{ fontSize: 9, color: 'var(--success)', fontFamily: 'var(--font-display)' }}>✓</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </ProfileSection>

      <ProfileSection
        title="RANK DETAILS"
        expanded={section.rank}
        onToggle={() => toggle('rank')}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: 9, color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 4 }}>SHADOW RANK</div>
            <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>{rank}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{healthScore?.score ?? gamification?.financialScore ?? '-'}/100</div>
          </div>
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: 9, color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 4 }}>REPUTATION</div>
            <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--gold)' }}>{gamification?.points ?? 0}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>Level {gamification?.level ?? 1}</div>
          </div>
        </div>
        {gamification?.nextLevelPoints != null && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>
              <span>Progress to Level {gamification.level + 1}</span>
              <span>{gamification.nextLevelPoints} pts to next</span>
            </div>
            <div style={{ height: 4, background: 'rgba(0,0,0,0.3)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                width: `${nextLevelPct}%`, height: '100%',
                background: 'linear-gradient(90deg, #0099cc, #00eaff)',
                borderRadius: 2, transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        )}
        {healthScore?.tips?.length > 0 && (
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 6 }}>VAULT TIPS</div>
            {healthScore.tips.slice(0, 3).map((tip, i) => (
              <div key={i} style={{
                padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                background: 'rgba(0, 234, 255, 0.03)', border: '1px solid rgba(0, 234, 255, 0.06)',
                fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4,
                fontFamily: 'var(--font-display)', letterSpacing: '0.02em',
              }}>
                ◈ {tip}
              </div>
            ))}
          </div>
        )}
      </ProfileSection>
    </div>
  );
}
