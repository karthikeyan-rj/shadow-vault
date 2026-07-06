import React, { useState, useRef, useEffect } from 'react';
import Button from '../ui/Button';
import { api } from '../../services/api';
import { fmt } from '../../utils/helpers';

export default function ChatFab({ user }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'ai', text: '**Vault Oracle online.** I perceive all shadow flows within this vault. Ask, and I shall reveal the truth of your financial realm.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const appendMsg = (text, type) => {
    setMessages(prev => [...prev, { type, text }]);
  };

  const sendMessage = async (msg) => {
    if (!msg.trim()) return;
    appendMsg(msg, 'user');
    setInput('');
    setShowSuggestions(false);
    setLoading(true);

    try {
      const data = await api.post('/chat', { message: msg });
      appendMsg(data.reply, 'ai');
    } catch {
      appendMsg('The Vault Oracle consciousness flickers. Speak again when ready.', 'ai');
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage(input);
  };

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;
    if (isRecording) { stopVoice(); return; }
    startVoice();
  };

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'en-IN';
    recognitionRef.current.interimResults = true;
    recognitionRef.current.continuous = false;
    recognitionRef.current.maxAlternatives = 1;
    setIsRecording(true);
    let finalTranscript = '';
    recognitionRef.current.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setInput(finalTranscript || interim);
    };
    recognitionRef.current.onend = () => {
      stopVoice();
      if (input.trim()) sendMessage(input);
    };
    recognitionRef.current.onerror = () => { stopVoice(); };
    recognitionRef.current.start();
  };

  const stopVoice = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setIsRecording(false);
  };

  const formatAI = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--accent)">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: open
            ? 'rgba(8, 20, 40, 0.6)'
            : 'linear-gradient(135deg, #0099cc, #00eaff)',
          backdropFilter: open ? 'blur(16px) saturate(160%)' : 'none',
          color: open ? 'var(--text-secondary)' : '#050816',
          border: open ? '1px solid var(--glass-border)' : 'none',
          cursor: 'pointer',
          fontSize: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: open
            ? '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.025)'
            : '0 4px 25px rgba(0, 234, 255, 0.35), 0 0 60px rgba(0, 234, 255, 0.1)',
          zIndex: 150,
          transition: 'var(--transition)',
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.transform = 'scale(1.08)'; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.transform = 'scale(1)'; }}
        title="Vault Oracle"
      >
        {open ? '✕' : '◈'}
      </button>

      {open && (
        <div
          className="chat-panel-mobile"
          style={{
            position: 'fixed',
            bottom: 88,
            right: 24,
            width: 400,
            maxHeight: 540,
            background: 'rgba(5, 8, 22, 0.88)',
            backdropFilter: 'blur(22px) saturate(160%)',
            WebkitBackdropFilter: 'blur(22px) saturate(160%)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 0 60px rgba(0, 234, 255, 0.04), 0 8px 48px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.025)',
            zIndex: 150,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideIn 0.3s ease',
          }}
        >
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'radial-gradient(ellipse at 20% 15%, rgba(0, 234, 255, 0.03) 0%, transparent 60%)',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 4,
                background: 'linear-gradient(135deg, #0099cc, #00eaff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, flexShrink: 0, color: '#050816',
                boxShadow: '0 0 12px rgba(0, 234, 255, 0.2)',
              }}>
                ◈
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: 700, fontSize: 13,
                  color: 'var(--accent)',
                  fontFamily: 'var(--font-display)',
                }}>
                  VAULT ORACLE
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>
                  ALL-SEEING ADVISOR · VOICE ENABLED
                </div>
              </div>
            </div>

            <div style={{
              flex: 1, overflowY: 'auto', padding: 14,
              display: 'flex', flexDirection: 'column', gap: 8,
              maxHeight: 350, minHeight: 180,
            }}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    maxWidth: '90%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                    lineHeight: 1.6,
                    wordWrap: 'break-word',
                    alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                    background: msg.type === 'user'
                      ? 'linear-gradient(135deg, #0099cc, #00eaff)'
                      : 'rgba(0, 234, 255, 0.03)',
                    backdropFilter: msg.type === 'ai' ? 'blur(8px)' : 'none',
                    border: msg.type === 'ai' ? '1px solid var(--glass-border)' : 'none',
                    color: msg.type === 'user' ? '#050816' : 'var(--text-primary)',
                    borderTopRightRadius: msg.type === 'user' ? 2 : 6,
                    borderTopLeftRadius: msg.type === 'ai' ? 2 : 6,
                    fontWeight: msg.type === 'user' ? 700 : 400,
                  }}
                  dangerouslySetInnerHTML={msg.type === 'ai' ? { __html: formatAI(msg.text) } : undefined}
                >
                  {msg.type === 'user' ? msg.text : undefined}
                </div>
              ))}
              {loading && (
                <div style={{
                  alignSelf: 'flex-start', padding: '10px 14px',
                  background: 'rgba(0, 234, 255, 0.03)', borderRadius: 6,
                  backdropFilter: 'blur(8px)',
                  borderTopLeftRadius: 2, border: '1px solid var(--glass-border)',
                }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1.4s infinite' }} />
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1.4s infinite', animationDelay: '0.2s' }} />
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1.4s infinite', animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {showSuggestions && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '0 14px 8px', position: 'relative', zIndex: 1 }}>
                {['Analyze my outflows', 'How to rank up?', 'Vault status', 'Savings advice'].map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    style={{
                      padding: '4px 8px', borderRadius: 2,
                      background: 'rgba(0, 234, 255, 0.04)',
                      backdropFilter: 'blur(4px)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-secondary)',
                      fontSize: 10, cursor: 'pointer',
                      fontFamily: 'var(--font)',
                      transition: 'var(--transition)',
                      letterSpacing: '0.02em',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0, 234, 255, 0.1)'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'rgba(0, 234, 255, 0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0, 234, 255, 0.04)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div style={{
              padding: '10px 14px', borderTop: '1px solid var(--glass-border)',
              display: 'flex', gap: 6, alignItems: 'center',
              position: 'relative', zIndex: 1,
            }}>
              <button
                onClick={toggleVoice}
                style={{
                  width: 32, height: 32, borderRadius: 4,
                  background: isRecording ? 'rgba(239,68,68,0.1)' : 'rgba(8, 20, 40, 0.5)',
                  backdropFilter: 'blur(8px)',
                  border: isRecording ? '1px solid var(--danger)' : '1px solid var(--glass-border)',
                  color: isRecording ? 'var(--danger)' : 'var(--text-tertiary)',
                  cursor: 'pointer', fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'var(--transition)', flexShrink: 0,
                }}
                title={isRecording ? 'Stop recording' : 'Voice input'}
              >
                ◉
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask the Oracle..."
                style={{
                  flex: 1,
                  background: 'rgba(5, 10, 25, 0.5)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 4, padding: '7px 12px',
                  fontSize: 12, color: 'var(--text-primary)',
                  outline: 'none', fontFamily: 'var(--font)',
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                style={{
                  width: 32, height: 32, borderRadius: 4,
                  background: '#0099cc', color: '#050816',
                  border: 'none', cursor: 'pointer', fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'var(--transition)', flexShrink: 0,
                  fontWeight: 800,
                  opacity: (!input.trim() || loading) ? 0.4 : 1,
                }}
              >
                ↵
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .chat-panel-mobile { right: 10px !important; left: 10px !important; width: auto !important; bottom: 80px !important; max-height: 60vh !important; }
        }
      `}</style>
    </>
  );
}
