import React, { useState } from 'react';
import { runAllTests } from '../services/testSolverEngines';

const TestPage = () => {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunTests = () => {
    setIsRunning(true);
    setTestResults(null);
    
    // Small delay to allow UI to update
    setTimeout(() => {
      try {
        const results = runAllTests();
        setTestResults(results);
      } catch (error) {
        console.error('Test execution failed:', error);
        setTestResults({ error: error.message });
      }
      setIsRunning(false);
    }, 100);
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'monospace',
      color: '#4ade80',
      backgroundColor: '#0a1f12'
    }}>
      <h1 style={{ borderBottom: '2px solid #4ade80', paddingBottom: '10px' }}>
        🔧 Solver Engine Test Suite
      </h1>
      
      <div style={{ margin: '20px 0' }}>
        <button
          onClick={handleRunTests}
          disabled={isRunning}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: isRunning ? '#333' : '#4ade80',
            color: isRunning ? '#888' : '#000',
            border: '2px solid #4ade80',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontFamily: 'monospace',
            fontWeight: 'bold'
          }}
        >
          {isRunning ? '⏳ Running Tests...' : '🚀 Run All Tests'}
        </button>
      </div>

      {testResults && (
        <div style={{ 
          marginTop: '20px',
          padding: '15px',
          border: '1px solid #4ade80',
          borderRadius: '8px',
          backgroundColor: 'rgba(74, 222, 128, 0.1)'
        }}>
          {testResults.error ? (
            <div style={{ color: '#f87171' }}>
              <h3>❌ Test Execution Error</h3>
              <p>{testResults.error}</p>
            </div>
          ) : (
            <div>
              <h2 style={{ marginTop: 0 }}>📊 Test Results</h2>
              
              <div style={{ marginBottom: '20px', fontSize: '18px' }}>
                <strong>Total:</strong> {testResults.total.passed} ✅ passed, {testResults.total.failed} ❌ failed
              </div>

              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ borderBottom: '1px solid #4ade80', paddingBottom: '5px' }}>
                  Big-M Engine
                </h3>
                <p>{testResults.bigM.passed} ✅ passed, {testResults.bigM.failed} ❌ failed</p>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ borderBottom: '1px solid #4ade80', paddingBottom: '5px' }}>
                  Dual Simplex Engine
                </h3>
                <p>{testResults.dualSimplex.passed} ✅ passed, {testResults.dualSimplex.failed} ❌ failed</p>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ borderBottom: '1px solid #4ade80', paddingBottom: '5px' }}>
                  Primal-Dual Engine
                </h3>
                <p>{testResults.primalDual.passed} ✅ passed, {testResults.primalDual.failed} ❌ failed</p>
              </div>

              <div style={{ marginTop: '20px', padding: '10px', fontSize: '14px', opacity: 0.8 }}>
                <p>💡 Check the browser console (F12) for detailed test output and step-by-step debugging information.</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '30px', fontSize: '14px', opacity: 0.7 }}>
        <h3>📋 Test Coverage</h3>
        <ul>
          <li>Standard LP maximization problems</li>
          <li>Minimization problems</li>
          <li>Mixed constraints (≤, ≥, =)</li>
          <li>Infeasible problem detection</li>
          <li>Unbounded problem detection</li>
          <li>Fraction arithmetic validation</li>
          <li>Step-by-step tableau generation</li>
        </ul>
      </div>
    </div>
  );
};

export default TestPage;