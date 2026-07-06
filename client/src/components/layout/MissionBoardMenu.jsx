import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { initials } from '../../utils/helpers';

const navItems = [
  { section: 'COMMAND' },
  { path: '/dashboard', label: 'Command Center', icon: '◈' },
  { section: 'FINANCE' },
  { path: '/income', label: 'Power Inflow', icon: '↑' },
  { path: '/expenses', label: 'Shadow Outflow', icon: '↓' },
  { section: 'CONTROL' },
  { path: '/budget', label: 'Control Limits', icon: '⊞' },
  { path: '/goals', label: 'Vault Quests', icon: '⚔' },
  { path: '/bills', label: 'Due Missions', icon: '☰' },
  { path: '/tasks', label: 'Tasks', icon: '✦' },
  { section: 'INTEL' },
  { path: '/reports', label: 'Intelligence Reports', icon: '◈' },
  { path: '/calendar', label: 'Timeline', icon: '◉' },
  { path: '/achievements', label: 'Rank Archive', icon: '◆' },
  { path: '/transfer', label: 'Vault Transfer', icon: '⇄' },
  { section: 'ACCOUNT' },
  { path: '/profile', label: 'Profile', icon: '◎' },
];

export default function MissionBoardMenu({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 320);
  }, [isClosing, onClose]);

  const handleNav = useCallback((path) => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
      navigate(path);
    }, 320);
  }, [isClosing, onClose, navigate]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, handleClose]);

  if (!open && !isClosing) return null;

  return (
    <div
      onClick={handleClose}
      className={`board-overlay ${isClosing ? 'closing' : 'open'}`}
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div className="mission-board-shell">
        <svg
          className="mission-electric-field"
          viewBox="0 0 1000 700"
          preserveAspectRatio="none"
        >
          <path className="electric-glow electric-glow-1" d="M500 95 L470 60 L510 35 L485 10" />
          <path className="electric-glow electric-glow-2" d="M130 250 L80 230 L105 200 L50 180" />
          <path className="electric-glow electric-glow-3" d="M870 260 L920 235 L895 205 L955 185" />
          <path className="electric-glow electric-glow-4" d="M250 610 L220 650 L250 675 L225 695" />
          <path className="electric-glow electric-glow-5" d="M760 608 L805 648 L780 678 L835 705" />
          <path className="electric-glow electric-glow-6" d="M100 100 L55 70 L80 40 L35 10" />
          <path className="electric-glow electric-glow-7" d="M900 98 L945 68 L920 38 L965 8" />
          <path className="electric-glow electric-glow-8" d="M115 520 L65 505 L90 475 L35 460" />
          <path className="electric-glow electric-glow-9" d="M885 520 L935 505 L910 475 L970 460" />
          <path className="electric-glow electric-glow-10" d="M500 605 L470 645 L510 670 L485 710" />
          <path className="electric-path electric-path-1" d="M500 95 L470 60 L510 35 L485 10" />
          <path className="electric-path electric-path-2" d="M130 250 L80 230 L105 200 L50 180" />
          <path className="electric-path electric-path-3" d="M870 260 L920 235 L895 205 L955 185" />
          <path className="electric-path electric-path-4" d="M250 610 L220 650 L250 675 L225 695" />
          <path className="electric-path electric-path-5" d="M760 608 L805 648 L780 678 L835 705" />
          <path className="electric-path electric-path-6" d="M100 100 L55 70 L80 40 L35 10" />
          <path className="electric-path electric-path-7" d="M900 98 L945 68 L920 38 L965 8" />
          <path className="electric-path electric-path-8" d="M115 520 L65 505 L90 475 L35 460" />
          <path className="electric-path electric-path-9" d="M885 520 L935 505 L910 475 L970 460" />
          <path className="electric-path electric-path-10" d="M500 605 L470 645 L510 670 L485 710" />
          <path className="electric-branch electric-branch-1" d="M470 60 L440 48 L455 25" />
          <path className="electric-branch electric-branch-2" d="M920 235 L950 250 L975 230" />
          <path className="electric-branch electric-branch-3" d="M220 650 L190 640 L205 670" />
          <path className="electric-branch electric-branch-4" d="M80 230 L55 245 L40 225" />
        </svg>
        <div
          onClick={(e) => e.stopPropagation()}
          className={`board-panel ${isClosing ? 'closing' : 'open'}`}
          style={{
            position: 'relative',
            zIndex: 2,
            width: 'min(520px, 90vw)',
            maxHeight: '85vh',
            background: 'linear-gradient(160deg, rgba(5, 12, 30, 0.94), rgba(8, 20, 45, 0.97))',
            backdropFilter: 'blur(28px) saturate(180%)',
            WebkitBackdropFilter: 'blur(28px) saturate(180%)',
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          <div className="board-shockwave" />
          <div className="board-glow" />
          <div className="board-surface" />

          <div className="current-rays">
            <span className="current-ray ray-1" style={{ '--mx': '-100px', '--my': '-70px' }} />
            <span className="current-ray ray-2" style={{ '--mx': '80px', '--my': '50px' }} />
            <span className="current-ray ray-3" style={{ '--mx': '90px', '--my': '-90px' }} />
            <span className="current-ray ray-4" style={{ '--mx': '50px', '--my': '100px' }} />
            <span className="current-ray ray-5" style={{ '--mx': '70px', '--my': '-40px' }} />
            <span className="current-ray ray-6" style={{ '--mx': '-60px', '--my': '-80px' }} />
            <span className="current-ray ray-7" style={{ '--mx': '-90px', '--my': '60px' }} />
            <span className="current-ray ray-8" style={{ '--mx': '60px', '--my': '-60px' }} />
            <span className="current-ray ray-9" style={{ '--mx': '-70px', '--my': '80px' }} />
            <span className="current-ray ray-10" style={{ '--mx': '40px', '--my': '90px' }} />
            <span className="current-ray ray-11" style={{ '--mx': '-50px', '--my': '70px' }} />
            <span className="current-ray ray-12" style={{ '--mx': '100px', '--my': '50px' }} />
          </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', maxHeight: '85vh' }}>
          <div className="board-header" style={{
            padding: '26px 28px 16px',
            borderBottom: '1px solid rgba(0, 234, 255, 0.06)',
            textAlign: 'center',
          }}>
            <div className="board-title" style={{
              fontFamily: 'var(--font-display)',
              fontSize: 16,
              fontWeight: 900,
              letterSpacing: '0.16em',
              color: '#e6fbff',
              marginBottom: 6,
              textShadow: '0 0 8px rgba(0, 234, 255, 0.55), 0 0 22px rgba(124, 58, 237, 0.35)',
            }}>
              SHADOWVAULT MISSION BOARD
            </div>
            <div className="board-subtitle" style={{
              fontSize: 10,
              color: 'rgba(106, 155, 184, 0.85)',
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.14em',
              fontWeight: 600,
              textShadow: '0 0 6px rgba(0, 234, 255, 0.15)',
            }}>
              SYSTEM ACCESS · ACTIVE
            </div>
          </div>

          <nav
            className="mission-nav"
            style={{
              padding: '8px 16px',
              overflowY: 'auto',
              flex: 1,
            }}
          >
            <style>{`
              .board-overlay.open {
                animation: overlayIn 450ms ease forwards;
              }
              .board-overlay.closing {
                animation: overlayOut 320ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
              }

              .board-panel.open {
                animation: panelOpen 600ms cubic-bezier(.34,1.56,.64,1) forwards;
              }
              .board-panel.closing {
                animation: panelClose 320ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
              }

              .board-panel.closing .current-ray {
                opacity: 0 !important;
                animation: none !important;
              }
              .board-panel.closing .board-glow {
                opacity: 0 !important;
                transition: opacity 150ms ease;
              }
              .board-panel.closing .board-surface {
                opacity: 0 !important;
                animation: none !important;
                transition: opacity 150ms ease;
              }

              .board-overlay.closing .mission-electric-field {
                opacity: 0;
                transform: scale(0.82) translateY(36px);
                filter: blur(8px);
                transition:
                  opacity 260ms ease,
                  transform 320ms cubic-bezier(0.4, 0, 0.2, 1),
                  filter 320ms ease;
              }

              .mission-board-shell {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: visible;
              }

              .mission-electric-field {
                position: absolute;
                inset: -90px;
                width: calc(100% + 180px);
                height: calc(100% + 180px);
                pointer-events: none;
                z-index: 0;
                overflow: visible;
              }

              .electric-path,
              .electric-branch {
                fill: none;
                stroke-linecap: butt;
                stroke-linejoin: round;
                vector-effect: non-scaling-stroke;
                pointer-events: none;
              }

              .electric-path {
                stroke: rgba(210, 250, 255, 0.95);
                stroke-width: 2.2;
                stroke-dasharray: 42 180;
                stroke-dashoffset: 260;
                filter:
                  drop-shadow(0 0 5px rgba(0, 234, 255, 0.95))
                  drop-shadow(0 0 14px rgba(0, 234, 255, 0.55))
                  drop-shadow(0 0 24px rgba(124, 58, 237, 0.35));
                animation:
                  electricCrawl 2.4s linear infinite,
                  electricFlicker 1.7s ease-in-out infinite;
              }

              .electric-glow {
                fill: none;
                stroke: rgba(0, 234, 255, 0.28);
                stroke-width: 8;
                stroke-linecap: round;
                stroke-linejoin: round;
                stroke-dasharray: 60 200;
                stroke-dashoffset: 260;
                filter:
                  blur(3px)
                  drop-shadow(0 0 18px rgba(0, 234, 255, 0.55))
                  drop-shadow(0 0 34px rgba(124, 58, 237, 0.35));
                animation:
                  electricCrawl 2.4s linear infinite,
                  electricGlowPulse 2s ease-in-out infinite;
              }

              .electric-branch {
                stroke: rgba(190, 245, 255, 0.8);
                stroke-width: 1.3;
                stroke-dasharray: 24 120;
                stroke-dashoffset: 160;
                filter:
                  drop-shadow(0 0 5px rgba(0, 234, 255, 0.75))
                  drop-shadow(0 0 12px rgba(124, 58, 237, 0.32));
                animation:
                  electricBranchCrawl 2.8s linear infinite,
                  electricFlicker 1.5s ease-in-out infinite;
              }

              .electric-path-1, .electric-glow-1 { animation-delay: 0s, 0s; animation-duration: 2.4s, 2s; }
              .electric-path-2, .electric-glow-2 { animation-delay: -0.6s, -0.4s; animation-duration: 3.1s, 2.4s; }
              .electric-path-3, .electric-glow-3 { animation-delay: -1.1s, -0.8s; animation-duration: 2.7s, 2.2s; }
              .electric-path-4, .electric-glow-4 { animation-delay: -1.7s, -1.2s; animation-duration: 3.4s, 2.8s; }
              .electric-path-5, .electric-glow-5 { animation-delay: -2.0s, -1.6s; animation-duration: 2.9s, 2.3s; }
              .electric-path-6, .electric-glow-6 { animation-delay: -0.3s, -0.2s; animation-duration: 3.6s, 3s; }
              .electric-path-7, .electric-glow-7 { animation-delay: -1.4s, -1.0s; animation-duration: 2.5s, 2.1s; }
              .electric-path-8, .electric-glow-8 { animation-delay: -0.9s, -0.6s; animation-duration: 3.2s, 2.6s; }
              .electric-path-9, .electric-glow-9 { animation-delay: -1.9s, -1.4s; animation-duration: 2.8s, 2.5s; }
              .electric-path-10, .electric-glow-10 { animation-delay: -0.5s, -0.3s; animation-duration: 3s, 2.2s; }
              .electric-branch-1 { animation-delay: -0.8s, -0.5s; animation-duration: 2.6s, 1.8s; }
              .electric-branch-2 { animation-delay: -1.5s, -1.1s; animation-duration: 3s, 2s; }
              .electric-branch-3 { animation-delay: -2.2s, -1.8s; animation-duration: 2.4s, 1.6s; }
              .electric-branch-4 { animation-delay: -0.4s, -0.2s; animation-duration: 3.3s, 2.2s; }

              .board-panel::after {
                content: "";
                position: absolute;
                inset: -1px;
                border-radius: inherit;
                pointer-events: none;
                z-index: 1;
                border: 1px solid rgba(0, 234, 255, 0.28);
                box-shadow:
                  0 0 18px rgba(0, 234, 255, 0.28),
                  0 0 42px rgba(124, 58, 237, 0.16);
                opacity: 0.85;
              }

              .board-shockwave {
                position: absolute;
                inset: -24px;
                border: 1.5px solid rgba(0, 234, 255, 0.25);
                border-radius: 20px;
                pointer-events: none;
                z-index: 0;
                opacity: 0;
                box-shadow: 0 0 40px rgba(0, 234, 255, 0.2), 0 0 90px rgba(124, 58, 237, 0.1);
                animation: shockwavePulse 1s ease-out 150ms forwards;
              }

              .board-glow {
                position: absolute;
                inset: 0;
                pointer-events: none;
                z-index: 0;
                background: radial-gradient(ellipse at 50% 25%, rgba(0, 234, 255, 0.1) 0%, rgba(124, 58, 237, 0.03) 45%, transparent 75%);
                animation: glowSurge 700ms ease-out forwards;
                opacity: 0.6;
                transition: opacity 300ms ease;
              }

              .board-surface {
                position: absolute;
                inset: 0;
                pointer-events: none;
                z-index: 0;
                border-radius: 16px;
                background:
                  linear-gradient(115deg, transparent 0%, rgba(0, 234, 255, 0.08) 48%, transparent 54%),
                  linear-gradient(245deg, transparent 0%, rgba(124, 58, 237, 0.06) 46%, transparent 52%);
                background-size: 220% 220%;
                animation: surfaceCurrent 5s linear infinite;
                transition: opacity 300ms ease;
              }

              .current-rays {
                position: absolute;
                inset: 0;
                pointer-events: none;
                z-index: 0;
                overflow: visible;
              }

              .current-ray {
                position: absolute;
                width: 100px;
                height: 2px;
                border-radius: 999px;
                pointer-events: none;
                opacity: 0;
                background: linear-gradient(90deg, transparent, rgba(220, 250, 255, 0.92), rgba(0, 234, 255, 0.7), rgba(124, 58, 237, 0.3), transparent);
                filter: drop-shadow(0 0 7px rgba(0, 234, 255, 0.75)) drop-shadow(0 0 16px rgba(124, 58, 237, 0.3));
                will-change: transform, opacity;
              }

              .ray-1 { top: 6%; left: -30px; transform: rotate(-35deg); animation: rayFlow 2.6s ease-in-out 0s infinite; }
              .ray-2 { top: 20%; left: -20px; transform: rotate(18deg); animation: rayFlow 3s ease-in-out 0.6s infinite; }
              .ray-3 { top: -20px; right: 20%; transform: rotate(55deg); animation: rayFlow 2.8s ease-in-out 0.3s infinite; }
              .ray-4 { top: -15px; left: 15%; transform: rotate(75deg); width: 85px; animation: rayFlow 3.2s ease-in-out 1s infinite; }
              .ray-5 { right: -25px; top: 12%; transform: rotate(145deg); animation: rayFlow 2.7s ease-in-out 0.8s infinite; }
              .ray-6 { right: -20px; top: 35%; transform: rotate(195deg); width: 90px; animation: rayFlow 3.1s ease-in-out 0.2s infinite; }
              .ray-7 { bottom: -20px; left: 25%; transform: rotate(250deg); animation: rayFlow 2.9s ease-in-out 1.2s infinite; }
              .ray-8 { bottom: -20px; right: 30%; transform: rotate(290deg); width: 80px; animation: rayFlow 2.5s ease-in-out 0.5s infinite; }
              .ray-9 { left: -25px; bottom: 20%; transform: rotate(310deg); animation: rayFlow 3.3s ease-in-out 0.9s infinite; }
              .ray-10 { left: -30px; bottom: 40%; transform: rotate(340deg); animation: rayFlow 2.8s ease-in-out 0.15s infinite; }
              .ray-11 { top: 40%; left: -18px; transform: rotate(8deg); width: 80px; animation: rayFlow 3s ease-in-out 0.7s infinite; }
              .ray-12 { top: 55%; right: -22px; transform: rotate(165deg); width: 90px; animation: rayFlow 2.6s ease-in-out 1.1s infinite; }

              .board-title {
                animation: systemBoot 650ms ease-out 350ms both;
              }
              .board-subtitle {
                animation: subtitleFade 550ms ease-out 550ms both;
              }
              .board-header {
                animation: headerReveal 450ms ease-out 250ms both;
              }

              .board-section-label {
                letter-spacing: 0.18em;
                text-shadow: 0 0 10px rgba(0, 234, 255, 0.12);
              }

              .board-nav-item {
                letter-spacing: 0.045em;
                text-shadow: 0 0 10px rgba(0, 234, 255, 0.18);
                isolation: isolate;
                overflow: hidden;
              }
              .board-nav-item:hover {
                color: #eaffff !important;
                text-shadow: 0 0 8px rgba(0, 234, 255, 0.65), 0 0 18px rgba(124, 58, 237, 0.35) !important;
              }

              .board-nav-icon,
              .board-nav-label,
              .board-nav-dot {
                position: relative;
                z-index: 2;
              }

              .mission-tab-current {
                position: absolute;
                pointer-events: none;
                opacity: 0;
                height: 2px;
                width: 90px;
                border-radius: 999px;
                background: linear-gradient(
                  90deg,
                  transparent,
                  rgba(235, 255, 255, 0.95),
                  rgba(0, 234, 255, 0.85),
                  rgba(124, 58, 237, 0.45),
                  transparent
                );
                filter:
                  drop-shadow(0 0 5px rgba(0, 234, 255, 0.9))
                  drop-shadow(0 0 12px rgba(124, 58, 237, 0.45));
                z-index: 0;
                will-change: transform, opacity;
              }

              .mission-tab-current.current-top {
                top: 0;
                left: -80px;
                clip-path: polygon(0 50%, 18% 45%, 30% 62%, 45% 38%, 58% 55%, 74% 42%, 100% 50%);
                animation: tabCurrentTop 3.2s ease-in-out infinite;
                animation-delay: var(--tab-delay, 0s);
              }

              .mission-tab-current.current-bottom {
                bottom: 0;
                right: -80px;
                clip-path: polygon(0 50%, 16% 58%, 31% 35%, 48% 64%, 63% 42%, 80% 57%, 100% 50%);
                animation: tabCurrentBottom 3.8s ease-in-out infinite;
                animation-delay: var(--tab-delay, 0s);
              }

              .mission-tab-current.current-diagonal {
                top: 50%;
                left: -70px;
                transform: rotate(12deg);
                clip-path: polygon(0 50%, 20% 40%, 37% 66%, 54% 34%, 72% 60%, 100% 50%);
                animation: tabCurrentDiagonal 4.4s ease-in-out infinite;
                animation-delay: var(--tab-delay, 0s);
              }

              .mission-tab-surface-current {
                position: absolute;
                inset: 0;
                pointer-events: none;
                opacity: 0.2;
                z-index: 1;
                background:
                  linear-gradient(
                    115deg,
                    transparent 0%,
                    transparent 38%,
                    rgba(0, 234, 255, 0.14) 44%,
                    rgba(235, 255, 255, 0.28) 46%,
                    rgba(124, 58, 237, 0.12) 49%,
                    transparent 55%,
                    transparent 100%
                  );
                background-size: 220% 220%;
                animation: tabSurfaceCurrent 4.8s linear infinite;
                animation-delay: var(--tab-delay, 0s);
                transition: opacity 0.3s ease;
              }

              .board-nav-item.active .mission-tab-current {
                filter:
                  drop-shadow(0 0 7px rgba(0, 234, 255, 1))
                  drop-shadow(0 0 16px rgba(124, 58, 237, 0.65));
                animation-duration: 2.4s;
              }

              .board-nav-item.active .mission-tab-surface-current {
                opacity: 0.3;
              }

              .board-nav-item:hover .mission-tab-current {
                filter:
                  drop-shadow(0 0 10px rgba(0, 234, 255, 1))
                  drop-shadow(0 0 20px rgba(124, 58, 237, 0.8))
                  brightness(1.4);
              }

              .board-nav-item:hover .mission-tab-surface-current {
                opacity: 0.38;
              }

              .board-nav-item::before {
                content: "";
                position: absolute;
                top: 12%;
                right: 18px;
                width: 48px;
                height: 2px;
                pointer-events: none;
                opacity: 0;
                background: linear-gradient(
                  90deg,
                  transparent,
                  rgba(235, 255, 255, 0.85),
                  rgba(0, 234, 255, 0.55),
                  transparent
                );
                clip-path: polygon(0 50%, 22% 42%, 36% 70%, 55% 38%, 100% 50%);
                filter: drop-shadow(0 0 8px rgba(0, 234, 255, 0.75));
                animation: tabMiniSpark 5.4s ease-in-out infinite;
                animation-delay: var(--tab-delay, 0s);
                z-index: 0;
              }

              .mission-nav::-webkit-scrollbar { width: 6px; }
              .mission-nav::-webkit-scrollbar-track { background: rgba(5, 8, 22, 0.35); border-radius: 999px; }
              .mission-nav::-webkit-scrollbar-thumb {
                background: linear-gradient(180deg, rgba(0, 234, 255, 0.2), rgba(124, 58, 237, 0.15));
                border-radius: 999px;
              }
              .mission-nav::-webkit-scrollbar-thumb:hover { background: rgba(0, 234, 255, 0.4); }
              .mission-nav { scrollbar-width: thin; scrollbar-color: rgba(0, 234, 255, 0.2) rgba(5, 8, 22, 0.35); }

              @keyframes overlayIn {
                0% { opacity: 0; backdrop-filter: blur(0px); -webkit-backdrop-filter: blur(0px); }
                100% { opacity: 1; backdrop-filter: blur(14px) saturate(180%); -webkit-backdrop-filter: blur(14px) saturate(180%); }
              }
              @keyframes overlayOut {
                0% { opacity: 1; backdrop-filter: blur(14px) saturate(180%); -webkit-backdrop-filter: blur(14px) saturate(180%); }
                100% { opacity: 0; backdrop-filter: blur(0); -webkit-backdrop-filter: blur(0); }
              }

              @keyframes panelOpen {
                0% { opacity: 0; transform: scale(0.88) translateY(18px); filter: blur(12px); }
                60% { opacity: 1; transform: scale(1.015) translateY(-2px); filter: blur(0); }
                100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
              }
              @keyframes panelClose {
                0% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); box-shadow: 0 0 60px rgba(0, 234, 255, 0.06); }
                100% { opacity: 0; transform: scale(0.72) translateY(42px); filter: blur(10px); box-shadow: 0 0 0 rgba(0, 234, 255, 0); }
              }

              @keyframes shockwavePulse {
                0% { opacity: 0.8; transform: scale(0.94); filter: blur(0px); }
                45% { opacity: 0.4; transform: scale(1.05); filter: blur(3px); }
                100% { opacity: 0; transform: scale(1.15); filter: blur(8px); }
              }

              @keyframes glowSurge {
                0% { opacity: 0; transform: scale(0.5); }
                30% { opacity: 1; transform: scale(1.12); }
                60% { opacity: 0.65; transform: scale(1); }
                100% { opacity: 0.6; transform: scale(1); }
              }

              @keyframes surfaceCurrent {
                0% { background-position: 0% 50%, 100% 50%; opacity: 0.2; }
                50% { opacity: 0.4; }
                100% { background-position: 100% 50%, 0% 50%; opacity: 0.2; }
              }

              @keyframes rayFlow {
                0% { opacity: 0; transform: translate3d(0, 0, 0) scaleX(0.15); }
                12% { opacity: 0.85; }
                30% { opacity: 0.35; }
                100% { opacity: 0; transform: translate3d(var(--mx), var(--my), 0) scaleX(1); }
              }

              @keyframes systemBoot {
                0% { opacity: 0; letter-spacing: 0.32em; filter: blur(3px); }
                45% { opacity: 1; filter: blur(0); }
                70% { opacity: 0.82; }
                100% { opacity: 1; letter-spacing: 0.16em; }
              }

              @keyframes subtitleFade {
                0% { opacity: 0; letter-spacing: 0.22em; }
                100% { opacity: 1; letter-spacing: 0.14em; }
              }

              @keyframes headerReveal {
                from { opacity: 0; }
                to { opacity: 1; }
              }

              @keyframes tabCurrentTop {
                0% { opacity: 0; transform: translateX(0) scaleX(0.4); }
                14% { opacity: 0.85; }
                45% { opacity: 0.45; }
                100% { opacity: 0; transform: translateX(260px) scaleX(1); }
              }

              @keyframes tabCurrentBottom {
                0% { opacity: 0; transform: translateX(0) scaleX(0.35); }
                18% { opacity: 0.7; }
                55% { opacity: 0.4; }
                100% { opacity: 0; transform: translateX(-260px) scaleX(1); }
              }

              @keyframes tabCurrentDiagonal {
                0% { opacity: 0; transform: translate(-40px, 18px) rotate(12deg) scaleX(0.3); }
                20% { opacity: 0.75; }
                55% { opacity: 0.35; }
                100% { opacity: 0; transform: translate(260px, -24px) rotate(12deg) scaleX(1); }
              }

              @keyframes tabSurfaceCurrent {
                0% { background-position: 120% 50%; opacity: 0.08; }
                35% { opacity: 0.28; }
                70% { opacity: 0.14; }
                100% { background-position: -120% 50%; opacity: 0.08; }
              }

               @keyframes tabMiniSpark {
                0%, 72%, 100% { opacity: 0; transform: translateX(0) rotate(-8deg) scaleX(0.4); }
                78% { opacity: 0.8; }
                84% { opacity: 0.25; }
                90% { opacity: 0.65; transform: translateX(-18px) rotate(-8deg) scaleX(1); }
              }

              @keyframes electricCrawl {
                from { stroke-dashoffset: 260; }
                to { stroke-dashoffset: -260; }
              }

              @keyframes electricFlicker {
                0%, 100% { opacity: 0.18; }
                12% { opacity: 0.85; }
                28% { opacity: 0.32; }
                46% { opacity: 1; }
                70% { opacity: 0.26; }
              }

              @keyframes electricGlowPulse {
                0%, 100% { opacity: 0.08; }
                35% { opacity: 0.42; }
                58% { opacity: 0.22; }
              }

              @keyframes electricBranchCrawl {
                from { stroke-dashoffset: 160; }
                to { stroke-dashoffset: -160; }
              }

              @media (prefers-reduced-motion: reduce) {
                .board-overlay { animation: none !important; }
                .board-overlay.closing { animation: none !important; }
                .board-panel.open { animation: none !important; opacity: 1 !important; transform: none !important; filter: none !important; }
                .board-panel.closing { animation: none !important; opacity: 1 !important; transform: none !important; filter: none !important; }
                .board-shockwave { animation: none !important; opacity: 0 !important; display: none !important; }
                .board-glow { animation: none !important; opacity: 0.4 !important; }
                .board-surface { animation: none !important; opacity: 0.15 !important; }
                .current-ray { animation: none !important; opacity: 0 !important; display: none !important; }
                .board-title { animation: none !important; opacity: 1 !important; letter-spacing: 0.16em !important; filter: none !important; }
                .board-subtitle { animation: none !important; opacity: 1 !important; }
                .board-header { animation: none !important; opacity: 1 !important; }
                .mission-tab-current,
                .mission-tab-surface-current,
                .board-nav-item::before {
                  animation: none !important;
                  opacity: 0 !important;
                }
                .mission-electric-field,
                .electric-path,
                .electric-glow,
                .electric-branch {
                  animation: none !important;
                  opacity: 0 !important;
                }
              }
            `}</style>

            {navItems.map((item, i) => {
              if (item.section) {
                return (
                  <div key={i} className="board-section-label" style={{
                    fontSize: 9,
                    color: 'var(--text-muted)',
                    fontWeight: 700,
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '0.18em',
                    padding: '14px 12px 4px',
                    textShadow: '0 0 10px rgba(0, 234, 255, 0.12)',
                  }}>
                    {item.section}
                  </div>
                );
              }
              const isActive = location.pathname === item.path ||
                (item.path === '/dashboard' && location.pathname === '/');
              return (
                <div
                  key={item.path}
                  className={`board-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleNav(item.path)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', cursor: 'pointer',
                    borderRadius: 10,
                    margin: '2px 0',
                    fontSize: 13, fontWeight: 500,
                    letterSpacing: '0.045em',
                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(0, 234, 255, 0.08), rgba(0, 234, 255, 0.02))'
                      : 'transparent',
                    border: isActive
                      ? '1px solid rgba(0, 234, 255, 0.12)'
                      : '1px solid transparent',
                    boxShadow: isActive
                      ? '0 0 20px rgba(0, 234, 255, 0.04), inset 0 1px 0 rgba(0, 234, 255, 0.06)'
                      : 'none',
                    transition: 'all 0.25s ease',
                    position: 'relative',
                    textShadow: '0 0 10px rgba(0, 234, 255, 0.18)',
                    '--tab-delay': `${i * 0.22}s`,
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(0, 234, 255, 0.03)';
                      e.currentTarget.style.color = '#eaffff';
                      e.currentTarget.style.borderColor = 'rgba(0, 234, 255, 0.06)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                      e.currentTarget.style.textShadow = '0 0 8px rgba(0, 234, 255, 0.65), 0 0 18px rgba(124, 58, 237, 0.35)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.textShadow = '0 0 10px rgba(0, 234, 255, 0.18)';
                    }
                  }}
                >
                  <span className="mission-tab-current current-top" />
                  <span className="mission-tab-current current-bottom" />
                  <span className="mission-tab-current current-diagonal" />
                  <span className="mission-tab-surface-current" />
                  <span className="board-nav-icon" style={{
                    fontSize: 13, width: 22, textAlign: 'center',
                    opacity: isActive ? 1 : 0.5,
                    fontFamily: 'var(--font-display)',
                  }}>
                    {item.icon}
                  </span>
                  <span className="board-nav-label" style={{ flex: 1 }}>{item.label}</span>
                  {isActive && (
                    <div className="board-nav-dot" style={{
                      width: 4, height: 4, borderRadius: '50%',
                      background: 'var(--accent)',
                      boxShadow: '0 0 8px rgba(0, 234, 255, 0.5)',
                    }} />
                  )}
                </div>
              );
            })}
          </nav>

          <div className="board-footer" style={{
            padding: '14px 20px',
            borderTop: '1px solid rgba(0, 234, 255, 0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 4,
                background: 'linear-gradient(135deg, #0099cc, #00eaff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, color: '#050816', flexShrink: 0,
                fontFamily: 'var(--font-display)',
                boxShadow: '0 0 8px rgba(0, 234, 255, 0.15)',
              }}>
                {user ? initials(user.name) : '?'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: 12, fontWeight: 600,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  color: 'var(--text-primary)',
                }}>
                  {user?.name || 'Hunter'}
                </div>
                <div style={{
                  fontSize: 9, color: 'var(--text-tertiary)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  fontFamily: 'var(--font-display)',
                }}>
                  {user?.email || ''}
                </div>
              </div>
            </div>
            <button
              onClick={() => { handleClose(); setTimeout(() => { logout(); }, 320); }}
              style={{
                padding: '6px 12px', borderRadius: 6,
                background: 'transparent', border: '1px solid rgba(239,68,68,0.15)',
                color: 'var(--danger)', cursor: 'pointer',
                fontFamily: 'var(--font)', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.06em',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.15)'; }}
            >
              DISCONNECT
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
