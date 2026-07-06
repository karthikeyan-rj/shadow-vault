import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { fmt, fmtDate, todayStr } from '../utils/helpers';
import { CAT_EMOJI, CAT_COLORS, EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../utils/constants';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import FilterBar from '../components/ui/FilterBar';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import SystemQuestBox from '../components/ui/SystemQuestBox';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [date, setDate] = useState(todayStr());
  const [description, setDescription] = useState('');
  const [aiSuggest, setAiSuggest] = useState(null);

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [payFilter, setPayFilter] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [exp, s] = await Promise.all([api.get('/expenses'), api.get('/expenses/summary')]);
      setExpenses(exp);
      setSummary(s);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  let suggestTimeout;
  const handleTitleChange = (val) => {
    setTitle(val);
    clearTimeout(suggestTimeout);
    if (val.length >= 2) {
      suggestTimeout = setTimeout(async () => {
        try {
          const r = await api.post('/ai/categorize', { title: val });
          if (r.suggestedCategory && r.suggestedCategory !== 'Other') setAiSuggest(r);
          else setAiSuggest(null);
        } catch (e) { /* ignore */ }
      }, 400);
    } else {
      setAiSuggest(null);
    }
  };

  const openModal = (id) => {
    if (id) {
      const exp = expenses.find(e => e._id === id);
      if (exp) {
        setEditId(id); setTitle(exp.title); setAmount(exp.amount);
        setCategory(exp.category); setPaymentMethod(exp.paymentMethod);
        setDate(exp.date ? exp.date.split('T')[0] : todayStr());
        setDescription(exp.description || '');
      }
    } else {
      setEditId(null); setTitle(''); setAmount(''); setCategory('Food');
      setPaymentMethod('UPI'); setDate(todayStr()); setDescription('');
    }
    setAiSuggest(null);
    setModalOpen(true);
  };

  const save = async () => {
    if (!title || !amount || amount <= 0) return;
    try {
      if (editId) await api.put('/expenses/' + editId, { title, amount: parseFloat(amount), category, paymentMethod, date, description });
      else await api.post('/expenses', { title, amount: parseFloat(amount), category, paymentMethod, date, description });
      setModalOpen(false);
      await loadData();
    } catch (e) { alert(e.message); }
  };

  const del = async (id) => {
    if (!window.confirm('Remove this shadow outflow?')) return;
    try { await api.delete('/expenses/' + id); await loadData(); } catch (e) { alert(e.message); }
  };

  const exportCSV = () => {
    const rows = [['Title', 'Amount', 'Category', 'Payment', 'Date', 'Description'],
      ...expenses.map(e => [`"${e.title}"`, e.amount, e.category, e.paymentMethod, new Date(e.date).toLocaleDateString(), `"${e.description || ''}"`])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'shadowvault_expenses_' + todayStr() + '.csv';
    a.click();
  };

  if (loading) return <LoadingOverlay message="Scanning shadow outflows..." />;

  const filtered = expenses.filter(e =>
    (!search || e.title.toLowerCase().includes(search.toLowerCase())) &&
    (!catFilter || e.category === catFilter) &&
    (!payFilter || e.paymentMethod === payFilter)
  );

  const total = filtered.reduce((s, e) => s + e.amount, 0);
  const bal = summary?.allTimeBalance || 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 2, height: 16, background: 'var(--danger)', borderRadius: 1 }} />
            <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px', fontFamily: 'var(--font-display)' }}>SHADOW OUTFLOW</h2>
            <Badge variant="red" style={{ fontSize: 8 }}>↓ EXPENSES</Badge>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>Outflows drain your vault reserve</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{
            background: 'rgba(0,234,255,0.04)', border: '1px solid rgba(0,234,255,0.08)',
            borderRadius: 'var(--radius-sm)', padding: '6px 12px', fontSize: 12,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{
              fontSize: 8, color: 'var(--text-tertiary)',
              fontFamily: 'var(--font-display)', letterSpacing: '0.08em',
            }}>
              CAN SPEND
            </span>
            <span style={{ color: 'var(--accent)', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{fmt(bal)}</span>
          </div>
          <Button variant="primary" onClick={() => openModal(null)}>+ NEW OUTFLOW</Button>
        </div>
      </div>

      {bal <= 0 && (
        <SystemQuestBox
          type="danger"
          title="Vault Depleted"
          message="Your vault reserve is empty. Channel power inflow before recording outflows."
          style={{ marginBottom: 16 }}
        />
      )}

      <FilterBar onReset={() => { setSearch(''); setCatFilter(''); setPayFilter(''); }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <input placeholder="Search outflow..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32, height: 36 }} />
          <span style={{ position: 'absolute', left: 10, top: 8, color: 'var(--text-tertiary)', fontSize: 13 }}>◈</span>
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ height: 36, width: 140 }}>
          <option value="">All Categories</option>
          {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={payFilter} onChange={e => setPayFilter(e.target.value)} style={{ height: 36, width: 140 }}>
          <option value="">All Payments</option>
          {PAYMENT_METHODS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <Button variant="ghost" size="sm" onClick={exportCSV} style={{ marginLeft: 'auto', color: 'var(--accent)' }}>
          ↓ EXPORT
        </Button>
      </FilterBar>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard label="TOTAL ENTRIES" value={filtered.length} glow className="electric-surface-soft electric-hover-node" />
        <StatCard label="TOTAL OUTFLOW" value={fmt(total)} color="var(--danger)" className="electric-surface-soft electric-hover-node" />
        <StatCard label="AVERAGE" value={fmt(filtered.length ? Math.round(total / filtered.length) : 0)} className="electric-surface-soft electric-hover-node" />
      </div>

      <Card className="electric-surface electric-hover-node">
        {filtered.length > 0 ? (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-tertiary)', fontWeight: 600, borderBottom: '1px solid var(--border-primary)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-display)' }}>TITLE</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-tertiary)', fontWeight: 600, borderBottom: '1px solid var(--border-primary)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-display)' }}>CATEGORY</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-tertiary)', fontWeight: 600, borderBottom: '1px solid var(--border-primary)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-display)' }}>PAYMENT</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-tertiary)', fontWeight: 600, borderBottom: '1px solid var(--border-primary)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-display)' }}>DATE</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', color: 'var(--text-tertiary)', fontWeight: 600, borderBottom: '1px solid var(--border-primary)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-display)' }}>AMOUNT</th>
                  <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-primary)', width: 70 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e._id} style={{ transition: 'var(--transition)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,234,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 4,
                          background: (CAT_COLORS[e.category] || '#64748b') + '0a',
                          border: '1px solid ' + (CAT_COLORS[e.category] || '#64748b') + '12',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
                        }}>
                          ↓
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 12 }}>{e.title}</div>
                          {e.description && <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{e.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-primary)' }}>
                      <Badge variant="slate">{e.category}</Badge>
                    </td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-primary)', color: 'var(--text-secondary)', fontSize: 11 }}>{e.paymentMethod}</td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-primary)', color: 'var(--text-secondary)', fontSize: 11 }}>{fmtDate(e.date)}</td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-primary)', textAlign: 'right', color: 'var(--danger)', fontWeight: 700, fontFamily: 'var(--font-display)' }}>-{fmt(e.amount)}</td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-primary)' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Button variant="ghost" size="sm" onClick={() => openModal(e._id)}>✎</Button>
                        <Button variant="danger" size="sm" onClick={() => del(e._id)}>✕</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon="↓" title="No Shadow Outflows" message="Track your first expense" actionLabel="+ New Outflow" onAction={() => openModal(null)} />
        )}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Outflow' : 'New Shadow Outflow'}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label>TITLE *</label>
            <input value={title} onChange={e => handleTitleChange(e.target.value)} placeholder="e.g. Grocery" />
          </div>
          <div><label>AMOUNT (₹) *</label>
            <input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" />
          </div>
        </div>
        {aiSuggest && (
          <div style={{
            marginTop: 8, padding: '6px 10px', borderRadius: 'var(--radius-sm)',
            background: 'rgba(0,234,255,0.04)', border: '1px solid rgba(0,234,255,0.08)',
            color: 'var(--accent)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            ◈ Oracle suggests: <strong>{aiSuggest.suggestedCategory}</strong>
            <Button variant="primary" size="sm" onClick={() => { setCategory(aiSuggest.suggestedCategory); setAiSuggest(null); }}>APPLY</Button>
          </div>
        )}
        {parseFloat(amount) > bal && (
          <div style={{
            marginTop: 8, padding: '6px 10px', borderRadius: 'var(--radius-sm)',
            background: 'var(--danger-bg)', border: '1px solid rgba(239,68,68,0.12)',
            color: 'var(--danger)', fontSize: 11,
          }}>
            ⚠ Amount exceeds vault reserve of {fmt(bal)}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <div><label>CATEGORY</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div><label>PAYMENT</label>
            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
              {PAYMENT_METHODS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <div><label>DATE</label><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
          <div><label>DESCRIPTION</label><input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional" /></div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
          <Button variant="ghost" onClick={() => setModalOpen(false)}>CANCEL</Button>
          <Button variant="primary" onClick={save}>RECORD OUTFLOW</Button>
        </div>
      </Modal>
    </div>
  );
}
