/**
 * Operations Daily — Application Shell & Router
 */

import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';

import HomePage from './pages/HomePage';
import SolverPage from './pages/SolverPage';
import LPSolverPage from './pages/LPSolverPage';
import IPSolverPage from './pages/IPSolverPage';
import DailyChallengePage from './pages/DailyChallengePage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

import logoMain from './assets/logo-main.png';
import RetroGrid from './components/layout/RetroGrid';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

/* ============================================================
   Application Shell Layout
   ============================================================ */
function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <>
      {/* 3D Perspective Grid Background */}
      <RetroGrid />

      {/* Main Page Container */}
      <div className="page-shell">
        <header className="app-header" style={{ flexDirection: 'column' }}>
          <Link to="/" className="logo-link" title="Return to Home">
            <img
              src={logoMain}
              alt="Operations Daily"
              className="logo-image"
            />
          </Link>
          {isHomePage && (
            <>
              <p
                style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  color: 'rgba(74, 222, 128, 0.85)',
                  fontSize: '0.95rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  marginTop: '8px',
                  textAlign: 'center',
                  textShadow: '0 0 8px rgba(74, 222, 128, 0.4)',
                }}
              >
                A website for learning operations research
              </p>
              <span
                style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  color: 'rgba(74, 222, 128, 0.6)',
                  fontSize: '0.8rem',
                  letterSpacing: '0.18em',
                  marginTop: '4px',
                  textAlign: 'center',
                }}
              >
                v1.0.3
              </span>
            </>
          )}
        </header>

        {/* Application Navigation Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/solver" element={<SolverPage />} />
          <Route path="/solver/lp" element={<LPSolverPage />} />
          <Route path="/solver/ip" element={<IPSolverPage />} />
          <Route path="/challenge" element={<DailyChallengePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

/* ============================================================
   Root Component with Context Providers
   ============================================================ */
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;