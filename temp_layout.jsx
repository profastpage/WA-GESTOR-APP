import { usePWAInstall } from '../hooks/usePWAInstall';

export default function Layout({ children, activeView, setActiveView, isLicensed }) {
  const { isInstallable, handleInstall } = usePWAInstall();
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
          {isInstallable && (
            <button 
              onClick={handleInstall}
              className="bg-white text-wa-dark px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-wa-light transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Instalar App
            </button>
          )}
          <span className="text-2xl">💬</span>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 pb-24">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">
        {navItems.map(item => (<button key={item.id} data-view={item.id} onClick={() => setActiveView(item.id)} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeView === item.id ? 'text-wa-dark' : 'text-gray-400'}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d={item.icon} /></svg><span className="text-[10px] mt-1 font-medium">{item.label}</span></button>))}
      </nav>
    </div>
  );
}