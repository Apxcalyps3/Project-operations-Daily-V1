import React from 'react';
import { useNavigate } from 'react-router-dom';
import Window from '../components/layout/Window';

import iconSolver from '../assets/icons/icon-solver.png';
import iconChallenge from '../assets/icons/icon-challenge.png';
import iconHistory from '../assets/icons/icon-history.png';
import iconSettings from '../assets/icons/icon-settings.png';

/**
 * HomePage — Page 1 of PDF
 * 4 icon cards in a single horizontal row:
 * [SIMPLEX SOLVER] [DAILY CHALLENGE] [HISTORY] [SETTINGS]
 */
const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-grid">
      <Window
        iconSrc={iconSolver}
        onClick={() => navigate('/solver')}
        altText="Simplex Solver"
      />
      <Window
        iconSrc={iconChallenge}
        onClick={() => navigate('/challenge')}
        altText="Daily Challenge"
      />
      <Window
        iconSrc={iconHistory}
        onClick={() => navigate('/history')}
        altText="History"
      />
      <Window
        iconSrc={iconSettings}
        onClick={() => navigate('/settings')}
        altText="Settings"
      />
      {/* Temporary test link for debugging */}
      <div style={{ 
        position: 'fixed', 
        bottom: '10px', 
        right: '10px',
        zIndex: 1000 
      }}>
        <button
          onClick={() => navigate('/test')}
          style={{
            padding: '8px 16px',
            fontSize: '12px',
            backgroundColor: '#4ade80',
            color: '#000',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'monospace'
          }}
        >
          🔧 Run Tests
        </button>
      </div>
    </div>
  );
};

export default HomePage;