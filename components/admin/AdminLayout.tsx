'use client';
import AdminTopbar from './AdminTopbar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTheme } from '@/app/lib/ThemeContext';

const GREEN = '#22c55e';
const GREEN_LIGHT = '#dcfce7';
const GREEN_DARK = '#15803d';
const BLACK = '#1e293b';
const GRAY = '#6B7280';
const BORDER = '#334155';

const navLinks = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard', labelEn: 'Dashboard' },
  { label: 'Trajets', path: '/admin/trajets', icon: 'trajets', labelEn: 'Trips' },
  { label: 'Réservations', path: '/admin/reservations', icon: 'reservations', labelEn: 'Reservations' },
  { label: 'Utilisateurs', path: '/admin/utilisateurs', icon: 'utilisateurs', labelEn: 'Users' },
  { label: 'Évaluations', path: '/admin/evaluations', icon: 'evaluations', labelEn: 'Reviews' },
  { label: 'Positions', path: '/admin/positions', icon: 'positions', labelEn: 'GPS Tracking' },
  { label: 'Paiements', path: '/admin/paiements', icon: 'paiements', labelEn: 'Payments' },
  { label: 'Lieux', path: '/admin/lieux', icon: 'lieux', labelEn: 'Locations' },
  { label: 'Profil', path: '/admin/profil', icon: 'profil', labelEn: 'Profile' },
];

const icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  ),
  trajets: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M5 11L6.5 6.5C6.8 5.6 7.6 5 8.6 5H15.4C16.4 5 17.2 5.6 17.5 6.5L19 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <rect x="2" y="11" width="20" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="7" cy="18" r="2" stroke="currentColor" strokeWidth="1.8" fill="white"/>
      <circle cx="17" cy="18" r="2" stroke="currentColor" strokeWidth="1.8" fill="white"/>
    </svg>
  ),
  reservations: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  ),
  utilisateurs: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M17 21V19C17 17.9 16.1 17 15 17H9C7.9 17 7 17.9 7 19V21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="12" cy="11" r="4" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  ),
  evaluations: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  positions: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" strokeDasharray="3 3"/>
    </svg>
  ),
  paiements: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="6" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M2 10H22" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="17" cy="15" r="1.5" fill="currentColor"/>
    </svg>
  ),
  lieux: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  ),
  profil: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M5 20C5 17.24 7.24 15 10 15H14C16.76 15 19 17.24 19 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutContent>{children}</AdminLayoutContent>;
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { lang } = useTheme();
  const [darkMode, setDarkMode] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const updateDarkMode = () => {
      const savedDarkMode = localStorage.getItem('darkMode');
      const isDark = savedDarkMode === null ? true : savedDarkMode === 'true';
      setDarkMode(isDark);
    };

    updateDarkMode();

    window.addEventListener('darkModeChanged', updateDarkMode);
    return () => { window.removeEventListener('darkModeChanged', updateDarkMode); };
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <div style={{
      minHeight: '100vh',
      background: darkMode ? '#0f172a' : '#f8fafb',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      transition: 'background 0.3s',
      overflowX: 'hidden',
    }}>
      {/* Topbar fixe */}
      <AdminTopbar />

      <div style={{ display: 'flex', marginTop: '64px', width: '100%' }}>
        {/* Sidebar fixe (masquée sur mobile, remplacée par le menu AdminTopbar) */}
        <aside style={{
          position: 'fixed',
          left: 0,
          top: '64px',
          bottom: 0,
          width: '200px',
          display: isMobile ? 'none' : 'flex',
          background: darkMode ? '#1e293b' : '#ffffff',
          borderRight: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`,
          overflowY: 'auto',
          padding: '20px 12px',
          zIndex: 900,
          transition: 'background 0.3s, border-color 0.3s',
          flexDirection: 'column',
        }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            {navLinks.map(link => {
              const active = isActive(link.path);
              return (
                <Link key={link.path} href={link.path} style={{ textDecoration: 'none' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: active ? (darkMode ? '#0f1f0f' : '#f0fdf4') : 'transparent',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = darkMode ? '#1a1a1a' : '#f3f4f6'; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ color: active ? GREEN : (darkMode ? '#9ca3af' : '#6b7280'), display: 'flex', alignItems: 'center' }}>
                      {icons[link.icon as keyof typeof icons]}
                    </div>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: active ? '600' : '500',
                      color: active ? GREEN : (darkMode ? '#9ca3af' : '#374151'),
                      whiteSpace: 'nowrap',
                    }}>
                      {lang === 'fr' ? link.label : link.labelEn}
                    </span>
                    {active && (
                      <div style={{
                        marginLeft: 'auto',
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        background: GREEN,
                      }}/>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Bouton déconnexion en bas */}
          <div style={{
            marginTop: 'auto',
            paddingTop: '16px',
            borderTop: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`,
          }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px',
                borderRadius: '10px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                color: darkMode ? '#ef4444' : '#dc2626',
                fontSize: '13px',
                fontWeight: '500',
              }}
              onMouseEnter={e => e.currentTarget.style.background = darkMode ? '#334155' : '#f3f4f6'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"/>
                <path d="M16 17L21 12L16 7M21 12H9"/>
              </svg>
              <span>{lang === 'fr' ? 'Déconnexion' : 'Logout'}</span>
            </button>
          </div>
        </aside>

        {/* Contenu principal */}
        <main style={{
          marginLeft: isMobile ? 0 : '200px',
          flex: 1,
          minWidth: 0,
          padding: isMobile ? '16px' : '24px',
          minHeight: 'calc(100vh - 64px)',
          color: darkMode ? '#fff' : '#0D0D0D',
          transition: 'color 0.3s',
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
