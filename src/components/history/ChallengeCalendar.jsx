import React from 'react';
import { CalendarSection } from '../../pages/HistoryPage';
import { useAuth } from '../../context/AuthContext';

const ChallengeCalendar = () => {
  const { user } = useAuth();

  return (
    <div className="retro-window" style={{ maxWidth: '920px' }}>
      <div className="retro-window-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="window-dots">
            <div className="window-dot" />
            <div className="window-dot" />
            <div className="window-dot" />
          </div>
          <div className="window-title">CHALLENGE HISTORY</div>
        </div>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', opacity: 0.8, color: '#4ade80' }}>
          {user ? `ACCOUNT: ${user.username || user.email}` : 'ACCOUNT: GUEST'}
        </div>
      </div>

      <div
        className="retro-window-body"
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '24px',
          padding: '28px 20px',
          maxHeight: 'none',
        }}
      >
        <CalendarSection title="DAILY LP" type="LP" />
        <CalendarSection title="DAILY IP" type="IP" />
      </div>
    </div>
  );
};

export default ChallengeCalendar;
