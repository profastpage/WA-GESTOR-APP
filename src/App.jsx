import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import TemplateManager from './components/TemplateManager';
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

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isLicensed, setIsLicensed] = useState(() => {
    return localStorage.getItem('wa_license_active') === 'true';
  });

  // Firebase auth (opcional - se activa al iniciar sesión)
  const { user, login, register, logout } = useAuth();

  const [clients, setClients] = useLocalStorage('wa_clients', []);
  const [templates, setTemplates] = useLocalStorage('wa_templates', []);        

  const displayClients = isLicensed ? clients : DEMO_CLIENTS;
  const displayTemplates = isLicensed ? templates : DEMO_TEMPLATES;

  const [messageLog, setMessageLog] = useLocalStorage('wa_log', []);
  const logMessage = (clientId) => setMessageLog(prev => [...prev, { clientId, timestamp: Date.now() }]);

  const handleLogin = async () => {
    // Login trigger - user will use the modal
  };

  const handleLogout = async () => {
    await logout();
  };

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
      onLogin={handleLogin}
      onLogout={handleLogout}
      user={user}
    >
      <div className="page-enter">{renderView()}</div>
    </Layout>
  );
}
