/**
 * Main Application Entry Point
 * Mounts the root React component into the DOM.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './assets/styles/global.css';

/* ============================================================
   Application Bootstrap
   ============================================================ */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);