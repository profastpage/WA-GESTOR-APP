import { useState } from 'react';
import { useLicenseGenerator } from '../hooks/useLicenseGenerator';

export default function AdminPanel() {
  const { generateKey, generateBatch } = useLicenseGenerator();
  
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  const [batchKeys, setBatchKeys] = useState([]);
  const [batchCount, setBatchCount] = useState(5);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleGenerateSingle = () => {
    if (!clientName.trim()) return;
    const key = generateKey(clientName, clientPhone || '000000000');
    setGeneratedKey(key);
  };

  const handleGenerateBatch = () => {
    const keys = generateBatch(batchCount);
    setBatchKeys(keys);
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">🔐 Panel de Administración</h2>
        <p className="text-gray-500 text-sm">Generador de claves de activación - Solo para Fast Page Pro</p>
      </div>

      {/* Generar Clave Individual */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📝 Generar Clave para Cliente</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Cliente
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-wa-green focus:border-transparent outline-none"
              placeholder="Ej: Juan Pérez"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono del Cliente (opcional)
            </label>
            <input
              type="tel"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-wa-green focus:border-transparent outline-none"
              placeholder="Ej: 987654321"
            />
          </div>

          <button
            onClick={handleGenerateSingle}
            disabled={!clientName.trim()}
            className={`w-full font-bold py-3 rounded-xl transition-colors ${
              !clientName.trim()
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-wa-dark text-white hover:bg-wa-green'
            }`}
          >
            Generar Clave Única
          </button>

          {generatedKey && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
              <p className="text-sm font-semibold text-green-800 mb-2">✅ Clave Generada:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white px-3 py-2 rounded-lg font-mono text-sm break-all">
                  {generatedKey}
                </code>
                <button
                  onClick={() => copyToClipboard(generatedKey, -1)}
                  className="bg-wa-green text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-wa-dark transition-colors whitespace-nowrap"
                >
                  {copiedIndex === -1 ? '✓ Copiado' : '📋 Copiar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generar Lote de Claves */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📦 Generar Lote de Claves</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad de Claves
            </label>
            <input
              type="number"
              value={batchCount}
              onChange={(e) => setBatchCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-wa-green focus:border-transparent outline-none"
              min="1"
              max="50"
            />
            <p className="text-xs text-gray-400 mt-1">Mínimo: 1, Máximo: 50</p>
          </div>

          <button
            onClick={handleGenerateBatch}
            className="w-full bg-wa-dark text-white font-bold py-3 rounded-xl hover:bg-wa-green transition-colors"
          >
            Generar {batchCount} Claves
          </button>

          {batchKeys.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Claves Generadas ({batchKeys.length}):</p>
              {batchKeys.map((key, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                  <code className="flex-1 font-mono text-sm break-all">
                    {key}
                  </code>
                  <button
                    onClick={() => copyToClipboard(key, index)}
                    className="bg-wa-green text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-wa-dark transition-colors whitespace-nowrap"
                  >
                    {copiedIndex === index ? '✓' : '📋'}
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const allKeys = batchKeys.join('\n');
                  navigator.clipboard.writeText(allKeys);
                  alert('✅ Todas las claves copiadas al portapapeles');
                }}
                className="w-full mt-3 bg-wa-dark text-white font-semibold py-2 rounded-lg text-sm hover:bg-wa-green transition-colors"
              >
                📋 Copiar Todas las Claves
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl">
        <h4 className="font-bold text-blue-800 mb-3">📖 Cómo usar:</h4>
        <ol className="space-y-2 text-sm text-blue-700">
          <li><strong>1.</strong> Ingresa el nombre del cliente (y teléfono si quieres)</li>
          <li><strong>2.</strong> Haz clic en "Generar Clave Única"</li>
          <li><strong>3.</strong> Copia la clave y envíala al cliente por WhatsApp</li>
          <li><strong>4.</strong> El cliente ingresa la clave en la app y se activa automáticamente</li>
        </ol>
      </div>
    </div>
  );
}
