import { solveBigM } from './bigMEngine';
import { solveDualSimplex } from './dualSimplexEngine';
import { solvePrimalDual } from './primalDualEngine';

/**
 * Unified Simplex Engine Entry Point
 * Routes requests to the appropriate solver algorithm.
 * All algorithms return an array of step-by-step tableaus.
 */
export function solveSimplex({ method, isMax, objective, constraints }) {
  if (method === 'DUAL SIMPLEX') {
    return solveDualSimplex({ isMax, objective, constraints });
  } else if (method === 'PRIMAL-DUAL') {
    return solvePrimalDual({ isMax, objective, constraints });
  } else {
    // Default for 'BIG M' and regular 'SIMPLEX'
    return solveBigM({ isMax, objective, constraints });
  }
}
