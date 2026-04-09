export default function Dashboard({ clients, messageLog, isLicensed }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const messagesToday = messageLog.filter(log => log.timestamp >= today.getTime()).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Buenos días 👋</h2>
        <p className="text-gray-500 text-sm">Resumen de tu actividad</p>
      </div>

      {!isLicensed && (
        <div className="bg-wa-dark text-white p-4 rounded-xl shadow-lg">
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
      )}

      {isLicensed && (
        <div className="bg-gradient-to-r from-wa-dark to-wa-green text-white p-4 rounded-xl flex items-center gap-3">
          <span className="text-2xl">⭐</span>
          <div>
            <p className="font-bold">Licencia Completa Activada</p>
            <p className="text-sm opacity-90">Clientes ilimitados • Plantillas ilimitadas • Soporte por WhatsApp</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Clientes {isLicensed ? 'Totales' : 'Demo'}</p>
          <p className="text-3xl font-bold text-gray-800">{clients.length}</p>
          {!isLicensed && <p className="text-xs text-gray-400 mt-1">Datos de ejemplo</p>}
        </div>
        <div className="bg-wa-dark p-5 rounded-2xl shadow-sm text-white">
          <p className="text-sm text-wa-light mb-1">Enviados Hoy</p>
          <p className="text-3xl font-bold">{messagesToday}</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl text-xs leading-relaxed">
        <strong>🔒 Modo Seguro:</strong> Cumple con los Términos de WhatsApp. Se abre tu app oficial para confirmación manual.
      </div>
    </div>
  );
}
