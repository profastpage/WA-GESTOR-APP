import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export default function SuperAdminPanel({ user, onLogout }) {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newCode, setNewCode] = useState({ type: 'pro', duration: 'anual', price: '120' });
  const [generatedCode, setGeneratedCode] = useState('');

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    try {
      const q = query(collection(db, 'activationCodes'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setCodes(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Error loading codes:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'WA-';
    for (let i = 0; i < 12; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
      if (i === 3 || i === 7) code += '-';
    }
    return code;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = generateCode();
    setGeneratedCode(code);
    
    try {
      await addDoc(collection(db, 'activationCodes'), {
        code,
        ...newCode,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        usedBy: null,
        usedAt: null,
        active: true
      });
      loadCodes();
      setShowForm(false);
      setNewCode({ type: 'pro', duration: 'anual', price: '120' });
    } catch (err) {
      console.error('Error creating code:', err);
    }
  };

  const deleteCode = async (id) => {
    if (confirm('¿Eliminar este código?')) {
      await deleteDoc(doc(db, 'activationCodes', id));
      loadCodes();
    }
  };

  const stats = {
    total: codes.length,
    used: codes.filter(c => c.usedBy).length,
    available: codes.filter(c => !c.usedBy && c.active).length
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
          <div className="flex items-center gap-2">
            <button onClick={onLogout} className="bg-white/20 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/30 transition-colors">
              🚪 Salir
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-xs text-gray-500">Total Códigos</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-3xl font-bold text-green-600">{stats.available}</p>
            <p className="text-xs text-gray-500">Disponibles</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.used}</p>
            <p className="text-xs text-gray-500">Usados</p>
          </div>
        </div>

        {/* Generated Code Display */}
        {generatedCode && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6 text-center">
            <p className="text-sm text-green-600 mb-2">✅ Código generado exitosamente:</p>
            <p className="text-2xl font-mono font-bold text-green-800 select-all">{generatedCode}</p>
            <p className="text-xs text-green-500 mt-2">Copia este código y compártelo con el cliente</p>
          </div>
        )}

        {/* Create Code Button */}
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 transition-colors shadow-lg mb-6"
        >
          + Generar Código de Activación
        </button>

        {/* Codes List */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700">Códigos Generados</h3>
          {loading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>
          ) : codes.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-4xl mb-2">🔑</p>
              <p>No hay códigos aún</p>
            </div>
          ) : (
            codes.map(c => (
              <div key={c.id} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${c.usedBy ? 'border-gray-400 opacity-60' : 'border-green-500'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-mono font-bold text-lg text-gray-800">{c.code}</p>
                    <div className="flex gap-3 mt-2 text-xs">
                      <span className={`px-2 py-1 rounded-full font-bold ${c.type === 'pro' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {c.type.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 rounded-full">{c.duration}</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold">S/{c.price}</span>
                      {c.usedBy && <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full">Usado</span>}
                    </div>
                    {c.usedBy && (
                      <p className="text-xs text-gray-500 mt-2">Usado por: {c.usedBy}</p>
                    )}
                  </div>
                  {!c.usedBy && (
                    <button onClick={() => deleteCode(c.id)} className="text-red-400 hover:text-red-600 p-2">🗑️</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="bg-red-600 text-white p-6 rounded-t-3xl">
              <h2 className="text-xl font-bold">🔑 Generar Código</h2>
              <p className="text-xs text-red-100 mt-1">Configura los detalles del código de activación</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Licencia</label>
                <select value={newCode.type} onChange={(e) => setNewCode({...newCode, type: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none bg-white">
                  <option value="pro">Pro</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duración</label>
                <select value={newCode.duration} onChange={(e) => setNewCode({...newCode, duration: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none bg-white">
                  <option value="mensual">Mensual</option>
                  <option value="anual">Anual</option>
                  <option value="lifetime">De por vida</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio (S/)</label>
                <input type="number" value={newCode.price} onChange={(e) => setNewCode({...newCode, price: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none" placeholder="120" />
              </div>
              <button type="submit" className="w-full bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 transition-colors shadow-lg">
                Generar Código
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="w-full text-gray-500 font-medium py-2 hover:text-gray-700">
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}

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
