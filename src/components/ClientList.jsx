import { useState } from 'react';
import ClientForm from './ClientForm';
import ActivationModal from './ActivationModal';
import { generateWhatsAppLink, formatPhoneDisplay, isDemoPhone, getDemoPhone } from '../utils/whatsapp';

export default function ClientList({ clients, setClients, templates, logMessage, isLicensed }) {
  const [showForm, setShowForm] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [filterTag, setFilterTag] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  // BUSCADOR UNIVERSAL: filtra por nombre, teléfono o notas
  const filteredClients = clients.filter(client => {
    const matchesTag = filterTag === 'Todos' || client.tag === filterTag;
    const matchesSearch = !searchTerm ||
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm) ||
      client.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const handleSaveClient = (clientData) => {
    if (!isLicensed) return;

    if (editClient) {
      setClients(prev => prev.map(c => c.id === editClient.id ? { ...c, ...clientData } : c));
    } else {
      setClients(prev => [...prev, { ...clientData, id: Date.now().toString() }]);
    }
    setShowForm(false);
    setEditClient(null);
  };

  const handleDelete = (id) => {
    if (!isLicensed) return;
    if (confirm('¿Eliminar cliente?')) {
      setClients(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleSendClick = (client) => {
    setPendingAction(client);
  };

  const handleEditClick = (client) => {
    if (!isLicensed) return;
    setEditClient(client);
    setShowForm(true);
  };

  if (showForm) {
    return <ClientForm onSave={handleSaveClient} editData={editClient} onCancel={() => { setShowForm(false); setEditClient(null); }} />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
        <button
          onClick={() => {
            if (!isLicensed) return;
            setEditClient(null);
            setShowForm(true);
          }}
          className="bg-wa-green text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-wa-dark transition-colors"
        >
          + Nuevo
        </button>
      </div>

      {/* BUSCADOR UNIVERSAL */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 Buscar por nombre, teléfono o notas..."
          className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-wa-green focus:border-transparent outline-none transition-all text-sm"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter Tags */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['Todos', 'Nuevo', 'Pendiente', 'VIP'].map(tag => (
          <button
            key={tag}
            onClick={() => setFilterTag(tag)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              filterTag === tag
                ? 'bg-wa-dark text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Demo Notice */}
      {!isLicensed && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-xl text-xs">
          <strong>📱 Modo Demo:</strong> Estos son datos de ejemplo. <span className="underline cursor-pointer" onClick={() => {}}>Activa tu licencia</span> para guardar tus propios clientes.
        </div>
      )}

      {/* Licencia Activa */}
      {isLicensed && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-xl text-xs">
          <strong>✅ Licencia Activa:</strong> Tienes acceso completo. Los mensajes se envían directamente a tus clientes.
        </div>
      )}

      {/* Client List */}
      <div className="space-y-3">
        {filteredClients.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-4xl mb-2">📭</p>
            <p className="font-medium">
              {searchTerm ? 'No se encontraron resultados' : 'No hay clientes aquí'}
            </p>
            {!searchTerm && !isLicensed && (
              <p className="text-sm mt-1">Los datos de demo aparecerán aquí</p>
            )}
          </div>
        ) : (
          filteredClients.map(client => (
            <div key={client.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Card completa clickeable */}
              <div
                onClick={() => handleSendClick(client)}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="p-4 flex justify-between items-center">
                  <div className="flex-1 min-w-0 mr-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800 truncate">{client.name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        client.tag === 'VIP' ? 'bg-yellow-100 text-yellow-700' :
                        client.tag === 'Pendiente' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {client.tag}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{formatPhoneDisplay(client.phone)}</p>
                    {client.notes && <p className="text-xs text-gray-400 mt-1 truncate">📝 {client.notes}</p>}
                    {!isLicensed && isDemoPhone(client.phone) && (
                      <p className="text-[10px] text-wa-green mt-1 font-semibold">📲 Demo → Se envía a 933 667 414</p>
                    )}
                  </div>
                  {/* Botones de acción */}
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleSendClick(client)}
                      className="bg-wa-green text-white p-2 rounded-lg hover:bg-wa-dark transition-colors sm:p-2.5"
                      title="Enviar WhatsApp"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleEditClick(client)}
                      className="bg-gray-100 text-gray-500 p-2 rounded-lg hover:bg-gray-200 transition-colors sm:p-2.5"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="bg-gray-100 text-red-400 p-2 rounded-lg hover:bg-red-50 transition-colors sm:p-2.5"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Plantillas */}
      {pendingAction && (
        <div
          className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={() => setPendingAction(null)}
          style={{ touchAction: 'manipulation' }}
        >
          <div
            className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl p-4 sm:p-6 max-h-[85vh] overflow-y-auto animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 sm:hidden"></div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1">Enviar a {pendingAction.name}</h3>
            <p className="text-sm text-gray-500 mb-3">{formatPhoneDisplay(pendingAction.phone)}</p>

            {!isLicensed && (
              <div className="bg-wa-dark text-white text-xs p-3 rounded-lg mb-4">
                📲 <strong>Demo en vivo:</strong> El mensaje se enviará a <strong>933 667 414</strong> (Fast Page Pro)
              </div>
            )}

            <div className="space-y-3 mb-4">
              {templates.map(tmpl => (
                <button
                  key={tmpl.id}
                  onClick={() => {
                    const destPhone = isLicensed ? pendingAction.phone : getDemoPhone();
                    const message = tmpl.text.replace('{nombre}', pendingAction.name.split(' ')[0]);
                    window.open(generateWhatsAppLink(destPhone, message), '_blank');
                    logMessage(pendingAction.id);
                    setPendingAction(null);
                  }}
                  className="w-full text-left p-4 border-2 border-gray-200 rounded-xl hover:border-wa-green hover:bg-wa-light transition-all active:scale-98 sm:hover:scale-[1.02]"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <p className="font-semibold text-sm text-wa-dark">{tmpl.name}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{tmpl.text.replace('{nombre}', pendingAction.name.split(' ')[0])}</p>
                </button>
              ))}
            </div>

            {!isLicensed && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="bg-gradient-to-br from-wa-dark to-wa-green text-white p-4 rounded-xl mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-sm">🚀 Plan Premium</p>
                    <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-bold">S/120 único</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                    <div className="bg-white/10 rounded-lg p-2">
                      <p className="font-semibold mb-1">Gratis</p>
                      <p className="opacity-80">3 clientes demo</p>
                      <p className="opacity-80">3 plantillas</p>
                      <p className="opacity-80">Datos no se guardan</p>
                    </div>
                    <div className="bg-white/20 rounded-lg p-2 border-2 border-white/40">
                      <p className="font-semibold mb-1">⭐ Premium</p>
                      <p>Clientes ilimitados</p>
                      <p>Plantillas ilimitadas</p>
                      <p>Datos persistentes</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm mb-4">
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0">✅</span>
                      <span><strong>Datos persistentes</strong> en la nube</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0">✅</span>
                      <span><strong>Sincronización automática</strong> entre dispositivos</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0">✅</span>
                      <span><strong>Historial completo</strong> de interacciones</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0">✅</span>
                      <span><strong>Exportación CSV/Excel</strong> de clientes</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0">✅</span>
                      <span><strong>Recordatorios automáticos</strong> de seguimiento</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0">✅</span>
                      <span><strong>Búsqueda avanzada</strong> de clientes</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0">✅</span>
                      <span>Clientes y plantillas <strong>ilimitados</strong></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0">✅</span>
                      <span>Soporte prioritario por WhatsApp</span>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-3 mb-4 text-xs">
                    <p className="italic">"Increíble herramienta, ahora gestiono todos mis clientes desde el celular. Vale cada sol."</p>
                    <p className="font-semibold mt-2">— Carlos M., Emprendedor Lima</p>
                  </div>

                  <div className="bg-yellow-400/20 border border-yellow-400/40 rounded-lg p-3 mb-4 flex items-start gap-2 text-xs">
                    <span className="text-lg">🛡️</span>
                    <div>
                      <p className="font-bold">Garantía de 7 días</p>
                      <p className="opacity-90">Si no te convence, te devolvemos tu dinero sin preguntas.</p>
                    </div>
                  </div>

                  <a
                    href="https://wa.me/51933667414?text=Hola,%20quiero%20activar%20mi%20licencia%20de%20WA%20Gestor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-white text-wa-dark text-center font-bold py-3.5 sm:py-4 rounded-xl hover:bg-wa-light transition-all text-sm sm:text-base shadow-lg active:scale-95"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    💬 Activar Ahora por WhatsApp
                  </a>
                  <p className="text-center text-xs mt-2 opacity-80">⚡ Activación en menos de 5 minutos</p>
                </div>
              </div>
            )}

            <button
              onClick={() => setPendingAction(null)}
              className="mt-3 w-full text-gray-500 text-sm font-medium py-2 hover:text-gray-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal de activación simple - no usado, solo placeholder */}
    </div>
  );
}
