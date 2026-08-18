'use client';

import PassagerTopbar from './PassagerTopbar';
import { useTheme } from '@/app/lib/ThemeContext';

export default function PassagerLayout({ children }: { children: React.ReactNode }) {
  const { darkMode } = useTheme();

  return (
    <div style={{
      minHeight: '100vh',
      background: darkMode ? '#0D0D0D' : '#F8FAFB',
      color: darkMode ? '#FFFFFF' : '#0D0D0D',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      transition: 'background 0.3s ease, color 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden', // ✅ Empêche tout scroll horizontal accidentel
    }}>
      <PassagerTopbar />
      <main style={{ 
        flex: 1, // ✅ Pousse le contenu pour occuper tout l'espace disponible
        width: '100%',
        maxWidth: '1440px', 
        margin: '0 auto', 
        paddingTop: '80px',
        padding: '80px 16px 40px', // ✅ Padding confortable sur mobile
      }}>
        {children}
      </main>
    </div>
  );
}