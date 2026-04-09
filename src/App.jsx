import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useCRM } from './hooks/useCRM';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import TemplateManager from './components/TemplateManager';
import FollowUpManager from './components/FollowUpManager';

export default function App() {
  const { user, loading: authLoading, error: authError, login, register, logout } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [appError, setAppError] = useState(null);
  
  // CRM solo si hay usuario autenticado
  const crm = useCRM(user?.uid || '');

  // Inicializar datos por defecto para nuevos usuarios
  useEffect(() => {
    if (user && !crm.loading && crm.clients.length === 0 && crm.templates.length === 0) {
      crm.initDefaultData().catch(err => {
        console.error('Error inicializando datos:', err);
        setAppError('Error al inicializar: ' + err.message);
      });
    }
  }, [user, crm.loading]);

  // Mostrar error si hay problema
  if (appError) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
        <h1>⚠️ Error</h1>
        <p>{appError}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  // Mostrar login si no hay usuario
  if (!user) {
    return (
      <Login 
        onLogin={login} 
        onRegister={register} 
        loading={authLoading} 
        error={authError} 
      />
    );
  }

  // Funciones de clientes
  const handleSaveClient = async (clientData) => {
    try {
      if (clientData.id) {
        await crm.updateClient(clientData.id, clientData);
      } else {
        await crm.addClient(clientData);
      }
    } catch (err) {
      console.error('Error guardando cliente:', err);
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (confirm('¿Eliminar este cliente?')) {
      await crm.deleteClient(clientId);
    }
  };

  const handleSendWA = async (clientId, templateId, templateText, clientName) => {
    const message = templateText.replace('{nombre}', clientName.split(' ')[0]);
    await crm.sendMessage(clientId, templateId, message);
  };

  // Funciones de plantillas
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

  // Exportar CSV
  const handleExportCSV = () => {
    crm.exportToCSV();
  };

  // Renderizar vista
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard stats={crm.stats} loading={crm.loading} />;
      case 'clients':
        return (
          <ClientList 
            clients={crm.clients}
            loading={crm.loading}
            onSaveClient={handleSaveClient}
            onDeleteClient={handleDeleteClient}
            onSendWA={handleSendWA}
            templates={crm.templates}
          />
        );
      case 'templates':
        return (
          <TemplateManager 
            templates={crm.templates}
            onSave={handleSaveTemplate}
            onDelete={handleDeleteTemplate}
          />
        );
      case 'followups':
        return (
          <FollowUpManager 
            followUps={crm.followUps}
            clients={crm.clients}
            onAdd={crm.addFollowUp}
            onComplete={crm.completeFollowUp}
            onDelete={crm.deleteFollowUp}
          />
        );
      default:
        return <Dashboard stats={crm.stats} loading={crm.loading} />;
    }
  };

  return (
    <Layout 
      activeView={activeView} 
      setActiveView={setActiveView}
      user={user}
      onLogout={logout}
      onExportCSV={handleExportCSV}
    >
      <div className="page-enter">{renderView()}</div>
    </Layout>
  );
}
