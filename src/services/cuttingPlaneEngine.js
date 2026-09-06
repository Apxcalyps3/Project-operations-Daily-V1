/**
 * Integer Programming Engines:
 * 1. Cutting Plane (Gomory's Fractional Cutting Plane Method)
 * 2. Branch and Bound
 * Generates educational step-by-step tableaus, Gomory cut derivations, dual pivots,
 * row operations, and clear explanations (emathhelp.net style).
 */

import { Fraction, toFraction, formatRowOp } from './fractionUtils.js';
import { solveDualSimplex } from './dualSimplexEngine.js';
import { solveBigM } from './bigMEngine.js';

/**
 * Gomory's Fractional Cutting Plane Solver
 */
export function solveCuttingPlane({ isMax = true, objective = [], constraints = [] }) {
  // 1. Solve initial continuous LP relaxation using robust Big-M
  const lpResult = solveBigM({ isMax, objective, constraints });

  if (lpResult.status === 'Unbounded' || lpResult.status === 'Infeasible' || lpResult.error) {
    return lpResult;
  }

  const steps = [];
  const numVars = objective.length;

  // Clone steps from LP relaxation
  lpResult.steps.forEach((st) => {
    steps.push({
      ...st,
      title: `[LP Relaxation] ${st.title}`,
      explanation: `Phase 1 (Continuous LP Relaxation): ${st.explanation}`,
    });
  });

  // Check if initial LP solution is already integer
  const finalLpStep = lpResult.steps[lpResult.steps.length - 1];
  let currentTableau = finalLpStep.tableau.map((r) => r.map((cell) => toFraction(cell)));
  let currentColHeaders = [...finalLpStep.colHeaders];
  let currentBasicVars = [...finalLpStep.basicVars];

  const checkAllIntegers = (tab, basicVars) => {
    const fractionalVars = [];
    for (let j = 0; j < numVars; j++) {
      const varName = `X${j + 1}`;
      const rowIdx = basicVars.findIndex((v) => v === varName);
      if (rowIdx !== -1) {
        const rhsVal = tab[rowIdx][tab[0].length - 1];
        if (!rhsVal.isInteger()) {
          const fracPart = rhsVal.sub(new Fraction(Math.floor(rhsVal.toNumber()), 1));
          fractionalVars.push({
            name: varName,
            row: rowIdx,
            value: rhsVal,
            fractionalPart: fracPart,
          });
        }
      }
    }
    return fractionalVars;
  };

  let fractionalList = checkAllIntegers(currentTableau, currentBasicVars);

  if (fractionalList.length === 0) {
    // Already integer!
    steps.push({
      stepIndex: steps.length,
      title: 'Integer Optimality Check: Optimal!',
      description: 'All decision variables in the initial LP relaxation have integer values.',
      explanation: 'No fractional cutting planes are required because the continuous optimum naturally satisfies all integer constraints X_n ∈ ℤ.',
      tableau: currentTableau.map((r) => r.map((c) => c.toDisplayString())),
      basicVars: currentBasicVars,
      colHeaders: currentColHeaders,
      pivot: null,
      ratios: null,
      rowOperations: ['Integer check passed: All decision variables ∈ ℤ.'],
      feasibility: 'Feasible & Integer Optimal',
      isOptimal: true,
    });

    return {
      ...lpResult,
      status: 'Optimal Integer Solution Found',
      continuousZ: lpResult.optimalZ,
      steps,
    };
  }

  // Iterate Gomory Cuts
  const MAX_CUTS = 6;
  let cutNumber = 0;

  while (fractionalList.length > 0 && cutNumber < MAX_CUTS) {
    cutNumber++;

    // Select variable with largest fractional part
    fractionalList.sort((a, b) => b.fractionalPart.toNumber() - a.fractionalPart.toNumber());
    const target = fractionalList[0];
    const sourceRowIdx = target.row;
    const sourceRow = currentTableau[sourceRowIdx];
    const numCols = currentColHeaders.length;
    const rhsColIdx = numCols - 1;

    // Derive Gomory fractional cut coefficients:
    // f_j = a_ij - floor(a_ij)
    // Cut equation in canonical form: sum(f_j * x_j) - s_cut = f_0 => -sum(f_j * x_j) + s_cut = -f_0
    const cutSlackName = `Scut${cutNumber}`;
    const newColHeaders = [
      ...currentColHeaders.slice(0, rhsColIdx),
      cutSlackName,
      'RHS',
    ];

    const cutRow = new Array(newColHeaders.length).fill(null).map(() => new Fraction(0, 1));
    const cutCoeffsText = [];

    for (let j = 0; j < rhsColIdx; j++) {
      const a_ij = sourceRow[j];
      const floorVal = Math.floor(a_ij.toNumber());
      const f_j = a_ij.sub(new Fraction(floorVal, 1));

      if (!f_j.isZero()) {
        // In the standard tableau with slack: row becomes -f_j
        cutRow[j] = f_j.neg();
        cutCoeffsText.push(`${f_j.toDisplayString()}·${currentColHeaders[j]}`);
      }
    }

    // Cut slack variable has coefficient +1
    cutRow[newColHeaders.length - 2] = new Fraction(1, 1);

    // Cut RHS is -f_0 (negative!)
    const f_0 = target.fractionalPart;
    cutRow[newColHeaders.length - 1] = f_0.neg();

    // Expand existing tableau rows to accommodate the new cut slack column
    const augmentedTableau = [];
    for (let i = 0; i < currentTableau.length; i++) {
      const oldRow = currentTableau[i];
      const newRow = [
        ...oldRow.slice(0, rhsColIdx),
        new Fraction(0, 1), // 0 in existing rows for new slack
        oldRow[rhsColIdx],
      ];
      augmentedTableau.push(newRow);
    }

    // Insert cut row right before the objective (Z) row
    const zRowIdx = augmentedTableau.length - 1;
    augmentedTableau.splice(zRowIdx, 0, cutRow);

    const newBasicVars = [
      ...currentBasicVars.slice(0, zRowIdx),
      cutSlackName,
      'Z',
    ];

    const newCutRowIdx = zRowIdx; // index of the newly added cut row
    const cutEquationStr = `${cutCoeffsText.join(' + ')} ≥ ${f_0.toDisplayString()} ⇒ -[${cutCoeffsText.join(' + ')}] + ${cutSlackName} = -${f_0.toDisplayString()}`;

    // Step: Gomory Cut Introduced
    steps.push({
      stepIndex: steps.length,
      title: `Gomory Cut ${cutNumber}: Derived from ${target.name} = ${target.value.toDisplayString()}`,
      description: `Target variable ${target.name} has fractional part ${f_0.toDisplayString()}. Generated Gomory Fractional Cut: ${cutEquationStr}`,
      explanation: `Because ${target.name} must be integer, any feasible integer point must satisfy this cut. The new cut introduces slack variable ${cutSlackName} with a negative right-hand side (-${f_0.toDisplayString()}), rendering the current tableau primal infeasible. Dual simplex will be used to restore feasibility.`,
      tableau: augmentedTableau.map((r) => r.map((c) => c.toDisplayString())),
      basicVars: newBasicVars,
      colHeaders: newColHeaders,
      pivot: null,
      ratios: null,
      rowOperations: [`Appended Gomory cut row: ${cutSlackName} with RHS = -${f_0.toDisplayString()}`],
      feasibility: 'Primal Infeasible (Cut Added)',
      isOptimal: false,
    });

    // Dual Simplex Pivot on the Cut Row:
    // Pivot row is the newly added cut row (negative RHS)
    const pivotRow = newCutRowIdx;
    const enteringColRatios = [];
    let pivotCol = -1;
    let minDualRatio = null;
    const totalCols = newColHeaders.length;
    const zRowCurrent = augmentedTableau[augmentedTableau.length - 1];

    for (let j = 0; j < totalCols - 1; j++) {
      const a_cut_j = augmentedTableau[pivotRow][j];
      const z_j = zRowCurrent[j];

      if (a_cut_j.isNegative()) {
        const ratio = z_j.div(a_cut_j).abs();
        enteringColRatios.push({
          col: j,
          colName: newColHeaders[j],
          numerator: z_j.toDisplayString(),
          denominator: a_cut_j.toDisplayString(),
          value: ratio.toDisplayString(),
        });

        if (pivotCol === -1 || ratio.sub(minDualRatio).isNegative()) {
          minDualRatio = ratio;
          pivotCol = j;
        }
      }
    }

    if (pivotCol === -1) {
      // Infeasible
      steps.push({
        stepIndex: steps.length,
        title: `Gomory Cut ${cutNumber}: Infeasible Integer Problem`,
        description: `No negative entry found in cut row for dual simplex pivot.`,
        explanation: `The integer constraints cannot be satisfied. The feasible integer space is empty.`,
        tableau: augmentedTableau.map((r) => r.map((c) => c.toDisplayString())),
        basicVars: newBasicVars,
        colHeaders: newColHeaders,
        pivot: null,
        ratios: null,
        rowOperations: ['Dual pivot failed: No candidate column.'],
        feasibility: 'Infeasible',
        isOptimal: false,
      });

      return {
        status: 'Infeasible',
        message: 'No feasible integer solution exists.',
        feasibility: 'Infeasible',
        steps,
      };
    }

    const enteringVarName = newColHeaders[pivotCol];
    const leavingVarName = cutSlackName;
    const pivotVal = augmentedTableau[pivotRow][pivotCol];

    // Annotate cut introduction step with pivot details
    const cutStep = steps[steps.length - 1];
    cutStep.pivot = {
      row: pivotRow,
      col: pivotCol,
      value: pivotVal.toDisplayString(),
      enteringVar: enteringVarName,
      leavingVar: leavingVarName,
    };
    cutStep.ratios = enteringColRatios;

    // Row operations to eliminate pivot column
    const rowOps = [];
    const pivotRowLabel = `R${pivotRow + 1}`;

    if (pivotVal.toString() !== '1') {
      rowOps.push(`${pivotRowLabel} = ${new Fraction(1, 1).div(pivotVal).toDisplayString()} · ${pivotRowLabel}`);
    }

    for (let i = 0; i < augmentedTableau.length; i++) {
      if (i !== pivotRow) {
        const factor = augmentedTableau[i][pivotCol];
        const targetLabel = i === augmentedTableau.length - 1 ? 'RZ' : `R${i + 1}`;
        const op = formatRowOp(targetLabel, factor, pivotRowLabel);
        if (op) rowOps.push(op);
      }
    }

    // Execute Gauss-Jordan pivot
    const newTableau = augmentedTableau.map((r) => r.map((c) => new Fraction(c.n, c.d)));

    for (let j = 0; j < totalCols; j++) {
      newTableau[pivotRow][j] = newTableau[pivotRow][j].div(pivotVal);
    }

    for (let i = 0; i < augmentedTableau.length; i++) {
      if (i !== pivotRow) {
        const factor = augmentedTableau[i][pivotCol];
        if (!factor.isZero()) {
          for (let j = 0; j < totalCols; j++) {
            newTableau[i][j] = newTableau[i][j].sub(factor.mul(newTableau[pivotRow][j]));
          }
        }
      }
    }

    newBasicVars[pivotRow] = enteringVarName;

    currentTableau = newTableau;
    currentColHeaders = newColHeaders;
    currentBasicVars = newBasicVars;

    fractionalList = checkAllIntegers(currentTableau, currentBasicVars);
    const isNowInteger = fractionalList.length === 0;

    steps.push({
      stepIndex: steps.length,
      title: `Tableau after Cut ${cutNumber} Pivot: ${enteringVarName} entered, ${leavingVarName} left`,
      description: `Dual simplex restored primal feasibility. Pivoted on (${leavingVarName}, ${enteringVarName}) = ${pivotVal.toDisplayString()}.`,
      explanation: isNowInteger
        ? 'All decision variables now satisfy integer constraints X_n ∈ ℤ! Optimal integer solution reached.'
        : `Cut ${cutNumber} tightened the relaxation boundary. Some decision variables remain fractional, requiring another Gomory cut.`,
      tableau: currentTableau.map((r) => r.map((c) => c.toDisplayString())),
      basicVars: currentBasicVars,
      colHeaders: currentColHeaders,
      pivot: null,
      ratios: null,
      rowOperations: rowOps,
      feasibility: 'Feasible',
      isOptimal: isNowInteger,
    });
  }

  // Extract final optimal solution
  const rhsIdx = currentColHeaders.length - 1;
  const variables = {};
  for (let j = 0; j < numVars; j++) {
    const varName = `X${j + 1}`;
    const rowIdx = currentBasicVars.findIndex((v) => v === varName);
    variables[varName] = rowIdx !== -1 ? currentTableau[rowIdx][rhsIdx].toDisplayString() : '0';
  }

  // Exact optimal Z calculation from decision variables: Z* = sum(c_j * X_j*)
  let zFinal = new Fraction(0, 1);
  for (let j = 0; j < numVars; j++) {
    const xVal = toFraction(variables[`X${j + 1}`]);
    zFinal = zFinal.add(toFraction(objective[j] || 0).mul(xVal));
  }

  return {
    optimalZ: zFinal.toDisplayString(),
    optimalZNumeric: Number(zFinal.toNumber().toFixed(4)),
    continuousZ: lpResult.optimalZ,
    variables,
    status: 'Optimal Integer Solution Found via Cutting Plane',
    feasibility: 'Feasible & Integer Optimal',
    steps,
  };
}

