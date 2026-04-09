import { useState, useCallback } from 'react';

// Generador de claves de activación (SOLO PARA ADMIN)
// Cada clave es única y se puede registrar individualmente

const SECRET_KEY = 'FASTPAGE-2026-WA-GESTOR'; // Clave maestra para generar códigos

export function useLicenseGenerator() {
  
  // Generar una clave única para un cliente
  const generateKey = useCallback((clientName, clientPhone) => {
    const timestamp = Date.now().toString(36);
    const nameHash = btoa(clientName).substring(0, 8);
    const phoneHash = btoa(clientPhone).substring(0, 6);
    const uniqueCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    return `WA-${nameHash}-${phoneHash}-${uniqueCode}-${timestamp.toUpperCase()}`;
  }, []);

  // Generar múltiples claves de una vez
  const generateBatch = useCallback((count) => {
    const keys = [];
    for (let i = 0; i < count; i++) {
      const uniqueCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      const timestamp = Date.now().toString(36);
      keys.push(`WA-PRO-${uniqueCode}-${timestamp.toUpperCase()}`);
    }
    return keys;
  }, []);

  // Verificar si una clave es válida
  const validateKey = useCallback((key) => {
    if (!key || typeof key !== 'string') return false;
    
    // Formato esperado: WA-XXXX-XXXX-XXXX-XXXX
    const parts = key.split('-');
    if (parts.length !== 5) return false;
    if (parts[0] !== 'WA') return false;
    
    // Verificar que tenga la estructura correcta
    const isValidFormat = /^[A-Z0-9]{4}$/.test(parts[1]) && 
                          /^[A-Z0-9]{4}$/.test(parts[2]) && 
                          /^[A-Z0-9]{4}$/.test(parts[3]);
    
    return isValidFormat;
  }, []);

  return { generateKey, generateBatch, validateKey };
}

// Hook para verificar licencia del cliente
export function useClientLicense() {
  const { validateKey } = useLicenseGenerator();
  
  const [licenseKey, setLicenseKey] = useState(() => {
    return localStorage.getItem('wa_license_key') || '';
  });

  const [isValid, setIsValid] = useState(() => {
    const storedKey = localStorage.getItem('wa_license_key');
    const isActive = localStorage.getItem('wa_license_active');
    return storedKey && isActive === 'true' && validateKey(storedKey);
  });

  const activateLicense = useCallback((key) => {
    const trimmedKey = key.trim();
    
    if (!validateKey(trimmedKey)) {
      return { success: false, error: '❌ Clave inválida. Verifica el código que recibiste.' };
    }

    localStorage.setItem('wa_license_key', trimmedKey);
    localStorage.setItem('wa_license_active', 'true');
    setLicenseKey(trimmedKey);
    setIsValid(true);

    return { success: true };
  }, [validateKey]);

  const deactivateLicense = useCallback(() => {
    localStorage.removeItem('wa_license_key');
    localStorage.removeItem('wa_license_active');
    setLicenseKey('');
    setIsValid(false);
  }, []);

  return { 
    isValid, 
    licenseKey, 
    activateLicense, 
    deactivateLicense 
  };
}
