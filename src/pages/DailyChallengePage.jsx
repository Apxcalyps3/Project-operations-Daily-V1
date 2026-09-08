/**
 * Daily Challenge Page
 * Provides daily LP and IP challenges with procedural models, countdown timer, and automated solution verification.
 */

import React, { useState } from 'react';
import Window from '../components/layout/Window';
import Navbar from '../components/layout/Navbar';
import DailyModelDisplay from '../components/challenge/DailyModelDisplay';
import SubmissionForm from '../components/challenge/SubmissionForm';
import CountdownTimer from '../components/challenge/CountdownTimer';
import { useAuth } from '../context/AuthContext';

import iconDailyLP from '../assets/icons/icon-dailylp.png';
import iconDailyIP from '../assets/icons/icon-dailyip.png';
import { getDailyLPModel, getDailyIPModel, markChallengeAsSolved } from '../services/api';
import { solveSimplex } from '../services/simplexEngine';
import { solveCuttingPlane } from '../services/cuttingPlaneEngine';
import { toFraction } from '../services/fractionUtils';

/* ============================================================
   Helper Functions
   ============================================================ */
const todayKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

/* ============================================================
   Daily Challenge Component
   ============================================================ */
const DailyChallengePage = () => {
  const { user } = useAuth();
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  const dateStr = todayKey();
  const activeModel = selectedChallenge === 'LP' ? getDailyLPModel(dateStr) : selectedChallenge === 'IP' ? getDailyIPModel(dateStr) : null;

  const verifyChallenge = (submission) => {
    const solver = selectedChallenge === 'IP' ? solveCuttingPlane : solveSimplex;
    const solution = solver({ method: 'BIG M', isMax: activeModel.isMax, objective: activeModel.rawObjective, constraints: activeModel.constraints });
    
    if (solution.error || !solution.optimalZ) {
      return { success: false, message: 'UNABLE TO VERIFY: MODEL HAS NO FEASIBLE SOLUTION.' };
    }

    const solZNum = toFraction(solution.optimalZ).toNumber();
    const matchesZ = Math.abs(submission.z - solZNum) < 0.01;

    const matchesVariables = submission.vars.every((val, index) => {
      const solVarStr = solution.variables?.[`X${index + 1}`] ?? '0';
      const solVarNum = toFraction(solVarStr).toNumber();
      return Math.abs(val - solVarNum) < 0.01;
    });

    if (!matchesZ || !matchesVariables) {
      return { success: false, message: 'INCORRECT. CHECK YOUR OBJECTIVE VALUE AND VARIABLE VALUES.' };
    }
    markChallengeAsSolved(selectedChallenge, todayKey(), { ...activeModel, solverType: selectedChallenge }, user?.uid);
    return { success: true, message: 'CORRECT — CHALLENGE COMPLETED AND RECORDED.' };
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Navbar
        backTo={selectedChallenge ? () => setSelectedChallenge(null) : '/'}
        label={selectedChallenge ? 'RETURN TO CHALLENGE SELECTION' : 'RETURN TO MAIN SYSTEM'}
      />

      {!selectedChallenge ? (
        <div className="solver-grid">
          <Window
            iconSrc={iconDailyLP}
            onClick={() => setSelectedChallenge('LP')}
            altText="Daily LP Challenge"
          />
          <Window
            iconSrc={iconDailyIP}
            onClick={() => setSelectedChallenge('IP')}
            altText="Daily IP Challenge"
          />
        </div>
      ) : (
        <div className="retro-window" style={{ maxWidth: '920px' }}>
          <div className="retro-window-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div className="window-dots">
                <div className="window-dot" />
                <div className="window-dot" />
                <div className="window-dot" />
              </div>
              <div className="window-title">{activeModel.title}</div>
            </div>

            <CountdownTimer />
          </div>

          <div
            className="retro-window-body"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '40px',
              padding: '30px'
            }}
          >
            <DailyModelDisplay model={activeModel} />
            <SubmissionForm
              numVars={activeModel.numVars}
              onSubmitSolution={verifyChallenge}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyChallengePage;
