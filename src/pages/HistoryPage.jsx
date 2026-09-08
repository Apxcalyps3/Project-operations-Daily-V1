/**
 * History Page
 * Displays user solve logs and dual calendar views for Daily LP & IP challenges.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Window from '../components/layout/Window';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import {
  getSolveHistory,
  getDailyLPModel,
  getDailyIPModel,
  getChallengeHistory,
  syncUserChallengesFromFirestore,
  syncUserSolveHistoryFromFirestore
} from '../services/api';

import iconSolverH from '../assets/icons/icon-solverh.png';
import iconChallengeH from '../assets/icons/icon-challengeh.png';

/* ============================================================
   Calendar Component
   ============================================================ */
const MONTHS = [
  'JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE',
  'JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER',
];

const DAY_NAMES = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

export const CalendarSection = ({ title, type }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();
  const todayKeyStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDate).padStart(2, '0')}`;

  const [month, setMonth] = useState(currentMonth);
  const [year, setYear]   = useState(currentYear);
  const [selectedDay, setSelectedDay] = useState(null);
  const [solvedDates, setSolvedDates] = useState({});

  const years = Array.from({ length: 4 }, (_, i) => currentYear - 3 + i);

  useEffect(() => {
    const localData = getChallengeHistory(type, user?.uid);
    setSolvedDates(localData || {});

    if (user?.uid) {
      syncUserChallengesFromFirestore(user.uid).then((allChallenges) => {
        const typeKey = type.toLowerCase();
        if (allChallenges && allChallenges[typeKey]) {
          setSolvedDates(allChallenges[typeKey]);
        }
      }).catch(console.error);
    }
  }, [type, user?.uid]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay    = new Date(year, month, 1).getDay();

  const dateKey = (day) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const isAtLatestMonth = year > currentYear || (year === currentYear && month >= currentMonth);

  const handleDayClick = (day) => {
    const key = dateKey(day);
    if (key > todayKeyStr) return;

    const data = solvedDates[key];
    const generatedModel = type === 'IP' ? getDailyIPModel(key) : getDailyLPModel(key);
    const isSolved = Boolean(data);
    const isToday = key === todayKeyStr;
    const isMissed = key < todayKeyStr && !isSolved;

    setSelectedDay({
      day,
      key,
      solvedAt: data?.solvedAt,
      model: data?.model || generatedModel,
      solved: isSolved,
      isToday,
      isMissed
    });
  };

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(y => y - 1);
    } else {
      setMonth(m => m - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (isAtLatestMonth) return;
    if (month === 11) {
      setMonth(0);
      setYear(y => y + 1);
    } else {
      setMonth(m => m + 1);
    }
    setSelectedDay(null);
  };

  return (
    <div className="calendar-table">
      {/* Calendar Header */}
      <div className="calendar-header">
        <div className="calendar-title">{title}</div>

        <div className="calendar-nav">
          <button className="calendar-nav-btn" onClick={prevMonth} aria-label="Previous month">‹</button>

          <div className="calendar-month-year">
            <select
              className="calendar-select"
              value={month}
              onChange={(e) => {
                const targetMonth = Number(e.target.value);
                if (year === currentYear && targetMonth > currentMonth) return;
                setMonth(targetMonth);
                setSelectedDay(null);
              }}
              aria-label="Select month"
            >
              {MONTHS.map((m, i) => {
                const isFutureMonth = year === currentYear && i > currentMonth;
                return (
                  <option key={m} value={i} disabled={isFutureMonth}>
                    {m}{isFutureMonth ? ' (LOCKED)' : ''}
                  </option>
                );
              })}
            </select>
            <select
              className="calendar-select"
              value={year}
              onChange={(e) => {
                const targetYear = Number(e.target.value);
                setYear(targetYear);
                if (targetYear === currentYear && month > currentMonth) {
                  setMonth(currentMonth);
                }
                setSelectedDay(null);
              }}
              aria-label="Select year"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button
            className="calendar-nav-btn"
            onClick={nextMonth}
            aria-label="Next month"
            disabled={isAtLatestMonth}
            style={{ opacity: isAtLatestMonth ? 0.3 : 1, cursor: isAtLatestMonth ? 'not-allowed' : 'pointer' }}
          >
            ›
          </button>
        </div>
      </div>

      {/* Day name headers */}
      <div className="calendar-grid">
        {DAY_NAMES.map((d) => (
          <div key={d} className="calendar-day-name">{d}</div>
        ))}

        {/* Empty cells for start offset */}
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`e-${i}`} className="calendar-day-cell empty" />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const key = dateKey(day);
          const isToday = key === todayKeyStr;
          const isFuture = key > todayKeyStr;
          const isPast = key < todayKeyStr;
          const solved = Boolean(solvedDates[key]);
          const missed = isPast && !solved;
          const isSelected = selectedDay?.day === day && selectedDay?.key === key;

          let cls = 'calendar-day-cell';
          if (isFuture) {
            cls += ' future';
          } else {
            if (isToday) cls += ' today';
            if (solved) cls += ' solved';
            if (missed) cls += ' missed';
            if (isSelected) cls += ' selected';
          }

          return (
            <div
              key={day}
              className={cls}
              onClick={isFuture ? undefined : () => handleDayClick(day)}
              role={isFuture ? 'cell' : 'button'}
              tabIndex={isFuture ? -1 : 0}
              onKeyDown={(e) => {
                if (!isFuture && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleDayClick(day);
                }
              }}
              aria-label={
                isFuture
                  ? `${MONTHS[month]} ${day}, ${year} — Locked (Future Challenge)`
                  : `${MONTHS[month]} ${day}, ${year}${solved ? ' — Completed ✓' : missed ? ' — Missed ✕' : ' — Active Today'}`
              }
              title={
                isFuture
                  ? `${MONTHS[month]} ${day}, ${year} — Locked (Future Challenge)`
                  : `${MONTHS[month]} ${day}, ${year}${solved ? ' — Completed ✓' : missed ? ' — Missed ✕' : ' — Active Today'}`
              }
            >
              <span className="calendar-cell-num">{day}</span>
              {solved && <span className="calendar-glyph glyph-solved" aria-hidden="true">✓</span>}
              {missed && <span className="calendar-glyph glyph-missed" aria-hidden="true">✕</span>}
              {isToday && !solved && <span className="calendar-glyph glyph-today" aria-hidden="true">☼</span>}
            </div>
          );
        })}
      </div>

      {/* Terminal Status Legend */}
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-sym glyph-today">☼</span>
          <span>TODAY</span>
        </div>
        <div className="legend-item">
          <span className="legend-sym glyph-solved">✓</span>
          <span>COMPLETED</span>
        </div>
        <div className="legend-item">
          <span className="legend-sym glyph-missed">✕</span>
          <span>MISSED</span>
        </div>
        <div className="legend-item">
          <span className="legend-sym glyph-future">·</span>
          <span>LOCKED</span>
        </div>
      </div>

      {/* Selected Day Full Problem Inspector */}
      {selectedDay && selectedDay.key <= todayKeyStr && (
        <div className="calendar-model-inspector">
          {/* Header */}
          <div className="inspector-header">
            <div className="inspector-date">
              {MONTHS[month]} {selectedDay.day}, {year} · {title}
            </div>
            <div className="inspector-status">
              {selectedDay.solved ? (
                <span className="status-tag tag-solved">COMPLETED ✓</span>
              ) : selectedDay.isToday ? (
                <span className="status-tag tag-today">ACTIVE TODAY ☼</span>
              ) : (
                <span className="status-tag tag-missed">MISSED ✕ (EXPIRED)</span>
              )}
            </div>
          </div>

          {/* Entire Problem: Objective and Constraints */}
          <div className="inspector-body">
            <div className="inspector-section-label">OBJECTIVE FUNCTION:</div>
            <div className="inspector-objective">
              {selectedDay.model?.objective || 'N/A'}
            </div>

            <div className="inspector-section-label" style={{ marginTop: '6px' }}>
              SUBJECT TO:
            </div>

            <div className="inspector-bracket-container">
              {/* Dynamic Scaling Curly Brace SVG */}
              <div className="inspector-curly-svg">
                <svg viewBox="0 0 20 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                  <path
                    d="M 18,2 C 10,2 8,24 8,44 C 8,48 4,50 1,50 C 4,50 8,52 8,56 C 8,76 10,98 18,98"
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>

              {/* All Constraints Inside Bracket */}
              <div className="inspector-constraints-list">
                {selectedDay.model?.constraints?.map((c, idx) => (
                  <div key={idx} className="inspector-constraint-row">
                    <span className="constraint-idx">{idx + 1}.</span>
                    <span className="constraint-text">{c.text}</span>
                  </div>
                ))}

                {/* Hardcoded Structural Constraints */}
                <div className="inspector-structural-divider">
                  <div className="inspector-constraint-row">
                    <span className="constraint-text">{selectedDay.model?.nonNegativity}</span>
                    <span className="structural-tag">[Non-Negativity]</span>
                  </div>
                  {selectedDay.model?.integerConstraint && (
                    <div className="inspector-constraint-row">
                      <span className="constraint-text">{selectedDay.model?.integerConstraint}</span>
                      <span className="structural-tag">[Integer]</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions & Solve Log */}
          <div className="inspector-footer">
            {selectedDay.solved && selectedDay.solvedAt && (
              <div className="inspector-solved-at">
                SOLVED AT: {new Date(selectedDay.solvedAt).toLocaleString()}
              </div>
            )}

            {selectedDay.isToday && !selectedDay.solved && (
              <button
                className="btn-solve-today"
                onClick={() => navigate('/challenge')}
                title="Launch solver for today's challenge"
              >
                SOLVE TODAY'S CHALLENGE →
              </button>
            )}

            <button
              className="btn-close-inspector"
              onClick={() => setSelectedDay(null)}
              aria-label="Close inspector"
            >
              [CLOSE INSPECTOR]
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================
   Recent Solves List Component
   ============================================================ */
const SolverHistoryList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const local = getSolveHistory(user?.uid);
    setHistory(local);

    if (user?.uid) {
      syncUserSolveHistoryFromFirestore(user.uid).then((remote) => {
        if (remote) setHistory(remote);
      }).catch(console.error);
    }
  }, [user?.uid]);

  const handleReload = (item) => {
    if (!item.details?.model) {
      navigate(item.type === 'IP' ? '/solver/ip' : '/solver/lp');
      return;
    }
    const model = item.details.model;
    navigate(model.solverType === 'IP' ? '/solver/ip' : '/solver/lp', {
      state: { model },
    });
  };

  return (
    <div className="retro-window" style={{ maxWidth: '880px' }}>
      <div className="retro-window-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="window-dots">
            <div className="window-dot" />
            <div className="window-dot" />
            <div className="window-dot" />
          </div>
          <div className="window-title">SOLVER HISTORY</div>
        </div>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', opacity: 0.8, color: '#4ade80' }}>
          {user ? `ACCOUNT: ${user.username || user.email}` : 'ACCOUNT: GUEST'}
        </div>
      </div>

      <div className="retro-window-body" style={{ minHeight: '320px' }}>
        {history.length === 0 ? (
          <div style={{ opacity: 0.45, fontSize: '0.9rem', letterSpacing: '0.1em' }}>
            NO SOLVE RECORDS FOUND. RUN AN ANALYSIS TO BEGIN.
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {history.map((item) => (
              <li key={item.id}>
                <div
                  className="solve-list-item"
                  onClick={() => handleReload(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleReload(item); }}
                  title="Click to reload this model into the solver"
                >
                  <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>•</span>
                  <span>{item.description}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.7rem', opacity: 0.5, letterSpacing: '0.05em' }}>
                    [RELOAD →]
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

/* ============================================================
   Challenge Calendar Dual View
   ============================================================ */
const ChallengeCalendarView = () => {
  const { user } = useAuth();

  return (
    <div className="retro-window" style={{ maxWidth: '920px' }}>
      <div className="retro-window-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="window-dots">
            <div className="window-dot" />
            <div className="window-dot" />
            <div className="window-dot" />
          </div>
          <div className="window-title">CHALLENGE HISTORY</div>
        </div>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', opacity: 0.8, color: '#4ade80' }}>
          {user ? `ACCOUNT: ${user.username || user.email}` : 'ACCOUNT: GUEST'}
        </div>
      </div>

      <div
        className="retro-window-body"
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '24px',
          padding: '28px 20px',
          maxHeight: 'none',
        }}
      >
        <CalendarSection title="DAILY LP" type="LP" />
        <CalendarSection title="DAILY IP" type="IP" />
      </div>
    </div>
  );
};

/* ============================================================
   History Page Root Component
   ============================================================ */
const HistoryPage = () => {
  const [view, setView] = useState(null);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Navbar
        backTo={view ? () => setView(null) : '/'}
        label={view ? 'RETURN TO HISTORY SELECTION' : 'RETURN TO MAIN SYSTEM'}
      />

      {!view ? (
        <div className="solver-grid">
          <Window
            iconSrc={iconSolverH}
            onClick={() => setView('solvers')}
            altText="Solver History"
          />
          <Window
            iconSrc={iconChallengeH}
            onClick={() => setView('challenges')}
            altText="Challenge History"
          />
        </div>
      ) : view === 'solvers' ? (
        <SolverHistoryList />
      ) : (
        <ChallengeCalendarView />
      )}
    </div>
  );
};

export default HistoryPage;
