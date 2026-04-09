import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Soporte para activación por URL
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('license') === 'true') {
  localStorage.setItem('wa_license_active', 'true');
  window.history.replaceState({}, document.title, window.location.pathname);
}

// Registrar Service Worker con actualización forzada
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js?v=' + Date.now(), { scope: '/' })
      .then(reg => {
        console.log('SW registrado:', reg.scope);
        // Forzar actualización inmediata
        reg.update();
      })
      .catch(err => console.error('SW error:', err));
  });
}

// Hook para detección de instalación PWA
function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  return { isInstallable, install };
}

// Componente de botón de instalación
function InstallButton() {
  const { isInstallable, install } = usePWAInstall();

  if (!isInstallable) return null;

  return (
    <button
      onClick={install}
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#128C7E',
        color: 'white',
        border: 'none',
        borderRadius: '24px',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        zIndex: 1000,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      📲 Instalar App
    </button>
  );
}

// Wrapper que incluye el botón de instalación
function AppWrapper() {
  return (
    <>
      <App />
      <InstallButton />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);
