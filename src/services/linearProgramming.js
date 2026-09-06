const EPSILON = 1e-8;
const numeric = (value) => { const number = Number(value); return Number.isFinite(number) ? number : 0; };

function combinations(items, size, start = 0, chosen = [], result = []) {
  if (chosen.length === size) { result.push([...chosen]); return result; }
  for (let index = start; index <= items.length - (size - chosen.length); index += 1) {
    chosen.push(items[index]); combinations(items, size, index + 1, chosen, result); chosen.pop();
  }
  return result;
}

function solveSystem(matrix, values) {
  const size = values.length;
  const augmented = matrix.map((row, index) => [...row, values[index]]);
  for (let column = 0; column < size; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < size; row += 1) if (Math.abs(augmented[row][column]) > Math.abs(augmented[pivot][column])) pivot = row;
    if (Math.abs(augmented[pivot][column]) < EPSILON) return null;
    [augmented[column], augmented[pivot]] = [augmented[pivot], augmented[column]];
    const divisor = augmented[column][column];
    for (let cell = column; cell <= size; cell += 1) augmented[column][cell] /= divisor;
    for (let row = 0; row < size; row += 1) {
      if (row === column) continue;
      const factor = augmented[row][column];
      for (let cell = column; cell <= size; cell += 1) augmented[row][cell] -= factor * augmented[column][cell];
    }
  }
  return augmented.map((row) => row[size]);
}

function hasImprovingRay(normalized, objective, isMax, variableCount) {
  const directionalConstraints = [
    ...normalized.map((item) => ({ ...item, rhs: 0 })),
    { coefficients: new Array(variableCount).fill(1), relation: '=', rhs: 1 },
  ];
  const boundaries = [...directionalConstraints, ...Array.from({ length: variableCount }, (_, index) => ({
    coefficients: Array.from({ length: variableCount }, (_, coefficient) => coefficient === index ? 1 : 0), relation: '>=', rhs: 0,
  }))];
  return combinations(boundaries, variableCount).some((active) => {
    const direction = solveSystem(active.map((item) => item.coefficients), active.map((item) => item.rhs));
    if (!direction || !direction.every(Number.isFinite) || !direction.every((value) => value >= -EPSILON)) return false;
    const feasible = directionalConstraints.every(({ coefficients, relation, rhs }) => {
      const left = coefficients.reduce((total, coefficient, index) => total + coefficient * direction[index], 0);
      return relation === '<=' ? left <= rhs + EPSILON : relation === '>=' ? left >= rhs - EPSILON : Math.abs(left - rhs) <= EPSILON;
    });
    if (!feasible) return false;
    const improvement = objective.reduce((total, coefficient, index) => total + numeric(coefficient) * direction[index], 0);
    return isMax ? improvement > EPSILON : improvement < -EPSILON;
  });
}

/** Solves bounded, non-negative LP models with <=, >=, and = constraints. */
export function solveLinearProgram({ isMax = true, objective = [], constraints = [] }) {
  const variableCount = objective.length;
  if (!variableCount || !constraints.length) return { error: 'Please provide valid objective and constraints.' };
  const normalized = constraints.map((constraint) => ({
    coefficients: Array.from({ length: variableCount }, (_, index) => numeric(constraint.coefficients?.[index])),
    relation: constraint.relation || '<=', rhs: numeric(constraint.rhs),
  }));
  const boundaries = [...normalized, ...Array.from({ length: variableCount }, (_, index) => ({
    coefficients: Array.from({ length: variableCount }, (_, coefficient) => coefficient === index ? 1 : 0), relation: '>=', rhs: 0,
  }))];
  let best = null;
  const candidates = [];
  for (const active of combinations(boundaries, variableCount)) {
    const point = solveSystem(active.map((item) => item.coefficients), active.map((item) => item.rhs));
    if (!point || !point.every(Number.isFinite)) continue;
    const feasible = normalized.every(({ coefficients, relation, rhs }) => {
      const left = coefficients.reduce((total, coefficient, index) => total + coefficient * point[index], 0);
      return relation === '<=' ? left <= rhs + EPSILON : relation === '>=' ? left >= rhs - EPSILON : Math.abs(left - rhs) <= EPSILON;
    }) && point.every((value) => value >= -EPSILON);
    if (!feasible) continue;
    const value = objective.reduce((total, coefficient, index) => total + numeric(coefficient) * point[index], 0);
    candidates.push({ point, value });
    if (!best || (isMax ? value > best.value + EPSILON : value < best.value - EPSILON)) best = { point, value };
  }
  if (!best) return { status: 'Infeasible', message: 'No feasible solution exists.', steps: [] };
  if (hasImprovingRay(normalized, objective, isMax, variableCount)) {
    return { status: 'Unbounded', message: 'The objective can improve without limit while remaining feasible.', steps: [] };
  }
  const variables = Object.fromEntries(best.point.map((value, index) => [`X${index + 1}`, Number(Math.max(0, value).toFixed(6))]));
  const constraintTable = {
    description: 'Normalized model',
    explanation: 'All constraints are evaluated with non-negative decision variables before selecting the best feasible vertex.',
    colHeaders: [...Array.from({ length: variableCount }, (_, index) => `X${index + 1}`), 'Relation', 'RHS'],
    basicVars: normalized.map((_, index) => `C${index + 1}`),
    tableau: normalized.map((item) => [...item.coefficients, item.relation, item.rhs]),
    isTableau: false,
  };
  const vertexTable = {
    description: 'Feasible vertex evaluation',
    explanation: 'The objective is evaluated at every feasible corner point. The highlighted optimum is the best value for this model.',
    colHeaders: [...Array.from({ length: variableCount }, (_, index) => `X${index + 1}`), 'Z'],
    basicVars: candidates.slice(0, 30).map((_, index) => `V${index + 1}`),
    tableau: candidates.slice(0, 30).map((candidate) => [...candidate.point, candidate.value]),
    isTableau: false,
  };
  return { optimalZ: Number(best.value.toFixed(6)), variables, status: 'Optimal Solution Found', steps: [constraintTable, vertexTable] };
}
