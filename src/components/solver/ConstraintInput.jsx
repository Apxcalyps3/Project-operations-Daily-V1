import React from 'react';

const ConstraintInput = ({
  index,
  numVars,
  constraint,
  onCoeffChange,
  onRelationChange,
  onRhsChange,
  onRemove,
  canRemove
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        padding: '4px 0'
      }}
    >
      <span style={{ width: '24px', fontSize: '0.95rem', fontWeight: 600, color: '#4ade80' }}>
        {index + 1}.
      </span>

      {Array.from({ length: numVars }).map((_, vIdx) => (
        <div key={vIdx} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <input
            type="number"
            value={constraint.coefficients[vIdx] ?? ''}
            onChange={(e) => onCoeffChange(index, vIdx, e.target.value)}
            placeholder="0"
            className="pill-input"
            style={{ width: '75px', textAlign: 'center' }}
          />
          <span style={{ fontSize: '0.85rem', color: 'rgba(74, 222, 128, 0.7)' }}>
            X<sub>{vIdx + 1}</sub>
          </span>
        </div>
      ))}

      <select
        value={constraint.relation || '<='}
        onChange={(e) => onRelationChange(index, e.target.value)}
        className="pill-select"
        style={{ minWidth: '65px', paddingRight: '22px' }}
      >
        <option value="<=">&le;</option>
        <option value=">=">&ge;</option>
        <option value="=">=</option>
      </select>

      <input
        type="number"
        value={constraint.rhs ?? ''}
        onChange={(e) => onRhsChange(index, e.target.value)}
        placeholder="0"
        className="pill-input"
        style={{ width: '80px', textAlign: 'center' }}
      />

      {canRemove && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          title="Remove Constraint"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#4ade80',
            fontSize: '1.2rem',
            cursor: 'pointer',
            padding: '2px 6px',
            transition: 'transform 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          🗑
        </button>
      )}
    </div>
  );
};

export default ConstraintInput;
