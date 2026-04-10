import { useState, useEffect } from 'react';

export default function WelcomeBanner({ onClose }) {
  const [visible, setVisible] = useState(true);
  const [showGuide, setShowGuide] = useState(false);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setShowGuide(true);
      setTimeout(() => setShowGuide(false), 500); // Small delay for animation
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible && !showGuide) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4" onClick={() => { setVisible(false); setShowGuide(false); if (onClose) onClose(); }}>
      <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-3xl shadow-2xl w-full max-w-md p-6 text-white relative animate-bounce-in" onClick={e => e.stopPropagation()}>
        <button onClick={() => { setVisible(false); setShowGuide(false); if (onClose) onClose(); }} className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl leading-none">&times;</button>
        
        {visible && (
          <div className="text-center">
            <div className="text-6xl mb-4 animate-pulse">🎉🔥</div>
            <h2 className="text-2xl font-bold mb-2">¡Licencia Activada!</h2>
            <p className="text-white/80">Ahora tienes acceso completo a WA Manager CRM</p>
            <div className="mt-4 flex justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-2xl animate-pulse" style={{animationDelay: `${i * 0.2}s`}}>🔥</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
