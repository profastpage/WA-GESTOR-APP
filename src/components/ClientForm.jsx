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
    // Only detect for new clients, not when editing
    if (editData || clipboardDismissed) return;

    const detectClipboard = async () => {
      try {
        // Check if clipboard API is available
        if (!navigator.clipboard || !navigator.clipboard.readText) return;
        
        const text = await navigator.clipboard.readText();
        if (!text) return;

        // Clean the text - remove non-digit characters except +
        const cleanText = text.replace(/[^\d+]/g, '');
        
        // Look for phone pattern: 9-12 digits, optionally starting with +
        const phoneMatch = cleanText.match(/^\+?(\d{9,12})$/);
        
        if (phoneMatch) {
          let detectedPhone = phoneMatch[1];
          // If it's a Peruvian number starting with 9 and has 9 digits, add 51 prefix
          if (detectedPhone.length === 9 && detectedPhone.startsWith('9')) {
            detectedPhone = '51' + detectedPhone;
          }
          setClipboardPhone(detectedPhone);
        }
      } catch (err) {
        // Silently fail - clipboard permission denied or not available
        console.log('Clipboard detection skipped:', err.message);
      }
    };

    // Small delay to avoid interfering with page load
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
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-800">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-800">{editData ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
      </div>

      {/* Clipboard detection banner */}
      {clipboardPhone && !clipboardDismissed && !editData && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📋</span>
            <div className="flex-1">
              <p className="font-semibold text-blue-800 text-sm">¿Número detectado en portapapeles?</p>
              <p className="text-blue-600 font-mono text-lg mt-1">{clipboardPhone.replace(/(\d{2})(\d{3})(\d{3})/, '$1 $2 $3')}</p>
              <div className="flex gap-3 mt-3">
                <button
                  type="button"
                  onClick={useClipboardPhone}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  ✓ Usar este número
                </button>
                <button
                  type="button"
                  onClick={dismissClipboard}
                  className="text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  Ignorar
                </button>
              </div>
            </div>
            <button onClick={dismissClipboard} className="text-blue-400 hover:text-blue-600 text-lg leading-none">&times;</button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre (opcional)</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-wa-green focus:border-transparent outline-none transition-all"
            placeholder="Juan Pérez"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => setForm({...form, phone: e.target.value})}
            className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-wa-green focus:border-transparent outline-none transition-all ${clipboardPhone && !clipboardDismissed ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}
            placeholder="Ej: 51987654321"
          />
          <p className="text-xs text-gray-400 mt-1">Incluye el código de país sin el + (Ej: 51 para Perú).</p>
          {clipboardPhone && form.phone === clipboardPhone && (
            <p className="text-xs text-blue-600 mt-1">✅ Número importado del portapapeles</p>
          )}
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
