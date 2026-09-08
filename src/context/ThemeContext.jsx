/**
 * Theme Context
 * Manages active theme state (dark/light/matrix) and persists to localStorage.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

/* ============================================================
   Theme Provider
   ============================================================ */
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('op_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('op_theme', theme);
  }, [theme]);

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/* ============================================================
   Hook
   ============================================================ */
export const useTheme = () => useContext(ThemeContext);

