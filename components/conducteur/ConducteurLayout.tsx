'use client';

import { useEffect, useState } from 'react';
import ConducteurTopbar from './ConducteurTopbar';
import { useTheme } from '@/app/lib/ThemeContext';

export default function ConducteurLayout({ children }: { children: React.ReactNode }) {
  const { darkMode } = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: darkMode ? '#0D0D0D' : '#F8FAFB',
      color: darkMode ? '#FFFFFF' : '#0D0D0D',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      transition: 'background 0.3s ease, color 0.3s ease',
      overflowX: 'hidden',
    }}>
      <ConducteurTopbar />
      <main style={{ maxWidth: '1440px', margin: '0 auto', paddingTop: '84px', padding: isMobile ? '84px 12px 40px' : '84px 32px 32px' }}>
        {children}
      </main>
    </div>
  );
}
