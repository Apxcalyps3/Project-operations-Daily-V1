import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();
const ACCOUNTS_KEY = 'op_accounts';
const readAccounts = () => { try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]'); } catch { return []; } };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('op_user') || 'null'); } catch { return null; } });
  const setActiveUser = (username) => {
    const userData = { username, loggedInAt: new Date().toISOString() };
    localStorage.setItem('op_user', JSON.stringify(userData));
    setUser(userData);
  };
  const signup = (username, password) => {
    const normalized = username.trim();
    const accounts = readAccounts();
    if (accounts.some((account) => account.username.toLowerCase() === normalized.toLowerCase())) return { ok: false, message: 'THIS CALLSIGN IS ALREADY REGISTERED.' };
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, { username: normalized, password }]));
    setActiveUser(normalized);
    return { ok: true };
  };
  const login = (username, password) => {
    const account = readAccounts().find((item) => item.username.toLowerCase() === username.trim().toLowerCase() && item.password === password);
    if (!account) return { ok: false, message: 'INVALID CALLSIGN OR ACCESS CODE.' };
    setActiveUser(account.username);
    return { ok: true };
  };
  const logout = () => { setUser(null); localStorage.removeItem('op_user'); };
  return <AuthContext.Provider value={{ user, signup, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
