import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { fmt, fmtDate, todayStr } from '../utils/helpers';
import { CAT_EMOJI, INCOME_SOURCES } from '../utils/constants';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import FilterBar from '../components/ui/FilterBar';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import SystemQuestBox from '../components/ui/SystemQuestBox';

export default function Income() {
  const [incomes, setIncomes] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('Salary');
  const [date, setDate] = useState(todayStr());
  const [description, setDescription] = useState('');

  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [inc, s] = await Promise.all([api.get('/income'), api.get('/expenses/summary')]);
      setIncomes(inc);
      setSummary(s);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const openModal = (id) => {
    if (id) {
      const inc = incomes.find(i => i._id === id);
      if (inc) {
        setEditId(id); setTitle(inc.title); setAmount(inc.amount);
        setSource(inc.source); setDate(inc.date ? inc.date.split('T')[0] : todayStr());
        setDescription(inc.description || '');
      }
    } else {
      setEditId(null); setTitle(''); setAmount(''); setSource('Salary'); setDate(todayStr()); setDescription('');
    }
    setModalOpen(true);
  };

  const save = async () => {
    if (!title || !amount || amount <= 0) return;
    try {
      if (editId) await api.put('/income/' + editId, { title, amount: parseFloat(amount), source, date, description });
      else await api.post('/income', { title, amount: parseFloat(amount), source, date, description });
      setModalOpen(false);
      await loadData();
    } catch (e) { alert(e.message); }
  };

  const del = async (id) => {
    if (!window.confirm('Remove this power inflow?')) return;
    try { await api.delete('/income/' + id); await loadData(); } catch (e) { alert(e.message); }
  };

  if (loading) return <LoadingOverlay message="Syncing power inflow..." />;

  const filtered = incomes.filter(i =>
    (!search || i.title.toLowerCase().includes(search.toLowerCase())) &&
    (!sourceFilter || i.source === sourceFilter)
  );

  const total = filtered.reduce((s, i) => s + i.amount, 0);
  const maxAmt = filtered.length ? Math.max(...filtered.map(i => i.amount)) : 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 2, height: 16, background: 'var(--accent)', borderRadius: 1 }} />
            <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px', fontFamily: 'var(--font-display)' }}>POWER INFLOW</h2>
            <Badge variant="cyan" style={{ fontSize: 8 }}>↑ INCOME</Badge>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>Channel income to empower your vault</p>
        </div>
        <Button variant="primary" onClick={() => openModal(null)}>+ NEW INFLOW</Button>
      </div>

      <SystemQuestBox
        type="notice"
        title="Channel Power First"
        message="Channel power inflow to build your vault reserve. Your spending capacity depends on your income flow."
        style={{ marginBottom: 16 }}
      />

      <FilterBar onReset={() => { setSearch(''); setSourceFilter(''); }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <input placeholder="Search inflow..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32, height: 36 }} />
          <span style={{ position: 'absolute', left: 10, top: 8, color: 'var(--text-tertiary)', fontSize: 13 }}>◈</span>
        </div>
        <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} style={{ height: 36, width: 150 }}>
          <option value="">All Sources</option>
          {INCOME_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </FilterBar>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard label="TOTAL ENTRIES" value={filtered.length} glow className="electric-surface-soft electric-hover-node" />
        <StatCard label="TOTAL INFLOW" value={fmt(total)} color="var(--success)" className="electric-surface-soft electric-hover-node" />
        <StatCard label="HIGHEST" value={fmt(maxAmt)} className="electric-surface-soft electric-hover-node" />
      </div>

      <Card className="electric-surface electric-hover-node">
        {filtered.length > 0 ? (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-tertiary)', fontWeight: 600, borderBottom: '1px solid var(--border-primary)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-display)' }}>TITLE</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-tertiary)', fontWeight: 600, borderBottom: '1px solid var(--border-primary)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-display)' }}>SOURCE</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-tertiary)', fontWeight: 600, borderBottom: '1px solid var(--border-primary)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-display)' }}>DATE</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', color: 'var(--text-tertiary)', fontWeight: 600, borderBottom: '1px solid var(--border-primary)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-display)' }}>AMOUNT</th>
                  <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-primary)', width: 70 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inc => (
                  <tr key={inc._id} style={{ transition: 'var(--transition)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,234,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 4,
                          background: 'rgba(34,197,94,0.06)',
                          border: '1px solid rgba(34,197,94,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12,
                        }}>
                          ↑
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 12 }}>{inc.title}</div>
                          {inc.description && <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{inc.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-primary)' }}>
                      <Badge variant="green">{inc.source}</Badge>
                    </td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-primary)', color: 'var(--text-secondary)', fontSize: 11 }}>{fmtDate(inc.date)}</td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-primary)', textAlign: 'right', color: 'var(--success)', fontWeight: 700, fontFamily: 'var(--font-display)' }}>+{fmt(inc.amount)}</td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-primary)' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Button variant="ghost" size="sm" onClick={() => openModal(inc._id)}>✎</Button>
                        <Button variant="danger" size="sm" onClick={() => del(inc._id)}>✕</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon="↑" title="No Power Inflow" message="Channel your first income source" actionLabel="+ New Inflow" onAction={() => openModal(null)} />
        )}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Inflow' : 'New Power Inflow'}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label>TITLE *</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. March Salary" /></div>
          <div><label>AMOUNT (₹) *</label><input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 12 }}>
          <div><label>SOURCE</label>
            <select value={source} onChange={e => setSource(e.target.value)}>
              {INCOME_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div><label>DATE</label><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
        </div>
        <div style={{ marginTop: 12 }}>
          <label>DESCRIPTION</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows="2" placeholder="Optional" />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
          <Button variant="ghost" onClick={() => setModalOpen(false)}>CANCEL</Button>
          <Button variant="primary" onClick={save}>CHANNEL INFLOW</Button>
        </div>
      </Modal>
    </div>
  );
}
