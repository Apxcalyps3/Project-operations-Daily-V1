import React from 'react';
import Window from '../layout/Window';
import iconThemed from '../../assets/icons/icon-themed.png';
import iconThemel from '../../assets/icons/icon-themel.png';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ position: 'relative' }}>
          <Window
            iconSrc={iconThemed}
            altText="Dark Theme"
            onClick={() => toggleTheme('dark')}
          />
          {theme === 'dark' && (
            <div
              style={{
                textAlign: 'center',
                marginTop: '10px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                color: '#4ade80'
              }}
            >
              [ ACTIVE THEME ]
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <Window
            iconSrc={iconThemel}
            altText="Light Theme"
            onClick={() => toggleTheme('light')}
          />
          {theme === 'light' && (
            <div
              style={{
                textAlign: 'center',
                marginTop: '10px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                color: '#4ade80'
              }}
            >
              [ ACTIVE THEME ]
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle;
