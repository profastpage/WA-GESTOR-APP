import { useState } from 'react';
import { useProLicense } from '../hooks/useProLicense';

export default function LicenseActivation({ onBack }) {
  const [licenseKey, setLicenseKey] = useState('');
  const [success, setSuccess] = useState(false);
  const { activateKey, isValidating, error, isPro } = useProLicense();

  const handleActivate = async (e) => {
    e.preventDefault();
    if (!licenseKey.trim()) return;

    const result = await activateKey(licenseKey);
    if (result) {
      setSuccess(true);
    }
  };

  if (success || isPro) {
    return (
      <div className="space-y-6">
        <div className="text-center py-10">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Activación Exitosa!</h2>
          <p className="text-gray-500 mb-6">Ahora tienes acceso a todas las funciones Pro</p>
          
          <div className="bg-gradient-to-r from-wa-dark to-wa-green text-white p-5 rounded-xl mb-6">
            <p className="font-bold text-lg">⭐ Plan Pro Activado</p>
            <p className="text-sm opacity-90 mt-1">Clientes ilimitados • Plantillas ilimitadas • Soporte prioritario</p>
          </div>

          <button
            onClick={onBack}
            className="bg-wa-dark text-white px-8 py-3 rounded-xl font-semibold hover:bg-wa-green transition-colors"
          >
            Volver a la app
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-800">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Activar Licencia Pro</h2>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔑</div>
          <p className="text-gray-600 text-sm">
            Ingresa la clave que recibiste por email tras completar tu pago
          </p>
        </div>

        <form onSubmit={handleActivate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Clave de Activación
            </label>
            <input
              type="text"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-wa-green focus:border-transparent outline-none transition-all font-mono text-center text-lg tracking-wider"
              placeholder="WA-PRO-XXXX-XXXX"
              disabled={isValidating}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!licenseKey.trim() || isValidating}
            className={`w-full font-semibold py-3 rounded-xl transition-colors ${
              !licenseKey.trim() || isValidating
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-wa-dark text-white hover:bg-wa-green'
            }`}
          >
            {isValidating ? 'Validando...' : 'Activar Plan Pro'}
          </button>
        </form>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl text-sm">
        <p className="font-bold mb-2">⚠️ ¿No recibiste tu clave?</p>
        <p className="text-xs leading-relaxed">
          Revisa tu bandeja de entrada y spam. Si no la encuentras, contáctanos por WhatsApp y te la reenviamos.
        </p>
      </div>
    </div>
  );
}
