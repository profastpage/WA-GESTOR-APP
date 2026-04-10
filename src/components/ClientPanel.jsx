import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCRM } from '../hooks/useCRM';
import Layout from './Layout';
import Dashboard from './Dashboard';
import ClientList from './ClientList';
import TemplateManager from './TemplateManager';
import { exportService } from '../services/firestore';

const COMPANY_PHONE = '51933667414';

export default function ClientPanel() {
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = typeof window !== 'undefined' ? window.location : null;
  const [activeView, setActiveView] = useState('dashboard');
  
  // CRM data from Firebase
  const crm = useCRM(user?.uid || '');

  // Initialize default data for new users
  useEffect(() => {
    if (user && !isSuperAdmin && crm.loading === false && crm.clients.length === 0 && crm.templates.length === 0) {
      crm.initDefaultData().catch(() => {});
    }
  }, [user, isSuperAdmin, crm.loading, crm.clients.length, crm.templates.length]);

  // Redirect admin to admin panel
  useEffect(() => {
    if (isSuperAdmin && navigate) {
      window.location.href = '/admin';
    }
  }, [isSuperAdmin, navigate]);

  // Redirect to landing if not logged in
  useEffect(() => {
    if (!user && navigate) {
      window.location.href = '/';
    }
  }, [user, navigate]);

  if (!user || isSuperAdmin) return null;
  if (crm.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wa-dark"></div>
      </div>
    );
  }

  // Handler functions
  const handleSaveClient = async (clientData) => {
    if (clientData.id) {
      await crm.updateClient(clientData.id, clientData);
    } else {
      await crm.addClient(clientData);
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (confirm('¿Eliminar este cliente?')) {
      await crm.deleteClient(clientId);
    }
  };

  const handleSendWA = async (clientId, templateId, templateText, clientName) => {
    const message = (templateText || '').replace('{nombre}', clientName.split(' ')[0]);
    await crm.sendMessage(clientId, templateId, message);
  };

  const handleSaveTemplate = async (templateData) => {
    if (templateData.id) {
      await crm.updateTemplate(templateData.id, templateData);
    } else {
      await crm.addTemplate(templateData);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (confirm('¿Eliminar esta plantilla?')) {
      await crm.deleteTemplate(templateId);
    }
  };

  const handleExportCSV = () => {
    crm.exportToCSV();
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard clients={crm.clients} messageLog={[]} isLicensed={true} user={user} stats={crm.stats} loading={crm.loading} />;
      case 'clients':
        return <ClientList clients={crm.clients} setClients={null} templates={crm.templates} logMessage={(id) => crm.sendMessage(id, null, '')} isLicensed={true} user={user} onSaveClient={handleSaveClient} onDeleteClient={handleDeleteClient} />;
      case 'templates':
        return <TemplateManager templates={crm.templates} setTemplates={null} isLicensed={true} user={user} onSave={handleSaveTemplate} onDelete={handleDeleteTemplate} />;
      default:
        return <Dashboard clients={crm.clients} messageLog={[]} isLicensed={true} user={user} stats={crm.stats} loading={crm.loading} />;
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
