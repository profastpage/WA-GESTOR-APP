// Firestore Services - CRUD operations
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  onSnapshot,
  writeBatch,
  arrayUnion,
  increment
} from 'firebase/firestore';
import { db } from '../firebase';

// ==================== CLIENTES ====================

export const clientService = {
  // Crear cliente
  create: async (userId, clientData) => {
    const docRef = await addDoc(collection(db, 'clients'), {
      ...clientData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      totalMessages: 0,
      lastContact: null,
      notes: [],
      tags: clientData.tags || []
    });
    return docRef.id;
  },

  // Actualizar cliente
  update: async (clientId, updates) => {
    await updateDoc(doc(db, 'clients', clientId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  // Eliminar cliente
  delete: async (clientId) => {
    await deleteDoc(doc(db, 'clients', clientId));
  },

  // Obtener cliente
  get: async (clientId) => {
    const snap = await getDoc(doc(db, 'clients', clientId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  // Escuchar cambios en tiempo real
  listen: (userId, callback) => {
    const q = query(
      collection(db, 'clients'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const clients = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(clients);
    });
  },

  // Buscar clientes
  search: async (userId, searchTerm) => {
    const q = query(
      collection(db, 'clients'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    const clients = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    const lower = searchTerm.toLowerCase();
    return clients.filter(c => 
      c.name?.toLowerCase().includes(lower) ||
      c.phone?.includes(searchTerm) ||
      c.email?.toLowerCase().includes(lower) ||
      c.company?.toLowerCase().includes(lower)
    );
  },

  // Contar clientes por etiqueta
  countByTag: async (userId, tag) => {
    const q = query(
      collection(db, 'clients'),
      where('userId', '==', userId),
      where('tags', 'array-contains', tag)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  },

  // Incrementar contador de mensajes
  incrementMessages: async (clientId) => {
    await updateDoc(doc(db, 'clients', clientId), {
      totalMessages: increment(1),
      lastContact: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
};

// ==================== MENSAJES ====================

export const messageService = {
  // Guardar mensaje enviado
  log: async (clientId, messageData) => {
    await addDoc(collection(db, 'messages'), {
      clientId,
      ...messageData,
      createdAt: serverTimestamp()
    });
    // Actualizar cliente
    await clientService.incrementMessages(clientId);
  },

  // Escuchar mensajes de un cliente
  listenByClient: (clientId, callback) => {
    const q = query(
      collection(db, 'messages'),
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(messages);
    });
  },

  // Contar mensajes hoy
  countToday: async (userId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const q = query(
      collection(db, 'messages'),
      where('userId', '==', userId),
      where('createdAt', '>=', today)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  }
};

// ==================== PLANTILLAS ====================

export const templateService = {
  // Crear plantilla
  create: async (userId, templateData) => {
    await addDoc(collection(db, 'templates'), {
      ...templateData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      usageCount: 0,
      variables: extractVariables(templateData.content || '')
    });
  },

  // Actualizar plantilla
  update: async (templateId, updates) => {
    await updateDoc(doc(db, 'templates', templateId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  // Eliminar plantilla
  delete: async (templateId) => {
    await deleteDoc(doc(db, 'templates', templateId));
  },

  // Escuchar plantillas en tiempo real
  listen: (userId, callback) => {
    const q = query(
      collection(db, 'templates'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const templates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(templates);
    });
  },

  // Incrementar contador de uso
  incrementUsage: async (templateId) => {
    await updateDoc(doc(db, 'templates', templateId), {
      usageCount: increment(1),
      lastUsed: serverTimestamp()
    });
  }
};

// ==================== SEGUIMIENTO ====================

export const followUpService = {
  // Crear recordatorio
  create: async (userId, clientId, data) => {
    await addDoc(collection(db, 'followups'), {
      userId,
      clientId,
      ...data,
      createdAt: serverTimestamp(),
      completed: false
    });
  },

  // Marcar como completado
  complete: async (followUpId) => {
    await updateDoc(doc(db, 'followups', followUpId), {
      completed: true,
      completedAt: serverTimestamp()
    });
  },

  // Eliminar
  delete: async (followUpId) => {
    await deleteDoc(doc(db, 'followups', followUpId));
  },

  // Escuchar pendientes
  listenPending: (userId, callback) => {
    const now = new Date();
    const q = query(
      collection(db, 'followups'),
      where('userId', '==', userId),
      where('completed', '==', false),
      orderBy('dueDate', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      const followups = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(followups);
    });
  }
};

// ==================== ESTADÍSTICAS ====================

export const statsService = {
  // Obtener estadísticas del dashboard
  getDashboardStats: async (userId) => {
    const clientsSnapshot = await getDocs(
      query(collection(db, 'clients'), where('userId', '==', userId))
    );
    const totalClients = clientsSnapshot.size;
    
    const vipCount = clientsSnapshot.docs.filter(d => 
      d.data().tags?.includes('VIP')
    ).length;
    
    const pendingCount = clientsSnapshot.docs.filter(d => 
      d.data().tags?.includes('Pendiente')
    ).length;
    
    const newCount = clientsSnapshot.docs.filter(d => 
      d.data().tags?.includes('Nuevo')
    ).length;

    // Mensajes hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const messagesToday = await messageService.countToday(userId);

    // Tasa de respuesta (últimos 7 días)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentMessages = await getDocs(
      query(
        collection(db, 'messages'),
        where('userId', '==', userId),
        where('createdAt', '>=', sevenDaysAgo)
      )
    );

    return {
      totalClients,
      vipCount,
      pendingCount,
      newCount,
      messagesToday,
      messagesThisWeek: recentMessages.size,
      conversionRate: totalClients > 0 
        ? Math.round(((totalClients - pendingCount) / totalClients) * 100) 
        : 0
    };
  }
};

// ==================== UTILIDADES ====================

// Extraer variables de un template ({nombre}, {empresa}, etc.)
function extractVariables(text) {
  const regex = /\{([^}]+)\}/g;
  const variables = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }
  return variables;
}

// Exportar datos a CSV
export const exportService = {
  toCSV: (clients) => {
    if (!clients.length) return '';
    
    const headers = ['Nombre', 'Teléfono', 'Email', 'Empresa', 'Etiquetas', 'Notas', 'Total Mensajes', 'Último Contacto'];
    
    const rows = clients.map(c => [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      c.phone || '',
      c.email || '',
      c.company || '',
      `"${(c.tags || []).join(', ')}"`,
      `"${(c.notes || []).map(n => n.text).join('; ')}"`,
      c.totalMessages || 0,
      c.lastContact ? c.lastContact.toDate().toLocaleDateString() : 'Nunca'
    ]);
    
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },

  download: (csvContent, filename) => {
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
};
