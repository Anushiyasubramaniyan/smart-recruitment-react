import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('sra_user');
    const token = localStorage.getItem('sra_token');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('sra_user');
        localStorage.removeItem('sra_token');
      }
    }
    setLoading(false);
  }, []);

  function persistSession(loggedInUser, token) {
    localStorage.setItem('sra_user', JSON.stringify(loggedInUser));
    localStorage.setItem('sra_token', token);
    setUser(loggedInUser);
  }

  async function login({ email, password, role }) {
    const res = await authApi.login({ email, password, role });
    persistSession(res.user, res.token);
    return res.user;
  }

  async function register({ name, email, password, role }) {
    const res = await authApi.register({ name, email, password, role });
    persistSession(res.user, res.token);
    return res.user;
  }

  function logout() {
    localStorage.removeItem('sra_user');
    localStorage.removeItem('sra_token');
    setUser(null);
  }

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
