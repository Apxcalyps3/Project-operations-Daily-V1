import React from 'react';

const DailyModelDisplay = ({ model }) => {
  if (!model) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '0.1em', color: '#4ade80' }}>
        {model.objective}
      </div>

      <div>
        <div style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '8px', color: '#4ade80' }}>
          SUBJECT TO:
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Big Curly Brace */}
          <div
            style={{
              fontSize: '4.5rem',
              fontWeight: 200,
              lineHeight: 0.9,
              color: '#4ade80',
              fontFamily: 'serif',
              userSelect: 'none',
              transform: 'scaleY(1.3)'
            }}
          >
            &#123;
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '1rem', letterSpacing: '0.05em' }}>
            {model.constraints.map((c, i) => (
              <div key={i} style={{ color: '#4ade80' }}>
                {c.text}
              </div>
            ))}
            <div style={{ color: '#4ade80' }}>{model.nonNegativity}</div>
            {model.integerConstraint && (
              <div style={{ color: '#4ade80' }}>{model.integerConstraint}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyModelDisplay;
