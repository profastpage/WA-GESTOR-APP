import { useState } from 'react';
import ClientForm from './ClientForm';
import { generateWhatsAppLink, formatPhoneDisplay } from '../utils/whatsapp';

const COMPANY_PHONE = '51933667414';

const AVAILABLE_VARS = [
  { key: '{nombre}', label: 'Nombre', desc: 'Juan' },
  { key: '{apellido}', label: 'Apellido', desc: 'Pérez' },
  { key: '{nombre_completo}', label: 'Nombre completo', desc: 'Juan Pérez' },
  { key: '{empresa}', label: 'Empresa', desc: 'Mi Empresa' },
  { key: '{telefono}', label: 'Teléfono', desc: '933667414' },
  { key: '{email}', label: 'Email', desc: 'juan@email.com' },
  { key: '{fecha}', label: 'Fecha hoy', desc: '09/04/2026' },
  { key: '{hora}', label: 'Hora actual', desc: '14:30' },
  { key: '{producto}', label: 'Producto', desc: 'Plan Premium' },
  { key: '{precio}', label: 'Precio', desc: 'S/120' }
];

function replaceVars(text, client) {
  let result = text;
  const nameParts = (client.name || '').split(' ');
  result = result.replace(/{nombre}/g, nameParts[0] || 'Cliente');
  result = result.replace(/{apellido}/g, nameParts.slice(1).join(' ') || '');
  result = result.replace(/{nombre_completo}/g, client.name || 'Cliente');
  result = result.replace(/{empresa}/g, client.company || 'tu empresa');
  result = result.replace(/{telefono}/g, client.phone || '');
  result = result.replace(/{email}/g, client.email || '');
  const today = new Date();
  result = result.replace(/{fecha}/g, today.toLocaleDateString('es'));
  result = result.replace(/{hora}/g, today.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }));
  result = result.replace(/{producto}/g, '');
  result = result.replace(/{precio}/g, '');
  return result;
}

