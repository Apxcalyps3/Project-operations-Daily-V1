/**
 * Solver Results Component
 * Comprehensive display of optimal values, basic variables, shadow prices,
 * and step-by-step educational tableau progression.
 */

import React, { useState, useEffect } from 'react';

/* ============================================================
   Helper Components & Formatters
   ============================================================ */
const FractionValue = ({ value }) => {
  if (value === null || value === undefined) return '—';
  const text = String(value).trim();
  const match = text.match(/^(-?)(\d+)\/(\d+)$/);
  if (!match) return <span>{text}</span>;
  const [, sign, num, den] = match;
  return (
    <span
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        verticalAlign: 'middle',
        lineHeight: 0.9,
        textAlign: 'center',
        margin: '0 2px',
        fontSize: '0.9em',
      }}
    >
      <span style={{ borderBottom: '1px solid currentColor', padding: '0 2px 1px' }}>
        {sign}{num}
      </span>
      <span style={{ padding: '1px 2px 0' }}>{den}</span>
    </span>
  );
};

const displayVariable = (name) =>
  name.replace(/\d+/g, (digits) =>
    digits
      .split('')
      .map((digit) => '₀₁₂₃₄₅₆₇₈₉'[digit] || digit)
      .join('')
  );

/* ============================================================
   Solver Results Component
   ============================================================ */
