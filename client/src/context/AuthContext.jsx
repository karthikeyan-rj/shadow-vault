import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setToken, getStoredUser, setStoredUser } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored && localStorage.getItem('ft_token')) {
      setUser(stored);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    setToken(data.token);
    setStoredUser({ _id: data._id, name: data.name, email: data.email });
    setUser({ _id: data._id, name: data.name, email: data.email });
  };

  const register = async (name, email, password) => {
    const data = await api.post('/auth/register', { name, email, password });
    setToken(data.token);
    setStoredUser({ _id: data._id, name: data.name, email: data.email });
    setUser({ _id: data._id, name: data.name, email: data.email });
  };

  const logout = () => {
    setToken(null);
    setStoredUser(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
