export default function Dashboard({ clients, messageLog, isPro }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const messagesToday = messageLog.filter(log => log.timestamp >= today.getTime()).length;
  const tagCounts = clients.reduce((acc, client) => { acc[client.tag] = (acc[client.tag] || 0) + 1; return acc; }, {});
  const clientLimit = isPro ? '∞' : '30';
  const clientPercentage = isPro ? 0 : Math.min((clients.length / 30) * 100, 100);
  
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-gray-800">Buenos días 👋</h2><p className="text-gray-500 text-sm">Resumen de tu actividad</p></div>
      
      {isPro && (
        <div className="bg-gradient-to-r from-wa-dark to-wa-green text-white p-4 rounded-xl flex items-center gap-3">
          <span className="text-2xl">⭐</span>
          <div>
            <p className="font-bold">Plan Pro Activado</p>
            <p className="text-sm opacity-90">Clientes ilimitados • Plantillas ilimitadas • Soporte prioritario</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Clientes</p>
          <p className="text-3xl font-bold text-gray-800">{clients.length}<span className="text-sm text-gray-400 font-normal">/{clientLimit}</span></p>
          {!isPro && (
            <div className="mt-2 bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${clientPercentage >= 90 ? 'bg-red-500' : clientPercentage >= 70 ? 'bg-orange-500' : 'bg-wa-green'}`}
                style={{ width: `${clientPercentage}%` }}
              ></div>
            </div>
          )}
        </div>
        <div className="bg-wa-dark p-5 rounded-2xl shadow-sm text-white"><p className="text-sm text-wa-light mb-1">Enviados Hoy</p><p className="text-3xl font-bold">{messagesToday}</p></div>
      </div>
      
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-700 mb-4">Distribución de Etiquetas</h3>
        <div className="space-y-3">
          {['Nuevo', 'Pendiente', 'VIP'].map(tag => (
            <div key={tag} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${tag === 'VIP' ? 'bg-yellow-400' : tag === 'Pendiente' ? 'bg-orange-400' : 'bg-blue-400'}`}></span>
                <span className="text-sm text-gray-600">{tag}s</span>
              </div>
              <span className="font-bold text-gray-800">{tagCounts[tag] || 0}</span>
            </div>
          ))}
        </div>
      </div>
      
      {!isPro && clients.length >= 25 && (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xl text-sm">
          <p className="font-bold mb-1">⚠️ Estás cerca del límite</p>
          <p className="text-xs">El plan Gratis permite hasta 30 clientes. <strong>Actualiza a Pro</strong> para tener clientes ilimitados.</p>
        </div>
      )}
      
      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl text-xs leading-relaxed"><strong>🔒 Modo Seguro:</strong> Cumple con los Términos de WhatsApp. Se abre tu app oficial para confirmación manual.</div>
    </div>
  );
}