const SolverResults = ({ results, isMax }) => {
  const [activeStep, setActiveStep] = useState(0);

  // Automatically reset step index whenever a new solution or mode is provided
  useEffect(() => {
    setActiveStep(0);
  }, [results, isMax]);

  if (!results) return null;

  const {
    optimalZ,
    variables,
    dualVariables,
    slacks,
    status,
    message,
    steps = [],
    continuousZ,
    feasibility,
  } = results;

  // Safe clamping ensures out-of-bounds indexing never resolves to null
  const safeStep = steps.length > 0 ? Math.min(Math.max(0, activeStep), steps.length - 1) : 0;
  const currentStep = steps[safeStep] || null;
  const pivot = currentStep?.pivot || null;

  return (
    <div
      style={{
        marginTop: '2rem',
        borderTop: '1.5px dashed #4ade80',
        paddingTop: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      {/* ── Header & Status Badge ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <h3
          style={{
            fontSize: '1.2rem',
            margin: 0,
            letterSpacing: '0.15em',
            color: '#4ade80',
            fontWeight: 700,
          }}
        >
          ANALYSIS RESULTS
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {feasibility && (
            <span
              style={{
                fontSize: '0.8rem',
                padding: '4px 10px',
                borderRadius: '9999px',
                border: '1px solid rgba(74, 222, 128, 0.4)',
                backgroundColor: 'rgba(74, 222, 128, 0.1)',
                color: '#86efac',
              }}
            >
              {feasibility}
            </span>
          )}
          <span
            style={{
              fontSize: '0.85rem',
              padding: '4px 14px',
              borderRadius: '9999px',
              border: `1px solid ${
                status?.includes('Infeasible') || status?.includes('Unbounded')
                  ? '#f87171'
                  : '#4ade80'
              }`,
              backgroundColor:
                status?.includes('Infeasible') || status?.includes('Unbounded')
                  ? 'rgba(248, 113, 113, 0.15)'
                  : 'rgba(74, 222, 128, 0.15)',
              color:
                status?.includes('Infeasible') || status?.includes('Unbounded')
                  ? '#f87171'
                  : '#4ade80',
              fontWeight: 600,
            }}
          >
            {status}
          </span>
        </div>
      </div>

      {message && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            color: '#fca5a5',
            fontSize: '0.9rem',
            lineHeight: 1.5,
          }}
        >
          {message}
        </div>
      )}

      {/* ── Optimal Solution Summary Card ── */}
      {optimalZ !== undefined && (
        <div
          style={{
            background: 'rgba(20, 83, 45, 0.3)',
            border: '1px solid #4ade80',
            borderRadius: '12px',
            padding: '18px 22px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '15px',
          }}
        >
          <div>
            <span style={{ fontSize: '0.8rem', opacity: 0.75, display: 'block', letterSpacing: '0.05em' }}>
              OPTIMAL VALUE ({isMax ? 'MAX' : 'MIN'} Z)
            </span>
            <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#4ade80' }}>
              <FractionValue value={optimalZ} />
            </span>
            {continuousZ !== undefined && (
              <span style={{ fontSize: '0.75rem', display: 'block', opacity: 0.65, marginTop: '2px' }}>
                (Relaxed LP Z = <FractionValue value={continuousZ} />)
              </span>
            )}
          </div>

          {variables &&
            Object.entries(variables).map(([name, val]) => (
              <div key={name}>
                <span style={{ fontSize: '0.8rem', opacity: 0.75, display: 'block', letterSpacing: '0.05em' }}>
                  VARIABLE {name}
                </span>
                <span style={{ fontSize: '1.6rem', fontWeight: 700, color: '#4ade80' }}>
                  <FractionValue value={val} />
                </span>
              </div>
            ))}

          {slacks && Object.keys(slacks).length > 0 && (
            <div style={{ gridColumn: '1 / -1', borderTop: '1px dashed rgba(74,222,128,0.25)', paddingTop: '10px' }}>
              <span style={{ fontSize: '0.78rem', opacity: 0.75, display: 'block', marginBottom: '4px' }}>
                SLACK / SURPLUS / CUT VARIABLES
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.9rem', color: 'rgba(74, 222, 128, 0.9)' }}>
                {Object.entries(slacks).map(([s, val]) => (
                  <span key={s} style={{ background: 'rgba(74,222,128,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                    {s} = <FractionValue value={val} />
                  </span>
                ))}
              </div>
            </div>
          )}

          {dualVariables && Object.keys(dualVariables).length > 0 && (
            <div style={{ gridColumn: '1 / -1', borderTop: '1px dashed rgba(74,222,128,0.25)', paddingTop: '10px' }}>
              <span style={{ fontSize: '0.78rem', opacity: 0.75, display: 'block', marginBottom: '4px' }}>
                DUAL VARIABLES (SHADOW PRICES)
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.9rem', color: 'rgba(74, 222, 128, 0.9)' }}>
                {Object.entries(dualVariables).map(([y, val]) => (
                  <span key={y} style={{ background: 'rgba(74,222,128,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                    {y} = <FractionValue value={val} />
                  </span>
                ))}
              </div>
            </div>
          )}

          {variables && (
            <div
              style={{
                gridColumn: '1 / -1',
                borderTop: '1px solid rgba(74,222,128,0.28)',
                paddingTop: '12px',
                textAlign: 'center',
                fontSize: '1.05rem',
                lineHeight: 1.8,
                color: 'rgba(255,255,255,0.92)',
              }}
            >
              <span>Solution Vector: </span>
              <span style={{ fontStyle: 'italic' }}>(</span>
              {Object.keys(variables).map((name, index) => (
                <React.Fragment key={name}>
                  <span style={{ fontStyle: 'italic', color: '#4ade80' }}>{displayVariable(name)}</span>
                  {index < Object.keys(variables).length - 1 ? ', ' : ''}
                </React.Fragment>
              ))}
              <span style={{ fontStyle: 'italic' }}>) = (</span>
              {Object.values(variables).map((value, index) => (
                <React.Fragment key={index}>
                  <FractionValue value={value} />
                  {index < Object.keys(variables).length - 1 ? ', ' : ''}
                </React.Fragment>
              ))}
              <span style={{ fontStyle: 'italic' }}>)</span>
            </div>
          )}
        </div>
      )}

      {/* ── Step-by-Step Interactive Educational Breakdown (emathhelp.net style) ── */}
      {steps.length > 0 && currentStep && (
        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* ── Step Navigation Bar ── */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              background: '#0d2818',
              border: '1px solid rgba(74, 222, 128, 0.4)',
              borderRadius: '8px',
              padding: '10px 14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setActiveStep(0)}
                disabled={safeStep === 0}
                className="counter-btn"
                style={{ width: 'auto', padding: '0 8px', fontSize: '0.75rem', opacity: safeStep === 0 ? 0.3 : 1 }}
                title="First Step"
              >
                ⏮ FIRST
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(Math.max(0, safeStep - 1))}
                disabled={safeStep === 0}
                className="counter-btn"
                style={{ width: 'auto', padding: '0 10px', opacity: safeStep === 0 ? 0.3 : 1 }}
                title="Previous Step"
              >
                &larr; PREV
              </button>
            </div>

            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.92rem', fontWeight: 700, letterSpacing: '0.08em', color: '#4ade80' }}>
                STEP {safeStep + 1} OF {steps.length}
              </span>
              <span style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
                {currentStep.title || `Iteration ${safeStep}`}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setActiveStep(Math.min(steps.length - 1, safeStep + 1))}
                disabled={safeStep === steps.length - 1}
                className="counter-btn"
                style={{ width: 'auto', padding: '0 10px', opacity: safeStep === steps.length - 1 ? 0.3 : 1 }}
                title="Next Step"
              >
                NEXT &rarr;
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(steps.length - 1)}
                disabled={safeStep === steps.length - 1}
                className="counter-btn"
                style={{ width: 'auto', padding: '0 8px', fontSize: '0.75rem', opacity: safeStep === steps.length - 1 ? 0.3 : 1 }}
                title="Final Step"
              >
                FINAL ⏭
              </button>
            </div>
          </div>

          {/* ── Step Description Banner ── */}
          <div
            style={{
              background: 'rgba(20, 83, 45, 0.2)',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              borderRadius: '8px',
              padding: '12px 16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#4ade80', letterSpacing: '0.05em' }}>
                {currentStep.title}
              </span>
              {currentStep.feasibility && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: currentStep.feasibility.includes('Infeasible') ? 'rgba(248, 113, 113, 0.2)' : 'rgba(74, 222, 128, 0.2)',
                    border: `1px solid ${currentStep.feasibility.includes('Infeasible') ? '#f87171' : '#4ade80'}`,
                    color: currentStep.feasibility.includes('Infeasible') ? '#f87171' : '#4ade80',
                  }}
                >
                  Status: {currentStep.feasibility}
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: '0.86rem', color: 'rgba(255,255,255,0.88)', lineHeight: 1.5 }}>
              {currentStep.description}
            </p>
          </div>

          {/* ── Full Simplex Tableau with Pivot Highlighting ── */}
          {currentStep.tableau && (
            <div style={{ border: '1px solid rgba(74, 222, 128, 0.35)', borderRadius: '8px', overflow: 'hidden' }}>
              <div
                style={{
                  background: '#143521',
                  padding: '8px 12px',
                  borderBottom: '1px solid rgba(74, 222, 128, 0.4)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', color: '#4ade80' }}>
                  SIMPLEX TABLEAU
                </span>
                {pivot && (
                  <span style={{ fontSize: '0.78rem', color: '#fef08a' }}>
                    Entering: <strong>{pivot.enteringVar}</strong> | Leaving: <strong>{pivot.leavingVar}</strong> | Pivot Element: <strong>{pivot.value}</strong>
                  </span>
                )}
              </div>

              <div style={{ overflowX: 'auto', background: '#0a1f12' }}>
                {(() => {
                  const isRowRatioTest = currentStep.ratios?.some((r) => r?.row !== undefined);
                  const isColRatioTest = currentStep.ratios?.some((r) => r?.col !== undefined);

                  return (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ background: '#102d1b', borderBottom: '1.5px solid #4ade80' }}>
                          <th style={{ padding: '10px 12px', borderRight: '1px solid rgba(74, 222, 128, 0.3)', color: '#4ade80' }}>
                            Basis
                          </th>
                          {currentStep.colHeaders?.map((col, idx) => {
                            const isPivotCol = pivot && pivot.col === idx;
                            return (
                              <th
                                key={idx}
                                style={{
                                  padding: '10px 12px',
                                  borderRight: idx === currentStep.colHeaders.length - 1 ? 'none' : '1px solid rgba(74, 222, 128, 0.2)',
                                  color: isPivotCol ? '#22c55e' : '#4ade80',
                                  background: isPivotCol ? 'rgba(74, 222, 128, 0.18)' : 'transparent',
                                  boxShadow: isPivotCol ? 'inset 0 0 8px rgba(74,222,128,0.25)' : 'none',
                                }}
                              >
                                {col}
                                {isPivotCol && <span style={{ display: 'block', fontSize: '0.65rem', color: '#86efac' }}>↓ ENTERING</span>}
                              </th>
                            );
                          })}
                          {isRowRatioTest && (
                            <th style={{ padding: '10px 12px', color: '#4ade80', borderLeft: '1px solid rgba(74, 222, 128, 0.3)' }}>
                              Ratio Test (RHS / a<sub>ij</sub>)
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {currentStep.tableau?.map((row, rIdx) => {
                          const isZRow = rIdx === currentStep.tableau.length - 1;
                          const isPivotRow = pivot && pivot.row === rIdx;

                          return (
                            <tr
                              key={rIdx}
                              style={{
                                background: isPivotRow
                                  ? 'rgba(74, 222, 128, 0.12)'
                                  : isZRow
                                  ? 'rgba(74, 222, 128, 0.08)'
                                  : 'transparent',
                                borderBottom: isZRow ? 'none' : '1px solid rgba(74, 222, 128, 0.15)',
                                fontWeight: isZRow ? 'bold' : 'normal',
                              }}
                            >
                              {/* Basis Variable */}
                              <td
                                style={{
                                  padding: '9px 12px',
                                  borderRight: '1px solid rgba(74, 222, 128, 0.3)',
                                  color: isPivotRow ? '#86efac' : '#4ade80',
                                  fontWeight: 700,
                                  background: isPivotRow ? 'rgba(74, 222, 128, 0.2)' : 'transparent',
                                }}
                              >
                                {currentStep.basicVars?.[rIdx] || (isZRow ? (currentStep.title?.includes('Dual') ? 'W' : 'Z') : '')}
                                {isPivotRow && <span style={{ display: 'block', fontSize: '0.62rem', color: '#fef08a' }}>LEAVING →</span>}
                              </td>

                              {/* Data Cells */}
                              {row.map((val, cIdx) => {
                                const isPivotCell = pivot && pivot.row === rIdx && pivot.col === cIdx;
                                const isPivotCol = pivot && pivot.col === cIdx;

                                return (
                                  <td
                                    key={cIdx}
                                    style={{
                                      padding: '9px 12px',
                                      borderRight: cIdx === row.length - 1 ? 'none' : '1px solid rgba(74, 222, 128, 0.12)',
                                      color: isPivotCell
                                        ? '#052e16'
                                        : isZRow
                                        ? '#86efac'
                                        : 'rgba(255, 255, 255, 0.95)',
                                      background: isPivotCell
                                        ? '#4ade80'
                                        : isPivotCol
                                        ? 'rgba(74, 222, 128, 0.12)'
                                        : 'transparent',
                                      fontWeight: isPivotCell ? 800 : isZRow ? 700 : 400,
                                      boxShadow: isPivotCell ? '0 0 12px rgba(74, 222, 128, 0.8)' : 'none',
                                    }}
                                  >
                                    {isPivotCell ? (
                                      <span style={{ padding: '2px 4px', borderRadius: '3px' }} title="Pivot Element">
                                        <FractionValue value={val} />
                                      </span>
                                    ) : (
                                      <FractionValue value={val} />
                                    )}
                                  </td>
                                );
                              })}

                              {/* Ratio Test Column */}
                              {isRowRatioTest && (
                                <td
                                  style={{
                                    padding: '9px 12px',
                                    borderLeft: '1px solid rgba(74, 222, 128, 0.25)',
                                    color: isPivotRow ? '#fef08a' : 'rgba(74, 222, 128, 0.8)',
                                    fontWeight: isPivotRow ? 700 : 400,
                                  }}
                                >
                                  {(() => {
                                    const ratioItem = currentStep.ratios.find((r) => r?.row === rIdx);
                                    if (!ratioItem) return '—';
                                    if (ratioItem.value === '—') return '— (≤ 0)';
                                    return (
                                      <span>
                                        <FractionValue value={ratioItem.numerator} /> / <FractionValue value={ratioItem.denominator} /> ={' '}
                                        <strong><FractionValue value={ratioItem.value} /></strong>
                                        {ratioItem.isMin && (
                                          <span
                                            style={{
                                              marginLeft: '6px',
                                              fontSize: '0.7rem',
                                              background: '#fef08a',
                                              color: '#052e16',
                                              padding: '1px 5px',
                                              borderRadius: '3px',
                                              fontWeight: 800,
                                            }}
                                          >
                                            MIN
                                          </span>
                                        )}
                                      </span>
                                    );
                                  })()}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                      {isColRatioTest && (
                        <tfoot>
                          <tr style={{ background: '#102d1b', borderTop: '1.5px solid #4ade80' }}>
                            <td
                              style={{
                                padding: '9px 12px',
                                borderRight: '1px solid rgba(74, 222, 128, 0.3)',
                                color: '#4ade80',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                textAlign: 'left',
                              }}
                            >
                              Dual Ratio (|Z<sub>j</sub> / a<sub>rj</sub>|)
                            </td>
                            {currentStep.colHeaders?.map((col, idx) => {
                              const ratioItem = currentStep.ratios.find((r) => r?.col === idx);
                              const isPivot = pivot && pivot.col === idx;
                              return (
                                <td
                                  key={idx}
                                  style={{
                                    padding: '9px 12px',
                                    borderRight: idx === currentStep.colHeaders.length - 1 ? 'none' : '1px solid rgba(74, 222, 128, 0.2)',
                                    color: isPivot ? '#fef08a' : '#86efac',
                                    background: isPivot ? 'rgba(74, 222, 128, 0.2)' : 'transparent',
                                    fontSize: '0.8rem',
                                    fontWeight: isPivot ? 700 : 400,
                                  }}
                                >
                                  {ratioItem ? (
                                    <span>
                                      <FractionValue value={ratioItem.value} />
                                      {(ratioItem.isMin || isPivot) && (
                                        <span
                                          style={{
                                            marginLeft: '5px',
                                            fontSize: '0.65rem',
                                            background: '#fef08a',
                                            color: '#052e16',
                                            padding: '1px 4px',
                                            borderRadius: '3px',
                                            fontWeight: 800,
                                          }}
                                        >
                                          MIN
                                        </span>
                                      )}
                                    </span>
                                  ) : (
                                    '—'
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  );
                })()}
              </div>
            </div>
          )}

          {/* ── Row Operations Panel ── */}
          {currentStep.rowOperations && currentStep.rowOperations.length > 0 && (
            <div
              style={{
                background: '#092113',
                border: '1px solid rgba(74, 222, 128, 0.35)',
                borderRadius: '8px',
                padding: '12px 16px',
              }}
            >
              <span
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#4ade80',
                  letterSpacing: '0.08em',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                ELEMENTARY ROW OPERATIONS PERFORMED
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {currentStep.rowOperations.map((op, idx) => (
                  <div
                    key={idx}
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.88rem',
                      color: '#86efac',
                      background: 'rgba(74, 222, 128, 0.08)',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      borderLeft: '3px solid #4ade80',
                    }}
                  >
                    {op}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Educational Explanation Card ── */}
          {currentStep.explanation && (
            <div
              style={{
                background: 'rgba(10, 31, 18, 0.6)',
                border: '1px solid rgba(74, 222, 128, 0.3)',
                borderRadius: '8px',
                padding: '12px 16px',
              }}
            >
              <span
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#4ade80',
                  letterSpacing: '0.08em',
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                EDUCATIONAL ANALYSIS / EXPLANATION
              </span>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  lineHeight: 1.65,
                  color: 'rgba(255, 255, 255, 0.88)',
                }}
              >
                {currentStep.explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SolverResults;
