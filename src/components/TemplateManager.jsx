import { useState } from 'react';
import { AVAILABLE_VARS } from './ClientList';

export default function TemplateManager({ templates, setTemplates, isLicensed, isApproved, onSave, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);
  const [form, setForm] = useState({ name: '', content: '', category: 'general' });

  const categories = [
    { value: 'general', label: '📋 General' },
    { value: 'saludo', label: '👋 Saludo' },
    { value: 'ventas', label: '💰 Ventas' },
    { value: 'seguimiento', label: '🔄 Seguimiento' },
    { value: 'recordatorio', label: '⏰ Recordatorio' },
    { value: 'cierre', label: '🤝 Cierre' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.content.trim()) return;
    
    const tmpl = { ...form, id: editTemplate?.id || Date.now().toString(), usageCount: editTemplate?.usageCount || 0, createdAt: editTemplate?.createdAt || Date.now() };

    if (onSave) {
      onSave(tmpl);
    } else if (setTemplates) {
      if (editTemplate) {
        setTemplates(prev => prev.map(t => t.id === editTemplate.id ? tmpl : t));
      } else {
        setTemplates(prev => [...prev, tmpl]);
      }
    }
    
    setShowForm(false);
    setEditTemplate(null);
    setForm({ name: '', content: '', category: 'general' });
  };

  const startEdit = (tmpl) => {
    setEditTemplate(tmpl);
    setForm({ name: tmpl.name, content: tmpl.content || tmpl.text || '', category: tmpl.category || 'general' });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (onDelete) {
      onDelete(id);
    } else if (setTemplates && confirm('¿Eliminar esta plantilla?')) {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  const copyToClipboard = async (text) => {
    if (!isApproved) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
  };

  const insertVar = (variable) => {
    setForm(prev => ({ ...prev, content: prev.content + variable }));
  };

  if (showForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => { setShowForm(false); setEditTemplate(null); }} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white text-xl">←</button>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{editTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">Información</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-wa-green outline-none" placeholder="Ej: Saludo inicial" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button key={cat.value} type="button" onClick={() => setForm({...form, category: cat.value})} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${form.category === cat.value ? 'bg-wa-dark text-white' : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'}`}>{cat.label}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Variables disponibles</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {AVAILABLE_VARS.map(v => (
                <button key={v.key} type="button" onClick={() => insertVar(v.key)} className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors border border-blue-200 dark:border-blue-700" title={v.desc}>
                  {v.key}
                </button>
              ))}
            </div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contenido *</label>
            <textarea id="template-content" value={form.content} onChange={(e) => setForm({...form, content: e.target.value})} rows="6" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-wa-green outline-none resize-none font-mono text-sm" placeholder="Hola {nombre}, te contactamos de {empresa}..." required />
          </div>

          <button type="submit" className="w-full bg-wa-dark text-white font-semibold py-3 rounded-xl hover:bg-wa-green transition-colors shadow-lg">{editTemplate ? 'Guardar Cambios' : 'Crear Plantilla'}</button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Plantillas</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{templates.length} plantillas</p>
        </div>
        <button onClick={() => { setEditTemplate(null); setForm({ name: '', content: '', category: 'general' }); setShowForm(true); }} className="bg-wa-green text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-wa-dark transition-colors">+ Nueva</button>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 p-3 rounded-xl text-xs">
        💡 <strong>Tip:</strong> Usa variables como {AVAILABLE_VARS.slice(0,4).map(v => v.key).join(', ')} para personalizar
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-10 text-gray-400 dark:text-gray-500">
          <p className="text-4xl mb-2">📝</p>
          <p className="font-medium">Sin plantillas aún</p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map(tmpl => (
            <div key={tmpl.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-800 dark:text-white">{tmpl.name}</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300">{tmpl.category || 'general'}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 whitespace-pre-wrap">{tmpl.content || tmpl.text}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 dark:text-gray-500">
                    {tmpl.usageCount > 0 && <span>📊 Usada {tmpl.usageCount} veces</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(tmpl.content || tmpl.text || '')}
                    className={`p-2 rounded-lg transition-colors ${isApproved ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900' : 'bg-gray-100 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'}`}
                    title={isApproved ? 'Copiar plantilla' : 'Solo para cuentas aprobadas'}
                    disabled={!isApproved}
                  >
                    📋
                  </button>
                  <button onClick={() => startEdit(tmpl)} className="bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-300 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors">✏️</button>
                  <button onClick={() => handleDelete(tmpl.id)} className="bg-gray-100 dark:bg-gray-600 text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
