import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import TemplateManager from './components/TemplateManager';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useAuth } from './hooks/useAuth';
import { useCRM } from './hooks/useCRM';
import { exportService } from './services/firestore';

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

  // Firebase auth - optional CRM mode
  const { user, login: firebaseLogin, register: firebaseRegister, logout: firebaseLogout } = useAuth();
  const [useFirebase, setUseFirebase] = useState(false);
  
  // LocalStorage mode (default)
  const [clients, setClients] = useLocalStorage('wa_clients', []);
  const [templates, setTemplates] = useLocalStorage('wa_templates', []);
  const [messageLog, setMessageLog] = useLocalStorage('wa_log', []);

  // Firebase CRM mode
  const crm = useCRM(useFirebase && user?.uid ? user.uid : '');

  // Sync Firebase data when user logs in
  useEffect(() => {
    if (useFirebase && user && crm.clients.length === 0 && crm.templates.length === 0) {
      crm.initDefaultData().catch(() => {});
    }
  }, [useFirebase, user, crm.loading]);

  // Use Firebase data if logged in, otherwise use localStorage
  const displayClients = useFirebase && user ? crm.clients : clients;
  const displayTemplates = useFirebase && user ? crm.templates : templates;

  const logMessage = (clientId) => setMessageLog(prev => [...prev, { clientId, timestamp: Date.now() }]);

  // Firebase send message
  const firebaseSendWA = async (clientId, templateId, templateText, clientName) => {
    const message = (templateText || '').replace('{nombre}', clientName.split(' ')[0]);
    await crm.sendMessage(clientId, templateId, message);
  };

  // Handle login - switch to Firebase mode
  const handleLogin = () => {
    setUseFirebase(true);
  };

  // Handle logout - go back to demo mode
  const handleLogout = () => {
    firebaseLogout();
    setUseFirebase(false);
  };

  // Export CSV
  const handleExportCSV = () => {
    const csv = exportService.toCSV(displayClients);
    exportService.download(csv, `clientes_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const renderView = () => {
    const props = {
      clients: displayClients,
      setClients: useFirebase ? undefined : setClients,
      templates: displayTemplates,
      setTemplates: useFirebase ? undefined : setTemplates,
      logMessage,
      isLicensed,
      useFirebase,
      onSendWA: useFirebase ? firebaseSendWA : undefined,
      onSaveClient: useFirebase ? crm.addClient : undefined,
      onDeleteClient: useFirebase ? crm.deleteClient : undefined,
      onSaveTemplate: useFirebase ? crm.addTemplate : undefined,
      onDeleteTemplate: useFirebase ? crm.deleteTemplate : undefined,
    };

    switch (activeView) {
      case 'dashboard': return <Dashboard clients={displayClients} messageLog={messageLog} isLicensed={isLicensed} useFirebase={useFirebase} stats={useFirebase ? crm.stats : null} loading={useFirebase ? crm.loading : false} />;
      case 'clients': return <ClientList {...props} />;
      case 'templates': return <TemplateManager templates={displayTemplates} setTemplates={useFirebase ? undefined : setTemplates} isLicensed={isLicensed} useFirebase={useFirebase} onSave={crm.addTemplate} onDelete={crm.deleteTemplate} />;
      default: return <Dashboard clients={displayClients} messageLog={messageLog} isLicensed={isLicensed} useFirebase={useFirebase} stats={useFirebase ? crm.stats : null} loading={useFirebase ? crm.loading : false} />;
    }
  };

  return (
    <Layout 
      activeView={activeView} 
      setActiveView={setActiveView}
      isLicensed={isLicensed}
      useFirebase={useFirebase}
      user={user}
      onLogout={handleLogout}
      onLogin={handleLogin}
      onExportCSV={handleExportCSV}
    >
      <div className="page-enter">{renderView()}</div>
    </Layout>
  );
}
