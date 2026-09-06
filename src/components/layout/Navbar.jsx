import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Navbar — back-navigation button shown on all non-home pages.
 * backTo: string path OR a callback function (for in-page state navigation).
 */
const Navbar = ({ backTo = '/', label = 'RETURN TO SYSTEM' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/') return null;

  const handleBack = () => {
    if (typeof backTo === 'function') {
      backTo();
    } else {
      navigate(backTo);
    }
  };

  return (
    <nav style={{
      width: '100%',
      maxWidth: '920px',
      display: 'flex',
      justifyContent: 'flex-start',
      marginBottom: '1.2rem',
    }}>
      <button
        onClick={handleBack}
        className="nav-back-button"
        title="Go back"
        aria-label={label}
      >
        <span>←</span>
        <span>{label}</span>
      </button>
    </nav>
  );
};

export default Navbar;
