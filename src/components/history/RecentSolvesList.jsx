import React, { useState, useEffect } from 'react';
import { getSolveHistory } from '../../services/api';

const RecentSolvesList = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(getSolveHistory());
  }, []);

  return (
    <div className="retro-window" style={{ maxWidth: '880px' }}>
      <div className="retro-window-header">
        <div className="window-dots">
          <div className="window-dot" />
          <div className="window-dot" />
          <div className="window-dot" />
        </div>
        <div className="window-title">SOLVER HISTORY</div>
      </div>

      <div className="retro-window-body" style={{ minHeight: '380px' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {history.map((item) => (
            <li
              key={item.id}
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                letterSpacing: '0.12em',
                color: '#4ade80',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>&bull;</span>
              <span>{item.description}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RecentSolvesList;
