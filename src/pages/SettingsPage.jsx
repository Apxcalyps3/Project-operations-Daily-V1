/**
 * Settings Page
 * Provides access to User Account modal, Theme preferences, and Feedback QR code panel.
 */

import React, { useState } from 'react';
import Window from '../components/layout/Window';
import Navbar from '../components/layout/Navbar';
import AuthModal from '../components/settings/AuthModal';

import iconAccount from '../assets/icons/icon-account.png';
import iconTheme from '../assets/icons/icon-theme.png';
import iconReview from '../assets/icons/icon-review.png';
import iconThemed from '../assets/icons/icon-themed.png';
import iconThemel from '../assets/icons/icon-themel.png';
import qrImage from '../assets/icons/icon-feedback.png';

/* ============================================================
   Theme Panel Component
   ============================================================ */
const ThemePanel = () => {
  const [showComingSoon, setShowComingSoon] = useState(false);

  return (
    <>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Dark Theme — active default */}
        <div style={{ textAlign: 'center' }}>
          <Window
            iconSrc={iconThemed}
            altText="Dark Theme"
            onClick={() => {}}
          />
          <div style={{
            marginTop: '10px', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.12em',
            color: '#4ade80', textShadow: '0 0 10px rgba(74,222,128,0.8)',
          }}>
            [ ACTIVE ]
          </div>
        </div>

        {/* Light Theme */}
        <div style={{ textAlign: 'center' }}>
          <Window
            iconSrc={iconThemel}
            altText="Light Theme (Coming Soon)"
            onClick={() => setShowComingSoon(true)}
          />
          <div style={{
            marginTop: '10px', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.12em',
            color: 'rgba(74,222,128,0.45)',
          }}>
            COMING SOON
          </div>
        </div>
      </div>

      {showComingSoon && (
        <div
          className="modal-overlay"
          onClick={() => setShowComingSoon(false)}
        >
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="retro-window-header">
              <div className="window-dots">
                <div className="window-dot" />
                <div className="window-dot" />
                <div className="window-dot" />
              </div>
              <div className="window-title">LIGHT THEME</div>
            </div>
            <div className="coming-soon-banner">
              COMING SOON
            </div>
            <div style={{ padding: '0 30px 30px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.78rem', opacity: 0.6, letterSpacing: '0.08em', marginBottom: '20px' }}>
                LIGHT THEME TRANSMISSION WILL BE AVAILABLE IN A FUTURE UPDATE.
              </p>
              <button
                className="pill-button"
                onClick={() => setShowComingSoon(false)}
                style={{ fontSize: '0.75rem' }}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* ============================================================
   Feedback Panel Component
   ============================================================ */
const FeedbackPanel = () => {
  return (
    <div className="retro-window" style={{ maxWidth: '420px' }}>
      <div className="retro-window-header">
        <div className="window-dots">
          <div className="window-dot" />
          <div className="window-dot" />
          <div className="window-dot" />
        </div>
        <div className="window-title">FEEDBACK</div>
      </div>
      <div className="retro-window-body" style={{ alignItems: 'center', padding: '30px' }}>
        <img
          src={qrImage}
          alt="Feedback QR Code"
          style={{
            width: '100%',
            maxWidth: '280px',
            height: 'auto',
            borderRadius: '8px',
            border: '1.5px solid rgba(74,222,128,0.4)',
            boxShadow: '0 0 20px rgba(74,222,128,0.25)',
          }}
        />
        <p style={{ fontSize: '0.75rem', opacity: 0.55, letterSpacing: '0.1em', textAlign: 'center', marginTop: '10px' }}>
          SCAN TO SUBMIT FEEDBACK TRANSMISSION
        </p>
      </div>
    </div>
  );
};

/* ============================================================
   Settings Page Component
   ============================================================ */
const SettingsPage = () => {
  const [view, setView] = useState(null);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Navbar
        backTo={view ? () => setView(null) : '/'}
        label={view ? 'RETURN TO SETTINGS' : 'RETURN TO MAIN SYSTEM'}
      />

      {!view ? (
        <div className="settings-grid">
          <Window
            iconSrc={iconAccount}
            onClick={() => setView('account')}
            altText="Account"
          />
          <Window
            iconSrc={iconTheme}
            onClick={() => setView('theme')}
            altText="Change Theme"
          />
          <Window
            iconSrc={iconReview}
            onClick={() => setView('review')}
            altText="Review"
          />
        </div>
      ) : view === 'account' ? (
        <AuthModal onClose={() => setView(null)} />
      ) : view === 'theme' ? (
        <ThemePanel />
      ) : (
        <FeedbackPanel />
      )}
    </div>
  );
};

export default SettingsPage;
