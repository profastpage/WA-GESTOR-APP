import { useState } from 'react';
import { AVAILABLE_VARS } from './ClientList';

export default function TemplateManager({ templates, setTemplates, isLicensed }) {
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
    
    const tmpl = {
      ...form,
      id: editTemplate?.id || Date.now().toString(),
      usageCount: editTemplate?.usageCount || 0,
      createdAt: editTemplate?.createdAt || Date.now()
    };

    if (editTemplate) {
      setTemplates(prev => prev.map(t => t.id === editTemplate.id ? tmpl : t));
    } else {
      setTemplates(prev => [...prev, tmpl]);
    }
    
    setShowForm(false);
    setEditTemplate(null);
    setForm({ name: '', content: '', category: 'general' });
  };

  const startEdit = (tmpl) => {
    setEditTemplate(tmpl);
    setForm({
      name: tmpl.name,
      content: tmpl.content || tmpl.text || '',
      category: tmpl.category || 'general'
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('¿Eliminar esta plantilla?')) {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  const insertVar = (variable) => {
    const textarea = document.getElementById('template-content');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = form.content;
      const newContent = text.substring(0, start) + variable + text.substring(end);
      setForm({...form, content: newContent});
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + variable.length;
      }, 0);
    } else {
      setForm({...form, content: form.content + variable});
    }
  };

  if (showForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => { setShowForm(false); setEditTemplate(null); }} className="text-gray-500 hover:text-gray-800 text-xl">←</button>
          <h2 className="text-2xl font-bold text-gray-800">{editTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-semibold text-gray-700">Información</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-wa-green outline-none" placeholder="Ej: Saludo inicial" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button key={cat.value} type="button" onClick={() => setForm({...form, category: cat.value})} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${form.category === cat.value ? 'bg-wa-dark text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{cat.label}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-3">Variables disponibles</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {AVAILABLE_VARS.map(v => (
                <button key={v.key} type="button" onClick={() => insertVar(v.key)} className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200" title={v.desc}>
                  {v.key}
                </button>
              ))}
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenido *</label>
            <textarea id="template-content" value={form.content} onChange={(e) => setForm({...form, content: e.target.value})} rows="6" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-wa-green outline-none resize-none font-mono text-sm" placeholder="Hola {nombre}, te contactamos de {empresa}..." required />
            <p className="text-xs text-gray-400 mt-2">Haz clic en las variables de arriba para insertarlas</p>
          </div>

          {form.content && (
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-xs text-gray-500 mb-2">Vista previa:</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {form.content
                  .replace(/{nombre}/g, 'Juan')
                  .replace(/{apellido}/g, 'Pérez')
                  .replace(/{nombre_completo}/g, 'Juan Pérez')
                  .replace(/{empresa}/g, 'Mi Empresa')
                  .replace(/{telefono}/g, '933 667 414')
                  .replace(/{email}/g, 'juan@email.com')
                  .replace(/{fecha}/g, new Date().toLocaleDateString('es'))
                  .replace(/{hora}/g, new Date().toLocaleTimeString('es', {hour:'2-digit', minute:'2-digit'}))
                  .replace(/{producto}/g, 'Plan Premium')
                  .replace(/{precio}/g, 'S/120')}
              </p>
            </div>
          )}

          <button type="submit" className="w-full bg-wa-dark text-white font-semibold py-3 rounded-xl hover:bg-wa-green transition-colors shadow-lg">{editTemplate ? 'Guardar Cambios' : 'Crear Plantilla'}</button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Plantillas</h2>
          <p className="text-sm text-gray-500">{templates.length} plantillas</p>
        </div>
        <button onClick={() => { setEditTemplate(null); setForm({ name: '', content: '', category: 'general' }); setShowForm(true); }} className="bg-wa-green text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-wa-dark transition-colors">+ Nueva</button>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-xl text-xs">
        💡 <strong>Tip:</strong> Usa {AVAILABLE_VARS.slice(0,4).map(v => v.key).join(', ')} y más para personalizar tus mensajes
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <p className="text-4xl mb-2">📝</p>
          <p className="font-medium">Sin plantillas aún</p>
          <p className="text-sm mt-1">Crea tu primera plantilla para empezar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map(tmpl => (
            <div key={tmpl.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-800">{tmpl.name}</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{tmpl.category || 'general'}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{tmpl.content || tmpl.text}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                    {tmpl.usageCount > 0 && <span>📊 Usada {tmpl.usageCount} veces</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(tmpl)} className="bg-gray-100 text-gray-500 p-2 rounded-lg hover:bg-gray-200 transition-colors">✏️</button>
                  <button onClick={() => handleDelete(tmpl.id)} className="bg-gray-100 text-red-400 p-2 rounded-lg hover:bg-red-50 transition-colors">🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
