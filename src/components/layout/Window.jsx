import React from 'react';

/**
 * Window component that displays the official high-resolution PNG icon assets
 * with cyber green glow, hover lift, and click feedback.
 */
const Window = ({ iconSrc, onClick, altText = 'Window Icon', className = '' }) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick && onClick();
        }
      }}
      className={`window-card cursor-pointer select-none transition-all duration-300 hover:scale-105 active:scale-95 ${className}`}
      aria-label={altText}
    >
      <img
        src={iconSrc}
        alt={altText}
        className="w-full h-auto drop-shadow-[0_8px_20px_rgba(0,0,0,0.8)] hover:drop-shadow-[0_0_25px_rgba(74,222,128,0.55)] transition-all duration-300"
        loading="eager"
      />
    </div>
  );
};

export default Window;