import React from 'react';
import Navbar from '../components/layout/Navbar';
import SolverForm from '../components/solver/SolverForm';

const IPSolverPage = () => {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Navbar backTo="/solver" label="RETURN TO SOLVER SELECTION" />

      <div className="retro-window">
        {/* Header Bar matching Page 4 Screenshot */}
        <div className="retro-window-header">
          <div className="window-dots">
            <div className="window-dot" />
            <div className="window-dot" />
            <div className="window-dot" />
          </div>
          <div className="window-title">IP SOLVER</div>
        </div>

        {/* Form Body matching Page 4 */}
        <div className="retro-window-body">
          <SolverForm solverType="IP" defaultMethod="CUTTING PLANE" />
        </div>
      </div>
    </div>
  );
};

export default IPSolverPage;
