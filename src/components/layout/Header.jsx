import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoMain from '../../assets/logo-main.png';

const Header = () => {
  const location = useLocation();
  const isChallenge = location.pathname.startsWith('/challenge');

  return (
    <header className="app-header">
      <Link to="/" className="logo-link" title="Return to Home">
        <img
          src={logoMain}
          alt="Operations Daily"
          className="logo-image"
        />
      </Link>
      {isChallenge && (
        <div
          style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontFamily: "'Orbitron', monospace",
            fontSize: '1.25rem',
            letterSpacing: '0.15em',
            color: '#4ade80',
            textShadow: '0 0 10px rgba(74, 222, 128, 0.7)',
            display: 'none' // will appear responsively on larger screens
          }}
          className="challenge-header-clock sm:block"
        >
          00:00:00
        </div>
      )}
    </header>
  );
};

export default Header;
