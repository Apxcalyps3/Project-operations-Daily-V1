/**
 * Solver Selection Page
 * Allows user to choose between Linear Programming (LP) and Integer Programming (IP) solvers.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Window from '../components/layout/Window';
import Navbar from '../components/layout/Navbar';

import iconLP from '../assets/icons/icon-lpsolver.png';
import iconIP from '../assets/icons/icon-ipsolver.png';

/* ============================================================
   Solver Selection Component
   ============================================================ */
const SolverPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Navbar backTo="/" label="RETURN TO MAIN SYSTEM" />

      <div className="solver-grid">
        <Window
          iconSrc={iconLP}
          onClick={() => navigate('/solver/lp')}
          altText="LP Solver"
        />
        <Window
          iconSrc={iconIP}
          onClick={() => navigate('/solver/ip')}
          altText="IP Solver"
        />
      </div>
    </div>
  );
};

export default SolverPage;