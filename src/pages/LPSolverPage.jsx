/**
 * Linear Programming (LP) Solver Page
 * Displays the retro window container for the LP solver form and tableau results.
 */

import React from 'react';
import Navbar from '../components/layout/Navbar';
import SolverForm from '../components/solver/SolverForm';

/* ============================================================
   LP Solver Page Component
   ============================================================ */
const LPSolverPage = () => {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Navbar backTo="/solver" label="RETURN TO SOLVER SELECTION" />

      <div className="retro-window">
        <div className="retro-window-header">
          <div className="window-dots">
            <div className="window-dot" />
            <div className="window-dot" />
            <div className="window-dot" />
          </div>
          <div className="window-title">LP SOLVER</div>
        </div>

        <div className="retro-window-body">
          <SolverForm solverType="LP" defaultMethod="BIG M" />
        </div>
      </div>
    </div>
  );
};

export default LPSolverPage;