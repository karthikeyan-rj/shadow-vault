import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import MissionBoardMenu from './MissionBoardMenu';
import Topbar from './Topbar';
import ChatFab from './ChatFab';
import AnimatedStormBackground from '../effects/AnimatedStormBackground';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { fmt } from '../../utils/helpers';

const pageTitles = {
  '/': 'Command Center',
  '/dashboard': 'Command Center',
  '/income': 'Power Inflow',
  '/expenses': 'Shadow Outflow',
  '/budget': 'Control Limits',
  '/goals': 'Vault Quests',
  '/bills': 'Due Missions',
  '/tasks': 'Tasks',
  '/calendar': 'Timeline',
  '/reports': 'Intelligence Reports',
  '/achievements': 'Rank Archive',
  '/transfer': 'Vault Transfer',
  '/profile': 'Profile',
};

export default function AppLayout({ children }) {
  const [boardOpen, setBoardOpen] = useState(false);
  const [streak, setStreak] = useState(0);
  const [balance, setBalance] = useState('₹0');
  const { user } = useAuth();
  const location = useLocation();

  const refreshData = useCallback(async () => {
    try {
      const [summary, gs] = await Promise.all([
        api.get('/expenses/summary'),
        api.get('/gamification/stats').catch(() => null),
      ]);
      setBalance(fmt(summary.allTimeBalance || 0));
      if (gs) setStreak(gs.currentStreak);
    } catch (e) {}
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData, location]);

  useEffect(() => {
    api.post('/gamification/activity', {}).catch(() => {});
  }, []);

  const title = pageTitles[location.pathname] || 'Command Center';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AnimatedStormBackground />
      <MissionBoardMenu
        open={boardOpen}
        onClose={() => setBoardOpen(false)}
      />
      <div style={{
        width: '100%',
        minHeight: '100vh',
        position: 'relative',
        zIndex: 1,
      }}>
        <Topbar
          title={title}
          onMenuToggle={() => setBoardOpen(true)}
          balance={balance}
        />
        <main style={{ padding: 24 }} className="page-enter">
          {children}
        </main>
      </div>
      <ChatFab user={user} />
    </div>
  );
}
