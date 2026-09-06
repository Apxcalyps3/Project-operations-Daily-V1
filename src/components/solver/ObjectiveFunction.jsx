import React from 'react';

const ObjectiveFunction = ({ isMax, setIsMax, numVars, coefficients, onChangeCoeff }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <select
          value={isMax ? 'MAX' : 'MIN'}
          onChange={(e) => setIsMax(e.target.value === 'MAX')}
          className="pill-select"
          style={{ minWidth: '90px' }}
        >
          <option value="MAX">MAX</option>
          <option value="MIN">MIN</option>
        </select>

        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#4ade80' }}>Z =</span>

        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          {Array.from({ length: numVars }).map((_, idx) => (
            <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="number"
                value={coefficients[idx] ?? ''}
                onChange={(e) => onChangeCoeff(idx, e.target.value)}
                placeholder="0"
                className="pill-input"
                style={{ width: '80px', textAlign: 'center' }}
              />
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#4ade80' }}>
                X<sub>{idx + 1}</sub>{idx < numVars - 1 ? ' +' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ObjectiveFunction;
