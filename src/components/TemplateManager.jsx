import { useState } from 'react';

export default function TemplateManager({ templates, setTemplates, isLicensed }) {
  const [editId, setEditId] = useState(null);

  if (!isLicensed) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Plantillas Rápidas</h2>
          <p className="text-gray-500 text-sm">Usa <code className="bg-gray-100 px-1 rounded">{"{nombre}"}</code> para personalizar.</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-xl text-xs">
          <strong>📱 Modo Demo:</strong> Estas son plantillas de ejemplo. <span className="underline cursor-pointer">Activa tu licencia</span> para crear las tuyas.
        </div>

        <div className="space-y-4">
          {templates.map(tmpl => (
            <div key={tmpl.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3">
              <p className="font-bold text-gray-800">{tmpl.name}</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{tmpl.text}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const handleChange = (id, field, value) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleAdd = () => {
    const newId = Date.now().toString();
    setTemplates(prev => [...prev, { id: newId, name: 'Nueva plantilla', text: '' }]);
  };

  const handleDelete = (id) => {
    if (confirm('¿Eliminar esta plantilla?')) {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Plantillas Rápidas</h2>
          <p className="text-gray-500 text-sm">Usa <code className="bg-gray-100 px-1 rounded">{"{nombre}"}</code> para personalizar.</p>
        </div>
        <button onClick={handleAdd} className="bg-wa-green text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-wa-dark transition-colors">
          + Nueva
        </button>
      </div>

      <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-xl text-xs">
        <strong>✅ Licencia Activa:</strong> Crea todas las plantillas que necesites.
      </div>

      <div className="space-y-4">
        {templates.map(tmpl => (
          <div key={tmpl.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3">
            <div className="flex justify-between items-start gap-3">
              <input
                type="text"
                value={tmpl.name}
                onChange={e => handleChange(tmpl.id, 'name', e.target.value)}
                className="flex-1 font-bold text-gray-800 outline-none text-lg bg-transparent"
                placeholder="Nombre"
                disabled={editId !== tmpl.id}
              />
              <button onClick={() => handleDelete(tmpl.id)} className="text-red-400 hover:text-red-600 transition-colors" title="Eliminar">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <textarea
              value={tmpl.text}
              onChange={e => handleChange(tmpl.id, 'text', e.target.value)}
              rows="2"
              className="w-full text-sm text-gray-600 outline-none bg-gray-50 p-3 rounded-lg border border-transparent focus:border-wa-green resize-none disabled:bg-transparent disabled:cursor-default"
              placeholder="Texto..."
              disabled={editId !== tmpl.id}
            ></textarea>
            <div className="flex justify-end">
              {editId === tmpl.id ? (
                <button onClick={() => setEditId(null)} className="text-wa-dark text-sm font-semibold">Listo ✓</button>
              ) : (
                <button onClick={() => setEditId(tmpl.id)} className="text-gray-400 hover:text-wa-dark text-sm font-semibold transition-colors">Editar</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
