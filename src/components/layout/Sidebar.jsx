import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '280px',
        height: '100vh',
        background: '#040d07',
        borderRight: '1.5px solid #4ade80',
        zIndex: 50,
        padding: '2rem 1.5rem',
        boxShadow: '0 0 30px rgba(74, 222, 128, 0.3)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <span style={{ fontWeight: 'bold', letterSpacing: '0.15em' }}>SYSTEM MENU</span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#4ade80', fontSize: '1.5rem', cursor: 'pointer' }}
        >
          &times;
        </button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <li><Link to="/" onClick={onClose} style={{ color: '#4ade80', textDecoration: 'none' }}>HOME</Link></li>
        <li><Link to="/solver" onClick={onClose} style={{ color: '#4ade80', textDecoration: 'none' }}>SIMPLEX SOLVER</Link></li>
        <li><Link to="/challenge" onClick={onClose} style={{ color: '#4ade80', textDecoration: 'none' }}>DAILY CHALLENGE</Link></li>
        <li><Link to="/history" onClick={onClose} style={{ color: '#4ade80', textDecoration: 'none' }}>HISTORY</Link></li>
        <li><Link to="/settings" onClick={onClose} style={{ color: '#4ade80', textDecoration: 'none' }}>SETTINGS</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;
