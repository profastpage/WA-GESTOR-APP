import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import TemplateManager from './components/TemplateManager';
import Pricing from './components/Pricing';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useProLicense } from './hooks/useProLicense';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const { isPro } = useProLicense();
  const [clients, setClients] = useLocalStorage('wa_clients', []);
  const maxTemplates = isPro ? Infinity : 3;
  const [templates, setTemplates] = useLocalStorage('wa_templates', [
    { id: '1', name: 'Saludo', text: 'Hola {nombre}, ¿cómo puedo ayudarte hoy?' },
    { id: '2', name: 'Precio', text: 'Hola {nombre}, el precio del producto es $XX. ¿Te interesa?' },
    { id: '3', name: 'Despedida', text: 'Gracias por tu contacto {nombre}, que tengas un excelente día.' }
  ]);
  const [messageLog, setMessageLog] = useLocalStorage('wa_log', []);
  const logMessage = (clientId) => setMessageLog(prev => [...prev, { clientId, timestamp: Date.now() }]);
  const renderView = () => {
    const props = { clients, setClients, templates, setTemplates, logMessage, isPro, maxTemplates };
    switch (activeView) {
      case 'dashboard': return <Dashboard clients={clients} messageLog={messageLog} isPro={isPro} />;
      case 'clients': return <ClientList {...props} />;
      case 'templates': return <TemplateManager templates={templates} setTemplates={setTemplates} isPro={isPro} maxTemplates={maxTemplates} />;
      case 'pricing': return <Pricing isPro={isPro} />;
      default: return <Dashboard clients={clients} messageLog={messageLog} isPro={isPro} />;
    }
  };
  return (<Layout activeView={activeView} setActiveView={setActiveView} isPro={isPro}><div className="page-enter">{renderView()}</div></Layout>);
}