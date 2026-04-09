export default function Dashboard({ stats, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wa-dark"></div>
      </div>
    );
  }

  const hours = new Date().getHours();
  const greeting = hours < 12 ? 'Buenos días' : hours < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">{greeting} 👋</h2>
        <p className="text-gray-500 text-sm">Resumen de tu CRM</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Clientes</p>
          <p className="text-3xl font-bold text-gray-800">{stats.totalClients}</p>
        </div>
        <div className="bg-wa-dark p-5 rounded-2xl shadow-sm text-white">
          <p className="text-sm text-wa-light mb-1">Enviados Hoy</p>
          <p className="text-3xl font-bold">{stats.messagesToday}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">VIP</p>
          <p className="text-3xl font-bold text-yellow-500">{stats.vipCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Pendientes</p>
          <p className="text-3xl font-bold text-orange-500">{stats.pendingCount}</p>
        </div>
      </div>

      {/* Conversion Rate */}
      <div className="bg-gradient-to-r from-wa-dark to-wa-green p-6 rounded-2xl shadow-sm text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-wa-light mb-1">Tasa de Conversión</p>
            <p className="text-4xl font-bold">{stats.conversionRate}%</p>
          </div>
          <div className="text-5xl">📈</div>
        </div>
        <div className="mt-4 bg-white/20 rounded-full h-2">
          <div 
            className="bg-white rounded-full h-2 transition-all duration-500"
            style={{ width: `${stats.conversionRate}%` }}
          ></div>
        </div>
      </div>

      {/* Tag Distribution */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-700 mb-4">Distribución por Etiquetas</h3>
        <div className="space-y-3">
          {[
            { tag: 'Nuevo', count: stats.newCount, color: 'bg-blue-400', bg: 'bg-blue-100' },
            { tag: 'Pendiente', count: stats.pendingCount, color: 'bg-orange-400', bg: 'bg-orange-100' },
            { tag: 'VIP', count: stats.vipCount, color: 'bg-yellow-400', bg: 'bg-yellow-100' }
          ].map(({ tag, count, color, bg }) => (
            <div key={tag} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${color}`}></span>
                <span className="text-sm text-gray-600">{tag}s</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${bg} text-gray-800`}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Activity */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-700 mb-4">Actividad Semanal</h3>
        <div className="flex items-end gap-2 h-32">
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, i) => {
            const height = Math.random() * 80 + 20;
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full bg-wa-green rounded-t-md transition-all duration-500"
                  style={{ height: `${height}%` }}
                ></div>
                <span className="text-xs text-gray-400">{day}</span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center">
          {stats.messagesThisWeek} mensajes esta semana
        </p>
      </div>

      {/* Security Note */}
      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl text-xs leading-relaxed">
        <strong>🔒 Datos seguros:</strong> Tu información se almacena encriptada en la nube y se sincroniza automáticamente entre todos tus dispositivos.
      </div>
    </div>
  );
}
