import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SolverResults from './SolverResults';
import GraphVisualization from './GraphVisualization';
import { solveBigM } from '../../services/bigMEngine';
import { solveCuttingPlane, solveBranchAndBound } from '../../services/cuttingPlaneEngine';
import { solveDualSimplex } from '../../services/dualSimplexEngine';
import { solvePrimalDual } from '../../services/primalDualEngine';
import { saveSolveRecord } from '../../services/api';

const LABEL_STYLE = {
  fontSize: '0.85rem',
  fontWeight: 700,
  letterSpacing: '0.15em',
  color: '#4ade80',
  textTransform: 'uppercase',
};

const ROW = { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' };

/**
 * SolverForm — PDF Pages 3 & 4
 * Full dynamic state for variables (2–6) and constraints (add/delete).
 * Accepts optional preloaded model from route state (for Solver History reload).
 */
const SolverForm = ({
  solverType = 'LP',
  defaultMethod = null,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Allow reloading a model from Solver History via navigate state
  const preload = location.state?.model || null;

  const [numVars, setNumVars] = useState(preload?.numVars || 2);
  const [isMax, setIsMax] = useState(preload?.isMax !== undefined ? preload.isMax : true);

  // Dynamic available methods per revised flowchart and instructions
  const availableMethods = React.useMemo(() => {
    if (solverType === 'IP') {
      return ['CUTTING PLANE', 'BRANCH & BOUND'];
    }
    return ['DUAL SIMPLEX', 'BIG M', 'PRIMAL-DUAL'];
  }, [solverType]);

  const [method, setMethod] = useState(() => {
    if (preload?.method) {
      if (preload.method === 'BRANCH AND BOUND') return 'BRANCH & BOUND';
      if (availableMethods.includes(preload.method)) return preload.method;
    }
    return defaultMethod && availableMethods.includes(defaultMethod)
      ? defaultMethod
      : availableMethods[0];
  });

  // Automatically update method if it becomes invalid under current mode
  useEffect(() => {
    if (!availableMethods.includes(method)) {
      setMethod(availableMethods[0]);
    }
  }, [availableMethods, method]);

  const [objective, setObjective] = useState(preload?.objective || ['', '']);
  const [constraints, setConstraints] = useState(
    preload?.constraints || [
      { coefficients: ['', ''], relation: '<=', rhs: '' },
      { coefficients: ['', ''], relation: '<=', rhs: '' },
    ]
  );
  const [results, setResults] = useState(preload?.results || null);
  const [error, setError] = useState(null);

  // Clear route state after consuming it so back-navigation won't re-apply
  useEffect(() => {
    if (location.state?.model) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Variable Count ── */
  const adjustVarCount = (delta) => {
    const next = numVars + delta;
    if (next < 2 || next > 10) return;
    setNumVars(next);
    setObjective((prev) => {
      const arr = [...prev];
      while (arr.length < next) arr.push('');
      return arr.slice(0, next);
    });
    setConstraints((prev) =>
      prev.map((c) => {
        const coeffs = [...c.coefficients];
        while (coeffs.length < next) coeffs.push('');
        return { ...c, coefficients: coeffs.slice(0, next) };
      })
    );
  };

  /* ── Objective ── */
  const setObjCoeff = (idx, val) =>
    setObjective((prev) => { const a = [...prev]; a[idx] = val; return a; });

  /* ── Constraints (Subjective rows) ── */
  const setConstraintCoeff = (ci, vi, val) =>
    setConstraints((prev) => {
      const a = [...prev];
      const coeffs = [...a[ci].coefficients];
      coeffs[vi] = val;
      a[ci] = { ...a[ci], coefficients: coeffs };
      return a;
    });

  const setConstraintRelation = (ci, rel) =>
    setConstraints((prev) => {
      const a = [...prev]; a[ci] = { ...a[ci], relation: rel }; return a;
    });

  const setConstraintRhs = (ci, val) =>
    setConstraints((prev) => {
      const a = [...prev]; a[ci] = { ...a[ci], rhs: val }; return a;
    });

  const addConstraint = () => {
    setConstraints((prev) => [
      ...prev,
      { coefficients: new Array(numVars).fill(''), relation: '<=', rhs: '' },
    ]);
  };

  const removeConstraint = (idx) => {
    if (constraints.length <= 1) return;
    setConstraints((prev) => prev.filter((_, i) => i !== idx));
  };

  /* ── Run Analysis ── */
  const handleRun = (e) => {
    e.preventDefault();
    setError(null);
    setResults(null);

    const allValues = [...objective, ...constraints.flatMap((constraint) => [...constraint.coefficients, constraint.rhs])];
    if (allValues.some((value) => value === '' || value === null || value === undefined || !Number.isFinite(Number(value)))) {
      setError('Complete every objective and constraint field with a valid number before running analysis.');
      return;
    }

    try {
      let result;
      if (solverType === 'IP') {
        if (method === 'BRANCH & BOUND' || method === 'BRANCH AND BOUND') {
          result = solveBranchAndBound({ isMax, objective, constraints });
        } else {
          result = solveCuttingPlane({ isMax, objective, constraints });
        }
      } else {
        if (method === 'DUAL SIMPLEX') {
          result = solveDualSimplex({ isMax, objective, constraints });
        } else if (method === 'PRIMAL-DUAL') {
          result = solvePrimalDual({ isMax, objective, constraints });
        } else {
          result = solveBigM({ isMax, objective, constraints });
        }
      }

      if (result.error) {
        setError(result.error);
        return;
      }

      setResults(result);

      // Persist model + result to localStorage
      const modelSnapshot = { method, numVars, isMax, objective, constraints, solverType, results: result };
      saveSolveRecord(solverType, {
        method,
        isMax,
        objective,
        constraints,
        numVars,
        optimalZ: result.optimalZ,
        results: result,
        model: modelSnapshot,
      });
    } catch (err) {
      setError(String(err));
    }
  };

  /* ── Render ── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

      {/* ── Method & Variable Row ── */}
      <div style={{ ...ROW, gap: '28px' }}>
        {/* Method Dropdown */}
        <div style={ROW}>
          <span style={LABEL_STYLE}>METHOD</span>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="pill-select"
            style={{ minWidth: '155px' }}
          >
            {availableMethods.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Variable Counter */}
        <div style={ROW}>
          <span style={LABEL_STYLE}>VARIABLES</span>
          <button
            type="button"
            className="counter-btn"
            onClick={() => adjustVarCount(-1)}
            disabled={numVars <= 2}
            aria-label="Decrease variable count"
          >−</button>
          <span style={{ minWidth: '22px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.05rem' }}>
            {numVars}
          </span>
          <button
            type="button"
            className="counter-btn"
            onClick={() => adjustVarCount(1)}
            disabled={numVars >= 10}
            aria-label="Increase variable count"
          >+</button>
        </div>
      </div>

      {/* ── Objective Function ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* MAX / MIN + Z = */}
        <div style={ROW}>
          <select
            value={isMax ? 'MAX' : 'MIN'}
            onChange={(e) => setIsMax(e.target.value === 'MAX')}
            className="pill-select"
            style={{ minWidth: '85px' }}
          >
            <option value="MAX">MAX</option>
            <option value="MIN">MIN</option>
          </select>
          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#4ade80' }}>Z =</span>

          {/* Coefficient Inputs per variable */}
          {Array.from({ length: numVars }).map((_, idx) => (
            <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <input
                type="number"
                value={objective[idx] ?? ''}
                onChange={(e) => setObjCoeff(idx, e.target.value)}
                placeholder="0"
                className="pill-input"
                style={{ width: '72px', textAlign: 'center' }}
                aria-label={`Objective X${idx + 1}`}
              />
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#4ade80' }}>
                X<sub>{idx + 1}</sub>{idx < numVars - 1 ? ' +' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Constraints ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <span style={LABEL_STYLE}>CONSTRAINTS (SUBJECT TO)</span>
        </div>

        {/* Dynamic bracket enclosing subjective + hardcoded structural constraints */}
        <div style={{ display: 'flex', alignItems: 'stretch', gap: '10px' }}>
          {/* Scalable Vector Curly Bracket */}
          <div style={{ display: 'flex', alignItems: 'center', width: '22px', flexShrink: 0 }}>
            <svg
              viewBox="0 0 20 100"
              preserveAspectRatio="none"
              style={{ width: '100%', height: '100%', minHeight: '110px' }}
            >
              <path
                d="M 18,2 C 10,2 8,24 8,44 C 8,48 4,50 1,50 C 4,50 8,52 8,56 C 8,76 10,98 18,98"
                fill="none"
                stroke="#4ade80"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* All Constraints Inside Bracket */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            {/* Subjective Constraints */}
            {constraints.map((c, ci) => (
              <div key={ci} style={{ ...ROW, padding: '2px 0' }}>
                {/* Row number */}
                <span style={{ width: '20px', fontSize: '0.88rem', fontWeight: 600, color: '#4ade80' }}>
                  {ci + 1}.
                </span>

                {/* Coefficient inputs */}
                {Array.from({ length: numVars }).map((_, vi) => (
                  <div key={vi} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="number"
                      value={c.coefficients[vi] ?? ''}
                      onChange={(e) => setConstraintCoeff(ci, vi, e.target.value)}
                      placeholder="0"
                      className="pill-input"
                      style={{ width: '68px', textAlign: 'center' }}
                      aria-label={`Constraint ${ci + 1} X${vi + 1}`}
                    />
                    <span style={{ fontSize: '0.82rem', color: 'rgba(74,222,128,0.7)' }}>
                      X<sub>{vi + 1}</sub>{vi < numVars - 1 ? ' +' : ''}
                    </span>
                  </div>
                ))}

                {/* Relation */}
                <select
                  value={c.relation || '<='}
                  onChange={(e) => setConstraintRelation(ci, e.target.value)}
                  className="pill-select"
                  style={{ minWidth: '60px' }}
                >
                  <option value="<=">≤</option>
                  <option value=">=">≥</option>
                  <option value="=">=</option>
                </select>

                {/* RHS */}
                <input
                  type="number"
                  value={c.rhs ?? ''}
                  onChange={(e) => setConstraintRhs(ci, e.target.value)}
                  placeholder="0"
                  className="pill-input"
                  style={{ width: '72px', textAlign: 'center' }}
                  aria-label={`Constraint ${ci + 1} RHS`}
                />

                {/* Delete constraint (enabled if > 1) */}
                {constraints.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeConstraint(ci)}
                    title="Delete Constraint"
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(74,222,128,0.4)',
                      borderRadius: '6px',
                      color: '#4ade80',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#f87171';
                      e.currentTarget.style.color = '#f87171';
                      e.currentTarget.style.boxShadow = '0 0 8px rgba(248,113,113,0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(74,222,128,0.4)';
                      e.currentTarget.style.color = '#4ade80';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    aria-label={`Delete constraint ${ci + 1}`}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                )}
              </div>
            ))}

            {/* Hardcoded Structural Constraints */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '4px', borderTop: '1px dashed rgba(74,222,128,0.25)' }}>
              {/* Non-negativity */}
              <div style={{ fontSize: '0.85rem', color: '#4ade80', letterSpacing: '0.05em' }}>
                {Array.from({ length: numVars }, (_, i) => `X${i + 1}`).join(', ')} ≥ 0{' '}
                <span style={{ fontSize: '0.72rem', color: 'rgba(74,222,128,0.5)' }}>[Structural: Non-Negativity]</span>
              </div>

              {/* Integer constraint for IP */}
              {solverType === 'IP' && (
                <div style={{ fontSize: '0.85rem', color: '#4ade80', letterSpacing: '0.05em' }}>
                  {Array.from({ length: numVars }, (_, i) => `X${i + 1}`).join(', ')} ∈ ℤ{' '}
                  <span style={{ fontSize: '0.72rem', color: 'rgba(74,222,128,0.5)' }}>[Structural: Integer]</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Constraint Button */}
        <button
          type="button"
          onClick={addConstraint}
          className="pill-button"
          style={{
            alignSelf: 'flex-start',
            marginTop: '4px',
            fontSize: '0.78rem',
            padding: '6px 16px',
            cursor: 'pointer',
          }}
        >
          + ADD CONSTRAINT
        </button>
      </div>

      {/* ── Run Analysis ── */}
      <button
        type="button"
        onClick={handleRun}
        className="run-analysis-btn"
      >
        RUN ANALYSIS
      </button>

      {/* Error */}
      {error && (
        <div style={{ color: '#f87171', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
          ⚠ {error}
        </div>
      )}

      {/* Results */}
      {results && (
        <>
          <SolverResults
            key={`${isMax ? 'MAX' : 'MIN'}-${method}-${results.optimalZ || ''}-${results.steps?.length || 0}`}
            results={results}
            isMax={isMax}
          />
          {numVars === 2 && (
            <GraphVisualization
              constraints={constraints}
              numVars={numVars}
              optimalPoint={results.variables}
            />
          )}
        </>
      )}
    </div>
  );
};

export default SolverForm;
