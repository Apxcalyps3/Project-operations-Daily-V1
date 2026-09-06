import React, { useState, useRef } from 'react';

const GraphVisualization = ({ constraints, numVars, optimalPoint }) => {
  const [view, setView] = useState({ x: -10, y: -10, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  if (numVars !== 2 || !constraints || constraints.length === 0) return null;

  const width = 600;
  const height = 400;
  const padding = 40;

  // Base domain size
  const maxAxis = 20;

  // Coordinate transforms
  const toX = (val) => padding + (val / maxAxis) * (width - 2 * padding);
  const toY = (val) => height - padding - (val / maxAxis) * (height - 2 * padding);

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
    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
          {/* Base Feasible Region Glow (Everything starts as feasible, then we carve it out) */}
          <rect x="-10000" y="-10000" width="20000" height="20000" fill="rgba(74, 222, 128, 0.25)" />

          {/* Infeasible regions (masking) */}
          <g>
            {/* Non-negativity X1 >= 0 => Infeasible is X1 < 0 */}
            <rect x="-10000" y="-10000" width={10000 + toX(0)} height="20000" fill="#040d07" />
            {/* Non-negativity X2 >= 0 => Infeasible is X2 < 0 */}
            <rect x="-10000" y={toY(0)} width="20000" height="10000" fill="#040d07" />

            {constraints.map((c, i) => {
              const a1 = Number(c.coefficients[0]) || 0;
              const a2 = Number(c.coefficients[1]) || 0;
              const rhs = Number(c.rhs) || 0;
              const rel = c.relation || '<=';
              
              if (a1 === 0 && a2 === 0) return null;

              // We need to draw a polygon on the INFEASIBLE side of a1*x1 + a2*x2 = rhs
              // Pick two points far away on the line
              const FAR = 10000;
              let px1, py1, px2, py2;
              
              if (Math.abs(a2) > 0.0001) {
                px1 = -FAR; py1 = (rhs - a1 * px1) / a2;
                px2 = FAR; py2 = (rhs - a1 * px2) / a2;
              } else {
                px1 = rhs / a1; py1 = -FAR;
                px2 = rhs / a1; py2 = FAR;
              }

              // Normal vector pointing to the infeasible side
              let nx = a1;
              let ny = a2;
              if (rel === '>=') { nx = -a1; ny = -a2; }
              // For '=', both sides are infeasible technically, but we'll just skip shading or shade a lot. 
              // To keep it simple, if '=', we won't shade the region since it's just a line.
              if (rel === '=') return null;

              // Normalize normal vector
              const len = Math.sqrt(nx*nx + ny*ny);
              nx = (nx / len) * FAR * 10;
              ny = (ny / len) * FAR * 10;

              // In screen coordinates, Y axis is inverted!
              // Since toY(val) = H - (val/max)*H, toY maps positive math Y to negative screen Y.
              // We just map the points.
              const sx1 = toX(px1), sy1 = toY(py1);
              const sx2 = toX(px2), sy2 = toY(py2);
              
              // We move from the line in the direction of the normal (in math space)
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
          {[0, 5, 10, 15, 20, 25, 30].map((val) => (
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

          {/* Constraint Lines */}
          {constraints.map((c, i) => {
            const a1 = Number(c.coefficients[0]) || 0;
            const a2 = Number(c.coefficients[1]) || 0;
            const rhs = Number(c.rhs) || 0;
            if (a1 === 0 && a2 === 0) return null;

            let p1, p2;
            if (Math.abs(a2) > 0.0001) {
              p1 = { x: -100, y: (rhs - a1 * -100) / a2 };
              p2 = { x: 100, y: (rhs - a1 * 100) / a2 };
            } else {
              p1 = { x: rhs / a1, y: -100 };
              p2 = { x: rhs / a1, y: 100 };
            }

            return (
              <line
                key={`line-${i}`}
                x1={toX(p1.x)}
                y1={toY(p1.y)}
                x2={toX(p2.x)}
                y2={toY(p2.y)}
                stroke="#4ade80"
                strokeWidth="2"
              />
            );
          })}

          {/* Optimal Point Marker */}
          {optimalPoint && optimalPoint.X1 !== undefined && (
            <g>
              <circle
                cx={toX(Number(optimalPoint.X1))}
                cy={toY(Number(optimalPoint.X2) || 0)}
                r="6"
                fill="#4ade80"
                stroke="#000"
                strokeWidth="2"
              />
              <text
                x={toX(Number(optimalPoint.X1)) + 8}
                y={toY(Number(optimalPoint.X2) || 0) - 8}
                fill="#4ade80"
                fontSize="12"
                fontWeight="bold"
                style={{ textShadow: '1px 1px 2px #000' }}
              >
                *({Number(optimalPoint.X1).toFixed(2)}, {(Number(optimalPoint.X2) || 0).toFixed(2)})
              </text>
            </g>
          )}
        </svg>
      </div>
      <div style={{ fontSize: '0.75rem', color: '#4ade80', opacity: 0.7, marginTop: '8px' }}>
        Optimal point marked with (*)
      </div>
    </div>
  );
};

export default GraphVisualization;
