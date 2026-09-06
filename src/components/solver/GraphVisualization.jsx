import React from 'react';

const GraphVisualization = ({ constraints, numVars, optimalPoint }) => {
  if (numVars !== 2 || !constraints || constraints.length === 0) return null;

  const width = 360;
  const height = 260;
  const padding = 35;
  const maxAxis = 15;

  const toX = (val) => padding + (val / maxAxis) * (width - 2 * padding);
  const toY = (val) => height - padding - (val / maxAxis) * (height - 2 * padding);

  return (
    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '8px', color: '#4ade80' }}>
        2D GRAPHICAL VISUALIZATION
      </span>
      <svg
        width={width}
        height={height}
        style={{
          background: '#040d07',
          border: '1px solid #4ade80',
          borderRadius: '8px',
          boxShadow: '0 0 15px rgba(74, 222, 128, 0.2)'
        }}
      >
        {/* Grid lines */}
        {[0, 3, 6, 9, 12, 15].map((val) => (
          <g key={val}>
            <line
              x1={toX(val)}
              y1={toY(0)}
              x2={toX(val)}
              y2={toY(maxAxis)}
              stroke="rgba(74, 222, 128, 0.15)"
              strokeDasharray="2,2"
            />
            <line
              x1={toX(0)}
              y1={toY(val)}
              x2={toX(maxAxis)}
              y2={toY(val)}
              stroke="rgba(74, 222, 128, 0.15)"
              strokeDasharray="2,2"
            />
            <text x={toX(val)} y={toY(0) + 16} fill="#4ade80" fontSize="10" textAnchor="middle">
              {val}
            </text>
            {val > 0 && (
              <text x={toX(0) - 8} y={toY(val) + 3} fill="#4ade80" fontSize="10" textAnchor="end">
                {val}
              </text>
            )}
          </g>
        ))}

        {/* Axes */}
        <line
          x1={toX(0)}
          y1={toY(0)}
          x2={toX(maxAxis)}
          y2={toY(0)}
          stroke="#4ade80"
          strokeWidth="2"
        />
        <line
          x1={toX(0)}
          y1={toY(0)}
          x2={toX(0)}
          y2={toY(maxAxis)}
          stroke="#4ade80"
          strokeWidth="2"
        />
        <text x={width - 15} y={toY(0) + 16} fill="#4ade80" fontSize="11" fontWeight="bold">
          X₁
        </text>
        <text x={toX(0) - 8} y={15} fill="#4ade80" fontSize="11" fontWeight="bold">
          X₂
        </text>

        {/* Constraint Lines */}
        {constraints.map((c, i) => {
          const a1 = Number(c.coefficients[0]) || 0;
          const a2 = Number(c.coefficients[1]) || 0;
          const rhs = Number(c.rhs) || 0;

          if (a1 === 0 && a2 === 0) return null;

          let p1 = { x: 0, y: 0 };
          let p2 = { x: 0, y: 0 };

          if (a2 !== 0 && a1 !== 0) {
            p1 = { x: 0, y: rhs / a2 };
            p2 = { x: rhs / a1, y: 0 };
          } else if (a1 === 0 && a2 !== 0) {
            p1 = { x: 0, y: rhs / a2 };
            p2 = { x: maxAxis, y: rhs / a2 };
          } else if (a2 === 0 && a1 !== 0) {
            p1 = { x: rhs / a1, y: 0 };
            p2 = { x: rhs / a1, y: maxAxis };
          }

          return (
            <line
              key={i}
              x1={toX(p1.x)}
              y1={toY(p1.y)}
              x2={toX(p2.x)}
              y2={toY(p2.y)}
              stroke={['#38bdf8', '#fbbf24', '#f472b6', '#a78bfa'][i % 4]}
              strokeWidth="2"
            />
          );
        })}

        {/* Optimal Point Marker */}
        {optimalPoint && optimalPoint.X1 !== undefined && (
          <g>
            <circle
              cx={toX(optimalPoint.X1)}
              cy={toY(optimalPoint.X2 || 0)}
              r="6"
              fill="#4ade80"
              stroke="#000"
              strokeWidth="2"
            />
            <text
              x={toX(optimalPoint.X1) + 8}
              y={toY(optimalPoint.X2 || 0) - 8}
              fill="#4ade80"
              fontSize="11"
              fontWeight="bold"
            >
              *({optimalPoint.X1}, {optimalPoint.X2 || 0})
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

export default GraphVisualization;
