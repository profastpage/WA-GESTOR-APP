import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Soporte para activación por URL
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('license') === 'true') {
  localStorage.setItem('wa_license_active', 'true');
  window.history.replaceState({}, document.title, window.location.pathname);
}

// Registrar Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js?v=' + Date.now(), { scope: '/' })
      .then(reg => {
        console.log('SW registrado:', reg.scope);
        reg.update();
      })
      .catch(err => console.error('SW error:', err));
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
