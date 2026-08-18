// app/lib/useLanguageSync.ts
'use client';

import { useEffect } from 'react';
import { useTheme } from './ThemeContext';

export function useLanguageSync() {
  const { lang } = useTheme();

  // Synchroniser la langue avec le HTML
  useEffect(() => {
    document.documentElement.lang = lang;
    // Déclencher un événement pour que les composants écoutent
    window.dispatchEvent(new CustomEvent('language-change', { detail: { lang } }));
  }, [lang]);

  return { lang };
}