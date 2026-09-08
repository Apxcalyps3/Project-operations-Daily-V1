/**
 * Integer Programming (IP) Solver Page
 * Displays the retro window container for the IP solver form and tableau results.
 */

import React from 'react';
import Navbar from '../components/layout/Navbar';
import SolverForm from '../components/solver/SolverForm';

/* ============================================================
   IP Solver Page Component
   ============================================================ */
const IPSolverPage = () => {
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
          <div className="window-title">IP SOLVER</div>
        </div>

        <div className="retro-window-body">
          <SolverForm solverType="IP" defaultMethod="CUTTING PLANE" />
        </div>
      </div>
    </div>
  );
};

export default IPSolverPage;
