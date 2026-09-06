import React from 'react';

const CalendarTable = ({ title }) => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const now = new Date();
  const monthName = now.toLocaleString('default', { month: 'long' }).toUpperCase();
  const year = now.getFullYear();

  return (
    <div
      style={{
        border: '1.5px solid #4ade80',
        borderRadius: '6px',
        padding: '12px',
        flex: 1,
        minWidth: '280px',
        maxWidth: '380px'
      }}
    >
      <div style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '4px' }}>
        {title}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '12px', padding: '0 8px' }}>
        <span>{monthName}</span>
        <span>{year}</span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          borderTop: '1px solid #4ade80',
          borderLeft: '1px solid #4ade80'
        }}
      >
        {days.map((day) => {
          const isCurrent = day === now.getDate();
          return (
            <div
              key={day}
              style={{
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRight: '1px solid #4ade80',
                borderBottom: '1px solid #4ade80',
                fontSize: '0.95rem',
                fontWeight: isCurrent ? 'bold' : 'normal',
                backgroundColor: isCurrent ? 'rgba(74, 222, 128, 0.25)' : 'transparent',
                color: '#4ade80'
              }}
            >
              {day}
            </div>
          );
        })}
        {/* Fill remaining empty cells of the 7-column row */}
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={`empty-${idx}`}
            style={{
              height: '38px',
              borderRight: '1px solid #4ade80',
              borderBottom: '1px solid #4ade80'
            }}
          />
        ))}
      </div>
    </div>
  );
};

const ChallengeCalendar = () => {
  return (
    <div className="retro-window" style={{ maxWidth: '880px' }}>
      <div className="retro-window-header">
        <div className="window-dots">
          <div className="window-dot" />
          <div className="window-dot" />
          <div className="window-dot" />
        </div>
        <div className="window-title">CHALLENGE HISTORY</div>
      </div>

      <div
        className="retro-window-body"
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '24px',
          padding: '30px 20px'
        }}
      >
        <CalendarTable title="DAILY LP" />
        <CalendarTable title="DAILY IP" />
      </div>
    </div>
  );
};

export default ChallengeCalendar;
