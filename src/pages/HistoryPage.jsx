import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Window from '../components/layout/Window';
import Navbar from '../components/layout/Navbar';
import { getSolveHistory, getDailyLPModel, getDailyIPModel } from '../services/api';

import iconSolverH from '../assets/icons/icon-solverh.png';
import iconChallengeH from '../assets/icons/icon-challengeh.png';

/* ─────────────────────────────────────────────────
   Calendar Component — matches PDF Page 10
   Interactive Month/Year navigation
   Marks dates from localStorage as Solved/Missed
───────────────────────────────────────────────── */
const MONTHS = [
  'JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE',
  'JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER',
];

const DAY_NAMES = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

const CalendarSection = ({ title, storageKey, type }) => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());    // 0-indexed
  const [year, setYear]   = useState(now.getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);
  const [solvedDates, setSolvedDates] = useState({});    // { 'YYYY-MM-DD': { model, ... } }

  const currentYear = now.getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // Load solved dates from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setSolvedDates(raw ? JSON.parse(raw) : {});
    } catch {
      setSolvedDates({});
    }
  }, [storageKey]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay    = new Date(year, month, 1).getDay(); // 0 = Sun

  const dateKey = (day) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const isPast = (day) => {
    const d = new Date(year, month, day);
    d.setHours(23, 59, 59);
    return d < now;
  };

  const isToday = (day) =>
    day === now.getDate() && month === now.getMonth() && year === now.getFullYear();

  const handleDayClick = (day) => {
    const key = dateKey(day);
    const data = solvedDates[key];
    const generatedModel = type === 'IP' ? getDailyIPModel(key) : getDailyLPModel(key);
    setSelectedDay({ day, key, ...data, model: data?.model || generatedModel, solved: Boolean(data) });
  };

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
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
              onChange={(e) => { setMonth(Number(e.target.value)); setSelectedDay(null); }}
              aria-label="Select month"
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
            <select
              className="calendar-select"
              value={year}
              onChange={(e) => { setYear(Number(e.target.value)); setSelectedDay(null); }}
              aria-label="Select year"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button className="calendar-nav-btn" onClick={nextMonth} aria-label="Next month">›</button>
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
          const day  = i + 1;
          const key  = dateKey(day);
          const solved = !!solvedDates[key];
          const past   = isPast(day);
          const today  = isToday(day);
          const missed = past && !solved && !today;

          let cls = 'calendar-day-cell';
          if (today) cls += ' today';
          else if (solved) cls += ' solved';
          else if (missed) cls += ' missed';

          return (
            <div
              key={day}
              className={cls}
              onClick={() => handleDayClick(day)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') handleDayClick(day); }}
              aria-label={`${MONTHS[month]} ${day}, ${year}${solved ? ' — Solved' : missed ? ' — Missed' : ''}`}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Selected Day Inspector */}
      {selectedDay && (
        <div style={{
          borderTop: '1px solid rgba(74,222,128,0.3)',
          padding: '12px 14px',
          fontSize: '0.78rem',
          letterSpacing: '0.08em',
          lineHeight: 1.6,
        }}>
          <div style={{ fontWeight: 700, marginBottom: '6px' }}>
            {MONTHS[month]} {selectedDay.day}, {year}
          </div>
          <div>STATUS: <span style={{ color: selectedDay.solved ? '#4ade80' : 'rgba(74,222,128,0.55)' }}>{selectedDay.solved ? 'SOLVED ✓' : 'ASSIGNED'}</span></div>
          {selectedDay.model && <div style={{ marginTop: '6px', opacity: 0.8 }}>
            {selectedDay.model.title} · {selectedDay.model.objective}
          </div>}
          <button
            onClick={() => setSelectedDay(null)}
            style={{
              background: 'transparent', border: 'none', color: 'rgba(74,222,128,0.5)',
              cursor: 'pointer', fontSize: '0.7rem', marginTop: '8px', padding: 0,
            }}
          >
            [CLOSE]
          </button>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────
   Recent Solves List — matches PDF Page 9
   Clickable items reload the model into the solver.
───────────────────────────────────────────────── */
const SolverHistoryList = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(getSolveHistory());
  }, []);

  const handleReload = (item) => {
    if (!item.details?.model) {
      // Just navigate to the solver without preloading if no snapshot
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
      <div className="retro-window-header">
        <div className="window-dots">
          <div className="window-dot" />
          <div className="window-dot" />
          <div className="window-dot" />
        </div>
        <div className="window-title">SOLVER HISTORY</div>
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

/* ─────────────────────────────────────────────────
   Challenge Calendar Page — matches PDF Page 10
   Dual calendar: DAILY LP + DAILY IP
───────────────────────────────────────────────── */
const ChallengeCalendarView = () => {
  return (
    <div className="retro-window" style={{ maxWidth: '920px' }}>
      <div className="retro-window-header">
        <div className="window-dots">
          <div className="window-dot" />
          <div className="window-dot" />
          <div className="window-dot" />
        </div>
        <div className="window-title">CHALLENGE HISTORY</div>
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
        <CalendarSection title="DAILY LP" storageKey="op_challenge_lp_solved" type="LP" />
        <CalendarSection title="DAILY IP" storageKey="op_challenge_ip_solved" type="IP" />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────
   HistoryPage — Page 8 Selection + Sub-views
───────────────────────────────────────────────── */
const HistoryPage = () => {
  const [view, setView] = useState(null); // null | 'solvers' | 'challenges'

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Navbar
        backTo={view ? () => setView(null) : '/'}
        label={view ? 'RETURN TO HISTORY SELECTION' : 'RETURN TO MAIN SYSTEM'}
      />

      {!view ? (
        /* Page 8: Selection — Solver History / Challenge History */
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
