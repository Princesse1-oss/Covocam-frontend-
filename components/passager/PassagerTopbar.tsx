'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/app/lib/ThemeContext';

interface User {
  nom: string;
  prenom: string;
  email: string;
  photo?: string | null;
}

const EMERALD = '#0D9E7E';
const EMERALD_LIGHT = '#E8F7F3';
const EMERALD_DARK = '#0A7B62';
const AMBER = '#F59E0B';
const AMBER_LIGHT = '#FFF8E8';
const RED = '#EF4444';

const Avatar = ({ user, size = 32 }: { user: User | null; size?: number }) => {
  const photoUrl = user?.photo && user.photo !== 'null' && user.photo !== 'undefined'
    ? (user.photo.startsWith('http') ? user.photo.trim() : `/uploads/profils/${user.photo.trim()}`)
    : null;
  const initials = (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, ${EMERALD}, ${EMERALD_DARK})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.375, fontWeight: '700', color: 'white',
      border: '2px solid #FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    }}>
      {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
    </div>
  );
  if (!photoUrl) return initials;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {initials}
      <img src={photoUrl} alt="Profil"
        onError={e => { e.currentTarget.style.display = 'none'; }}
        style={{
          position: 'absolute', top: 0, left: 0,
          width: size, height: size, borderRadius: '50%', objectFit: 'cover',
          border: '2px solid #FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}/>
    </div>
  );
};

const navLinks = [
  { 
    labelKey: 'dashboard' as const, 
    path: '/passager/dashboard',
    icon: (a: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke={a ? EMERALD : '#6B7280'} strokeWidth="1.8" fill={a ? EMERALD_LIGHT : 'none'}/>
        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke={a ? EMERALD : '#6B7280'} strokeWidth="1.8" fill={a ? EMERALD_LIGHT : 'none'}/>
        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke={a ? EMERALD : '#6B7280'} strokeWidth="1.8" fill={a ? EMERALD_LIGHT : 'none'}/>
        <rect x="14" y="14" width="7" height="7" rx="1.5" stroke={a ? EMERALD : '#6B7280'} strokeWidth="1.8" fill={a ? EMERALD_LIGHT : 'none'}/>
      </svg>
    ),
  },
  { 
    labelKey: 'myRequests' as const, 
    path: '/passager/demandes',
    icon: (a: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" stroke={a ? EMERALD : '#6B7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" stroke={a ? EMERALD : '#6B7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  { 
    labelKey: 'myReservations' as const, 
    path: '/passager/reservations',
    icon: (a: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="3" stroke={a ? EMERALD : '#6B7280'} strokeWidth="1.8" fill={a ? EMERALD_LIGHT : 'none'}/>
        <path d="M16 2V6M8 2V6M3 10H21" stroke={a ? EMERALD : '#6B7280'} strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M8 14H16M8 17H13" stroke={a ? EMERALD : '#6B7280'} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  { 
    labelKey: 'myProfile' as const, 
    path: '/passager/profil',
    icon: (a: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke={a ? EMERALD : '#6B7280'} strokeWidth="1.8"/>
        <path d="M4 20C4 17 7.58 14.5 12 14.5C16.42 14.5 20 17 20 20" stroke={a ? EMERALD : '#6B7280'} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function PassagerTopbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { darkMode, toggleDarkMode, lang, toggleLang, t } = useTheme();
  const theme = darkMode ? 'dark' : 'light';
  
  const [user, setUser] = useState<User | null>(null);
  const [notifCount, setNotifCount] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const fetchNotifCount = () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/notifications/non-lues/count', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setNotifCount(d.count || 0)).catch(() => {});
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const updateUser = () => {
      const raw = localStorage.getItem('user');
      if (raw && raw !== 'undefined' && raw !== 'null') {
        try {
          const p = JSON.parse(raw);
          setUser(p);
        } catch { 
          localStorage.removeItem('user'); 
        }
      }
    };
    
    updateUser();

    fetchNotifCount();
    const pollInterval = setInterval(fetchNotifCount, 30000);

    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    window.addEventListener('user-updated', updateUser);
    window.addEventListener('notifications-updated', fetchNotifCount);
    
    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('user-updated', updateUser);
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('notifications-updated', fetchNotifCount);
    };
  }, []);

  // ✅ VERROUILLAGE DU SCROLL : Empêche la page de défiler quand le menu mobile est ouvert
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (mobileOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    }
    return () => {
      if (typeof window !== 'undefined') {
        document.body.style.overflow = 'auto';
      }
    };
  }, [mobileOpen]);

  useEffect(() => { 
    setMobileOpen(false); 
    setProfileOpen(false); 
  }, [pathname]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    router.push('/login');
  };

  const getStyles = () => {
    const bg = theme === 'dark' ? '#1A1A1A' : '#FFFFFF';
    const text = theme === 'dark' ? '#FFFFFF' : '#0D0D0D';
    const textSecondary = theme === 'dark' ? '#9CA3AF' : '#6B7280';
    const border = theme === 'dark' ? '#2A2A2A' : '#F0F0F0';
    const hoverBg = theme === 'dark' ? '#2A2A2A' : '#F5F5F5';
    const cardBg = theme === 'dark' ? '#1A1A1A' : '#FFFFFF';
    const shadow = theme === 'dark' ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.06)';
    const topbarBg = theme === 'dark' ? 'rgba(26,26,26,0.96)' : 'rgba(255,255,255,0.96)';

    return { bg, text, textSecondary, border, hoverBg, cardBg, shadow, topbarBg };
  };

  const styles = getStyles();

  const getLabel = (key: string) => {
    if (key === 'myRequests') return lang === 'fr' ? 'Mes demandes' : 'My Requests';
    return t(key as any);
  };

  return (
    <>
      <style>{`
        @keyframes dropIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        .dark .topbar { background: ${styles.topbarBg} !important; border-bottom-color: ${styles.border} !important; }
        .dark .topbar-nav { background: ${styles.bg} !important; }
        .dark .topbar-dropdown { background: ${styles.bg} !important; border-color: ${styles.border} !important; }
      `}</style>

      {/* ✅ TOPBAR STICKY : Reste fixée en haut sans sortir du flux du document */}
      <header className="topbar" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: styles.topbarBg,
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${styles.border}`,
        boxShadow: styles.shadow,
        transition: 'all 0.3s ease',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: styles.text,
      }}>
        <div style={{
          maxWidth: '1440px', margin: '0 auto', padding: '0 16px', // Padding réduit sur mobile
          display: 'flex', alignItems: 'center', height: '64px', gap: '16px',
        }}>

          {/* LOGO */}
          <Link href="/passager/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: `linear-gradient(135deg, ${EMERALD}, ${EMERALD_DARK})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 12px rgba(13,158,126,0.3)`,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M5 11L6.5 6.5C6.8 5.6 7.6 5 8.6 5H15.4C16.4 5 17.2 5.6 17.5 6.5L19 11" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                <rect x="2" y="11" width="20" height="7" rx="2" stroke="white" strokeWidth="1.8" fill="rgba(255,255,255,0.15)"/>
                <circle cx="7" cy="18" r="2" stroke="white" strokeWidth="1.8" fill="rgba(255,255,255,0.3)"/>
                <circle cx="17" cy="18" r="2" stroke="white" strokeWidth="1.8" fill="rgba(255,255,255,0.3)"/>
              </svg>
            </div>
            <div style={{ display: isMobile ? 'none' : 'block' }}> {/* Caché sur très petits écrans pour gagner de la place */}
              <span style={{ fontSize: '20px', fontWeight: '800', color: styles.text, letterSpacing: '-0.5px', display: 'block', lineHeight: '1.1' }}>
                Covo<span style={{ color: EMERALD }}>Cam</span>
              </span>
              <span style={{ fontSize: '9px', color: AMBER, fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                {t('activePassenger')}
              </span>
            </div>
          </Link>

          {/* NAV DESKTOP */}
          {!isMobile && (
            <nav className="topbar-nav" style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, justifyContent: 'center' }}>
              {navLinks.map(link => {
                const active = pathname === link.path || pathname.startsWith(link.path + '/');
                return (
                  <Link key={link.path} href={link.path} prefetch={true} style={{ textDecoration: 'none' }}>
                    <div
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '8px 16px', borderRadius: '10px',
                        background: active ? EMERALD_LIGHT : 'transparent',
                        transition: 'all 0.2s', cursor: 'pointer', position: 'relative',
                      }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.background = styles.hoverBg; }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                    >
                      {link.icon(active)}
                      <span style={{ fontSize: '14px', fontWeight: active ? '600' : '500', color: active ? EMERALD : styles.textSecondary, whiteSpace: 'nowrap' }}>
                        {getLabel(link.labelKey)}
                      </span>
                      {active && (
                        <div style={{
                          position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)',
                          width: '20px', height: '3px', background: EMERALD, borderRadius: '2px 2px 0 0',
                        }}/>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* ACTIONS DROITE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: isMobile ? 'auto' : '0', flexShrink: 0 }}>

            {/* Mode sombre/clair */}
            <div
              onClick={toggleDarkMode}
              style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              onMouseEnter={e => e.currentTarget.style.background = styles.hoverBg}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme === 'dark' ? '#FCD34D' : styles.textSecondary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {theme === 'dark' ? (
                  <>
                    <circle cx="12" cy="12" r="4"/>
                    <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                  </>
                ) : (
                  <>
                    <path d="M21 15C21 15.55 20.55 16 20 16H7L3 20V4C3 3.45 3.45 3 4 3H20C20.55 3 21 3.45 21 4V15Z" stroke={styles.textSecondary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={styles.bg}/>
                    <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998Z"/>
                  </>
                )}
              </svg>
            </div>

            {/* Sélecteur de langue */}
            <div
              onClick={toggleLang}
              style={{
                width: '40px', height: '40px', borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = styles.hoverBg}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              title={lang === 'fr' ? 'English' : 'Français'}
            >
              <span style={{ fontSize: '12px', fontWeight: '800', color: styles.textSecondary }}>{lang.toUpperCase()}</span>
            </div>

            {/* Notifs */}
            <Link href="/passager/notifications" style={{ textDecoration: 'none', position: 'relative' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: pathname.startsWith('/passager/notifications') ? EMERALD_LIGHT : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { if (!pathname.startsWith('/passager/notifications')) e.currentTarget.style.background = styles.hoverBg; }}
                onMouseLeave={e => { if (!pathname.startsWith('/passager/notifications')) e.currentTarget.style.background = 'transparent'; }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={pathname.startsWith('/passager/notifications') ? EMERALD : styles.textSecondary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={pathname.startsWith('/passager/notifications') ? EMERALD : styles.textSecondary} strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                {notifCount > 0 && (
                  <div style={{
                    position: 'absolute', top: '4px', right: '4px',
                    minWidth: '16px', height: '16px', borderRadius: '8px',
                    background: RED, color: '#FFF', fontSize: '9px', fontWeight: '700',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `2px solid ${styles.bg}`, padding: '0 3px',
                  }}>{notifCount > 9 ? '9+' : notifCount}</div>
                )}
              </div>
            </Link>

            {/* Profil dropdown desktop */}
            {!isMobile && (
              <div style={{ position: 'relative', marginLeft: '8px' }}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: profileOpen ? EMERALD_LIGHT : 'transparent',
                    border: profileOpen ? `2px solid ${EMERALD}` : '2px solid transparent',
                    cursor: 'pointer', transition: 'all 0.2s',
                    padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: profileOpen ? `0 0 0 4px rgba(13,158,126,0.15)` : 'none',
                  }}
                >
                  <Avatar user={user} size={40}/>
                </button>

                {profileOpen && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 900 }} onClick={() => setProfileOpen(false)}/>
                    <div className="topbar-dropdown" style={{
                      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                      background: styles.cardBg, border: `1px solid ${styles.border}`,
                      borderRadius: '16px', padding: '8px', minWidth: '240px',
                      boxShadow: theme === 'dark' ? '0 20px 60px rgba(0,0,0,0.6)' : '0 20px 60px rgba(0,0,0,0.15)',
                      zIndex: 1000, animation: 'dropIn 0.15s ease',
                      color: styles.text,
                    }}>
                      <div style={{ 
                        padding: '14px', 
                        background: theme === 'dark' ? '#2A2A2A' : `linear-gradient(135deg, ${EMERALD_LIGHT}, ${AMBER_LIGHT})`, 
                        borderRadius: '12px', marginBottom: '8px' 
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Avatar user={user} size={48}/>
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: styles.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.prenom} {user?.nom}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: EMERALD }}/>
                              <span style={{ fontSize: '11px', color: EMERALD, fontWeight: '600' }}>{t('activePassenger')}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {[
                        { labelKey: 'myProfile' as const, path: '/passager/profil' },
                        { labelKey: 'myRequests' as const, path: '/passager/demandes' },
                        { labelKey: 'myReservations' as const, path: '/passager/reservations' },
                      ].map(item => (
                        <Link key={item.path} href={item.path} onClick={() => setProfileOpen(false)} style={{ textDecoration: 'none' }}>
                          <div style={{ 
                            display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s',
                            color: styles.text,
                          }}
                            onMouseEnter={e => e.currentTarget.style.background = EMERALD_LIGHT}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <span style={{ fontSize: '13px', fontWeight: '500' }}>{getLabel(item.labelKey)}</span>
                          </div>
                        </Link>
                      ))}

                      <div style={{ height: '1px', background: styles.border, margin: '8px 0' }}/>
                      <div onClick={handleLogout}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke={RED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 17L21 12L16 7M21 12H9" stroke={RED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span style={{ fontSize: '13px', color: RED, fontWeight: '600' }}>{t('logout')}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Burger mobile */}
            {isMobile && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: mobileOpen ? EMERALD_LIGHT : 'transparent',
                  border: `1.5px solid ${mobileOpen ? EMERALD : styles.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.2s',
                  marginLeft: '4px'
                }}
              >
                {mobileOpen ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke={EMERALD} strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M3 12H21M3 6H21M3 18H21" stroke={styles.textSecondary} strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ✅ MENU MOBILE : Overlay propre qui ne pousse pas le contenu de manière bizarre */}
        {isMobile && mobileOpen && (
          <div className="topbar-nav" style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            background: styles.bg, borderTop: `1px solid ${styles.border}`,
            padding: '16px',
            boxShadow: styles.shadow,
            animation: 'slideDown 0.2s ease',
            zIndex: 999,
            color: styles.text,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px',
              background: theme === 'dark' ? '#2A2A2A' : `linear-gradient(135deg, ${EMERALD_LIGHT}, ${AMBER_LIGHT})`,
              borderRadius: '14px', marginBottom: '16px',
            }}>
              <Avatar user={user} size={48}/>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '15px', fontWeight: '700', color: styles.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.prenom} {user?.nom}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: EMERALD }}/>
                  <span style={{ fontSize: '12px', color: EMERALD, fontWeight: '600' }}>{t('activePassenger')}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
              {navLinks.map(link => {
                const active = pathname === link.path || pathname.startsWith(link.path + '/');
                return (
                  <Link key={link.path} href={link.path} style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '14px', borderRadius: '12px',
                      background: active ? EMERALD_LIGHT : 'transparent',
                      transition: 'all 0.15s',
                      color: styles.text,
                    }}>
                      {link.icon(active)}
                      <span style={{ fontSize: '15px', fontWeight: active ? '600' : '500', color: active ? EMERALD : styles.text }}>
                        {getLabel(link.labelKey)}
                      </span>
                      {active && <div style={{ marginLeft: 'auto', width: '8px', height: '8px', borderRadius: '50%', background: EMERALD }}/>}
                    </div>
                  </Link>
                );
              })}
            </div>

            <div style={{ height: '1px', background: styles.border, margin: '12px 0' }}/>

            <div onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke={RED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17L21 12L16 7M21 12H9" stroke={RED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: '15px', color: RED, fontWeight: '600' }}>{t('logout')}</span>
            </div>
          </div>
        )}
      </header>
    </>
  );
}