import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { fmt } from '../utils/helpers';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import LoadingOverlay from '../components/ui/LoadingOverlay';

export default function Transfer() {
  const [goals, setGoals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [g, s] = await Promise.all([api.get('/goals'), api.get('/expenses/summary')]);
      setGoals(g);
      setSummary(s);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const openTransfer = () => {
    if (goals.length === 0) { alert('Create a vault quest first to transfer funds.'); return; }
    setSelectedGoal(goals[0]._id);
    setTransferAmount('');
    setModalOpen(true);
  };

  const doTransfer = async () => {
    if (!selectedGoal || !transferAmount || transferAmount <= 0) return;
    try {
      await api.post('/goals/' + selectedGoal + '/deposit', { amount: parseFloat(transferAmount) });
      setModalOpen(false);
      await loadData();
    } catch (e) { alert(e.message); }
  };

  if (loading) return <LoadingOverlay message="Preparing vault transfer..." />;

  const balance = summary?.allTimeBalance || 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 2, height: 16, background: 'var(--accent)', borderRadius: 1 }} />
            <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px', fontFamily: 'var(--font-display)' }}>VAULT TRANSFER</h2>
            <Badge variant="cyan" style={{ fontSize: 8 }}>⇄ TRANSFER</Badge>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>Move funds from vault reserve to quests</p>
        </div>
        <Button variant="primary" onClick={openTransfer}>+ TRANSFER TO QUEST</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard label="VAULT RESERVE" value={fmt(balance)} color="var(--accent)" glow />
        <StatCard label="ACTIVE QUESTS" value={goals.length} />
        <StatCard label="QUEST TOTAL" value={fmt(goals.reduce((s, g) => s + g.target, 0))} />
      </div>

      {goals.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {goals.map(g => {
            const pct = g.target > 0 ? Math.min(g.saved / g.target * 100, 100) : 0;
            const canTransfer = balance > 0 && g.saved < g.target;
            return (
              <Card key={g._id} hover className="electric-surface electric-hover-node">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 4,
                    background: 'rgba(0,234,255,0.04)', border: '1px solid rgba(0,234,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
                  }}>
                    {g.category === 'Travel' ? '✈' : g.category === 'Emergency' ? '◈' : g.category === 'Education' ? '◉' : g.category === 'Investment' ? '↑' : g.category === 'Shopping' ? '◆' : '⚔'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <strong style={{ fontSize: 13 }}>{g.title}</strong>
                      <span style={{ fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 13 }}>{fmt(g.saved)} / {fmt(g.target)}</span>
                    </div>
                    <ProgressBar value={pct} glow={pct >= 75} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3, alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                        {pct.toFixed(1)}% — {g.saved >= g.target ? 'Quest Complete' : `${fmt(g.target - g.saved)} remaining`}
                      </span>
                      {canTransfer && (
                        <Button variant="primary" size="sm" onClick={() => { setSelectedGoal(g._id); setTransferAmount(''); setModalOpen(true); }}>
                          + TRANSFER
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState icon="⇄" title="No Vault Quests" message="Create a goal to start transferring funds" actionLabel="Go to Vault Quests" onAction={() => window.location.href = '/goals'} />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Vault Transfer">
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>TARGET QUEST</label>
          <select value={selectedGoal} onChange={e => setSelectedGoal(e.target.value)} style={{ width: '100%' }}>
            {goals.map(g => (
              <option key={g._id} value={g._id}>
                {g.title} — {fmt(g.saved)} / {fmt(g.target)} ({g.saved >= g.target ? 'Complete' : fmt(g.target - g.saved) + ' remaining'})
              </option>
            ))}
          </select>
        </div>

        {selectedGoal && (() => {
          const g = goals.find(x => x._id === selectedGoal);
          if (!g) return null;
          const pct = g.target > 0 ? Math.min(g.saved / g.target * 100, 100) : 0;
          return (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Current Progress</span>
                <span style={{ fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-display)' }}>{pct.toFixed(1)}%</span>
              </div>
              <ProgressBar value={pct} glow />
              <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-tertiary)' }}>
                Vault Reserve: <strong style={{ color: 'var(--accent)' }}>{fmt(balance)}</strong>
                {g.saved < g.target && (
                  <span> — Need: {fmt(g.target - g.saved)}</span>
                )}
              </div>
            </div>
          );
        })()}

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>TRANSFER AMOUNT (₹)</label>
          <input type="number" min="1" max={Math.floor(balance)} value={transferAmount}
            onChange={e => setTransferAmount(e.target.value)} placeholder="0" autoFocus
            style={{ width: '100%' }} />
          {parseFloat(transferAmount) > balance && (
            <div style={{ marginTop: 4, fontSize: 11, color: 'var(--danger)' }}>
              ⚠ Exceeds vault reserve of {fmt(balance)}
            </div>
          )}
        </div>

        {selectedGoal && (() => {
          const g = goals.find(x => x._id === selectedGoal);
          if (!g || !transferAmount) return null;
          const newSaved = g.saved + parseFloat(transferAmount || 0);
          const newPct = g.target > 0 ? Math.min(newSaved / g.target * 100, 100) : 0;
          return (
            <div style={{
              padding: '10px 12px', borderRadius: 'var(--radius-sm)',
              background: 'rgba(0,234,255,0.02)', border: '1px solid rgba(0,234,255,0.06)',
              marginBottom: 14,
            }}>
              <div style={{ fontSize: 9, color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em', marginBottom: 4 }}>PREVIEW</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 11 }}>New progress</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>{newPct.toFixed(1)}%</span>
              </div>
              <ProgressBar value={newPct} glow />
            </div>
          );
        })()}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setModalOpen(false)}>CANCEL</Button>
          <Button variant="primary" onClick={doTransfer} disabled={!transferAmount || parseFloat(transferAmount) <= 0 || parseFloat(transferAmount) > balance}>
            EXECUTE TRANSFER
          </Button>
        </div>
      </Modal>
    </div>
  );
}
