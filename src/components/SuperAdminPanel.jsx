import { useState } from 'react';
import { useUsers } from '../hooks/useAuth';

export default function SuperAdminPanel({ user, onLogout }) {
  const { users, loading, approveUser, revokeUser, deleteUser } = useUsers();
  const [activeTab, setActiveTab] = useState('users');

  const stats = {
    total: users.filter(u => !u.deleted).length,
    approved: users.filter(u => u.approved && !u.deleted).length,
    pending: users.filter(u => !u.approved && !u.deleted).length
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👑</span>
            <div>
              <h1 className="text-xl font-bold">Super Admin Panel</h1>
              <p className="text-xs text-red-100 opacity-80">{user?.email}</p>
            </div>
          </div>
          <button onClick={onLogout} className="bg-white/20 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/30 transition-colors">
            🚪 Salir
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex gap-4">
          <button onClick={() => setActiveTab('users')} className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'users' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            👥 Usuarios ({stats.total})
          </button>
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-xs text-gray-500">Total Usuarios</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
            <p className="text-xs text-gray-500">Aprobados</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-gray-500">Pendientes</p>
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700">Usuarios Registrados</h3>
          {loading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>
          ) : users.filter(u => !u.deleted).length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-4xl mb-2">👥</p>
              <p>No hay usuarios registrados aún</p>
            </div>
          ) : (
            users.filter(u => !u.deleted).map(u => (
              <div key={u.id} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${u.approved ? 'border-green-500' : 'border-yellow-500'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">{u.displayName || 'Sin nombre'}</span>
                      {u.email === 'admin@wamanager.com' && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">👑 ADMIN</span>}
                      {u.approved && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">✅ Aprobado</span>}
                      {!u.approved && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">⏳ Pendiente</span>}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{u.email}</p>
                    {u.createdAt && (
                      <p className="text-xs text-gray-400 mt-1">📅 Registrado: {u.createdAt.toDate ? u.createdAt.toDate().toLocaleDateString('es') : 'N/A'}</p>
                    )}
                  </div>
                  {u.email !== 'admin@wamanager.com' && (
                    <div className="flex items-center gap-2">
                      {!u.approved ? (
                        <button onClick={() => approveUser(u.id)} className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-200 transition-colors">
                          ✅ Aprobar
                        </button>
                      ) : (
                        <button onClick={() => revokeUser(u.id)} className="bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-yellow-200 transition-colors">
                          ⏳ Revocar
                        </button>
                      )}
                      <button onClick={() => deleteUser(u.id)} className="bg-gray-100 text-red-400 p-2 rounded-lg hover:bg-red-50 transition-colors">
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-40">
        <button className="flex flex-col items-center justify-center w-full h-full text-red-600">
          <span className="text-xl mb-1">👑</span>
          <span className="text-[10px] font-medium">Admin</span>
        </button>
        <button onClick={() => window.location.href = '/'} className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-gray-600">
          <span className="text-xl mb-1">🏠</span>
          <span className="text-[10px] font-medium">Ir a App</span>
        </button>
      </nav>
    </div>
  );
}
