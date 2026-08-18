'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface User {
  nom: string;
  prenom: string;
  email: string;
  photo?: string | null;
}

const GREEN = '#22c55e';
const GREEN_LIGHT = '#dcfce7';
const GREEN_DARK = '#15803d';
const BLACK = '#1e293b';
const GRAY = '#6B7280';
const BORDER = '#334155';
const RED = '#EF4444';

const getFullPhotoUrl = (p?: string | null) => {
  if (!p || p === 'null' || p === 'undefined') return null;
  return p.startsWith('http') ? p.trim() : `/uploads/profils/${p.trim()}`;
};

// Move Avatar component outside to avoid creating during render
const Avatar = ({ user, size = 32 }: { user: User | null; size?: number }) => (
  user?.photo ? (
    <img src={user.photo} alt="Profil"
      onError={e => e.currentTarget.style.display = 'none'}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}/>
  ) : (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: GREEN,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.375, fontWeight: '700', color: 'white',
    }}>
      {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
    </div>
  )
);

const navLinks = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
  { label: 'Trajets', path: '/admin/trajets', icon: 'trajets' },
  { label: 'Réservations', path: '/admin/reservations', icon: 'reservations' },
  { label: 'Utilisateurs', path: '/admin/utilisateurs', icon: 'utilisateurs' },
  { label: 'Évaluations', path: '/admin/evaluations', icon: 'evaluations' },

  { label: 'Paiements', path: '/admin/paiements', icon: 'paiements' },
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

  paiements: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="6" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M2 10H22" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="17" cy="15" r="1.5" fill="currentColor"/>
    </svg>
  ),
};

