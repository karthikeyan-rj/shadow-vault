import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { fmt } from '../utils/helpers';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import LoadingOverlay from '../components/ui/LoadingOverlay';

function getMonthData(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDay = first.getDay();
  const days = [];
  let day = 1;
  for (let w = 0; w < 6; w++) {
    const row = [];
    for (let d = 0; d < 7; d++) {
      if ((w === 0 && d < startDay) || day > last.getDate()) {
        row.push(null);
      } else {
        row.push(day++);
      }
    }
    days.push(row);
    if (day > last.getDate()) break;
  }
  return days;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function Calendar() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try { setExpenses(await api.get('/expenses')); } catch (e) { console.error(e); }
    setLoading(false);
  };

  const monthData = useMemo(() => getMonthData(year, month), [year, month]);

  const dayMap = useMemo(() => {
    const map = {};
    expenses.forEach(e => {
      if (!e.date) return;
      const d = new Date(e.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const key = d.getDate();
        if (!map[key]) map[key] = [];
        map[key].push(e);
      }
    });
    return map;
  }, [expenses, year, month]);

  const [selectedDay, setSelectedDay] = useState(null);
  const selectedDayExpenses = useMemo(() => {
    if (selectedDay === null) return [];
    return dayMap[selectedDay] || [];
  }, [dayMap, selectedDay]);

  if (loading) return <LoadingOverlay message="Loading timeline..." />;

  const totalMonth = expenses.filter(e => {
    if (!e.date) return false;
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() === month;
  }).reduce((s, e) => s + e.amount, 0);

  const today = new Date();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 2, height: 16, background: 'var(--accent)', borderRadius: 1 }} />
            <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px', fontFamily: 'var(--font-display)' }}>TIMELINE</h2>
            <Badge variant="cyan" style={{ fontSize: 8 }}>◉ CALENDAR</Badge>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>View your outflow activity on the timeline</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            style={{ height: 36, width: 140, textAlign: 'center' }}>
            <option value="all">All Types</option>
            <option value="income">Power Inflow</option>
            <option value="expense">Shadow Outflow</option>
          </select>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }}
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', padding: '4px 8px', cursor: 'pointer', fontSize: 14 }}>‹</button>
            <div style={{ padding: '4px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)' }}>
              {MONTHS[month]} {year}
            </div>
            <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }}
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', padding: '4px 8px', cursor: 'pointer', fontSize: 14 }}>›</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard label="MONTH TOTAL" value={fmt(totalMonth)} className="electric-surface-soft electric-hover-node" />
        <StatCard label="ACTIVE DAYS" value={Object.keys(dayMap).length} glow className="electric-surface-soft electric-hover-node" />
      </div>

      <Card className="electric-surface electric-hover-node">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
          {DAYS.map(d => (
            <div key={d} style={{
              textAlign: 'center', fontSize: 10, fontWeight: 700,
              color: 'var(--text-tertiary)',
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.05em', padding: '6px 0',
            }}>
              {d}
            </div>
          ))}
        </div>
        {monthData.map((row, ri) => (
          <div key={ri} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {row.map((day, di) => {
              if (day === null) return <div key={di} />;
              const dayExpenses = dayMap[day] || [];
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const isSelected = day === selectedDay;
              const total = dayExpenses.reduce((s, e) => s + e.amount, 0);
              const maxTotal = 20000;
              const intensity = Math.min(total / maxTotal, 1);
              return (
                <div key={di} onClick={() => setSelectedDay(isSelected ? null : day)}
                  style={{
                    padding: '6px 4px', minHeight: 48, cursor: 'pointer', borderRadius: 'var(--radius-sm)',
                    border: isSelected ? '1.5px solid var(--accent)' : isToday ? '1.5px solid rgba(0,234,255,0.12)' : '1px solid transparent',
                    background: isSelected ? 'rgba(0,234,255,0.04)' : dayExpenses.length > 0 ? `rgba(239,68,68,${0.02 + intensity * 0.08})` : 'transparent',
                    transition: 'var(--transition)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(0,234,255,0.02)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = dayExpenses.length > 0 ? `rgba(239,68,68,${0.02 + intensity * 0.08})` : 'transparent'; }}
                >
                  <span style={{ fontSize: 12, fontWeight: isToday ? 700 : 400, color: isToday ? 'var(--accent)' : 'var(--text-primary)' }}>{day}</span>
                  {total > 0 && (
                    <span style={{ fontSize: 8, color: 'var(--text-tertiary)', marginTop: 1, fontFamily: 'var(--font-display)' }}>
                      {total >= 1000 ? Math.round(total / 1000) + 'k' : fmt(total)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </Card>

      {selectedDay !== null && selectedDayExpenses.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <Card className="electric-surface electric-hover-node">
            <div style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: 10 }}>
              DAY {selectedDay} — {MONTHS[month]} {year}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {selectedDayExpenses.slice().reverse().map(e => (
                <div key={e._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Badge variant="slate" style={{ fontSize: 8 }}>{e.category}</Badge>
                    <span style={{ fontSize: 12, fontWeight: 500 }}>{e.title}</span>
                  </div>
                  <span style={{ color: 'var(--danger)', fontWeight: 600, fontFamily: 'var(--font-display)', fontSize: 12 }}>
                    -{fmt(e.amount)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {selectedDay !== null && selectedDayExpenses.length === 0 && (
        <div style={{ marginTop: 14, textAlign: 'center', padding: 16, color: 'var(--text-tertiary)', fontSize: 12 }}>
          No activity on Day {selectedDay}
        </div>
      )}
    </div>
  );
}
