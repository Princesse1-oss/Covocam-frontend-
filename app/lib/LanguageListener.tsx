// app/lib/LanguageListener.tsx
'use client';

import { useEffect } from 'react';
import { useTheme } from './ThemeContext';

export function LanguageListener() {
  const { lang } = useTheme();

  useEffect(() => {
    // Écouter les changements de langue venant d'autres onglets/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lang' && e.newValue) {
        window.location.reload();
      }
    };

    // Écouter les événements personnalisés
    const handleLanguageChange = (e: CustomEvent) => {
      // La langue a changé, tout est déjà synchronisé via le contexte
      console.log('Langue changée:', e.detail.lang);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('language-change' as any, handleLanguageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('language-change' as any, handleLanguageChange);
    };
  }, []);

  return null;
}