export default function ClientList({ clients, setClients, templates, logMessage, isLicensed, user, isApproved, onSaveClient, onDeleteClient }) {
  const [showForm, setShowForm] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [filterTag, setFilterTag] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionModal, setActionModal] = useState(null);

  const handleSaveClient = (clientData) => {
    if (onSaveClient) {
      onSaveClient(clientData);
    } else if (setClients) {
      if (clientData.id) {
        setClients(prev => prev.map(c => c.id === clientData.id ? { ...c, ...clientData } : c));
      } else {
        setClients(prev => [...prev, { ...clientData, id: Date.now().toString() }]);
      }
    }
    setShowForm(false);
    setEditClient(null);
  };

  const handleDelete = (id) => {
    if (onDeleteClient) {
      onDeleteClient(id);
    } else if (setClients && confirm("¿Eliminar cliente?")) {
      setClients(prev => prev.filter(c => c.id !== id));
    }
  };

  const filteredClients = clients.filter(client => {
    const tags = client.tags || (client.tag ? [client.tag] : []);
    const matchesTag = filterTag === 'Todos' || tags.includes(filterTag);
    const matchesSearch = !searchTerm || 
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTag && matchesSearch;
  });

  if (showForm) {
    return <ClientForm onSave={handleSaveClient} editData={editClient} onCancel={() => { setShowForm(false); setEditClient(null); }} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Clientes</h2>
        <button onClick={() => { setEditClient(null); setShowForm(true); }} className="bg-wa-green text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-wa-dark transition-colors">+ Nuevo</button>
      </div>

      <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="🔍 Buscar por nombre, teléfono, email..." className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-wa-green outline-none" />

      <div className="flex gap-2 overflow-x-auto pb-2">
        {['Todos', 'Nuevo', 'Pendiente', 'VIP'].map(tag => (
          <button key={tag} onClick={() => setFilterTag(tag)} className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${filterTag === tag ? 'bg-wa-dark text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600'}`}>{tag}</button>
        ))}
      </div>

      {user && !isApproved && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 p-3 rounded-xl text-xs">
          ⏳ <strong>Cuenta Demo:</strong> Los mensajes se envían al número de empresa <strong>933 667 414</strong>. Contacta al administrador para activar tu licencia.
        </div>
      )}
      {user && isApproved && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-300 p-3 rounded-xl text-xs">
          ✅ <strong>Licencia Activa:</strong> Puedes enviar mensajes a cualquier número.
        </div>
      )}
      {!user && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 p-3 rounded-xl text-xs">
          📲 <strong>Mensajes:</strong> Se envían al número de empresa <strong>933 667 414</strong> con el mensaje prerellenado.
        </div>
      )}

      <div className="space-y-3">
        {filteredClients.length === 0 ? (
          <div className="text-center py-10 text-gray-400 dark:text-gray-500">
            <p className="text-4xl mb-2">📭</p>
            <p className="font-medium">{searchTerm ? 'No se encontraron resultados' : 'No hay clientes aún'}</p>
          </div>
        ) : (
          filteredClients.map(client => {
            const tags = client.tags || (client.tag ? [client.tag] : []);
            return (
              <div key={client.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 mr-3" onClick={() => setActionModal(client)} style={{cursor: 'pointer'}}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-800 dark:text-white truncate">{client.name}</h3>
                      {tags.map(tag => (
                        <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${tag === 'VIP' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' : tag === 'Pendiente' ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'}`}>{tag}</span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formatPhoneDisplay(client.phone)}</p>
                    {client.email && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">📧 {client.email}</p>}
                    {client.company && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">🏢 {client.company}</p>}
                    {(client.notes || []).length > 0 && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">📝 {(client.notes[client.notes.length - 1]?.text || client.notes[client.notes.length - 1])}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setActionModal(client)} className="bg-wa-green text-white p-2 rounded-lg hover:bg-wa-dark transition-colors" title="Enviar WhatsApp">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </button>
                    <button onClick={() => { setEditClient(client); setShowForm(true); }} className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">✏️</button>
                    <button onClick={() => handleDelete(client.id)} className="bg-gray-100 dark:bg-gray-700 text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">🗑️</button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal enviar WhatsApp */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex flex-col justify-end z-50 pb-16" onClick={() => setActionModal(null)}>
          <div className="bg-white dark:bg-gray-800 w-full rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Enviar a {actionModal.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{formatPhoneDisplay(actionModal.phone)}</p>
            <div className={`${user && !isApproved ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300' : 'bg-wa-dark text-white'} text-xs p-2 rounded-lg mb-4 text-center`}>
              {user && !isApproved 
                ? '⏳ Demo: Se envía a <strong>933 667 414</strong>'
                : user && isApproved 
                  ? '✅ Enviando a: <strong>' + formatPhoneDisplay(actionModal.phone) + '</strong>'
                  : '📲 Se envía a: <strong>933 667 414</strong>'
              }
            </div>
            
            <div className="space-y-3">
              {templates.map(tmpl => {
                const preview = replaceVars(tmpl.content || tmpl.text || '', actionModal);
                return (
                  <button key={tmpl.id} onClick={() => {
                    const destPhone = (user && isApproved) ? actionModal.phone : COMPANY_PHONE;
                    const message = replaceVars(tmpl.content || tmpl.text || '', actionModal);
                    window.open(generateWhatsAppLink(destPhone, message), '_blank');
                    logMessage(actionModal.id);
                    setActionModal(null);
                  }} className="w-full text-left p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-wa-green hover:bg-wa-light dark:hover:bg-gray-700 transition-all group">
                    <p className="font-semibold text-sm text-wa-dark dark:text-wa-green">{tmpl.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{preview}</p>
                    {tmpl.usageCount > 0 && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Usada {tmpl.usageCount} veces</p>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Exportar para usar en TemplateManager
export { AVAILABLE_VARS, replaceVars };
