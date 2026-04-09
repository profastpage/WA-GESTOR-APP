import { useState, useEffect } from 'react';

const PRO_LICENSE_KEY = 'WA-PRO-2026-X7K9';

export function useProLicense() {
  const [isPro, setIsPro] = useState(false);
  const [key, setKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedKey = localStorage.getItem('wa_pro_key');
    if (storedKey === PRO_LICENSE_KEY) {
      setIsPro(true);
      setKey(storedKey);
    }
  }, []);

  const activateKey = (inputKey) => {
    setIsValidating(true);
    setError('');

    setTimeout(() => {
      if (inputKey.trim() === PRO_LICENSE_KEY) {
        localStorage.setItem('wa_pro_key', inputKey.trim());
        setIsPro(true);
        setKey(inputKey.trim());
        setIsValidating(false);
        return true;
      } else {
        setError('❌ Clave inválida. Verifica el código que recibiste por email.');
        setIsValidating(false);
        return false;
      }
    }, 500);
  };

  const deactivate = () => {
    localStorage.removeItem('wa_pro_key');
    setIsPro(false);
    setKey('');
  };

  return { isPro, key, activateKey, deactivate, isValidating, error };
}
