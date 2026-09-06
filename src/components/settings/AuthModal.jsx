import React, { useState } from 'react';
import Window from '../layout/Window';
import iconSignup from '../../assets/icons/icon-signup.png';
import iconLogin from '../../assets/icons/icon-login.png';
import { useAuth } from '../../context/AuthContext';

const AuthModal = ({ onClose }) => {
  const { user, login, signup, logout } = useAuth();
  const [mode, setMode] = useState(null); // 'login' or 'signup'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setMsg('Please provide an email/username.');
      return;
    }
    if (password.length < 4) {
      setMsg('ACCESS CODE MUST HAVE AT LEAST 4 CHARACTERS.');
      return;
    }
    
    setMsg('AUTHENTICATING...');
    
    try {
      if (mode === 'signup') {
        await signup(username, password, username.split('@')[0]);
      } else {
        await login(username, password);
      }
      setMsg(`WELCOME, ${username.trim()}!`);
      setTimeout(() => {
        if (onClose) onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
      setMsg(err.message || 'AUTHENTICATION FAILED.');
    }
  };

  if (user) {
    return (
      <div className="retro-window" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="retro-window-header">
          <div className="window-dots">
            <div className="window-dot" />
            <div className="window-dot" />
            <div className="window-dot" />
          </div>
          <div className="window-title">USER ACCOUNT</div>
        </div>
        <div className="retro-window-body" style={{ alignItems: 'center', textAlign: 'center', gap: '15px' }}>
          <p style={{ fontSize: '1.2rem', color: '#4ade80' }}>ACTIVE USER: {user.username}</p>
          <button
            type="button"
            onClick={logout}
            className="pill-button"
            style={{ width: '200px' }}
          >
            SIGN OUT
          </button>
        </div>
      </div>
    );
  }

  if (mode) {
    return (
      <div className="retro-window" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="retro-window-header">
          <div className="window-dots">
            <div className="window-dot" />
            <div className="window-dot" />
            <div className="window-dot" />
          </div>
          <div className="window-title">{mode === 'signup' ? 'SIGN UP' : 'LOG IN'}</div>
        </div>
        <form onSubmit={handleSubmit} className="retro-window-body" style={{ gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem' }}>USERNAME / CALLSIGN</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pill-input"
              placeholder="operator_01"
              required
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem' }}>ACCESS CODE</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pill-input"
              placeholder="••••••••"
              required
            />
          </div>
          {msg && <div style={{ color: '#4ade80', fontSize: '0.85rem' }}>{msg}</div>}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" className="pill-button" style={{ flex: 1 }}>
              {mode === 'signup' ? 'REGISTER' : 'ENTER'}
            </button>
            <button
              type="button"
              onClick={() => setMode(null)}
              className="pill-button"
              style={{ flex: 1, borderColor: 'rgba(74, 222, 128, 0.5)' }}
            >
              BACK
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
      <Window
        iconSrc={iconSignup}
        altText="Sign Up"
        onClick={() => setMode('signup')}
        className="solver-grid"
        style={{ width: '280px' }}
      />
      <Window
        iconSrc={iconLogin}
        altText="Log In"
        onClick={() => setMode('login')}
        className="solver-grid"
        style={{ width: '280px' }}
      />
    </div>
  );
};

export default AuthModal;
