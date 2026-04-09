import { useState } from 'react';
export default function TemplateManager({ templates, setTemplates }) {
  const [editId, setEditId] = useState(null);
  const handleChange = (id, field, value) => { setTemplates(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t)); };
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-gray-800">Plantillas Rápidas</h2><p className="text-gray-500 text-sm">Usa <code className="bg-gray-100 px-1 rounded">{"{nombre}"}</code> para personalizar.</p></div>
      <div className="space-y-4">{templates.map(tmpl => (<div key={tmpl.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3"><input type="text" value={tmpl.name} onChange={e => handleChange(tmpl.id, 'name', e.target.value)} className="w-full font-bold text-gray-800 outline-none text-lg bg-transparent" placeholder="Nombre" disabled={editId !== tmpl.id} /><textarea value={tmpl.text} onChange={e => handleChange(tmpl.id, 'text', e.target.value)} rows="2" className="w-full text-sm text-gray-600 outline-none bg-gray-50 p-3 rounded-lg border border-transparent focus:border-wa-green resize-none disabled:bg-transparent disabled:cursor-default" placeholder="Texto..." disabled={editId !== tmpl.id}></textarea><div className="flex justify-end">{editId === tmpl.id ? (<button onClick={() => setEditId(null)} className="text-wa-dark text-sm font-semibold">Listo ✓</button>) : (<button onClick={() => setEditId(tmpl.id)} className="text-gray-400 hover:text-wa-dark text-sm font-semibold transition-colors">Editar</button>)}</div></div>))}</div>
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl text-xs leading-relaxed"><strong>⚠️ Límite de 3 plantillas.</strong> Edita las existentes según tu necesidad.</div>
    </div>);
}