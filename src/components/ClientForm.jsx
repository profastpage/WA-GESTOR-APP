import { useState } from 'react';
import ActivationModal from './ActivationModal';

export default function ClientForm({ onSave, editData, onCancel }) {
  const [form, setForm] = useState({ name: editData?.name || '', phone: editData?.phone || '', tag: editData?.tag || 'Nuevo', notes: editData?.notes || '' });
  const [showActivation, setShowActivation] = useState(false);
  
  const handleSubmit = (e) => { 
    e.preventDefault(); 
    if (!form.name.trim() || !form.phone.trim()) { 
      alert("Nombre y teléfono son obligatorios."); 
      return; 
    }
    
    if (!localStorage.getItem('wa_license_active') || localStorage.getItem('wa_license_active') !== 'true') {
      setShowActivation(true);
      return;
    }
    
    onSave(form); 
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-800">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-800">{editData ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
          <input 
            type="text" 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})} 
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-wa-green focus:border-transparent outline-none transition-all" 
            placeholder="Juan Pérez" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono (con código de país) *</label>
          <input 
            type="tel" 
            value={form.phone} 
            onChange={e => setForm({...form, phone: e.target.value})} 
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-wa-green focus:border-transparent outline-none transition-all" 
            placeholder="Ej: 51987654321" 
          />
          <p className="text-xs text-gray-400 mt-1">Incluye el código de país sin el + (Ej: 51 para Perú).</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Etiqueta</label>
          <select 
            value={form.tag} 
            onChange={e => setForm({...form, tag: e.target.value})} 
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-wa-green focus:border-transparent outline-none transition-all bg-white"
          >
            <option value="Nuevo">🆕 Nuevo</option>
            <option value="Pendiente">⏳ Pendiente</option>
            <option value="VIP">⭐ VIP</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas Internas</label>
          <textarea 
            value={form.notes} 
            onChange={e => setForm({...form, notes: e.target.value})} 
            rows="3" 
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-wa-green focus:border-transparent outline-none transition-all resize-none" 
            placeholder="¿Interesado en producto X?"
          ></textarea>
        </div>
        <button 
          type="submit" 
          className="w-full bg-wa-dark text-white font-semibold py-3 rounded-xl hover:bg-wa-green transition-colors shadow-lg"
        >
          {editData ? 'Guardar Cambios' : 'Agregar Cliente'}
        </button>
      </form>
      
      <ActivationModal 
        isOpen={showActivation} 
        onClose={() => setShowActivation(false)} 
      />
    </div>
  );
}
