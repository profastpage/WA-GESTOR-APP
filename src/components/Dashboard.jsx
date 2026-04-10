export default function Dashboard({ clients, messageLog, isLicensed, isApproved }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const messagesToday = messageLog.filter(log => log.timestamp >= today.getTime()).length;
  const tagCounts = clients.reduce((acc, client) => { acc[client.tag] = (acc[client.tag] || 0) + 1; return acc; }, {});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Buenos días 👋</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Resumen de tu actividad</p>
      </div>

      {!isLicensed && (
        <div className="bg-wa-dark text-white p-4 rounded-xl shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="font-bold text-base mb-1">🔓 Modo Demo - Activa tu licencia completa por S/120</p>
              <p className="text-sm opacity-90 mb-3">Prueba la app con datos de ejemplo. Paga una sola vez y sin mensualidades.</p>
              <a
                href="https://wa.me/51933667414?text=Hola,%20quiero%20activar%20mi%20licencia%20de%20WA%20Gestor"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white text-wa-dark px-4 py-2 rounded-lg font-semibold text-sm hover:bg-wa-light transition-colors"
              >
                Activar ahora →
              </a>
            </div>
          </div>
        </div>
      )}

      {isLicensed && isApproved && (
        <div className="bg-gradient-to-r from-wa-dark to-wa-green text-white p-4 rounded-xl flex items-center gap-3">
          <span className="text-2xl">⭐</span>
          <div>
            <p className="font-bold">Licencia Completa Activada</p>
            <p className="text-sm opacity-90">Clientes ilimitados • Plantillas ilimitadas • Soporte por WhatsApp</p>
          </div>
        </div>
      )}

      {isLicensed && !isApproved && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 p-4 rounded-xl">
          <p className="font-bold">⏳ Cuenta Demo</p>
          <p className="text-sm">Contacta al administrador para activar tu licencia completa.</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Clientes {isLicensed ? 'Totales' : 'Demo'}</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{clients.length}</p>
          {!isLicensed && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Datos de ejemplo</p>}
        </div>
        <div className="bg-wa-dark p-5 rounded-2xl shadow-sm text-white"><p className="text-sm text-wa-light mb-1">Enviados Hoy</p><p className="text-3xl font-bold">{messagesToday}</p></div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">Distribución de Etiquetas</h3>
        <div className="space-y-3">
          {['Nuevo', 'Pendiente', 'VIP'].map(tag => (
            <div key={tag} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${tag === 'VIP' ? 'bg-yellow-400' : tag === 'Pendiente' ? 'bg-orange-400' : 'bg-blue-400'}`}></span>
                <span className="text-sm text-gray-600 dark:text-gray-300">{tag}s</span>
              </div>
              <span className="font-bold text-gray-800 dark:text-white">{tagCounts[tag] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      {!isLicensed && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 p-4 rounded-xl text-xs leading-relaxed">
          <strong>📱 Demo en tiempo real:</strong> Los mensajes de prueba se envían a <strong>933 667 414</strong> (Fast Page Pro). Activa tu licencia para enviar a tus propios clientes.
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 p-4 rounded-xl text-xs leading-relaxed"><strong>🔒 Modo Seguro:</strong> Cumple con los Términos de WhatsApp. Se abre tu app oficial para confirmación manual.</div>
    </div>
  );
}
