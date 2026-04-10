import { useState, useEffect, useCallback } from 'react';

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('wa_theme');
    return saved === 'dark';
  });

  // Apply dark class to HTML element (not just body)
  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
      localStorage.setItem('wa_theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('wa_theme', 'light');
    }
  }, [isDark]);

  const toggle = useCallback(() => setIsDark(prev => !prev), []);

  return { isDark, toggle };
}
