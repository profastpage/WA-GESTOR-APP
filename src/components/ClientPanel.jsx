import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Layout from './Layout';
import Dashboard from './Dashboard';
import ClientList from './ClientList';
import TemplateManager from './TemplateManager';
import { exportService } from '../services/firestore';

export default function ClientPanel() {
  const { user, logout, isSuperAdmin, isApproved } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  
  // Fallback to localStorage when Firestore fails
  const [clients, setClients] = useLocalStorage('wa_clients', []);
  const [templates, setTemplates] = useLocalStorage('wa_templates', []);
  const [messageLog, setMessageLog] = useLocalStorage('wa_log', []);

  // Redirect admin to admin panel
  useEffect(() => {
    if (isSuperAdmin) {
      window.location.href = '/admin';
    }
    if (!user) {
      window.location.href = '/';
    }
  }, [user, isSuperAdmin]);

  if (!user || isSuperAdmin) return null;

  // Handler functions (localStorage based for now)
  const handleSaveClient = (clientData) => {
    if (clientData.id) {
      setClients(prev => prev.map(c => c.id === clientData.id ? { ...c, ...clientData } : c));
    } else {
      setClients(prev => [...prev, { ...clientData, id: Date.now().toString() }]);
    }
  };

  const handleDeleteClient = (clientId) => {
    if (confirm('¿Eliminar este cliente?')) {
      setClients(prev => prev.filter(c => c.id !== clientId));
    }
  };

  const handleSaveTemplate = (templateData) => {
    if (templateData.id) {
      setTemplates(prev => prev.map(t => t.id === templateData.id ? { ...t, ...templateData } : t));
    } else {
      setTemplates(prev => [...prev, { ...templateData, id: Date.now().toString() }]);
    }
  };

  const handleDeleteTemplate = (templateId) => {
    if (confirm('¿Eliminar esta plantilla?')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  };

  const handleSendWA = (clientId, templateId, templateText, clientName) => {
    const message = (templateText || '').replace('{nombre}', clientName.split(' ')[0]);
    window.open(`https://wa.me/51933667414?text=${encodeURIComponent(message)}`, '_blank');
    setMessageLog(prev => [...prev, { clientId, timestamp: Date.now() }]);
  };

  const handleExportCSV = () => {
    const csv = exportService.toCSV(clients);
    exportService.download(csv, `clientes_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard clients={clients} messageLog={messageLog} isLicensed={true} user={user} isApproved={isApproved} />;
      case 'clients':
        return <ClientList clients={clients} setClients={setClients} templates={templates} logMessage={() => {}} isLicensed={true} user={user} isApproved={isApproved} onSaveClient={handleSaveClient} onDeleteClient={handleDeleteClient} />;
      case 'templates':
        return <TemplateManager templates={templates} setTemplates={setTemplates} isLicensed={true} user={user} isApproved={isApproved} onSave={handleSaveTemplate} onDelete={handleDeleteTemplate} />;
      default:
        return <Dashboard clients={clients} messageLog={messageLog} isLicensed={true} user={user} isApproved={isApproved} />;
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
      clients={clients}
      isApproved={isApproved}
    >
      <div className="page-enter">{renderView()}</div>
    </Layout>
  );
}
