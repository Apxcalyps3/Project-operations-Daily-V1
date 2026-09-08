/**
 * Countdown Timer Component
 * Real-time digital clock counting down to the next local midnight challenge refresh.
 */

import React, { useEffect, useState } from 'react';

/* ============================================================
   Helper Functions
   ============================================================ */
const secondsUntilNextLocalMidnight = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.max(0, Math.ceil((midnight.getTime() - now.getTime()) / 1000));
};

/* ============================================================
   Countdown Timer Component
   ============================================================ */
const CountdownTimer = () => {
  const [secondsLeft, setSecondsLeft] = useState(secondsUntilNextLocalMidnight);

  useEffect(() => {
    const timer = window.setInterval(() => setSecondsLeft(secondsUntilNextLocalMidnight()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const hours = String(Math.floor(secondsLeft / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div
      aria-label={`Next challenge in ${hours} hours ${minutes} minutes`}
      style={{
        fontFamily: "'Orbitron', monospace",
        fontSize: '1.25rem',
        fontWeight: 'bold',
        letterSpacing: '0.15em',
        color: '#4ade80',
        textShadow: '0 0 10px rgba(74, 222, 128, 0.7)'
      }}
    >
      {hours}:{minutes}:{seconds}
    </div>
  );
};

export default CountdownTimer;