export default function AdminTopbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState<'fr' | 'en'>('fr');

  const applyDarkMode = (isDark: boolean) => {
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.style.background = '#0D0D0D';
      document.body.style.color = '#FFFFFF';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.background = '#FFFFFF';
      document.body.style.color = '#0D0D0D';
    }
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    applyDarkMode(savedDarkMode === null ? false : savedDarkMode === 'true');
  }, []);

  useEffect(() => {
    const updateUser = () => {
      const raw = localStorage.getItem('user');
      if (raw && raw !== 'undefined' && raw !== 'null') {
        try {
          const p = JSON.parse(raw);
          setUser({ ...p, photo: getFullPhotoUrl(p.photo) });
        } catch { localStorage.removeItem('user'); }
      }
    };
    updateUser();

    const savedLang = localStorage.getItem('lang') as 'fr' | 'en' | null;
    if (savedLang) setLang(savedLang);

    window.addEventListener('user-updated', updateUser);
    return () => { window.removeEventListener('user-updated', updateUser); };
  }, []);

  useEffect(() => { setProfileOpen(false); setMobileOpen(false); }, [pathname]); // eslint-disable-line react-hooks/set-state-in-effect

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    applyDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    window.dispatchEvent(new Event('darkModeChanged'));
  };

  const toggleLang = () => {
    const newLang = lang === 'fr' ? 'en' : 'fr';
    setLang(newLang);
    localStorage.setItem('lang', newLang);
    window.dispatchEvent(new Event('langChanged'));
  };

  return (
    <>
      <style>{`
        @keyframes dropIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: '#1e293b',
        borderBottom: `1px solid #334155`,
        boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        height: '64px',
      }}>
        <div style={{
          maxWidth: '100%', margin: '0 auto', padding: '0 24px',
          display: 'flex', alignItems: 'center', height: '100%', gap: '24px',
        }}>

          {/* LOGO */}
          <Link href="/admin/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: GREEN,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 16px rgba(34, 197, 94, 0.35)`,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M5 11L6.5 6.5C6.8 5.6 7.6 5 8.6 5H15.4C16.4 5 17.2 5.6 17.5 6.5L19 11"
                  stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                <rect x="2" y="11" width="20" height="7" rx="2" stroke="white" strokeWidth="1.8" fill="rgba(255,255,255,0.15)"/>
                <circle cx="7" cy="18" r="2" stroke="white" strokeWidth="1.8" fill="rgba(255,255,255,0.3)"/>
                <circle cx="17" cy="18" r="2" stroke="white" strokeWidth="1.8" fill="rgba(255,255,255,0.3)"/>
              </svg>
            </div>
            <div>
              <span style={{ fontSize: '20px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px', display: 'block', lineHeight: '1.1' }}>
                Covo<span style={{ color: GREEN }}>Cam</span>
              </span>
              <span style={{ fontSize: '9px', color: GREEN, fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Admin
              </span>
            </div>
          </Link>

          {/* Spacer pour sidebar */}
          <div style={{ flex: 1 }} />

          {/* ACTIONS DROITE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>

            {/* Nom de l'admin */}
            {!isMobile && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: GREEN,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: 'white',
                }}>
                  {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
                </div>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#fff',
                }}>
                  {user?.prenom} {user?.nom}
                </span>
              </div>
            )}

            {/* Séparateur */}
            <div style={{ width: '1px', height: '24px', background: BORDER, margin: '0 4px' }}/>

            {/* Mode sombre/clair */}
            <div
              onClick={toggleDarkMode}
              style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#2a1a1a'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              title={darkMode ? 'Mode clair' : 'Mode sombre'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={darkMode ? '#FCD34D' : '#9ca3af'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {darkMode ? (
                  <>
                    <circle cx="12" cy="12" r="4"/>
                    <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                  </>
                ) : (
                  <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998Z"/>
                )}
              </svg>
            </div>

            {/* Sélecteur de langue */}
            <div
              onClick={toggleLang}
              style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#2a1a1a'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              title={lang === 'fr' ? 'English' : 'Français'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
              </svg>
              <span style={{ fontSize: '10px', fontWeight: '700', marginLeft: '1px', color: '#9ca3af' }}>{lang.toUpperCase()}</span>
            </div>

            {/* Séparateur */}
            <div style={{ width: '1px', height: '24px', background: BORDER, margin: '0 4px' }}/>

            {/* Profil dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: profileOpen ? GREEN_LIGHT : 'transparent',
                  border: profileOpen ? `2px solid ${GREEN}` : '2px solid transparent',
                  cursor: 'pointer', transition: 'all 0.2s',
                  padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: profileOpen ? `0 0 0 4px rgba(34, 197, 94, 0.15)` : 'none',
                }}
              >
                <Avatar user={user} size={36}/>
              </button>

              {profileOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 900 }} onClick={() => setProfileOpen(false)}/>
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: '#1a1a1a', border: `1px solid #2a2a2a`,
                    borderRadius: '16px', padding: '8px', minWidth: '220px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)', zIndex: 1000,
                    animation: 'dropIn 0.15s ease',
                  }}>
                    {/* User card */}
                    <div style={{ padding: '12px 14px', background: '#0f1f0f', borderRadius: '12px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Avatar user={user} size={40}/>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{user?.prenom} {user?.nom}</div>
                          <div style={{ fontSize: '11px', color: GREEN, marginTop: '2px', fontWeight: '600' }}>Administrateur</div>
                        </div>
                      </div>
                    </div>

                    <div style={{ height: '1px', background: '#2a2a2a', margin: '6px 0' }}/>

                    <Link href="/admin/profil" style={{ textDecoration: 'none' }}>
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#2a2a2a'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                        <span style={{ fontSize: '13px', color: '#fff', fontWeight: '500' }}>Mon profil</span>
                      </div>
                    </Link>

                    <div style={{ height: '1px', background: '#2a2a2a', margin: '6px 0' }}/>

                    <div onClick={handleLogout}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#2a1a1a'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
                          stroke={RED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 17L21 12L16 7M21 12H9" stroke={RED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span style={{ fontSize: '13px', color: GREEN, fontWeight: '600' }}>Se déconnecter</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Burger mobile */}
            {isMobile && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: mobileOpen ? GREEN_LIGHT : 'transparent',
                  border: mobileOpen ? `1.5px solid ${GREEN}` : '1.5px solid #334155',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {mobileOpen ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke={GREEN} strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M3 12H21M3 6H21M3 18H21" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Menu mobile */}
        {isMobile && mobileOpen && (
          <div style={{
            background: '#1a1a1a',
            borderTop: '1px solid #2a2a2a',
            padding: '12px 16px 20px',
            maxHeight: 'calc(100vh - 64px)',
            overflowY: 'auto',
            animation: 'dropIn 0.15s ease',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {navLinks.map(link => {
                const active = pathname === link.path || pathname.startsWith(link.path + '/');
                return (
                  <Link key={link.path} href={link.path} style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 14px', borderRadius: '12px',
                      background: active ? '#0f1f0f' : 'transparent',
                      color: '#fff',
                    }}>
                      <div style={{ color: active ? GREEN : '#9ca3af', display: 'flex', alignItems: 'center' }}>
                        {icons[link.icon as keyof typeof icons]}
                      </div>
                      <span style={{ fontSize: '15px', fontWeight: active ? '600' : '400', color: active ? GREEN : '#fff' }}>
                        {link.label}
                      </span>
                      {active && <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: GREEN }}/>}
                    </div>
                  </Link>
                );
              })}
            </div>

            <div style={{ height: '1px', background: '#2a2a2a', margin: '10px 0' }}/>

            <Link href="/admin/profil" style={{ textDecoration: 'none' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '12px', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#2a2a2a'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span style={{ fontSize: '15px', color: '#fff', fontWeight: '500' }}>Mon profil</span>
              </div>
            </Link>

            <div style={{ height: '1px', background: '#2a2a2a', margin: '10px 0' }}/>

            <div onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '12px', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = '#2a1a1a'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
                  stroke={RED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17L21 12L16 7M21 12H9" stroke={RED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: '15px', color: RED, fontWeight: '600' }}>Se déconnecter</span>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
