/**
 * RetroGrid Component
 * Recreates the 3D perspective neon wireframe grid floor against a dark background.
 * Stays permanently fixed to the viewport across page navigations.
 */

import React, { useMemo } from 'react';

/* ============================================================
   RetroGrid Canvas Component
   ============================================================ */
const RetroGrid = () => {
  const HORIZON_Y = 520;
  const BOTTOM_Y = 1080;
  const CENTER_X = 960;
  const WIDTH = 1920;
  const VANISH_Y = 300;

  // Transverse (horizontal) lines with geometric perspective foreshortening
  const horizontalLines = useMemo(() => {
    const lines = [];
    const dist = BOTTOM_Y - VANISH_Y;

    for (let k = 0; k <= 25; k++) {
      const z = 1 + k * 0.22;
      const y = VANISH_Y + dist / z;
      if (y >= HORIZON_Y && y <= BOTTOM_Y) {
        const t = (y - HORIZON_Y) / (BOTTOM_Y - HORIZON_Y);
        const strokeWidth = (0.9 + t * 1.3).toFixed(2);
        const opacity = (0.5 + t * 0.45).toFixed(2);
        lines.push({
          y: Math.round(y * 10) / 10,
          strokeWidth,
          opacity,
        });
      }
    }
    return lines;
  }, []);

  // Longitudinal (perspective depth) lines crossing the horizon evenly
  const longitudinalLines = useMemo(() => {
    const lines = [];
    const stepTop = 32;
    const stepBottom = 240;
    const maxM = 36;

    for (let m = -maxM; m <= maxM; m++) {
      const x1 = CENTER_X + m * stepTop;
      const x2 = CENTER_X + m * stepBottom;
      const absM = Math.abs(m);

      lines.push({
        x1: Math.round(x1 * 10) / 10,
        y1: HORIZON_Y,
        x2: Math.round(x2 * 10) / 10,
        y2: BOTTOM_Y,
        m,
        strokeWidth: absM <= 6 ? '1.7' : '1.25',
        opacity: absM <= 10 ? '0.85' : '0.65',
      });
    }
    return lines;
  }, []);

  return (
    <div className="retro-grid-container" aria-hidden="true">
      <svg
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
        className="retro-grid-svg"
      >
        <defs>
          {/* Phosphor bloom for neon wireframe */}
          <filter id="retro-neon-glow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Horizon laser glow filter */}
          <filter id="horizon-laser-glow" x="-5%" y="-100%" width="110%" height="300%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Linear ambient glow directly below the horizon edge */}
          <linearGradient id="horizon-linear-glow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.3" />
            <stop offset="25%" stopColor="#22c55e" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </linearGradient>

          {/* Floor clipping mask so perspective lines never bleed into the sky */}
          <clipPath id="retro-floor-clip">
            <rect x="0" y={HORIZON_Y} width={WIDTH} height={BOTTOM_Y - HORIZON_Y + 10} />
          </clipPath>
        </defs>

        {/* Dark sky background */}
        <rect x="0" y="0" width={WIDTH} height={BOTTOM_Y} fill="#000000" />

        {/* Horizon glow */}
        <rect
          x="0"
          y={HORIZON_Y}
          width={WIDTH}
          height="120"
          fill="url(#horizon-linear-glow)"
        />

        {/* 3D Perspective Wireframe Floor */}
        <g clipPath="url(#retro-floor-clip)" filter="url(#retro-neon-glow)">
          {longitudinalLines.map((line) => (
            <line
              key={`long-${line.m}`}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="#34d399"
              strokeWidth={line.strokeWidth}
              opacity={line.opacity}
            />
          ))}

          {horizontalLines.map((line, idx) => (
            <line
              key={`lat-${idx}`}
              x1="0"
              y1={line.y}
              x2={WIDTH}
              y2={line.y}
              stroke="#4ade80"
              strokeWidth={line.strokeWidth}
              opacity={line.opacity}
            />
          ))}
        </g>

        {/* Horizon Boundary Line */}
        <line
          x1="0"
          y1={HORIZON_Y}
          x2={WIDTH}
          y2={HORIZON_Y}
          stroke="#4ade80"
          strokeWidth="2.5"
          filter="url(#horizon-laser-glow)"
          opacity="0.98"
        />
      </svg>
    </div>
  );
};

export default React.memo(RetroGrid);
