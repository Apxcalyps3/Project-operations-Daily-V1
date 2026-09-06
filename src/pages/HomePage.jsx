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
    </div>
  );
};

export default HomePage;