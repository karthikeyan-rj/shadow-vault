import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { fmt, fmtDate, todayStr } from '../utils/helpers';
import { CAT_EMOJI, BILL_CATEGORIES, PAYMENT_METHODS } from '../utils/constants';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import FilterBar from '../components/ui/FilterBar';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import SystemQuestBox from '../components/ui/SystemQuestBox';

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Electricity');
  const [dueDate, setDueDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [b, s] = await Promise.all([api.get('/bills'), api.get('/bills/summary')]);
      setBills(b);
      setSummary(s);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const openModal = (id) => {
    if (id) {
      const b = bills.find(x => x._id === id);
      if (b) {
        setEditId(id); setTitle(b.title); setAmount(b.amount);
        setCategory(b.category); setDueDate(b.dueDate ? b.dueDate.split('T')[0] : '');
        setPaymentMethod(b.paymentMethod || 'UPI');
      }
    } else {
      setEditId(null); setTitle(''); setAmount(''); setCategory('Electricity');
      setDueDate(''); setPaymentMethod('UPI');
    }
    setModalOpen(true);
  };

  const save = async () => {
    if (!title || !amount || amount <= 0) return;
    try {
      if (editId) await api.put('/bills/' + editId, { title, amount: parseFloat(amount), category, dueDate, paymentMethod });
      else await api.post('/bills', { title, amount: parseFloat(amount), category, dueDate, paymentMethod });
      setModalOpen(false);
      await loadData();
    } catch (e) { alert(e.message); }
  };

  const markPaid = async (id) => {
    try { await api.put('/bills/' + id, { paid: true }); await loadData(); } catch (e) { alert(e.message); }
  };

  const del = async (id) => {
    if (!window.confirm('Remove this due mission?')) return;
    try { await api.delete('/bills/' + id); await loadData(); } catch (e) { alert(e.message); }
  };

  if (loading) return <LoadingOverlay message="Scanning due missions..." />;

  const filtered = bills.filter(b =>
    (!search || b.title.toLowerCase().includes(search.toLowerCase())) &&
    (!statusFilter || (statusFilter === 'paid' ? b.paid : (statusFilter === 'unpaid' ? !b.paid : true)))
  );

  const totalUnpaid = filtered.filter(b => !b.paid).reduce((s, b) => s + b.amount, 0);
  const totalPaid = filtered.filter(b => b.paid).reduce((s, b) => s + b.amount, 0);
  const overdue = filtered.filter(b => !b.paid && b.dueDate && new Date(b.dueDate) < new Date());

  const getMissionStatus = (b) => {
    if (b.paid) return { label: 'COMPLETED', color: 'green', icon: '✓' };
    const now = new Date();
    const due = new Date(b.dueDate);
    const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { label: 'OVERDUE', color: 'red', icon: '⚠' };
    if (diff === 0) return { label: 'DUE TODAY', color: 'amber', icon: '◈' };
    if (diff <= 3) return { label: 'UPCOMING', color: 'blue', icon: '◉' };
    return { label: 'SCHEDULED', color: 'slate', icon: '☰' };
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 2, height: 16, background: 'var(--orange)', borderRadius: 1 }} />
            <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px', fontFamily: 'var(--font-display)' }}>DUE MISSIONS</h2>
            <Badge variant="amber" style={{ fontSize: 8 }}>☰ BILLS</Badge>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>Track and manage your bill payments</p>
        </div>
        <Button variant="primary" onClick={() => openModal(null)}>+ NEW MISSION</Button>
      </div>

      {overdue.length > 0 && (
        <SystemQuestBox
          type="danger"
          title="Overdue Missions Detected"
          message={`${overdue.length} mission(s) past deadline — ${fmt(overdue.reduce((s, b) => s + b.amount, 0))} total. Complete immediately to avoid penalties.`}
          style={{ marginBottom: 16 }}
        />
      )}

      <FilterBar onReset={() => { setSearch(''); setStatusFilter(''); }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <input placeholder="Search missions..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32, height: 36 }} />
          <span style={{ position: 'absolute', left: 10, top: 8, color: 'var(--text-tertiary)', fontSize: 13 }}>◈</span>
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ height: 36, width: 150 }}>
          <option value="">All Missions</option>
          <option value="unpaid">Active</option>
          <option value="paid">Completed</option>
        </select>
      </FilterBar>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard label="TOTAL MISSIONS" value={filtered.length} glow className="electric-surface-soft electric-hover-node" />
        <StatCard label="ACTIVE DUES" value={fmt(totalUnpaid)} color="var(--danger)" className="electric-surface-soft electric-hover-node" />
        <StatCard label="COMPLETED" value={fmt(totalPaid)} color="var(--success)" className="electric-surface-soft electric-hover-node" />
      </div>

      {filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(b => {
            const ms = getMissionStatus(b);
            return (
              <Card key={b._id} hover glow={ms.label === 'OVERDUE' || ms.label === 'DUE TODAY'} className="electric-surface electric-hover-node">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 4,
                    background: ms.color === 'green' ? 'rgba(34,197,94,0.06)' : ms.color === 'red' ? 'rgba(239,68,68,0.06)' : 'rgba(0,234,255,0.04)',
                    border: '1px solid ' + (
                      ms.color === 'green' ? 'rgba(34,197,94,0.1)' : ms.color === 'red' ? 'rgba(239,68,68,0.12)' : 'rgba(0,234,255,0.08)'
                    ),
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
                  }}>
                    {ms.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: 13 }}>{b.title}</strong>
                        <Badge variant={ms.color} style={{ marginLeft: 6 }}>{ms.label}</Badge>
                      </div>
                      <span style={{ fontWeight: 700, color: b.paid ? 'var(--success)' : 'var(--text-primary)', fontFamily: 'var(--font-display)', fontSize: 14 }}>
                        {fmt(b.amount)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 14, marginTop: 3 }}>
                      <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                        📂 {b.category}
                      </span>
                      {b.dueDate && (
                        <span style={{ fontSize: 10, color: ms.label === 'OVERDUE' ? 'var(--danger)' : ms.label === 'DUE TODAY' ? 'var(--warning)' : 'var(--text-tertiary)' }}>
                          ⏰ {ms.label === 'OVERDUE' ? 'Missed: ' : 'Due: '}{fmtDate(b.dueDate)}
                        </span>
                      )}
                      {b.paymentMethod && (
                        <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                          💳 {b.paymentMethod}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {!b.paid && <Button variant="primary" size="sm" onClick={() => markPaid(b._id)}>✓ COMPLETE</Button>}
                    <Button variant="ghost" size="sm" onClick={() => openModal(b._id)}>✎</Button>
                    <Button variant="danger" size="sm" onClick={() => del(b._id)}>✕</Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState icon="☰" title="No Due Missions" message="Add your first bill to track" actionLabel="+ New Mission" onAction={() => openModal(null)} />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Mission' : 'New Due Mission'}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label>TITLE *</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Electricity Bill" /></div>
          <div><label>AMOUNT (₹) *</label><input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <div><label>CATEGORY</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              {BILL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div><label>PAYMENT</label>
            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
              {PAYMENT_METHODS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <label>DUE DATE</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
          <Button variant="ghost" onClick={() => setModalOpen(false)}>CANCEL</Button>
          <Button variant="primary" onClick={save}>CREATE MISSION</Button>
        </div>
      </Modal>
    </div>
  );
}
