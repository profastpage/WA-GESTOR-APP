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
    totalClients: 0,
    vipCount: 0,
    pendingCount: 0,
    newCount: 0,
    messagesToday: 0,
    messagesThisWeek: 0,
    conversionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Suscribirse a datos en tiempo real
  useEffect(() => {
    if (!userId) return;

    setLoading(true);

    // Escuchar clientes
    const unsubClients = clientService.listen(userId, (data) => {
      setClients(data);
    });

    // Escuchar plantillas
    const unsubTemplates = templateService.listen(userId, (data) => {
      setTemplates(data);
    });

    // Escuchar seguimientos
    const unsubFollowUps = followUpService.listenPending(userId, (data) => {
      setFollowUps(data);
    });

    // Cargar estadísticas
    const loadStats = async () => {
      try {
        const data = await statsService.getDashboardStats(userId);
        setStats(data);
      } catch (err) {
        console.error('Error cargando estadísticas:', err);
      }
    };

    loadStats();
    setLoading(false);

    // Actualizar stats cada 30 segundos
    const statsInterval = setInterval(loadStats, 30000);

    return () => {
      unsubClients();
      unsubTemplates();
      unsubFollowUps();
      clearInterval(statsInterval);
    };
  }, [userId]);

  // ==================== CLIENTES ====================

  const addClient = useCallback(async (clientData) => {
    try {
      await clientService.create(userId, clientData);
    } catch (err) {
      setError('Error al agregar cliente');
    }
  }, [userId]);

  const updateClient = useCallback(async (clientId, updates) => {
    try {
      await clientService.update(clientId, updates);
    } catch (err) {
      setError('Error al actualizar cliente');
    }
  }, []);

  const deleteClient = useCallback(async (clientId) => {
    try {
      await clientService.delete(clientId);
    } catch (err) {
      setError('Error al eliminar cliente');
    }
  }, []);

  const searchClients = useCallback(async (searchTerm) => {
    try {
      return await clientService.search(userId, searchTerm);
    } catch (err) {
      setError('Error en búsqueda');
      return [];
    }
  }, [userId]);

  // ==================== MENSAJES ====================

  const sendMessage = useCallback(async (clientId, templateId, messageText) => {
    try {
      await messageService.log(clientId, {
        templateId,
        content: messageText,
        type: 'outgoing',
        userId
      });
      if (templateId) {
        await templateService.incrementUsage(templateId);
      }
    } catch (err) {
      setError('Error al enviar mensaje');
    }
  }, [userId]);

  // ==================== PLANTILLAS ====================

  const addTemplate = useCallback(async (templateData) => {
    try {
      await templateService.create(userId, templateData);
    } catch (err) {
      setError('Error al crear plantilla');
    }
  }, [userId]);

  const updateTemplate = useCallback(async (templateId, updates) => {
    try {
      await templateService.update(templateId, updates);
    } catch (err) {
      setError('Error al actualizar plantilla');
    }
  }, []);

  const deleteTemplate = useCallback(async (templateId) => {
    try {
      await templateService.delete(templateId);
    } catch (err) {
      setError('Error al eliminar plantilla');
    }
  }, []);

  // ==================== SEGUIMIENTO ====================

  const addFollowUp = useCallback(async (clientId, data) => {
    try {
      await followUpService.create(userId, clientId, data);
    } catch (err) {
      setError('Error al crear seguimiento');
    }
  }, [userId]);

  const completeFollowUp = useCallback(async (followUpId) => {
    try {
      await followUpService.complete(followUpId);
    } catch (err) {
      setError('Error al completar seguimiento');
    }
  }, []);

  const deleteFollowUp = useCallback(async (followUpId) => {
    try {
      await followUpService.delete(followUpId);
    } catch (err) {
      setError('Error al eliminar seguimiento');
    }
  }, []);

  // ==================== EXPORTAR ====================

  const exportToCSV = useCallback(() => {
    const csv = exportService.toCSV(clients);
    exportService.download(csv, `clientes_${new Date().toISOString().split('T')[0]}.csv`);
  }, [clients]);

  // ==================== PLANTILLAS DE DATOS ====================

  // Datos por defecto para nuevos usuarios
  const defaultTemplates = [
    { 
      name: 'Saludo inicial', 
      content: 'Hola {nombre} 👋, bienvenido/a a {empresa}. ¿En qué puedo ayudarte hoy?',
      category: 'saludo'
    },
    { 
      name: 'Información de precios', 
      content: 'Hola {nombre}, te comparto los precios de nuestros productos:\n\n📦 {producto}: ${precio}\n\n¿Te interesa? 😊',
      category: 'ventas'
    },
    { 
      name: 'Seguimiento post-venta', 
      content: 'Hola {nombre}! ¿Cómo te fue con tu compra? ¿Todo bien? Si necesitas algo, aquí estoy 🤝',
      category: 'seguimiento'
    },
    { 
      name: 'Recordatorio de cita', 
      content: 'Hola {nombre} 📅 Te recuerdo que tienes una cita el {fecha} a las {hora}. ¿Confirmas?',
      category: 'recordatorio'
    },
    { 
      name: 'Despedida', 
      content: 'Gracias por contactarnos {nombre}! Que tengas un excelente día 😄',
      category: 'cierre'
    }
  ];

  const initDefaultData = useCallback(async () => {
    if (clients.length > 0 || templates.length > 0) return;
    
    // Crear plantillas por defecto
    for (const tmpl of defaultTemplates) {
      await addTemplate(tmpl);
    }
  }, [clients.length, templates.length, addTemplate]);

  return {
    // Estado
    clients,
    templates,
    followUps,
    stats,
    loading,
    error,
    
    // Acciones clientes
    addClient,
    updateClient,
    deleteClient,
    searchClients,
    
    // Acciones mensajes
    sendMessage,
    
    // Acciones plantillas
    addTemplate,
    updateTemplate,
    deleteTemplate,
    defaultTemplates,
    initDefaultData,
    
    // Acciones seguimiento
    addFollowUp,
    completeFollowUp,
    deleteFollowUp,
    
    // Acciones exportar
    exportToCSV
  };
}
