import React, { useState } from 'react';
import btnBg from '../../assets/icons/btn-bg.png';

const SubmissionForm = ({ numVars = 2, onSubmitSolution }) => {
  const [zVal, setZVal] = useState('');
  const [vars, setVars] = useState(() => new Array(numVars).fill(''));
  const [feedback, setFeedback] = useState(null);

  const handleVarChange = (idx, val) => {
    setVars((prev) => {
      const updated = [...prev];
      updated[idx] = val;
      return updated;
    });
  };

  const handleClear = () => {
    setZVal('');
    setVars(new Array(numVars).fill(''));
    setFeedback(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (zVal === '' || vars.some((v) => v === '')) {
      setFeedback({ success: false, message: 'Please enter all values before submitting.' });
      return;
    }
    const result = onSubmitSolution ? onSubmitSolution({ z: Number(zVal), vars: vars.map(Number) }) : null;
    setFeedback(result || { success: false, message: 'Unable to verify this challenge.' });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '0.1em', color: '#4ade80' }}>
        SUBMIT YOUR SOLUTION
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ width: '40px', fontSize: '1rem', fontWeight: 700, color: '#4ade80' }}>Z:</span>
          <input
            type="number"
            step="any"
            value={zVal}
            onChange={(e) => setZVal(e.target.value)}
            className="pill-input"
            style={{ width: '130px' }}
            placeholder="0"
          />
        </div>

        {Array.from({ length: numVars }).map((_, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ width: '40px', fontSize: '1rem', fontWeight: 700, color: '#4ade80' }}>
              X<sub>{idx + 1}</sub>:
            </span>
            <input
              type="number"
              step="any"
              value={vars[idx] ?? ''}
              onChange={(e) => handleVarChange(idx, e.target.value)}
              className="pill-input"
              style={{ width: '130px' }}
              placeholder="0"
            />
          </div>
        ))}
      </div>

      {feedback && (
        <div
          style={{
            color: feedback.success ? '#4ade80' : '#f87171',
            fontSize: '0.85rem',
            letterSpacing: '0.05em'
          }}
        >
          {feedback.message}
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px', marginTop: '10px', alignSelf: 'flex-start' }}>
        <button
          type="button"
          onClick={handleClear}
          style={{
            backgroundImage: `url(${btnBg})`,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#4ade80',
            fontFamily: "'Orbitron', monospace",
            fontSize: '0.95rem',
            fontWeight: 700,
            letterSpacing: '0.15em',
            padding: '12px 32px',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, filter 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.04)';
            e.currentTarget.style.filter = 'drop-shadow(0 0 10px rgba(74, 222, 128, 0.6))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.filter = 'none';
          }}
        >
          CLEAR
        </button>

        <button
          type="submit"
          style={{
            backgroundImage: `url(${btnBg})`,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#4ade80',
            fontFamily: "'Orbitron', monospace",
            fontSize: '0.95rem',
            fontWeight: 700,
            letterSpacing: '0.15em',
            padding: '12px 32px',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, filter 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.04)';
            e.currentTarget.style.filter = 'drop-shadow(0 0 10px rgba(74, 222, 128, 0.6))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.filter = 'none';
          }}
        >
          SUBMIT
        </button>
      </div>
    </form>
  );
};

export default SubmissionForm;
