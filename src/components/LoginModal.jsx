import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function LoginModal({ onClose, onLogin }) {
  const { login, register, loading, error } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegister) {
      await register(form.email, form.password, form.name);
    } else {
      await login(form.email, form.password);
    }
    // After successful login, the app will switch to CRM mode
    if (onLogin) onLogin();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-wa-dark text-white p-6 rounded-t-3xl flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">💬 WA Manager CRM</h2>
            <p className="text-xs text-wa-light mt-1">
              {isRegister ? 'Crea tu cuenta gratis' : 'Inicia sesión para acceder al CRM'}
            </p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-wa-green outline-none"
                  placeholder="Tu nombre"
                  required={isRegister}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-wa-green outline-none"
                placeholder="tu@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-wa-green outline-none"
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-wa-dark text-white font-semibold py-3 rounded-xl hover:bg-wa-green transition-colors shadow-lg disabled:opacity-50"
            >
              {loading ? '⏳ Procesando...' : (isRegister ? 'Crear cuenta' : 'Iniciar sesión')}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => { setIsRegister(!isRegister); setForm({ email: '', password: '', name: '' }); }}
              className="text-wa-dark hover:text-wa-green font-medium text-sm"
            >
              {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate gratis'}
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-2">Al iniciar sesión obtienes:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>✅ CRM completo</div>
              <div>✅ Datos en la nube</div>
              <div>✅ Sync en tiempo real</div>
              <div>✅ Multi-dispositivo</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
