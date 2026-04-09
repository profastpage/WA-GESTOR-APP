import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import TemplateManager from './components/TemplateManager';
import AdminPanel from './components/AdminPanel';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useClientLicense } from './hooks/useLicenseGenerator';

const DEMO_PHONE = '933667414'; // Número de Fast Page Pro para demo en tiempo real

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

// Ruta secreta para admin: agregar ?admin=true a la URL
const isAdminRoute = () => {
  return new URLSearchParams(window.location.search).get('admin') === 'true';
};

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const { isValid: isLicensed, activateLicense } = useClientLicense();
  
  const [clients, setClients] = useLocalStorage('wa_clients', []);
  const [templates, setTemplates] = useLocalStorage('wa_templates', []);
  
  const displayClients = isLicensed ? clients : DEMO_CLIENTS;
  const displayTemplates = isLicensed ? templates : DEMO_TEMPLATES;
  
  const [messageLog, setMessageLog] = useLocalStorage('wa_log', []);
  const logMessage = (clientId) => setMessageLog(prev => [...prev, { clientId, timestamp: Date.now() }]);

  // Mostrar panel de admin si la URL tiene ?admin=true
  if (isAdminRoute()) {
    return <Layout activeView="admin" setActiveView={setActiveView} isLicensed={true}><div className="page-enter"><AdminPanel /></div></Layout>;
  }

  const renderView = () => {
    const props = { 
      clients: displayClients, 
      setClients, 
      templates: displayTemplates, 
      setTemplates, 
      logMessage, 
      isLicensed,
      activateLicense
    };
    
    switch (activeView) {
      case 'dashboard': return <Dashboard clients={displayClients} messageLog={messageLog} isLicensed={isLicensed} />;
      case 'clients': return <ClientList {...props} />;
      case 'templates': return <TemplateManager templates={displayTemplates} setTemplates={setTemplates} isLicensed={isLicensed} />;
      default: return <Dashboard clients={displayClients} messageLog={messageLog} isLicensed={isLicensed} />;
    }
  };
  
  return (<Layout activeView={activeView} setActiveView={setActiveView} isLicensed={isLicensed}><div className="page-enter">{renderView()}</div></Layout>);
}
