/**
 * Big-M Simplex Engine for Linear Programming
 * Generates educational step-by-step tableaus with explicit M-penalty handling,
 * artificial/surplus variables, pivot steps, row operations, and explanations.
 */

import { Fraction, toFraction, formatRowOp } from './fractionUtils.js';

/* ============================================================
   Big-M Simplex Algorithm Solver
   ============================================================ */
export function solveBigM({ isMax = false, objective = [], constraints = [] }) {
  const steps = [];
  const numVars = objective.length;
  const numConstraints = constraints.length;

  if (numVars === 0 || numConstraints === 0) {
    return { error: 'Please provide valid objective and constraints.' };
  }

  /* ------------------------------------------------------------
     1. Coefficient Parsing & RHS Normalization
     ------------------------------------------------------------ */
  const c = objective.map((val) => toFraction(val));
  const A = constraints.map((row) =>
    Array.from({ length: numVars }, (_, j) => toFraction(row.coefficients?.[j] ?? 0))
  );
  const b = constraints.map((row) => toFraction(row.rhs ?? 0));
  const rels = constraints.map((row) => row.relation || '<=');

  // If RHS is negative, multiply row by -1 and reverse inequality relation
  for (let i = 0; i < numConstraints; i++) {
    if (b[i].isNegative()) {
      b[i] = b[i].neg();
      for (let j = 0; j < numVars; j++) {
        A[i][j] = A[i][j].neg();
      }
      if (rels[i] === '<=') rels[i] = '>=';
      else if (rels[i] === '>=') rels[i] = '<=';
    }
  }

  /* ------------------------------------------------------------
     2. Auxiliary Variable Setup (Slack, Surplus, Artificial)
     ------------------------------------------------------------ */
  const cols = [];
  for (let j = 0; j < numVars; j++) {
    cols.push({ name: `X${j + 1}`, type: 'decision' });
  }

  const constraintVars = [];
  let slackCount = 0;
  let surplusCount = 0;
  let artificialCount = 0;

  for (let i = 0; i < numConstraints; i++) {
    const rel = rels[i];
    if (rel === '<=') {
      slackCount++;
      const sName = `S${slackCount}`;
      cols.push({ name: sName, type: 'slack' });
      constraintVars.push({ basic: sName, slack: sName, surplus: null, artificial: null });
    } else if (rel === '>=') {
      surplusCount++;
      artificialCount++;
      const eName = `E${surplusCount}`;
      const aName = `A${artificialCount}`;
      cols.push({ name: eName, type: 'surplus' });
      cols.push({ name: aName, type: 'artificial' });
      constraintVars.push({ basic: aName, slack: null, surplus: eName, artificial: aName });
    } else {
      artificialCount++;
      const aName = `A${artificialCount}`;
      cols.push({ name: aName, type: 'artificial' });
      constraintVars.push({ basic: aName, slack: null, surplus: null, artificial: aName });
    }
  }

  cols.push({ name: 'RHS', type: 'rhs' });
  const totalCols = cols.length;
  const colHeaders = cols.map((c) => c.name);

  // Big M value for exact rational calculation
  const BIG_M = new Fraction(100000, 1);

  /* ------------------------------------------------------------
     3. Initial Tableau Construction
     ------------------------------------------------------------ */
  let tableau = [];
  const basicVars = [];

  for (let i = 0; i < numConstraints; i++) {
    const row = new Array(totalCols).fill(null).map(() => new Fraction(0, 1));
    for (let j = 0; j < numVars; j++) {
      row[j] = A[i][j];
    }
    const cv = constraintVars[i];
    if (cv.slack) {
      const idx = colHeaders.indexOf(cv.slack);
      row[idx] = new Fraction(1, 1);
    }
    if (cv.surplus) {
      const idx = colHeaders.indexOf(cv.surplus);
      row[idx] = new Fraction(-1, 1);
    }
    if (cv.artificial) {
      const idx = colHeaders.indexOf(cv.artificial);
      row[idx] = new Fraction(1, 1);
    }
    row[totalCols - 1] = b[i];
    tableau.push(row);
    basicVars.push(cv.basic);
  }

  /* ------------------------------------------------------------
     4. Canonical Objective Row Transformation
     ------------------------------------------------------------ */
  const zRow = new Array(totalCols).fill(null).map(() => new Fraction(0, 1));
  for (let j = 0; j < numVars; j++) {
    zRow[j] = isMax ? c[j].neg() : c[j];
  }

  // Set initial penalty +M on all artificial variable columns
  for (let j = 0; j < totalCols - 1; j++) {
    if (colHeaders[j].startsWith('A')) {
      zRow[j] = BIG_M;
    }
  }

  // Substitute artificial variables out of objective row for canonical form
  for (let i = 0; i < numConstraints; i++) {
    if (constraintVars[i].artificial) {
      for (let j = 0; j < totalCols; j++) {
        zRow[j] = zRow[j].sub(BIG_M.mul(tableau[i][j]));
      }
    }
  }
  tableau.push(zRow);

  const formatTableauValues = (tab) =>
    tab.map((r) => r.map((cell) => cell.toDisplayString()));

  steps.push({
    stepIndex: 0,
    title: 'Tableau 0: Initial Big-M Form',
    description: `Constructed Big-M augmented system with ${slackCount} slack, ${surplusCount} surplus, and ${artificialCount} artificial variables. Penalty M = 100,000 applied to drive artificial variables out of basis.`,
    explanation: `Initial basis: { ${basicVars.join(', ')} }. Objective row Z was adjusted by substituting out the artificial variables so that the initial basic solution is represented in canonical form.`,
    tableau: formatTableauValues(tableau),
    basicVars: [...basicVars, 'Z'],
    colHeaders,
    pivot: null,
    ratios: null,
    rowOperations: ['Constructed Big-M canonical form by subtracting M * (artificial rows) from row Z.'],
    feasibility: 'Feasible (with artificials)',
    isOptimal: false,
  });

  /* ------------------------------------------------------------
     5. Iterative Simplex Pivoting
     ------------------------------------------------------------ */
  const MAX_ITERATIONS = 40;
  let iteration = 0;

  while (iteration < MAX_ITERATIONS) {
    iteration++;
    const currentZRow = tableau[numConstraints];

    // Entering variable selection: most negative reduced cost
    let pivotCol = -1;
    let mostNegative = new Fraction(0, 1);

    for (let j = 0; j < totalCols - 1; j++) {
      if (currentZRow[j].isNegative()) {
        if (pivotCol === -1 || currentZRow[j].sub(mostNegative).isNegative()) {
          mostNegative = currentZRow[j];
          pivotCol = j;
        }
      }
    }

    if (pivotCol === -1) {
      steps[steps.length - 1].isOptimal = true;
      steps[steps.length - 1].explanation += ' All coefficients in the objective row are non-negative. Big-M optimality achieved!';
      break;
    }

    const enteringVarName = colHeaders[pivotCol];

    // Minimum Ratio Test
    let pivotRow = -1;
    let minRatio = null;
    const ratioDetails = [];

    for (let i = 0; i < numConstraints; i++) {
      const coeff = tableau[i][pivotCol];
      const rhs = tableau[i][totalCols - 1];

      if (coeff.isPositive()) {
        const ratio = rhs.div(coeff);
        ratioDetails.push({
          row: i,
          numerator: rhs.toDisplayString(),
          denominator: coeff.toDisplayString(),
          value: ratio.toDisplayString(),
          isMin: false,
        });

        if (pivotRow === -1 || ratio.sub(minRatio).isNegative()) {
          minRatio = ratio;
          pivotRow = i;
        }
      } else {
        ratioDetails.push({
          row: i,
          numerator: rhs.toDisplayString(),
          denominator: coeff.toDisplayString(),
          value: '—',
          isMin: false,
        });
      }
    }

    if (pivotRow !== -1) {
      const match = ratioDetails.find((r) => r.row === pivotRow);
      if (match) match.isMin = true;
    }

    if (pivotRow === -1) {
      const unboundedStep = {
        stepIndex: steps.length,
        title: `Iteration ${iteration}: Unbounded Condition`,
        description: `Entering variable is ${enteringVarName}, but all column entries are ≤ 0.`,
        explanation: 'No positive divisor exists in the pivot column for the ratio test. The solution is unbounded.',
        tableau: formatTableauValues(tableau),
        basicVars: [...basicVars, 'Z'],
        colHeaders,
        pivot: null,
        ratios: ratioDetails,
        rowOperations: ['Ratio test failed: No valid pivot candidate.'],
        feasibility: 'Unbounded',
        isOptimal: false,
      };
      steps.push(unboundedStep);
      return { status: 'Unbounded', message: 'The problem is unbounded.', feasibility: 'Unbounded', steps };
    }

    const leavingVarName = basicVars[pivotRow];
    const pivotVal = tableau[pivotRow][pivotCol];

    const prevStep = steps[steps.length - 1];
    prevStep.pivot = {
      row: pivotRow,
      col: pivotCol,
      value: pivotVal.toDisplayString(),
      enteringVar: enteringVarName,
      leavingVar: leavingVarName,
    };
    prevStep.ratios = ratioDetails;
    prevStep.explanation += ` Entering variable: ${enteringVarName} (most negative reduced cost). Leaving variable: ${leavingVarName} (minimum positive ratio = ${minRatio.toDisplayString()}). Pivot element: Row ${pivotRow + 1} (${leavingVarName}), Col ${enteringVarName} = ${pivotVal.toDisplayString()}.`;

    // Calculate row operations
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

    // Apply Gauss-Jordan Elimination
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

    const hasNegative = tableau[numConstraints].slice(0, totalCols - 1).some((c) => c.isNegative());

    steps.push({
      stepIndex: steps.length,
      title: `Tableau ${iteration}: After Big-M Pivot on Row ${pivotRow + 1}, Col ${enteringVarName}`,
      description: `Pivoted on cell (${leavingVarName}, ${enteringVarName}) = ${pivotVal.toDisplayString()}. ${enteringVarName} enters basis, replacing ${leavingVarName}.`,
      explanation: hasNegative
        ? 'Row operations completed. Negative coefficients remain in row Z, continuing next Big-M iteration.'
        : 'Row operations completed. All row Z coefficients are non-negative. Optimality condition satisfied!',
      tableau: formatTableauValues(tableau),
      basicVars: [...basicVars, 'Z'],
      colHeaders,
      pivot: null,
      ratios: null,
      rowOperations: rowOps,
      feasibility: 'Feasible',
      isOptimal: !hasNegative,
    });
  }

  /* ------------------------------------------------------------
     6. Solution Extraction & Infeasibility Validation
     ------------------------------------------------------------ */
  // Check if any artificial variable remains in the basis with positive value
  for (let i = 0; i < numConstraints; i++) {
    if (basicVars[i].startsWith('A') && tableau[i][totalCols - 1].isPositive()) {
      return {
        status: 'Infeasible',
        message: `Artificial variable ${basicVars[i]} remains positive in the final basis with value ${tableau[i][totalCols - 1].toDisplayString()}. No feasible solution exists that satisfies all original constraints.`,
        feasibility: 'Infeasible',
        steps,
      };
    }
  }

  const variables = {};
  for (let j = 0; j < numVars; j++) {
    const varName = `X${j + 1}`;
    const rowIdx = basicVars.findIndex((v) => v === varName);
    variables[varName] = rowIdx !== -1 ? tableau[rowIdx][totalCols - 1].toDisplayString() : '0';
  }

  // Exact optimal Z calculation from decision variables
  let computedZ = new Fraction(0, 1);
  for (let j = 0; j < numVars; j++) {
    const xVal = toFraction(variables[`X${j + 1}`]);
    computedZ = computedZ.add(c[j].mul(xVal));
  }

  const slacks = {};
  for (let j = numVars; j < totalCols - 1; j++) {
    const name = colHeaders[j];
    const rowIdx = basicVars.findIndex((v) => v === name);
    slacks[name] = rowIdx !== -1 ? tableau[rowIdx][totalCols - 1].toDisplayString() : '0';
  }

  return {
    optimalZ: computedZ.toDisplayString(),
    optimalZNumeric: Number(computedZ.toNumber().toFixed(4)),
    variables,
    slacks,
    status: 'Optimal Solution Found via Big-M',
    feasibility: 'Feasible',
    steps,
  };
}
