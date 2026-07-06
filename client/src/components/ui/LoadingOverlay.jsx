import React from 'react';

export default function LoadingOverlay({ message = 'Initializing ShadowVault system...' }) {
  return (
    <div className="loading-overlay">
      <div className="spinner-large" />
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 11,
        color: 'var(--text-tertiary)',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        marginTop: 8,
      }}>
        {message}
      </div>
    </div>
  );
}
