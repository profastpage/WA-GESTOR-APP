import { useState, useEffect } from 'react';
import LoginModal from './LoginModal';

export default function Layout({ children, activeView, setActiveView, isLicensed, onLogin, onLogout, user }) {
  const [showLogin, setShowLogin] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showFloatingBtn, setShowFloatingBtn] = useState(false);

  // Detectar si ya está instalada
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Escuchar evento beforeinstallprompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      
      // Mostrar botón flotante por 5 segundos
      setShowFloatingBtn(true);
      setTimeout(() => setShowFloatingBtn(false), 5000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Detectar instalación
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setShowFloatingBtn(false);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
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

  // No mostrar nada si ya está instalada
  if (isInstalled) {
    const navItems = [
      { id: 'dashboard', label: 'Inicio', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
      { id: 'clients', label: 'Clientes', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
      { id: 'templates', label: 'Plantillas', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
    ];
    
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <header className="bg-wa-dark text-white p-4 shadow-lg flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold tracking-tight">WA Manager</h1>
            <p className="text-xs text-wa-light opacity-80">Gestión de Clientes</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowLogin(true)} className="bg-white/10 px-2 py-1 rounded-lg text-xs hover:bg-white/20 transition-colors">🔑</button>
            <span className="text-2xl">💬</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 pb-24">{children}</main>
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={onLogin} />}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">
          {navItems.map(item => (
            <button key={item.id} data-view={item.id} onClick={() => setActiveView(item.id)} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeView === item.id ? 'text-wa-dark' : 'text-gray-400'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d={item.icon} /></svg>
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'clients', label: 'Clientes', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'templates', label: 'Plantillas', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50 relative">
      {/* Header con botón fijo */}
      <header className="bg-wa-dark text-white p-4 shadow-lg flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight">WA Manager</h1>
          <p className="text-xs text-wa-light opacity-80">Gestión de Clientes</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowLogin(true)} className="bg-white/10 px-2 py-1 rounded-lg text-xs hover:bg-white/20 transition-colors">🔑</button>
          {isInstallable && (
            <button
              onClick={handleInstall}
              className="bg-white text-wa-dark px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-wa-light transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span className="hidden sm:inline">Instalar App</span>
            </button>
          )}
          <span className="text-2xl">💬</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-24">{children}</main>

      {/* Login Modal */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={onLogin} />}

      {/* Botón flotante inferior - aparece 5 segundos */}
      {isInstallable && showFloatingBtn && (
        <div className="fixed bottom-20 left-0 right-0 z-50 flex justify-center animate-bounce-in pointer-events-none">
          <button
            onClick={handleInstall}
            className="pointer-events-auto bg-wa-green text-white px-6 py-3 rounded-full text-sm font-bold shadow-2xl flex items-center gap-2 animate-pulse hover:bg-wa-dark transition-colors active:scale-95"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Instalar App
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-40">
        {navItems.map(item => (
          <button key={item.id} data-view={item.id} onClick={() => setActiveView(item.id)} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeView === item.id ? 'text-wa-dark' : 'text-gray-400'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d={item.icon} /></svg>
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