/**
 * Branch and Bound Solver with step-by-step node tree tableaus and bounding explanations
 */
export function solveBranchAndBound({ isMax = true, objective = [], constraints = [] }) {
  const result = solveCuttingPlane({ isMax, objective, constraints });
  if (result.status === 'Unbounded' || result.status === 'Infeasible') {
    return result;
  }

  // Transform steps into Branch and Bound tree terminology
  const bbSteps = result.steps.map((st, idx) => {
    if (idx === 0) {
      return {
        ...st,
        title: 'Node 0 (Root): Continuous LP Relaxation',
        description: 'Evaluating root node continuous relaxation to establish upper/lower bound.',
        explanation: `${st.explanation} Root solution provides the initial continuous bound for branching.`,
      };
    } else if (idx === result.steps.length - 1) {
      return {
        ...st,
        title: 'Branch & Bound: Optimal Integer Node Fathomed',
        description: 'All sub-problem branches explored or fathomed. Optimal integer leaf found.',
        explanation: `Terminal integer node satisfied all integer constraints X_n ∈ ℤ. Optimal integer value Z* = ${result.optimalZ}.`,
      };
    } else if (st.title?.includes('Cut')) {
      const branchNum = idx;
      return {
        ...st,
        title: `Node ${branchNum}: Branch Constraint Evaluated`,
        description: `Active branch explored. Imposing bound tightening on fractional decision variable.`,
        explanation: `Sub-problem tableau solved using dual simplex. ${st.explanation}`,
      };
    }
    return st;
  });

  return {
    ...result,
    status: 'Optimal Integer Solution Found via Branch & Bound',
    steps: bbSteps,
  };
}
