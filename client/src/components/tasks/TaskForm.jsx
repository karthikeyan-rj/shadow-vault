import React, { useState } from 'react';

export default function TaskForm({ onSubmit, onCancel }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('General');
  const [note, setNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      amount: parseFloat(amount) || 0,
      category: category || 'General',
      note: note.trim(),
    });
    setTitle('');
    setAmount('');
    setCategory('General');
    setNote('');
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(5, 8, 22, 0.7)', backdropFilter: 'blur(8px)',
      }} onClick={onCancel} />
      <form onSubmit={handleSubmit} className="glass-panel" style={{
        position: 'relative', width: 'min(400px, 90vw)',
        padding: 24, display: 'flex', flexDirection: 'column', gap: 14,
        animation: 'slideIn 0.3s ease',
      }}>
        <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent)', letterSpacing: '0.04em' }}>
          NEW MISSION
        </div>

        <div>
          <label>Mission Title</label>
          <input
            value={title} onChange={e => setTitle(e.target.value)}
            placeholder="e.g., Pay electricity bill"
            autoFocus
          />
        </div>

        <div>
          <label>Amount (optional)</label>
          <input
            type="number" value={amount} onChange={e => setAmount(e.target.value)}
            placeholder="₹"
            min="0" step="1"
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="General">General</option>
              <option value="Bill Payment">Bill Payment</option>
              <option value="Expense">Expense</option>
              <option value="Savings">Savings</option>
              <option value="Income">Income</option>
              <option value="Budget">Budget</option>
              <option value="Review">Review</option>
            </select>
          </div>
        </div>

        <div>
          <label>Note (optional)</label>
          <input
            value={note} onChange={e => setNote(e.target.value)}
            placeholder="Additional details..."
          />
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <button type="button" onClick={onCancel} style={{
            padding: '8px 16px', borderRadius: 'var(--radius-sm)',
            background: 'transparent', border: '1px solid var(--glass-border)',
            color: 'var(--text-tertiary)', cursor: 'pointer',
            fontSize: 12, fontWeight: 600,
            fontFamily: 'var(--font)',
            transition: 'var(--transition)',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,234,255,0.2)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
          >
            CANCEL
          </button>
          <button type="submit" style={{
            padding: '8px 16px', borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, #0099cc, #00eaff)',
            border: 'none', color: '#050816', cursor: 'pointer',
            fontSize: 12, fontWeight: 800, fontFamily: 'var(--font-display)',
            letterSpacing: '0.04em',
            boxShadow: '0 0 15px rgba(0, 234, 255, 0.15)',
            transition: 'var(--transition)',
          }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 234, 255, 0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 234, 255, 0.15)'; }}
          >
            ADD MISSION
          </button>
        </div>
      </form>
    </div>
  );
}
