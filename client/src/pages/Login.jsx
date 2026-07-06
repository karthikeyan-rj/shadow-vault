import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import AnimatedStormBackground from '../components/effects/AnimatedStormBackground';

export default function Login() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password || (isRegister && !name)) {
      setError('Complete all fields');
      return;
    }
    if (isRegister && password.length < 6) {
      setError('Password needs at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <AnimatedStormBackground variant="auth" />
      {/* Dark overlay to dampen lightning flash brightness around the card */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(5, 8, 22, 0.15) 0%, rgba(5, 8, 22, 0.50) 100%)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      <div className="auth-card">
        {/* Top gradient bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: isRegister
            ? 'linear-gradient(90deg, #0099cc, #00eaff, #7c3aed)'
            : 'linear-gradient(90deg, #5b21b6, #7c3aed, #00eaff)',
        }} />

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 60, height: 60,
            background: 'linear-gradient(135deg, #0099cc, #00eaff)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
            fontSize: 20,
            fontWeight: 900,
            color: '#050816',
            fontFamily: 'var(--font-display)',
            boxShadow: '0 8px 30px rgba(0, 234, 255, 0.25)',
          }}>
            SV
          </div>
          <h1 style={{
            fontSize: 26, fontWeight: 900, letterSpacing: '-0.5px',
            color: 'var(--text-primary)', marginBottom: 4,
            fontFamily: 'var(--font-display)',
          }}>
            SHADOWVAULT
          </h1>
          <p style={{
            color: 'var(--text-tertiary)', fontSize: 10, fontWeight: 700,
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.15em',
          }}>
            {isRegister ? 'FORGE YOUR LEGACY' : 'SYSTEM ACCESS'}
          </p>
          <p style={{
            color: 'var(--text-muted)', fontSize: 12, marginTop: 10,
          }}>
            Enter the vault. Track your money. Level up your financial rank.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '8px 12px', borderRadius: 'var(--radius-sm)',
            background: 'var(--danger-bg)',
            border: '1px solid rgba(239,68,68,0.15)',
            color: 'var(--danger)',
            fontSize: 12, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: 'var(--font-display)',
          }}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div style={{ marginBottom: 16 }}>
              <label>ACCESS ID</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <label>VAULT KEY (EMAIL)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label>PASSCODE {isRegister && <span style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font)', fontWeight: 400, textTransform: 'none' }}>(min 6 chars)</span>}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button
            variant="primary"
            size="lg"
            className="electric-button"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'AUTHENTICATING...' : isRegister ? 'CREATE VAULT ACCOUNT' : 'ENTER SHADOWVAULT'}
          </Button>
        </form>

        <div style={{
          textAlign: 'center', fontSize: 12, color: 'var(--text-tertiary)', marginTop: 18,
          borderTop: '1px solid var(--border-primary)', paddingTop: 18,
        }}>
          {isRegister ? (
            <>Already have a vault? <span onClick={() => { setIsRegister(false); setError(''); }} style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>Enter ShadowVault</span></>
          ) : (
            <>New hunter? <span onClick={() => { setIsRegister(true); setError(''); }} style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>Create Vault Account</span></>
          )}
        </div>
      </div>
    </div>
  );
}
