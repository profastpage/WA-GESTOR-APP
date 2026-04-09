import { useState } from 'react';

export default function Login({ onLogin, onRegister, loading, error }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegister) {
      onRegister(form.email, form.password, form.name);
    } else {
      onLogin(form.email, form.password);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-wa-dark to-wa-green flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💬</div>
          <h1 className="text-2xl font-bold text-gray-800">WA Manager CRM</h1>
          <p className="text-gray-500 text-sm">
            {isRegister ? 'Crea tu cuenta gratis' : 'Inicia sesión para continuar'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-wa-green focus:border-transparent outline-none transition-all"
                placeholder="Tu nombre"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-wa-green focus:border-transparent outline-none transition-all"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-wa-green focus:border-transparent outline-none transition-all"
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

        {/* Toggle */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setForm({ email: '', password: '', name: '' });
            }}
            className="text-wa-dark hover:text-wa-green font-medium text-sm"
          >
            {isRegister 
              ? '¿Ya tienes cuenta? Inicia sesión' 
              : '¿No tienes cuenta? Regístrate gratis'}
          </button>
        </div>

        {/* Features */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center mb-3">Tu cuenta incluye:</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div className="flex items-center gap-1">✅ CRM completo</div>
            <div className="flex items-center gap-1">✅ Datos en la nube</div>
            <div className="flex items-center gap-1">✅ Sync en tiempo real</div>
            <div className="flex items-center gap-1">✅ Multi-dispositivo</div>
          </div>
        </div>
      </div>
    </div>
  );
}
