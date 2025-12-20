import React, { createContext, useContext, useEffect, useState } from 'react';
import { get } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = window.localStorage.getItem('travelnow_token');
    if (!token) {
      setLoading(false);
      return;
    }

    get('/user/me')
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        window.localStorage.removeItem('travelnow_token');
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = (token, userData) => {
    window.localStorage.setItem('travelnow_token', token);
    if (userData) {
      setUser(userData);
    } else {
      get('/user/me').then((data) => setUser(data.user));
    }
  };

  const logout = () => {
    window.localStorage.removeItem('travelnow_token');
    setUser(null);
  };

  const value = { user, setUser, login, logout, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
