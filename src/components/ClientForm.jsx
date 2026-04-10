import { useState, useEffect } from 'react';
import ActivationModal from './ActivationModal';

export default function ClientForm({ onSave, editData, onCancel }) {
  const [form, setForm] = useState({ name: editData?.name || '', phone: editData?.phone || '', tag: editData?.tag || 'Nuevo', notes: editData?.notes || '' });
  const [showActivation, setShowActivation] = useState(false);
  
  // Clipboard detection state
  const [clipboardPhone, setClipboardPhone] = useState(null);
  const [clipboardDismissed, setClipboardDismissed] = useState(false);

  // Detect phone number from clipboard on mount
  useEffect(() => {
    if (editData || clipboardDismissed) return;

    const detectClipboard = async () => {
      try {
        if (!navigator.clipboard || !navigator.clipboard.readText) return;
        const text = await navigator.clipboard.readText();
        if (!text) return;
        const cleanText = text.replace(/[^\d+]/g, '');
        const phoneMatch = cleanText.match(/^\+?(\d{9,12})$/);
        if (phoneMatch) {
          let detectedPhone = phoneMatch[1];
          if (detectedPhone.length === 9 && detectedPhone.startsWith('9')) {
            detectedPhone = '51' + detectedPhone;
          }
          setClipboardPhone(detectedPhone);
        }
      } catch (err) {
        console.log('Clipboard detection skipped:', err.message);
      }
    };

    const timer = setTimeout(detectClipboard, 300);
    return () => clearTimeout(timer);
  }, [editData, clipboardDismissed]);

  const useClipboardPhone = () => {
    if (clipboardPhone) {
      setForm(prev => ({ ...prev, phone: clipboardPhone }));
      setClipboardDismissed(true);
    }
  };

  const dismissClipboard = () => {
    setClipboardDismissed(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.phone.trim()) {
      alert("El teléfono es obligatorio.");
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
        <button onClick={onCancel} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{editData ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
      </div>

      {/* Clipboard detection banner */}
      {clipboardPhone && !clipboardDismissed && !editData && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl p-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📋</span>
            <div className="flex-1">
              <p className="font-semibold text-blue-800 dark:text-blue-300 text-sm">¿Número detectado en portapapeles?</p>
              <p className="text-blue-600 dark:text-blue-400 font-mono text-lg mt-1">{clipboardPhone.replace(/(\d{2})(\d{3})(\d{3})/, '$1 $2 $3')}</p>
              <div className="flex gap-3 mt-3">
                <button type="button" onClick={useClipboardPhone} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">✓ Usar este número</button>
                <button type="button" onClick={dismissClipboard} className="text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">Ignorar</button>
              </div>
            </div>
            <button onClick={dismissClipboard} className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 text-lg leading-none">&times;</button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre (opcional)</label>
          <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-wa-green focus:border-transparent outline-none transition-all" placeholder="Juan Pérez" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono *</label>
          <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-wa-green focus:border-transparent outline-none transition-all ${clipboardPhone && !clipboardDismissed ? 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-white' : 'border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white'}`} placeholder="Ej: 51987654321" required />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Incluye el código de país sin el + (Ej: 51 para Perú).</p>
          {clipboardPhone && form.phone === clipboardPhone && <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">✅ Número importado del portapapeles</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Etiqueta</label>
          <select value={form.tag} onChange={e => setForm({...form, tag: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-wa-green focus:border-transparent outline-none transition-all bg-white dark:bg-gray-700">
            <option value="Nuevo">🆕 Nuevo</option>
            <option value="Pendiente">⏳ Pendiente</option>
            <option value="VIP">⭐ VIP</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas Internas</label>
          <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows="3" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-wa-green focus:border-transparent outline-none transition-all resize-none" placeholder="¿Interesado en producto X?"></textarea>
        </div>
        <button type="submit" className="w-full bg-wa-dark text-white font-semibold py-3 rounded-xl hover:bg-wa-green transition-colors shadow-lg">{editData ? 'Guardar Cambios' : 'Agregar Cliente'}</button>
      </form>

      <ActivationModal isOpen={showActivation} onClose={() => setShowActivation(false)} />
    </div>
  );
}
