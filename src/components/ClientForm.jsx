import { useState } from 'react';

export default function ClientForm({ onSave, editData, onCancel }) {
  const [form, setForm] = useState({
    name: editData?.name || '',
    phone: editData?.phone || '',
    email: editData?.email || '',
    company: editData?.company || '',
    tags: editData?.tags || ['Nuevo'],
    notes: editData?.notes || []
  });
  const [newNote, setNewNote] = useState('');

  const availableTags = ['Nuevo', 'Pendiente', 'VIP', 'Interesado', 'Comprador', 'Inactivo'];

  const toggleTag = (tag) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    setForm(prev => ({
      ...prev,
      notes: [...prev.notes, { text: newNote, date: new Date() }]
    }));
    setNewNote('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      alert('Nombre y teléfono son obligatorios.');
      return;
    }
    onSave({
      ...form,
      id: editData?.id
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-800 text-xl">
          ←
        </button>
        <h2 className="text-2xl font-bold text-gray-800">
          {editData ? 'Editar Cliente' : 'Nuevo Cliente'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-semibold text-gray-700">Información Básica</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-wa-green focus:border-transparent outline-none"
              placeholder="Juan Pérez"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({...form, phone: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-wa-green focus:border-transparent outline-none"
              placeholder="Ej: 5491112345678"
              required
            />
            <p className="text-xs text-gray-400 mt-1">Incluye código de país sin el +</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-wa-green focus:border-transparent outline-none"
              placeholder="juan@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
            <input
              type="text"
              value={form.company}
              onChange={(e) => setForm({...form, company: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-wa-green focus:border-transparent outline-none"
              placeholder="Nombre de la empresa"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-3">Etiquetas</h3>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  form.tags.includes(tag)
                    ? 'bg-wa-dark text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tag === 'VIP' && '⭐'}
                {tag === 'Nuevo' && '🆕'}
                {tag === 'Pendiente' && '⏳'}
                {tag === 'Interesado' && '👀'}
                {tag === 'Comprador' && '🛒'}
                {tag === 'Inactivo' && '😴'}
                {' '}{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-3">Notas</h3>
          
          {form.notes.length > 0 && (
            <div className="space-y-2 mb-4">
              {form.notes.map((note, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded-lg text-sm">
                  <p className="text-gray-700">{note.text}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {note.date ? new Date(note.date.toDate?.() || note.date).toLocaleDateString() : ''}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNote())}
              className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-wa-green focus:border-transparent outline-none text-sm"
              placeholder="Agregar nota..."
            />
            <button
              type="button"
              onClick={addNote}
              className="px-4 py-2 bg-wa-green text-white rounded-xl hover:bg-wa-dark transition-colors text-sm"
            >
              +
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-wa-dark text-white font-semibold py-3 rounded-xl hover:bg-wa-green transition-colors shadow-lg"
        >
          {editData ? 'Guardar Cambios' : 'Agregar Cliente'}
        </button>
      </form>
    </div>
  );
}
