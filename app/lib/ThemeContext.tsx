// app/lib/ThemeContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, TranslationKey, Language } from './translations';

type ThemeContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
  lang: Language;
  toggleLang: () => void;
  t: (key: TranslationKey) => string;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState<Language>('fr');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    const savedLang = localStorage.getItem('lang') as Language | null;

    if (savedDarkMode) {
      const isDark = savedDarkMode === 'true';
      setDarkMode(isDark);
      applyDarkMode(isDark);
    }

    if (savedLang && (savedLang === 'fr' || savedLang === 'en')) {
      setLang(savedLang);
    }

    setIsLoaded(true);
  }, []);

  const applyDarkMode = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.style.background = '#0D0D0D';
      document.body.style.color = '#FFFFFF';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.background = '#F8FAFB';
      document.body.style.color = '#0D0D0D';
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    applyDarkMode(newMode);
  };

  const toggleLang = () => {
    const newLang = lang === 'fr' ? 'en' : 'fr';
    setLang(newLang);
    localStorage.setItem('lang', newLang);
    document.documentElement.lang = newLang;
    window.dispatchEvent(new CustomEvent('language-change', { detail: { lang: newLang } }));
  };

  const t = (key: TranslationKey): string => {
    return translations[lang][key] || key;
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, lang, toggleLang, t }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}