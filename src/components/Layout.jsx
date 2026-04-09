import { useState, useEffect } from 'react';
import LoginModal from './LoginModal';

export default function Layout({ children, activeView, setActiveView, onLogin, onLogout, user }) {
  const [showLogin, setShowLogin] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showFloatingBtn, setShowFloatingBtn] = useState(false);
  const timerRef = useState(null);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      setShowFloatingBtn(true);
      if (timerRef[0]) clearTimeout(timerRef[0]);
      timerRef[0] = setTimeout(() => setShowFloatingBtn(false), 5000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setShowFloatingBtn(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      if (timerRef[0]) clearTimeout(timerRef[0]);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShowFloatingBtn(false);
    }
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  if (isInstalled) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <header className="bg-wa-dark text-white p-4 shadow-lg flex items-center justify-between">
          <div><h1 className="text-xl font-bold">WA Manager</h1><p className="text-xs text-wa-light opacity-80">Gestión de Clientes</p></div>
          <span className="text-2xl">💬</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 pb-24">{children}</main>
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">
          {['dashboard', 'clients', 'templates'].map(view => (
            <button key={view} onClick={() => setActiveView(view)} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeView === view ? 'text-wa-dark' : 'text-gray-400'}`}>
              <span className="text-xl mb-1">{view === 'dashboard' ? '🏠' : view === 'clients' ? '👥' : '📝'}</span>
              <span className="text-[10px] font-medium">{view === 'dashboard' ? 'Inicio' : view === 'clients' ? 'Clientes' : 'Plantillas'}</span>
            </button>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 relative">
      <header className="bg-wa-dark text-white p-4 shadow-lg flex items-center justify-between shrink-0">
        <div><h1 className="text-xl font-bold">WA Manager</h1><p className="text-xs text-wa-light opacity-80">Gestión de Clientes</p></div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowLogin(true)} className="bg-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-white/20 transition-colors">🔑 Iniciar Sesión</button>
          {isInstallable && (
            <button onClick={handleInstall} className="bg-white text-wa-dark px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-wa-light transition-colors">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              <span>Instalar App</span>
            </button>
          )}
          <span className="text-2xl">💬</span>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 pb-24">{children}</main>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={onLogin} />}
      {isInstallable && showFloatingBtn && (
        <div className="fixed bottom-20 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <button onClick={handleInstall} className="pointer-events-auto bg-wa-green text-white px-6 py-3 rounded-full text-sm font-bold shadow-2xl flex items-center gap-2 animate-pulse hover:bg-wa-dark transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Instalar App
          </button>
        </div>
      )}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-40">
        {['dashboard', 'clients', 'templates'].map(view => (
          <button key={view} onClick={() => setActiveView(view)} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeView === view ? 'text-wa-dark' : 'text-gray-400'}`}>
            <span className="text-xl mb-1">{view === 'dashboard' ? '🏠' : view === 'clients' ? '👥' : '📝'}</span>
            <span className="text-[10px] font-medium">{view === 'dashboard' ? 'Inicio' : view === 'clients' ? 'Clientes' : 'Plantillas'}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
