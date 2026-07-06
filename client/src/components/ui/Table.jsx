import React from 'react';

export default function Table({ headers, rows, onEdit, onDelete, emptyMessage = 'No data found', emptyIcon = '📄' }) {
  if (!rows || rows.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>
        <div style={{ fontSize: 44, marginBottom: 10 }}>{emptyIcon}</div>
        <div style={{ fontWeight: 600 }}>{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                style={{
                  textAlign: h.align || 'left',
                  padding: '12px 14px',
                  color: 'var(--text-tertiary)',
                  fontWeight: 600,
                  borderBottom: '1px solid var(--border-primary)',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  whiteSpace: 'nowrap',
                }}
              >
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={row._id || ri}
              style={{ transition: 'var(--transition)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              {row.cells.map((cell, ci) => (
                <td
                  key={ci}
                  style={{
                    padding: '12px 14px',
                    borderBottom: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)',
                    verticalAlign: 'middle',
                    textAlign: cell.align || 'left',
                  }}
                >
                  {cell.content}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
