import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';

import HomePage from './pages/HomePage';
import SolverPage from './pages/SolverPage';
import LPSolverPage from './pages/LPSolverPage';
import IPSolverPage from './pages/IPSolverPage';
import DailyChallengePage from './pages/DailyChallengePage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

import logoMain from './assets/logo-main.png';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          {/* Bright Retro Perspective Grid — CSS-drawn, covers bottom 75vh */}
          <div className="perspective-grid" />

          {/* Centered Application Shell */}
          <div className="page-shell">
            {/* Header: Logo as clickable Home link */}
            <header className="app-header">
              <Link to="/" className="logo-link" title="Return to Home">
                <img
                  src={logoMain}
                  alt="Operations Daily"
                  className="logo-image"
                />
              </Link>
            </header>

            {/* Routes — following Page 18 Flowchart */}
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
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;