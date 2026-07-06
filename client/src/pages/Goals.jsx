import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { fmt, fmtDate } from '../utils/helpers';
import { CAT_EMOJI, GOAL_CATEGORIES } from '../utils/constants';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import Modal from '../components/ui/Modal';
import ProgressBar from '../components/ui/ProgressBar';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import LoadingOverlay from '../components/ui/LoadingOverlay';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [category, setCategory] = useState('Travel');
  const [deadline, setDeadline] = useState('');

  const [depositId, setDepositId] = useState(null);
  const [depositAmt, setDepositAmt] = useState('');
  const [depositOpen, setDepositOpen] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try { setGoals(await api.get('/goals')); } catch (e) { console.error(e); }
    setLoading(false);
  };

  const openModal = (id) => {
    if (id) {
      const g = goals.find(x => x._id === id);
      if (g) {
        setEditId(id); setTitle(g.title); setTarget(g.target);
        setCategory(g.category); setDeadline(g.deadline ? g.deadline.split('T')[0] : '');
      }
    } else {
      setEditId(null); setTitle(''); setTarget(''); setCategory('Travel'); setDeadline('');
    }
    setModalOpen(true);
  };

  const save = async () => {
    if (!title || !target || target <= 0) return;
    try {
      if (editId) await api.put('/goals/' + editId, { title, target: parseFloat(target), category, deadline });
      else await api.post('/goals', { title, target: parseFloat(target), category, deadline });
      setModalOpen(false);
      await loadData();
    } catch (e) { alert(e.message); }
  };

  const del = async (id) => {
    if (!window.confirm('Remove this vault quest?')) return;
    try { await api.delete('/goals/' + id); await loadData(); } catch (e) { alert(e.message); }
  };

  const openDeposit = (id) => {
    const g = goals.find(x => x._id === id);
    setDepositId(id);
    setDepositAmt(g.remaining > 0 ? String(Math.min(g.remaining, 1000)) : '');
    setDepositOpen(true);
  };

  const doDeposit = async () => {
    if (!depositAmt || depositAmt <= 0) return;
    try {
      await api.post('/goals/' + depositId + '/deposit', { amount: parseFloat(depositAmt) });
      setDepositOpen(false);
      await loadData();
    } catch (e) { alert(e.message); }
  };

  const questStatus = (pct) => {
    if (pct === 100) return { label: 'COMPLETED', color: 'green' };
    if (pct >= 75) return { label: 'ADVANCED', color: 'cyan' };
    if (pct >= 50) return { label: 'IN PROGRESS', color: 'purple' };
    if (pct >= 25) return { label: 'STARTED', color: 'slate' };
    return { label: 'NEW QUEST', color: 'slate' };
  };

  if (loading) return <LoadingOverlay message="Loading vault quests..." />;

  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
  const completed = goals.filter(g => g.saved >= g.target).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 2, height: 16, background: 'var(--purple-light)', borderRadius: 1 }} />
            <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px', fontFamily: 'var(--font-display)' }}>VAULT QUESTS</h2>
            <Badge variant="purple" style={{ fontSize: 8 }}>⚔ GOALS</Badge>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>Set savings targets and track your quest progress</p>
        </div>
        <Button variant="purple" onClick={() => openModal(null)}>+ NEW QUEST</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard label="ACTIVE QUESTS" value={goals.length} glow className="electric-surface-soft electric-hover-node" />
        <StatCard label="COMPLETED" value={completed} color="var(--success)" className="electric-surface-soft electric-hover-node" />
        <StatCard label="TOTAL SAVED" value={fmt(totalSaved)} color="var(--accent-light)" className="electric-surface-soft electric-hover-node" />
      </div>

      {goals.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {goals.map(g => {
            const pct = g.target > 0 ? Math.min(g.saved / g.target * 100, 100) : 0;
            const status = questStatus(pct);
            return (
              <Card key={g._id} hover glow={pct >= 100} className="electric-surface electric-hover-node">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 4,
                    background: 'rgba(124,58,237,0.04)',
                    border: '1px solid rgba(124,58,237,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, flexShrink: 0,
                  }}>
                    {CAT_EMOJI[g.category] || '⚔'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div>
                        <strong style={{ fontSize: 13 }}>{g.title}</strong>
                        <Badge variant={status.color} style={{ marginLeft: 6 }}>{status.label}</Badge>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>{fmt(g.saved)}</span>
                        <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}> / {fmt(g.target)}</span>
                      </div>
                    </div>
                    <ProgressBar value={pct} glow={pct >= 75} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                      <span style={{ fontSize: 10, color: pct >= 100 ? 'var(--success)' : 'var(--text-tertiary)' }}>
                        {pct.toFixed(1)}% — {pct >= 100 ? 'Quest Complete!' : `${fmt(g.remaining || g.target - g.saved)} remaining`}
                      </span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {pct < 100 && <Button variant="purple" size="sm" onClick={() => openDeposit(g._id)}>+ DEPOSIT</Button>}
                        <Button variant="ghost" size="sm" onClick={() => openModal(g._id)}>✎</Button>
                        <Button variant="danger" size="sm" onClick={() => del(g._id)}>✕</Button>
                      </div>
                    </div>
                    {g.deadline && (
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 3 }}>
                        ◉ Deadline: {fmtDate(g.deadline)}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState icon="⚔" title="No Vault Quests" message="Create your first savings goal" actionLabel="+ New Quest" onAction={() => openModal(null)} />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Quest' : 'New Vault Quest'}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label>TITLE *</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Emergency Fund" /></div>
          <div><label>TARGET (₹) *</label><input type="number" min="1" value={target} onChange={e => setTarget(e.target.value)} placeholder="0" /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <div><label>CATEGORY</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              {GOAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div><label>DEADLINE</label><input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} /></div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
          <Button variant="ghost" onClick={() => setModalOpen(false)}>CANCEL</Button>
          <Button variant="purple" onClick={save}>CREATE QUEST</Button>
        </div>
      </Modal>

      <Modal isOpen={depositOpen} onClose={() => setDepositOpen(false)} title="Deposit to Quest">
        <div style={{ padding: '16px 0' }}>
          <label style={{ display: 'block', marginBottom: 8 }}>DEPOSIT AMOUNT (₹)</label>
          <input type="number" min="1" value={depositAmt} onChange={e => setDepositAmt(e.target.value)} placeholder="0" autoFocus />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setDepositOpen(false)}>CANCEL</Button>
          <Button variant="purple" onClick={doDeposit}>DEPOSIT TO VAULT</Button>
        </div>
      </Modal>
    </div>
  );
}
