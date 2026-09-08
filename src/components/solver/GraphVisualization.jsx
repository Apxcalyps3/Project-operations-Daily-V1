/**
 * Graph Visualization Component
 * Interactive SVG 2D plane rendering feasible regions, color-coded constraint boundary lines, and optimal solution vertices.
 */

import React, { useState, useRef } from 'react';

/* ============================================================
   Curated High-Contrast Constraint Line Color Palette
   ============================================================ */
const CONSTRAINT_PALETTE = [
  { stroke: '#f59e0b', name: 'Amber' },
  { stroke: '#06b6d4', name: 'Cyan' },
  { stroke: '#ec4899', name: 'Magenta' },
  { stroke: '#a855f7', name: 'Violet' },
  { stroke: '#f97316', name: 'Orange' },
  { stroke: '#3b82f6', name: 'Blue' },
  { stroke: '#10b981', name: 'Emerald' },
  { stroke: '#eab308', name: 'Yellow' },
];

/**
 * Safely parses integer, float, or rational fraction strings (e.g. "14/5")
 */
const parseCoordinate = (val) => {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
  const str = String(val).trim();
  if (str.includes('/')) {
    const [num, den] = str.split('/').map(Number);
    if (den && Number.isFinite(num) && Number.isFinite(den)) {
      return num / den;
    }
  }
  const n = parseFloat(str);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Computes an optimal label anchor point along the visible first-quadrant constraint line
 */
const getLabelPoint = (a1, a2, rhs, max) => {
  if (Math.abs(a2) < 0.0001) {
    if (Math.abs(a1) < 0.0001) return null;
    const x = rhs / a1;
    if (x >= 0 && x <= max) return { x, y: max * 0.75 };
    return null;
  }
  if (Math.abs(a1) < 0.0001) {
    const y = rhs / a2;
    if (y >= 0 && y <= max) return { x: max * 0.75, y };
    return null;
  }
  const xInt = rhs / a1;
  const yInt = rhs / a2;
  if (xInt > 0 && yInt > 0 && xInt <= max * 1.5 && yInt <= max * 1.5) {
    return { x: xInt * 0.5, y: yInt * 0.5 };
  }
  const testX = max * 0.35;
  const testY = (rhs - a1 * testX) / a2;
  if (testY >= 0 && testY <= max) {
    return { x: testX, y: testY };
  }
  return null;
};

/* ============================================================
   Graph Visualization Component
   ============================================================ */
const GraphVisualization = ({ constraints, numVars, optimalPoint }) => {
  const [view, setView] = useState({ x: -10, y: -10, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  if (numVars !== 2 || !constraints || constraints.length === 0) return null;

  const width = 600;
  const height = 400;
  const padding = 40;

  // Dynamic axis scaling based on constraints and optimal solution
  let maxNeeded = 20;
  constraints.forEach((c) => {
    const a1 = parseCoordinate(c.coefficients?.[0]);
    const a2 = parseCoordinate(c.coefficients?.[1]);
    const rhs = parseCoordinate(c.rhs);
    if (Math.abs(a1) > 0.001) {
      const interceptX = rhs / a1;
      if (interceptX > 0 && interceptX < 1000) maxNeeded = Math.max(maxNeeded, interceptX);
    }
    if (Math.abs(a2) > 0.001) {
      const interceptY = rhs / a2;
      if (interceptY > 0 && interceptY < 1000) maxNeeded = Math.max(maxNeeded, interceptY);
    }
  });

  if (optimalPoint) {
    const ox = parseCoordinate(optimalPoint.X1 ?? optimalPoint.x1);
    const oy = parseCoordinate(optimalPoint.X2 ?? optimalPoint.x2);
    if (ox > 0 && ox < 1000) maxNeeded = Math.max(maxNeeded, ox);
    if (oy > 0 && oy < 1000) maxNeeded = Math.max(maxNeeded, oy);
  }

  const maxAxis = Math.min(500, Math.max(20, Math.ceil((maxNeeded * 1.25) / 5) * 5));

  // Coordinate transforms
  const toX = (val) => padding + (val / maxAxis) * (width - 2 * padding);
  const toY = (val) => height - padding - (val / maxAxis) * (height - 2 * padding);

  // Dynamic grid ticks
  const tickStep = maxAxis <= 25 ? 5 : maxAxis <= 60 ? 10 : maxAxis <= 150 ? 25 : 50;
  const ticks = [];
  for (let t = 0; t <= maxAxis; t += tickStep) ticks.push(t);

  // Mouse Handlers for Pan/Zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const scaleAdjust = e.deltaY > 0 ? 0.9 : 1.1;
    setView((prev) => ({
      ...prev,
      scale: Math.max(0.1, Math.min(prev.scale * scaleAdjust, 10))
    }));
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setView((prev) => ({
      ...prev,
      x: prev.x - dx / prev.scale,
      y: prev.y - dy / prev.scale
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  // ViewBox calculation
  const vbW = width / view.scale;
  const vbH = height / view.scale;
  const vbX = view.x;
  const vbY = view.y;

  return (
    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '8px', color: '#4ade80' }}>
        2D GRAPHICAL VISUALIZATION (SCROLL TO ZOOM, DRAG TO PAN)
      </span>
      <div 
        style={{
          width: '100%',
          maxWidth: '600px',
          overflow: 'hidden',
          border: '1.5px solid #4ade80',
          borderRadius: '8px',
          boxShadow: '0 0 15px rgba(74, 222, 128, 0.2)'
        }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
          style={{ background: '#040d07', cursor: isDragging ? 'grabbing' : 'grab' }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Base Feasible Region Glow (Starts feasible in 1st quadrant, then carved out by constraints) */}
          <rect x="-10000" y="-10000" width="20000" height="20000" fill="rgba(74, 222, 128, 0.22)" />

          {/* Infeasible regions masking */}
          <g>
            {/* Non-negativity X1 >= 0 => Infeasible is X1 < 0 */}
            <rect x="-10000" y="-10000" width={10000 + toX(0)} height="20000" fill="#040d07" />
            {/* Non-negativity X2 >= 0 => Infeasible is X2 < 0 */}
            <rect x="-10000" y={toY(0)} width="20000" height="10000" fill="#040d07" />

            {constraints.map((c, i) => {
              const a1 = parseCoordinate(c.coefficients?.[0]);
              const a2 = parseCoordinate(c.coefficients?.[1]);
              const rhs = parseCoordinate(c.rhs);
              const rel = c.relation || '<=';
              
              if (a1 === 0 && a2 === 0) return null;

              // Shading infeasible side of a1*x1 + a2*x2 = rhs
              const FAR = 10000;
              let px1, py1, px2, py2;
              
              if (Math.abs(a2) > 0.0001) {
                px1 = -FAR; py1 = (rhs - a1 * px1) / a2;
                px2 = FAR; py2 = (rhs - a1 * px2) / a2;
              } else {
                px1 = rhs / a1; py1 = -FAR;
                px2 = rhs / a1; py2 = FAR;
              }

              let nx = a1;
              let ny = a2;
              if (rel === '>=') { nx = -a1; ny = -a2; }
              if (rel === '=') return null;

              const len = Math.sqrt(nx * nx + ny * ny) || 1;
              nx = (nx / len) * FAR * 10;
              ny = (ny / len) * FAR * 10;

              const sx1 = toX(px1), sy1 = toY(py1);
              const sx2 = toX(px2), sy2 = toY(py2);
              
              const nx_screen = toX(px1 + nx) - sx1;
              const ny_screen = toY(py1 + ny) - sy1;

              return (
                <polygon
                  key={`infeasible-${i}`}
                  points={`${sx1},${sy1} ${sx2},${sy2} ${sx2 + nx_screen},${sy2 + ny_screen} ${sx1 + nx_screen},${sy1 + ny_screen}`}
                  fill="#040d07"
                />
              );
            })}
          </g>

          {/* Grid lines */}
          {ticks.map((val) => (
            <g key={val}>
              <line x1={toX(val)} y1="-1000" x2={toX(val)} y2="1000" stroke="rgba(74, 222, 128, 0.15)" strokeDasharray="2,2" />
              <line x1="-1000" y1={toY(val)} x2="1000" y2={toY(val)} stroke="rgba(74, 222, 128, 0.15)" strokeDasharray="2,2" />
              <text x={toX(val)} y={toY(0) + 16} fill="#4ade80" fontSize="10" textAnchor="middle">{val}</text>
              {val > 0 && <text x={toX(0) - 8} y={toY(val) + 3} fill="#4ade80" fontSize="10" textAnchor="end">{val}</text>}
            </g>
          ))}

          {/* Axes */}
          <line x1="-1000" y1={toY(0)} x2="1000" y2={toY(0)} stroke="#4ade80" strokeWidth="2" />
          <line x1={toX(0)} y1="-1000" x2={toX(0)} y2="1000" stroke="#4ade80" strokeWidth="2" />
          
          <text x={toX(maxAxis) - 15} y={toY(0) + 16} fill="#4ade80" fontSize="11" fontWeight="bold">X₁</text>
          <text x={toX(0) - 15} y={toY(maxAxis) + 15} fill="#4ade80" fontSize="11" fontWeight="bold">X₂</text>

          {/* Constraint Lines with Distinct Color Coding */}
          {constraints.map((c, i) => {
            const a1 = parseCoordinate(c.coefficients?.[0]);
            const a2 = parseCoordinate(c.coefficients?.[1]);
            const rhs = parseCoordinate(c.rhs);
            if (a1 === 0 && a2 === 0) return null;

            const color = CONSTRAINT_PALETTE[i % CONSTRAINT_PALETTE.length].stroke;

            let p1, p2;
            if (Math.abs(a2) > 0.0001) {
              p1 = { x: -200, y: (rhs - a1 * -200) / a2 };
              p2 = { x: 500, y: (rhs - a1 * 500) / a2 };
            } else {
              p1 = { x: rhs / a1, y: -200 };
              p2 = { x: rhs / a1, y: 500 };
            }

            const labelPoint = getLabelPoint(a1, a2, rhs, maxAxis);

            return (
              <g key={`constraint-group-${i}`}>
                {/* Constraint Boundary Line */}
                <line
                  x1={toX(p1.x)}
                  y1={toY(p1.y)}
                  x2={toX(p2.x)}
                  y2={toY(p2.y)}
                  stroke={color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* In-Graph Constraint Label Badge (C1, C2, etc.) */}
                {labelPoint && (
                  <g key={`badge-${i}`}>
                    <rect
                      x={toX(labelPoint.x) - 13}
                      y={toY(labelPoint.y) - 9}
                      width="26"
                      height="18"
                      rx="4"
                      fill="#040d07"
                      stroke={color}
                      strokeWidth="1.5"
                    />
                    <text
                      x={toX(labelPoint.x)}
                      y={toY(labelPoint.y) + 4}
                      fill={color}
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      C{i + 1}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Optimal Point Marker (Exact Fractional Parsing) */}
          {optimalPoint && (optimalPoint.X1 !== undefined || optimalPoint.x1 !== undefined) && (() => {
            const rawX1 = optimalPoint.X1 ?? optimalPoint.x1;
            const rawX2 = optimalPoint.X2 ?? optimalPoint.x2;
            const optX = parseCoordinate(rawX1);
            const optY = parseCoordinate(rawX2);

            return (
              <g>
                <circle
                  cx={toX(optX)}
                  cy={toY(optY)}
                  r="12"
                  fill="none"
                  stroke="#4ade80"
                  strokeWidth="1.5"
                  strokeDasharray="3,2"
                  opacity="0.8"
                />
                <circle
                  cx={toX(optX)}
                  cy={toY(optY)}
                  r="6"
                  fill="#4ade80"
                  stroke="#040d07"
                  strokeWidth="2"
                />
                <text
                  x={toX(optX) + 9}
                  y={toY(optY) - 9}
                  fill="#4ade80"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="monospace"
                  style={{ textShadow: '0 0 5px #000, 1px 1px 2px #000' }}
                >
                  ★ ({rawX1}, {rawX2})
                </text>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Color-Coded Constraint Legend Below Graph */}
      <div
        style={{
          marginTop: '12px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '8px 12px',
          maxWidth: '600px',
          width: '100%',
          padding: '8px 12px',
          background: 'rgba(4, 13, 7, 0.85)',
          border: '1px solid rgba(74, 222, 128, 0.3)',
          borderRadius: '6px',
          fontSize: '0.78rem',
          fontFamily: 'monospace',
        }}
      >
        {constraints.map((c, i) => {
          const a1 = c.coefficients?.[0] ?? 0;
          const a2 = c.coefficients?.[1] ?? 0;
          const rhs = c.rhs ?? 0;
          const rel = c.relation === '<=' ? '≤' : c.relation === '>=' ? '≥' : '=';
          const color = CONSTRAINT_PALETTE[i % CONSTRAINT_PALETTE.length].stroke;

          return (
            <div
              key={`legend-${i}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 8px',
                borderRadius: '4px',
                border: `1px solid ${color}`,
                background: 'rgba(0, 0, 0, 0.55)',
                color: color,
                fontWeight: 700,
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '14px',
                  height: '3px',
                  background: color,
                  borderRadius: '2px',
                }}
              />
              <span>C{i + 1}: {a1}X₁ + {a2}X₂ {rel} {rhs}</span>
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: '0.75rem', color: '#4ade80', opacity: 0.75, marginTop: '6px', textAlign: 'center' }}>
        Optimal solution vertex marked with (★) · Feasible region shaded in green
      </div>
    </div>
  );
};

export default GraphVisualization;
