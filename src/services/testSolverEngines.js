/**
 * Test Suite for Solver Engines
 * Used to verify mathematical accuracy of Big-M, Dual Simplex, and Primal-Dual engines
 */

import { solveBigM } from './bigMEngine.js';
import { solveDualSimplex } from './dualSimplexEngine.js';
import { solvePrimalDual } from './primalDualEngine.js';

// Test cases with known solutions
const testCases = [
  {
    name: 'Standard LP - Maximize',
    problem: {
      isMax: true,
      objective: [3, 2],
      constraints: [
        { coefficients: [1, 1], relation: '<=', rhs: 4 },
        { coefficients: [2, 1], relation: '<=', rhs: 5 }
      ]
    },
    expected: {
      optimalZ: 11,
      variables: { X1: 1, X2: 3 }
    }
  },
  {
    name: 'Minimization Problem',
    problem: {
      isMax: false,
      objective: [2, 3],
      constraints: [
        { coefficients: [1, 1], relation: '>=', rhs: 3 },
        { coefficients: [2, 1], relation: '>=', rhs: 4 }
      ]
    },
    expected: {
      optimalZ: 8,
      variables: { X1: 1, X2: 2 }
    }
  },
  {
    name: 'Mixed Constraints',
    problem: {
      isMax: true,
      objective: [4, 3],
      constraints: [
        { coefficients: [2, 1], relation: '<=', rhs: 8 },
        { coefficients: [1, 2], relation: '>=', rhs: 6 },
        { coefficients: [1, 1], relation: '=', rhs: 5 }
      ]
    },
    expected: {
      optimalZ: 18,
      variables: { X1: 3, X2: 2 }
    }
  },
  {
    name: 'Infeasible Problem',
    problem: {
      isMax: true,
      objective: [1, 1],
      constraints: [
        { coefficients: [1, 1], relation: '<=', rhs: 1 },
        { coefficients: [1, 1], relation: '>=', rhs: 3 }
      ]
    },
    expected: {
      status: 'Infeasible'
    }
  },
  {
    name: 'Unbounded Problem',
    problem: {
      isMax: true,
      objective: [1, 1],
      constraints: [
        { coefficients: [1, -1], relation: '<=', rhs: 1 }
      ]
    },
    expected: {
      status: 'Unbounded'
    }
  }
];

function runTest(testCase, engine) {
  console.log(`\n=== TEST: ${testCase.name} ===`);
  console.log('Problem:', testCase.problem);
  
  try {
    const result = engine(testCase.problem);
    console.log('Result:', result);
    
    if (testCase.expected.status) {
      if (result.status?.includes(testCase.expected.status)) {
        console.log('✅ PASS: Correctly identified as', testCase.expected.status);
        return true;
      } else {
        console.log('❌ FAIL: Expected', testCase.expected.status, 'but got', result.status);
        return false;
      }
    } else {
      const zMatch = Math.abs(parseFloat(result.optimalZ) - testCase.expected.optimalZ) < 0.01;
      const x1Match = Math.abs(parseFloat(result.variables.X1) - testCase.expected.variables.X1) < 0.01;
      const x2Match = Math.abs(parseFloat(result.variables.X2) - testCase.expected.variables.X2) < 0.01;
      
      if (zMatch && x1Match && x2Match) {
        console.log('✅ PASS: Correct solution');
        return true;
      } else {
        console.log('❌ FAIL: Incorrect solution');
        console.log('Expected Z:', testCase.expected.optimalZ, 'Got:', result.optimalZ);
        console.log('Expected X1:', testCase.expected.variables.X1, 'Got:', result.variables.X1);
        console.log('Expected X2:', testCase.expected.variables.X2, 'Got:', result.variables.X2);
        return false;
      }
    }
  } catch (error) {
    console.log('❌ FAIL: Exception thrown:', error.message);
    return false;
  }
}

export function testBigMEngine() {
  console.log('\n🧪 TESTING BIG-M ENGINE');
  let passed = 0;
  let failed = 0;
  
  testCases.forEach(testCase => {
    if (runTest(testCase, solveBigM)) {
      passed++;
    } else {
      failed++;
    }
  });
  
  console.log(`\n📊 BIG-M ENGINE RESULTS: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

export function testDualSimplexEngine() {
  console.log('\n🧪 TESTING DUAL SIMPLEX ENGINE');
  let passed = 0;
  let failed = 0;
  
  // Test cases suitable for dual simplex (≥ constraints)
  const dualTestCases = testCases.filter(tc => 
    tc.name.includes('Minimization') || tc.name.includes('Mixed')
  );
  
  dualTestCases.forEach(testCase => {
    if (runTest(testCase, solveDualSimplex)) {
      passed++;
    } else {
      failed++;
    }
  });
  
  console.log(`\n📊 DUAL SIMPLEX ENGINE RESULTS: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

export function testPrimalDualEngine() {
  console.log('\n🧪 TESTING PRIMAL-DUAL ENGINE');
  let passed = 0;
  let failed = 0;
  
  testCases.forEach(testCase => {
    if (runTest(testCase, solvePrimalDual)) {
      passed++;
    } else {
      failed++;
    }
  });
  
  console.log(`\n📊 PRIMAL-DUAL ENGINE RESULTS: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

export function runAllTests() {
  console.log('\n🚀 RUNNING ALL SOLVER ENGINE TESTS');
  
  const bigMResults = testBigMEngine();
  const dualResults = testDualSimplexEngine();
  const primalDualResults = testPrimalDualEngine();
  
  const totalPassed = bigMResults.passed + dualResults.passed + primalDualResults.passed;
  const totalFailed = bigMResults.failed + dualResults.failed + primalDualResults.failed;
  
  console.log(`\n🎯 TOTAL RESULTS: ${totalPassed} passed, ${totalFailed} failed`);
  
  return {
    bigM: bigMResults,
    dualSimplex: dualResults,
    primalDual: primalDualResults,
    total: { passed: totalPassed, failed: totalFailed }
  };
}