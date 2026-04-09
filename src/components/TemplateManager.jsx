import { useState } from 'react';

export default function TemplateManager({ templates, onSave, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);
  const [form, setForm] = useState({
    name: '',
    content: '',
    category: 'general'
  });

  const categories = [
    { value: 'general', label: '📋 General', color: 'bg-gray-100 text-gray-700' },
    { value: 'saludo', label: '👋 Saludo', color: 'bg-blue-100 text-blue-700' },
    { value: 'ventas', label: '💰 Ventas', color: 'bg-green-100 text-green-700' },
    { value: 'seguimiento', label: '🔄 Seguimiento', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'recordatorio', label: '⏰ Recordatorio', color: 'bg-purple-100 text-purple-700' },
    { value: 'cierre', label: '🤝 Cierre', color: 'bg-red-100 text-red-700' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.content.trim()) return;
    
    await onSave({
      ...form,
      id: editTemplate?.id || undefined
    });
    
    setShowForm(false);
    setEditTemplate(null);
    setForm({ name: '', content: '', category: 'general' });
  };

  const startEdit = (tmpl) => {
    setEditTemplate(tmpl);
    setForm({
      name: tmpl.name,
      content: tmpl.content,
      category: tmpl.category || 'general'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar esta plantilla?')) {
      await onDelete(id);
    }
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => { setShowForm(false); setEditTemplate(null); }} className="text-gray-500 hover:text-gray-800">
            ← Volver
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            {editTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-wa-green focus:border-transparent outline-none"
              placeholder="Ej: Saludo inicial"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setForm({...form, category: cat.value})}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    form.category === cat.value 
                      ? `${cat.color} ring-2 ring-wa-green` 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contenido *
              <span className="text-xs text-gray-400 font-normal ml-2">
                Usa {'{nombre}'}, {'{empresa}'}, etc.
              </span>
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({...form, content: e.target.value})}
              rows="6"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-wa-green focus:border-transparent outline-none resize-none font-mono text-sm"
              placeholder="Hola {nombre}, te contactamos de {empresa}..."
              required
            />
          </div>

          {/* Preview */}
          {form.content && (
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-xs text-gray-500 mb-2">Vista previa:</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {form.content
                  .replace('{nombre}', 'Juan')
                  .replace('{empresa}', 'Mi Empresa')
                  .replace('{producto}', 'Producto X')
                  .replace('{precio}', '100')}
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-wa-dark text-white font-semibold py-3 rounded-xl hover:bg-wa-green transition-colors shadow-lg"
          >
            {editTemplate ? 'Guardar Cambios' : 'Crear Plantilla'}
          </button>
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
        <button
          onClick={() => {
            setEditTemplate(null);
            setForm({ name: '', content: '', category: 'general' });
            setShowForm(true);
          }}
          className="bg-wa-green text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-wa-dark transition-colors"
        >
          + Nueva
        </button>
      </div>

      {/* Tip */}
      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl text-xs leading-relaxed">
        <strong>💡 Variables disponibles:</strong> {'{nombre}'}, {'{empresa}'}, {'{producto}'}, {'{precio}'}, {'{fecha}'}, {'{hora}'}
      </div>

      {/* Templates by category */}
      {categories.map(cat => {
        const catTemplates = templates.filter(t => t.category === cat.value);
        if (catTemplates.length === 0) return null;
        
        return (
          <div key={cat.value}>
            <h3 className={`text-sm font-semibold px-3 py-2 rounded-lg inline-block mb-3 ${cat.color}`}>
              {cat.label} ({catTemplates.length})
            </h3>
            <div className="space-y-3">
              {catTemplates.map(tmpl => (
                <div key={tmpl.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{tmpl.name}</h4>
                      <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap line-clamp-3">
                        {tmpl.content}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                        {tmpl.usageCount > 0 && (
                          <span>📊 Usada {tmpl.usageCount} veces</span>
                        )}
                        {tmpl.variables?.length > 0 && (
                          <span> Variables: {tmpl.variables.join(', ')}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(tmpl)}
                        className="bg-gray-100 text-gray-500 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(tmpl.id)}
                        className="bg-gray-100 text-red-400 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {templates.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <p className="text-4xl mb-2">📝</p>
          <p className="font-medium">Sin plantillas aún</p>
          <p className="text-sm mt-1">Crea tu primera plantilla para empezar</p>
        </div>
      )}
    </div>
  );
}
