/**
 * Dual Simplex Engine for Linear Programming
 * Generates complete educational step-by-step tableaus, dual ratio tests,
 * row operations, and explanations (emathhelp.net style).
 */

import { Fraction, toFraction, formatRowOp } from './fractionUtils.js';

export function solveDualSimplex({ isMax = false, objective = [], constraints = [] }) {
  const steps = [];
  const numVars = objective.length;
  const numConstraints = constraints.length;

  if (numVars === 0 || numConstraints === 0) {
    return { error: 'Please provide valid objective and constraints.' };
  }

  const c = objective.map((val) => toFraction(val));
  const A = constraints.map((row) =>
    Array.from({ length: numVars }, (_, j) => toFraction(row.coefficients?.[j] ?? 0))
  );
  const b = constraints.map((row) => toFraction(row.rhs ?? 0));
  const rels = constraints.map((row) => row.relation || '<=');

  // Convert constraints to standard <= form for dual simplex
  // If >=, multiply row by -1
  for (let i = 0; i < numConstraints; i++) {
    if (rels[i] === '>=') {
      b[i] = b[i].neg();
      for (let j = 0; j < numVars; j++) {
        A[i][j] = A[i][j].neg();
      }
      rels[i] = '<=';
    }
  }

  const numSlack = numConstraints;
  const totalCols = numVars + numSlack + 1; // [X1..Xn, S1..Sm, RHS]

  const colHeaders = [
    ...Array.from({ length: numVars }, (_, i) => `X${i + 1}`),
    ...Array.from({ length: numSlack }, (_, i) => `S${i + 1}`),
    'RHS',
  ];

  let tableau = [];
  const basicVars = [];

  for (let i = 0; i < numConstraints; i++) {
    const row = new Array(totalCols).fill(null).map(() => new Fraction(0, 1));
    for (let j = 0; j < numVars; j++) {
      row[j] = A[i][j];
    }
    row[numVars + i] = new Fraction(1, 1);
    row[totalCols - 1] = b[i];
    tableau.push(row);
    basicVars.push(`S${i + 1}`);
  }

  // Objective Z-row:
  // For MIN: standard dual feasible form has non-negative coefficients in objective row
  // For MAX: indicators are -c[j]
  const zRow = new Array(totalCols).fill(null).map(() => new Fraction(0, 1));
  for (let j = 0; j < numVars; j++) {
    zRow[j] = isMax ? c[j].neg() : c[j];
  }
  tableau.push(zRow);

  const formatTableauValues = (tab) =>
    tab.map((r) => r.map((cell) => cell.toDisplayString()));

  steps.push({
    stepIndex: 0,
    title: 'Tableau 0: Initial Dual Simplex Form',
    description: 'Initial tableau constructed with slack variables. Constraints with ≥ relations were multiplied by -1 to establish dual feasibility.',
    explanation: `Basis: { ${basicVars.join(', ')} }. In the dual simplex method, we check for primal infeasibility by inspecting the RHS column for negative values.`,
    tableau: formatTableauValues(tableau),
    basicVars: [...basicVars, 'Z'],
    colHeaders,
    pivot: null,
    ratios: null,
    rowOperations: ['Standardized inequalities to ≤ and populated initial tableau.'],
    feasibility: tableau.slice(0, numConstraints).some((r) => r[totalCols - 1].isNegative())
      ? 'Primal Infeasible / Dual Feasible'
      : 'Feasible',
    isOptimal: false,
  });

  const MAX_ITERATIONS = 40;
  let iteration = 0;

  while (iteration < MAX_ITERATIONS) {
    iteration++;

    // 1. Leaving variable selection: row with most negative RHS
    let pivotRow = -1;
    let mostNegativeRhs = new Fraction(0, 1);

    for (let i = 0; i < numConstraints; i++) {
      const rhs = tableau[i][totalCols - 1];
      if (rhs.isNegative()) {
        if (pivotRow === -1 || rhs.sub(mostNegativeRhs).isNegative()) {
          mostNegativeRhs = rhs;
          pivotRow = i;
        }
      }
    }

    // If no negative RHS, primal feasibility reached! Current solution is optimal.
    if (pivotRow === -1) {
      steps[steps.length - 1].isOptimal = true;
      steps[steps.length - 1].explanation += ' All RHS values are non-negative (≥ 0). Primal feasibility and dual optimality have both been satisfied!';
      break;
    }

    const leavingVarName = basicVars[pivotRow];

    // 2. Entering variable selection: Dual Ratio Test min { |z_j / a_rj| for a_rj < 0 }
    let pivotCol = -1;
    let minDualRatio = null;
    const ratioDetails = [];
    const zRowCurrent = tableau[numConstraints];

    for (let j = 0; j < totalCols - 1; j++) {
      const a_rj = tableau[pivotRow][j];
      const z_j = zRowCurrent[j];

      if (a_rj.isNegative()) {
        const ratio = z_j.div(a_rj).abs();
        ratioDetails.push({
          col: j,
          colName: colHeaders[j],
          numerator: z_j.toDisplayString(),
          denominator: a_rj.toDisplayString(),
          value: ratio.toDisplayString(),
          isMin: false,
        });

        if (pivotCol === -1 || ratio.sub(minDualRatio).isNegative()) {
          minDualRatio = ratio;
          pivotCol = j;
        }
      }
    }

    // If no a_rj < 0, the problem has no feasible solution!
    if (pivotCol === -1) {
      const infeasibleStep = {
        stepIndex: steps.length,
        title: `Iteration ${iteration}: Infeasible Condition`,
        description: `Leaving variable is ${leavingVarName} with negative RHS (${mostNegativeRhs.toDisplayString()}), but all row entries a_${pivotRow + 1},j are non-negative (≥ 0).`,
        explanation: `Since there are no negative coefficients in row ${pivotRow + 1} to eliminate the negative RHS, no feasible solution exists for this linear program.`,
        tableau: formatTableauValues(tableau),
        basicVars: [...basicVars, 'Z'],
        colHeaders,
        pivot: null,
        ratios: ratioDetails,
        rowOperations: ['Dual ratio test failed: No negative pivot candidates.'],
        feasibility: 'Infeasible',
        isOptimal: false,
      };
      steps.push(infeasibleStep);

      return {
        status: 'Infeasible',
        message: 'No feasible solution exists. The constraint system is inconsistent.',
        feasibility: 'Infeasible',
        steps,
      };
    }

    if (pivotCol !== -1) {
      const match = ratioDetails.find((r) => r.col === pivotCol);
      if (match) match.isMin = true;
    }

    const enteringVarName = colHeaders[pivotCol];
    const pivotVal = tableau[pivotRow][pivotCol];

    // Annotate previous step
    const prevStep = steps[steps.length - 1];
    prevStep.pivot = {
      row: pivotRow,
      col: pivotCol,
      value: pivotVal.toDisplayString(),
      enteringVar: enteringVarName,
      leavingVar: leavingVarName,
    };
    prevStep.ratios = ratioDetails;
    prevStep.explanation += ` Leaving variable selected by most negative RHS: ${leavingVarName} (RHS = ${mostNegativeRhs.toDisplayString()}). Entering variable selected by dual ratio test: ${enteringVarName} (ratio = ${minDualRatio.toDisplayString()}). Pivot element is at row ${pivotRow + 1} (${leavingVarName}), column ${enteringVarName} with value ${pivotVal.toDisplayString()}.`;

    // Row operations
    const rowOps = [];
    const pivotRowLabel = `R${pivotRow + 1}`;

    if (pivotVal.toString() !== '1') {
      rowOps.push(`${pivotRowLabel} = ${new Fraction(1, 1).div(pivotVal).toDisplayString()} · ${pivotRowLabel}`);
    } else {
      rowOps.push(`${pivotRowLabel} is normalized (pivot = 1)`);
    }

    for (let i = 0; i < numConstraints; i++) {
      if (i !== pivotRow) {
        const factor = tableau[i][pivotCol];
        const op = formatRowOp(`R${i + 1}`, factor, pivotRowLabel);
        if (op) rowOps.push(op);
      }
    }
    const zFactor = tableau[numConstraints][pivotCol];
    const zOp = formatRowOp('RZ', zFactor, pivotRowLabel);
    if (zOp) rowOps.push(zOp);

    // Apply Gauss-Jordan elimination
    const newTableau = tableau.map((r) => r.map((cell) => new Fraction(cell.n, cell.d)));

    for (let j = 0; j < totalCols; j++) {
      newTableau[pivotRow][j] = newTableau[pivotRow][j].div(pivotVal);
    }

    for (let i = 0; i <= numConstraints; i++) {
      if (i !== pivotRow) {
        const factor = tableau[i][pivotCol];
        if (!factor.isZero()) {
          for (let j = 0; j < totalCols; j++) {
            newTableau[i][j] = newTableau[i][j].sub(factor.mul(newTableau[pivotRow][j]));
          }
        }
      }
    }

    basicVars[pivotRow] = enteringVarName;
    tableau = newTableau;

    const remainingNegativeRhs = tableau
      .slice(0, numConstraints)
      .some((r) => r[totalCols - 1].isNegative());

    steps.push({
      stepIndex: steps.length,
      title: `Tableau ${iteration}: After Dual Pivot on Row ${pivotRow + 1}, Col ${enteringVarName}`,
      description: `Pivoted on cell (${leavingVarName}, ${enteringVarName}) = ${pivotVal.toDisplayString()}. ${enteringVarName} enters basis, replacing ${leavingVarName}.`,
      explanation: remainingNegativeRhs
        ? `Row operations completed. Negative RHS values remain, continuing dual simplex iterations.`
        : `Row operations completed. All RHS values are now non-negative. Optimal basic feasible solution reached!`,
      tableau: formatTableauValues(tableau),
      basicVars: [...basicVars, 'Z'],
      colHeaders,
      pivot: null,
      ratios: null,
      rowOperations: rowOps,
      feasibility: remainingNegativeRhs ? 'Primal Infeasible' : 'Feasible',
      isOptimal: !remainingNegativeRhs,
    });
  }

  const variables = {};
  for (let j = 0; j < numVars; j++) {
    const varName = `X${j + 1}`;
    const rowIdx = basicVars.findIndex((v) => v === varName);
    variables[varName] = rowIdx !== -1 ? tableau[rowIdx][totalCols - 1].toDisplayString() : '0';
  }

  // Exact optimal Z calculation from decision variables: Z* = sum(c_j * X_j*)
  let computedZ = new Fraction(0, 1);
  for (let j = 0; j < numVars; j++) {
    const xVal = toFraction(variables[`X${j + 1}`]);
    computedZ = computedZ.add(c[j].mul(xVal));
  }

  const slacks = {};
  for (let i = 0; i < numSlack; i++) {
    const slackName = `S${i + 1}`;
    const rowIdx = basicVars.findIndex((v) => v === slackName);
    slacks[slackName] = rowIdx !== -1 ? tableau[rowIdx][totalCols - 1].toDisplayString() : '0';
  }

  return {
    optimalZ: computedZ.toDisplayString(),
    optimalZNumeric: Number(computedZ.toNumber().toFixed(4)),
    variables,
    slacks,
    status: 'Optimal Solution Found via Dual Simplex',
    feasibility: 'Feasible',
    steps,
  };
}
