import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { fmt, fmtDate, todayStr } from '../utils/helpers';
import { CAT_EMOJI, EXPENSE_CATEGORIES } from '../utils/constants';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import Modal from '../components/ui/Modal';
import ProgressBar from '../components/ui/ProgressBar';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import LoadingOverlay from '../components/ui/LoadingOverlay';

export default function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [category, setCategory] = useState('Food');
  const [limit, setLimit] = useState('');
  const [month, setMonth] = useState(todayStr().slice(0, 7));
  const [aiPredict, setAiPredict] = useState(null);
  const [predicting, setPredicting] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [b, s, e] = await Promise.all([api.get('/budgets'), api.get('/expenses/summary'), api.get('/expenses')]);
      setBudgets(b);
      setSummary(s);
      setExpenses(e);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const openModal = (id) => {
    if (id) {
      const b = budgets.find(x => x._id === id);
      if (b) {
        setEditId(id); setCategory(b.category); setLimit(b.limit); setMonth(b.month || todayStr().slice(0, 7));
      }
    } else {
      setEditId(null); setCategory('Food'); setLimit(''); setMonth(todayStr().slice(0, 7));
    }
    setAiPredict(null);
    setModalOpen(true);
  };

  const predictLimit = async () => {
    setPredicting(true);
    try {
      const recent = expenses.filter(e => e.category === category).slice(-10);
      const avg = recent.length ? Math.round(recent.reduce((s, e) => s + e.amount, 0) / recent.length * 30) : 0;
      const r = await api.post('/budgets/predict', { category, month });
      setAiPredict({ predicted: r.predicted || avg || 5000, category });
    } catch (e) {
      const recent = expenses.filter(e => e.category === category).slice(-10);
      const avg = recent.length ? Math.round(recent.reduce((s, e) => s + e.amount, 0) / recent.length * 30) : 5000;
      setAiPredict({ predicted: avg, category });
    }
    setPredicting(false);
  };

  const save = async () => {
    if (!limit || limit <= 0) return;
    try {
      if (editId) await api.put('/budgets/' + editId, { category, limit: parseFloat(limit), month });
      else await api.post('/budgets', { category, limit: parseFloat(limit), month });
      setModalOpen(false);
      await loadData();
    } catch (e) { alert(e.message); }
  };

  const del = async (id) => {
    try { await api.delete('/budgets/' + id); setDeleteConfirm(null); await loadData(); } catch (e) { alert(e.message); }
  };

  if (loading) return <LoadingOverlay message="Calibrating control limits..." />;

  const monthExpenses = expenses.filter(e => (e.date || '').startsWith(month));

  const budgetsWithSpend = budgets.map(b => {
    const spent = monthExpenses.filter(e => e.category === b.category).reduce((s, e) => s + e.amount, 0);
    return { ...b, spent, pct: b.limit > 0 ? Math.min(spent / b.limit * 100, 100) : 0 };
  });

  const totalLimit = budgetsWithSpend.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgetsWithSpend.reduce((s, b) => s + b.spent, 0);
  const overallPct = totalLimit > 0 ? Math.min(totalSpent / totalLimit * 100, 100) : 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 2, height: 16, background: 'var(--warning)', borderRadius: 1 }} />
            <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px', fontFamily: 'var(--font-display)' }}>CONTROL LIMITS</h2>
            <Badge variant="cyan" style={{ fontSize: 8 }}>⊞ BUDGET</Badge>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>Set spending boundaries per category</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input type="month" value={month} onChange={e => setMonth(e.target.value)}
            style={{ width: 150, height: 36, textAlign: 'center' }} />
          <Button variant="primary" onClick={() => openModal(null)}>+ SET LIMIT</Button>
        </div>
      </div>

      <Card glow className="electric-surface electric-hover-node" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <div style={{
              fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-display)',
              letterSpacing: '0.1em', color: 'var(--text-tertiary)',
            }}>
              VAULT CONSUMPTION
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2, fontFamily: 'var(--font-display)' }}>
              {fmt(totalSpent)} / {fmt(totalLimit)}
            </div>
          </div>
          <Badge variant={overallPct >= 90 ? 'gold' : overallPct >= 75 ? 'cyan' : 'green'}>
            {overallPct.toFixed(1)}%
          </Badge>
        </div>
        <ProgressBar value={overallPct} glow />
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard label="ACTIVE LIMITS" value={budgets.length} glow className="electric-surface-soft electric-hover-node" />
        <StatCard label="TOTAL LIMIT" value={fmt(totalLimit)} className="electric-surface-soft electric-hover-node" />
        <StatCard label="REMAINING" value={fmt(totalLimit - totalSpent)} color={overallPct >= 90 ? 'var(--danger)' : 'var(--success)'} className="electric-surface-soft electric-hover-node" />
      </div>

      {budgetsWithSpend.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {budgetsWithSpend.map(b => {
            const pct = b.pct;
            const remaining = b.limit - b.spent;
            const isOver = b.spent >= b.limit;
            const threat = isOver ? 'BREACHED' : pct >= 80 ? 'CRITICAL' : pct >= 50 ? 'ELEVATED' : 'STABLE';
            const threatColor = isOver ? 'var(--danger)' : pct >= 80 ? 'var(--warning)' : pct >= 50 ? 'var(--orange)' : 'var(--success)';
            return (
              <Card key={b._id} hover glow={isOver || pct >= 80} className="electric-surface electric-hover-node">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 4,
                    background: isOver ? 'rgba(239,68,68,0.06)' : pct >= 80 ? 'rgba(250,204,21,0.06)' : 'rgba(0,234,255,0.04)',
                    border: '1px solid ' + threatColor + '18',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
                  }}>
                    {CAT_EMOJI[b.category] || '⊞'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div>
                        <strong style={{ fontSize: 13 }}>{b.category}</strong>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center',
                          padding: '1px 6px', borderRadius: 2,
                          fontSize: 8, fontWeight: 700, letterSpacing: '0.06em',
                          fontFamily: 'var(--font-display)',
                          background: threatColor + '0a',
                          border: '1px solid ' + threatColor + '18',
                          color: threatColor,
                          marginLeft: 8,
                        }}>
                          {threat}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 700, color: isOver ? 'var(--danger)' : 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{fmt(b.spent)}</span>
                        <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}> / {fmt(b.limit)}</span>
                      </div>
                    </div>
                    <ProgressBar value={pct} glow={isOver || pct >= 80} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                      <span style={{ fontSize: 10, color: isOver ? 'var(--danger)' : 'var(--text-tertiary)' }}>
                        {pct.toFixed(1)}% — {isOver ? `Over by ${fmt(-remaining)}` : `${fmt(remaining)} remaining`}
                      </span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Button variant="ghost" size="sm" onClick={() => openModal(b._id)}>✎</Button>
                        {deleteConfirm === b._id ? (
                          <>
                            <Button variant="danger" size="sm" onClick={() => del(b._id)}>CONFIRM</Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)}>✕</Button>
                          </>
                        ) : (
                          <Button variant="danger" size="sm" onClick={() => setDeleteConfirm(b._id)}>✕</Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState icon="⊞" title="No Control Limits" message="Set your first category budget" actionLabel="+ Set Limit" onAction={() => openModal(null)} />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Limit' : 'Set Control Limit'}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label>CATEGORY</label>
            <select value={category} onChange={e => { setCategory(e.target.value); setAiPredict(null); }}>
              {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div><label>MONTH</label><input type="month" value={month} onChange={e => setMonth(e.target.value)} /></div>
        </div>
        <div style={{ marginTop: 12 }}>
          <label>LIMIT AMOUNT (₹)</label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="number" min="1" value={limit} onChange={e => setLimit(e.target.value)} placeholder="0" style={{ flex: 1 }} />
            <Button variant="ghost" size="sm" onClick={predictLimit} disabled={predicting} style={{ whiteSpace: 'nowrap', fontSize: 11, color: 'var(--accent)' }}>
              {predicting ? '◈ PREDICTING...' : '◈ AI PREDICT'}
            </Button>
          </div>
        </div>
        {aiPredict && (
          <div style={{
            marginTop: 8, padding: '8px 12px', borderRadius: 'var(--radius-sm)',
            background: 'rgba(0,234,255,0.04)', border: '1px solid rgba(0,234,255,0.08)',
            color: 'var(--accent)', fontSize: 12,
          }}>
            ◈ Oracle predicts <strong>{fmt(aiPredict.predicted)}</strong> for {aiPredict.category}
            <Button variant="primary" size="sm" onClick={() => { setLimit(aiPredict.predicted); setAiPredict(null); }} style={{ marginLeft: 8 }}>APPLY</Button>
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
          <Button variant="ghost" onClick={() => setModalOpen(false)}>CANCEL</Button>
          <Button variant="primary" onClick={save}>SET LIMIT</Button>
        </div>
      </Modal>
    </div>
  );
}
