import { useState, useEffect, useCallback } from 'react';
import { 
  clientService, 
  templateService, 
  messageService, 
  followUpService, 
  statsService,
  exportService 
} from '../services/firestore';

export function useCRM(userId) {
  const [clients, setClients] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [stats, setStats] = useState({
    totalClients: 0, vipCount: 0, pendingCount: 0, newCount: 0,
    messagesToday: 0, messagesThisWeek: 0, conversionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let unsubClients, unsubTemplates, unsubFollowUps;

    try {
      unsubClients = clientService.listen(userId, (data) => setClients(data));
      unsubTemplates = templateService.listen(userId, (data) => setTemplates(data));
      unsubFollowUps = followUpService.listenPending(userId, (data) => setFollowUps(data));

      statsService.getDashboardStats(userId).then(data => setStats(data)).catch(() => {});
    } catch (err) {
      console.error('Error setting up listeners:', err);
    }

    setLoading(false);

    return () => {
      if (unsubClients) unsubClients();
      if (unsubTemplates) unsubTemplates();
      if (unsubFollowUps) unsubFollowUps();
    };
  }, [userId]);

  const addClient = useCallback(async (clientData) => {
    try { await clientService.create(userId, clientData); } catch (err) { setError('Error al agregar cliente'); }
  }, [userId]);

  const updateClient = useCallback(async (clientId, updates) => {
    try { await clientService.update(clientId, updates); } catch (err) { setError('Error al actualizar'); }
  }, []);

  const deleteClient = useCallback(async (clientId) => {
    try { await clientService.delete(clientId); } catch (err) { setError('Error al eliminar'); }
  }, []);

  const searchClients = useCallback(async (searchTerm) => {
    try { return await clientService.search(userId, searchTerm); } catch { return []; }
  }, [userId]);

  const sendMessage = useCallback(async (clientId, templateId, messageText) => {
    try {
      await messageService.log(clientId, { templateId, content: messageText, type: 'outgoing', userId });
      if (templateId) await templateService.incrementUsage(templateId);
    } catch (err) { console.error('Error sending message:', err); }
  }, [userId]);

  const addTemplate = useCallback(async (templateData) => {
    try { await templateService.create(userId, templateData); } catch { setError('Error al crear plantilla'); }
  }, [userId]);

  const updateTemplate = useCallback(async (templateId, updates) => {
    try { await templateService.update(templateId, updates); } catch { setError('Error al actualizar'); }
  }, []);

  const deleteTemplate = useCallback(async (templateId) => {
    try { await templateService.delete(templateId); } catch { setError('Error al eliminar'); }
  }, []);

  const addFollowUp = useCallback(async (clientId, data) => {
    try { await followUpService.create(userId, clientId, data); } catch { setError('Error'); }
  }, [userId]);

  const completeFollowUp = useCallback(async (followUpId) => {
    try { await followUpService.complete(followUpId); } catch { setError('Error'); }
  }, []);

  const deleteFollowUp = useCallback(async (followUpId) => {
    try { await followUpService.delete(followUpId); } catch { setError('Error'); }
  }, []);

  const exportToCSV = useCallback(() => {
    const csv = exportService.toCSV(clients);
    exportService.download(csv, `clientes_${new Date().toISOString().split('T')[0]}.csv`);
  }, [clients]);

  const defaultTemplates = [
    { name: 'Saludo inicial', content: 'Hola {nombre} 👋, bienvenido/a a {empresa}. ¿En qué puedo ayudarte hoy?', category: 'saludo' },
    { name: 'Información de precios', content: 'Hola {nombre}, te comparto los precios:\n\n📦 {producto}: ${precio}\n\n¿Te interesa? 😊', category: 'ventas' },
    { name: 'Seguimiento post-venta', content: 'Hola {nombre}! ¿Cómo te fue con tu compra? 🤝', category: 'seguimiento' },
    { name: 'Despedida', content: 'Gracias por contactarnos {nombre}! Que tengas un excelente día 😄', category: 'cierre' }
  ];

  const initDefaultData = useCallback(async () => {
    if (templates.length > 0) return;
    for (const tmpl of defaultTemplates) {
      try { await addTemplate(tmpl); } catch {}
    }
  }, [templates.length, addTemplate]);

  return {
    clients, templates, followUps, stats, loading, error,
    addClient, updateClient, deleteClient, searchClients,
    sendMessage,
    addTemplate, updateTemplate, deleteTemplate,
    defaultTemplates, initDefaultData,
    addFollowUp, completeFollowUp, deleteFollowUp,
    exportToCSV
  };
}
