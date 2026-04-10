import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import TemplateManager from './components/TemplateManager';
import SuperAdminPanel from './components/SuperAdminPanel';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useAuth } from './hooks/useAuth';

const DEMO_PHONE = '933667414';

const DEMO_CLIENTS = [
  { id: 'demo1', name: 'María Rodríguez', phone: DEMO_PHONE, tag: 'Nuevo', notes: 'Interesada en producto premium' },
  { id: 'demo2', name: 'Carlos Sánchez', phone: DEMO_PHONE, tag: 'Pendiente', notes: 'Solicita cotización' },
  { id: 'demo3', name: 'Ana Flores', phone: DEMO_PHONE, tag: 'VIP', notes: 'Cliente frecuente' }
];

const DEMO_TEMPLATES = [
  { id: 'demo_t1', name: 'Saludo', text: 'Hola {nombre}, ¿cómo puedo ayudarte hoy?' },
  { id: 'demo_t2', name: 'Precio', text: 'Hola {nombre}, el precio del producto es S/XX. ¿Te interesa?' },
  { id: 'demo_t3', name: 'Despedida', text: 'Gracias por tu contacto {nombre}, que tengas un excelente día.' }
];

// Obtener ruta actual
const getCurrentRoute = () => {
  const path = window.location.pathname.replace(/\/$/, '');
  if (path === '/admin') return 'admin';
  if (path === '/clientes') return 'clientes';
  return 'landing';
};

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isLicensed, setIsLicensed] = useState(() => {
    return localStorage.getItem('wa_license_active') === 'true';
  });

  // Firebase auth
  const { user, logout, isSuperAdmin, loading: authLoading } = useAuth();
  const currentRoute = getCurrentRoute();

  const [clients, setClients] = useLocalStorage('wa_clients', []);
  const [templates, setTemplates] = useLocalStorage('wa_templates', []);

  const displayClients = isLicensed ? clients : DEMO_CLIENTS;
  const displayTemplates = isLicensed ? templates : DEMO_TEMPLATES;

  const [messageLog, setMessageLog] = useLocalStorage('wa_log', []);
  const logMessage = (clientId) => setMessageLog(prev => [...prev, { clientId, timestamp: Date.now() }]);

  // Redirección automática basada en rol
  useEffect(() => {
    if (authLoading) return;
    
    if (isSuperAdmin && currentRoute !== 'admin') {
      window.location.href = '/admin';
    } else if (user && !isSuperAdmin && currentRoute === 'landing') {
      window.location.href = '/clientes';
    } else if (!user && (currentRoute === 'admin' || currentRoute === 'clientes')) {
      window.location.href = '/';
    }
  }, [user, isSuperAdmin, currentRoute, authLoading]);

  // Mostrar loading mientras verifica auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wa-dark"></div>
      </div>
    );
  }

  // Super Admin Panel
  if (isSuperAdmin) {
    return <SuperAdminPanel user={user} onLogout={logout} />;
  }

  // Client Panel (logged in regular users)
  if (user && !isSuperAdmin) {
    const renderView = () => {
      switch (activeView) {
        case 'dashboard': return <Dashboard clients={clients} messageLog={messageLog} isLicensed={true} user={user} />;
        case 'clients': return <ClientList clients={clients} setClients={setClients} templates={templates} setTemplates={setTemplates} logMessage={logMessage} isLicensed={true} user={user} />;
        case 'templates': return <TemplateManager templates={templates} setTemplates={setTemplates} isLicensed={true} user={user} />;
        default: return <Dashboard clients={clients} messageLog={messageLog} isLicensed={true} user={user} />;
      }
    };

    return (
      <Layout 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isLicensed={true}
        onLogout={logout}
        user={user}
        showLoginButton={false}
      >
        <div className="page-enter">{renderView()}</div>
      </Layout>
    );
  }

  // Landing Page (public/demo)
  const renderView = () => {
    const props = {
      clients: displayClients,
      setClients,
      templates: displayTemplates,
      setTemplates,
      logMessage,
      isLicensed
    };

    switch (activeView) {
      case 'dashboard': return <Dashboard clients={displayClients} messageLog={messageLog} isLicensed={isLicensed} />;
      case 'clients': return <ClientList {...props} />;
      case 'templates': return <TemplateManager templates={displayTemplates} setTemplates={setTemplates} isLicensed={isLicensed} />;
      default: return <Dashboard clients={displayClients} messageLog={messageLog} isLicensed={isLicensed} />;
    }
  };

  return (
    <Layout 
      activeView={activeView} 
      setActiveView={setActiveView} 
      isLicensed={isLicensed}
      onLogin={() => {}}
      onLogout={logout}
      user={user}
      showLoginButton={true}
    >
      <div className="page-enter">{renderView()}</div>
    </Layout>
  );
}
