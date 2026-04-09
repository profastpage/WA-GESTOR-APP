import { useState } from 'react';

export default function FollowUpManager({ followUps, clients, onAdd, onComplete, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    clientId: '',
    title: '',
    description: '',
    dueDate: '',
    priority: 'media'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.clientId || !form.title || !form.dueDate) return;
    
    await onAdd(form.clientId, {
      title: form.title,
      description: form.description,
      dueDate: new Date(form.dueDate),
      priority: form.priority
    });
    
    setShowForm(false);
    setForm({ clientId: '', title: '', description: '', dueDate: '', priority: 'media' });
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Cliente';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-700 border-red-200';
      case 'media': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'baja': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const date = dueDate.toDate ? dueDate.toDate() : new Date(dueDate);
    return date < new Date();
  };

  const formatDate = (dueDate) => {
    if (!dueDate) return '';
    const date = dueDate.toDate ? dueDate.toDate() : new Date(dueDate);
    return date.toLocaleDateString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-800">← Volver</button>
          <h2 className="text-2xl font-bold text-gray-800">Nuevo Seguimiento</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
            <select value={form.clientId} onChange={(e) => setForm({...form, clientId: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-wa-green outline-none bg-white" required>
              <option value="">Seleccionar cliente...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-wa-green outline-none" placeholder="Ej: Llamar para seguimiento" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows="3" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-wa-green outline-none resize-none" placeholder="Detalles del seguimiento..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha límite *</label>
              <input type="datetime-local" value={form.dueDate} onChange={(e) => setForm({...form, dueDate: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-wa-green outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
              <select value={form.priority} onChange={(e) => setForm({...form, priority: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-wa-green outline-none bg-white">
                <option value="baja">🟢 Baja</option>
                <option value="media">🟡 Media</option>
                <option value="alta">🔴 Alta</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full bg-wa-dark text-white font-semibold py-3 rounded-xl hover:bg-wa-green transition-colors shadow-lg">Crear Seguimiento</button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Seguimiento</h2>
          <p className="text-sm text-gray-500">{followUps.length} pendientes</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-wa-green text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-wa-dark transition-colors">+ Nuevo</button>
      </div>
      {followUps.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <p className="text-4xl mb-2">✅</p>
          <p className="font-medium">Sin seguimientos pendientes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {followUps.map(fu => (
            <div key={fu.id} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${isOverdue(fu.dueDate) ? 'border-red-500' : 'border-wa-green'}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-800">{fu.title}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${getPriorityColor(fu.priority)}`}>{fu.priority}</span>
                    {isOverdue(fu.dueDate) && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-red-100 text-red-700">Vencido</span>}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">👤 {getClientName(fu.clientId)}</p>
                  {fu.description && <p className="text-xs text-gray-400 mt-1">{fu.description}</p>}
                  <p className={`text-xs mt-2 ${isOverdue(fu.dueDate) ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>📅 {formatDate(fu.dueDate)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onComplete(fu.id)} className="bg-green-100 text-green-600 p-2 rounded-lg hover:bg-green-200 transition-colors" title="Completado">✅</button>
                  <button onClick={() => onDelete(fu.id)} className="bg-gray-100 text-red-400 p-2 rounded-lg hover:bg-red-50 transition-colors" title="Eliminar">🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
