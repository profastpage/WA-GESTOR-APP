import { useState } from 'react';
import LicenseActivation from './LicenseActivation';

export default function Pricing({ isPro }) {
  const [showActivation, setShowActivation] = useState(false);

  if (showActivation) {
    return <LicenseActivation onBack={() => setShowActivation(false)} />;
  }

  const handleBuyPro = () => {
    // Link de pago de MercadoPago - reemplaza con tu link real
    window.open(
      'https://mpago.la/TU_LINK_DE_PAGO', 
      '_blank'
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Planes y Precios</h2>
        <p className="text-gray-500 text-sm">Elige el plan perfecto para tu negocio</p>
      </div>

      {isPro && (
        <div className="bg-gradient-to-r from-wa-dark to-wa-green text-white p-4 rounded-xl flex items-center gap-3">
          <span className="text-2xl">⭐</span>
          <div>
            <p className="font-bold">¡Tienes el Plan Pro!</p>
            <p className="text-sm opacity-90">Disfruta de todas las funciones sin límites</p>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {/* Plan Gratis */}
        <div className={`bg-white rounded-2xl shadow-sm border-2 ${isPro ? 'border-gray-100 opacity-60' : 'border-wa-dark'} p-6 relative`}>
          {!isPro && (
            <span className="absolute -top-3 left-4 bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              ACTUAL
            </span>
          )}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Gratis</h3>
              <p className="text-sm text-gray-500">Para empezar</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-800">S/0</p>
              <p className="text-xs text-gray-500">Para siempre</p>
            </div>
          </div>

          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-2">
              <span className="text-wa-green">✓</span>
              <span className="text-sm text-gray-600">Hasta <strong>30 clientes</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-wa-green">✓</span>
              <span className="text-sm text-gray-600"><strong>3 plantillas</strong> de mensajes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-wa-green">✓</span>
              <span className="text-sm text-gray-600">Mensajes <strong>ilimitados</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-300">✗</span>
              <span className="text-sm text-gray-400">Sin estadísticas avanzadas</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-300">✗</span>
              <span className="text-sm text-gray-400">Sin soporte prioritario</span>
            </li>
          </ul>
        </div>

        {/* Plan Pro */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-wa-dark p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-wa-green text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
            ⭐ RECOMENDADO
          </div>
          
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Pro</h3>
              <p className="text-sm text-gray-500">Para negocios serios</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-wa-dark">S/99</p>
              <p className="text-xs text-gray-500">Pago único</p>
            </div>
          </div>

          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-2">
              <span className="text-wa-green">✓</span>
              <span className="text-sm text-gray-600"><strong>Clientes ilimitados</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-wa-green">✓</span>
              <span className="text-sm text-gray-600"><strong>Plantillas ilimitadas</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-wa-green">✓</span>
              <span className="text-sm text-gray-600">Mensajes <strong>ilimitados</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-wa-green">✓</span>
              <span className="text-sm text-gray-600"><strong>Estadísticas avanzadas</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-wa-green">✓</span>
              <span className="text-sm text-gray-600"><strong>Soporte prioritario</strong> por WhatsApp</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-wa-green">✓</span>
              <span className="text-sm text-gray-600"><strong>Actualizaciones</strong> incluidas</span>
            </li>
          </ul>

          {isPro ? (
            <div className="bg-wa-light border border-wa-green rounded-xl p-4 text-center">
              <p className="font-bold text-wa-dark">✓ Ya tienes el Plan Pro</p>
              <p className="text-sm text-gray-600">¡Gracias por tu compra!</p>
            </div>
          ) : (
            <>
              <button 
                onClick={handleBuyPro}
                className="w-full bg-wa-green text-white font-bold py-4 rounded-xl hover:bg-wa-dark transition-colors shadow-lg text-base mb-3"
              >
                💳 Pagar con MercadoPago
              </button>
              
              <p className="text-xs text-center text-gray-500 mb-3">
                Acepta: Yape, Plin, tarjetas, transferencia
              </p>

              <button
                onClick={() => setShowActivation(true)}
                className="w-full border-2 border-wa-dark text-wa-dark font-semibold py-3 rounded-xl hover:bg-wa-dark hover:text-white transition-colors text-sm"
              >
                🔑 Ya tengo mi clave de activación
              </button>
            </>
          )}
        </div>
      </div>

      {/* Pasos para activar */}
      {!isPro && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-5 rounded-xl">
          <h4 className="font-bold mb-3">📋 ¿Cómo activar el Plan Pro?</h4>
          <ol className="space-y-2 text-sm leading-relaxed">
            <li><strong>1.</strong> Haz clic en "Pagar con MercadoPago"</li>
            <li><strong>2.</strong> Completa el pago con Yape, Plin o tarjeta</li>
            <li><strong>3.</strong> Recibe tu <strong>clave de activación</strong> por email</li>
            <li><strong>4.</strong> Ingresa la clave en la app y ¡listo!</li>
          </ol>
        </div>
      )}
    </div>
  );
}
