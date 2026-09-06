import React, { useState } from 'react';
import Window from '../components/layout/Window';
import Navbar from '../components/layout/Navbar';
import DailyModelDisplay from '../components/challenge/DailyModelDisplay';
import SubmissionForm from '../components/challenge/SubmissionForm';
import CountdownTimer from '../components/challenge/CountdownTimer';

import iconDailyLP from '../assets/icons/icon-dailylp.png';
import iconDailyIP from '../assets/icons/icon-dailyip.png';
import { DAILY_LP_MODEL, DAILY_IP_MODEL, markChallengeAsSolved } from '../services/api';
import { solveBigM } from '../services/bigMEngine';
import { solveCuttingPlane } from '../services/cuttingPlaneEngine';

const todayKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const DailyChallengePage = () => {
  const [selectedChallenge, setSelectedChallenge] = useState(null); // 'LP' or 'IP'

  const activeModel = selectedChallenge === 'LP' ? DAILY_LP_MODEL : selectedChallenge === 'IP' ? DAILY_IP_MODEL : null;

  const verifyChallenge = (submission) => {
    const solver = selectedChallenge === 'IP' ? solveCuttingPlane : solveBigM;
    const solution = solver({ isMax: activeModel.isMax, objective: activeModel.rawObjective, constraints: activeModel.constraints });
    const matchesZ = Math.abs(submission.z - solution.optimalZ) < 0.001;
    const matchesVariables = submission.vars.every((value, index) => Math.abs(value - solution.variables[`X${index + 1}`]) < 0.001);
    if (!matchesZ || !matchesVariables) return { success: false, message: 'INCORRECT. CHECK YOUR OBJECTIVE VALUE AND VARIABLE VALUES.' };
    markChallengeAsSolved(selectedChallenge, todayKey(), { ...activeModel, solverType: selectedChallenge });
    return { success: true, message: 'CORRECT — CHALLENGE COMPLETED AND RECORDED.' };
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Navbar
        backTo={selectedChallenge ? () => setSelectedChallenge(null) : '/'}
        label={selectedChallenge ? 'RETURN TO CHALLENGE SELECTION' : 'RETURN TO MAIN SYSTEM'}
      />

      {!selectedChallenge ? (
        /* Page 5: Daily Challenge Selection */
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
        /* Pages 9 & 10: Daily Model Challenge View */
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
