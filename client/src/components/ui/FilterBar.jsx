import React from 'react';
import Button from './Button';

export default function FilterBar({ children, onReset }) {
  return (
    <div style={{
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap',
      alignItems: 'center',
      background: 'rgba(8, 20, 40, 0.4)',
      backdropFilter: 'blur(16px) saturate(160%)',
      WebkitBackdropFilter: 'blur(16px) saturate(160%)',
      padding: 12,
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--glass-border)',
      marginBottom: 16,
    }}>
      {children}
      {onReset && (
        <Button variant="ghost" size="sm" onClick={onReset}>Reset</Button>
      )}
    </div>
  );
}
