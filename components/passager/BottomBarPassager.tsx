'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// ✅ Fonction utilitaire pour construire l'URL absolue de la photo
const getFullPhotoUrl = (photoPath: string | null | undefined) => {
  if (!photoPath || photoPath === 'null' || photoPath === 'undefined') return null;
  const cleanPath = photoPath.trim();
  if (cleanPath.startsWith('http')) return cleanPath;
  if (cleanPath.startsWith('/uploads/')) return cleanPath;
  return `/uploads/profils/${cleanPath}`;
};

interface UserData {
  prenom: string;
  nom: string;
  photo?: string | null;
}

const links = [
  {
    href: '/passager/dashboard',
    label: 'Accueil',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z"
          stroke={active ? '#0D9E7E' : '#9CA3AF'}
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          fill={active ? '#E8F7F3' : 'none'}/>
      </svg>
    ),
  },
  {
    href: '/passager/reservations',
    label: 'Réservations',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="3"
          stroke={active ? '#0D9E7E' : '#9CA3AF'}
          strokeWidth="1.8"
          fill={active ? '#E8F7F3' : 'none'}/>
        <path d="M16 2V6M8 2V6M3 10H21"
          stroke={active ? '#0D9E7E' : '#9CA3AF'}
          strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M8 14H16M8 17H13"
          stroke={active ? '#0D9E7E' : '#9CA3AF'}
          strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/passager/chat',
    label: 'Chat',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M21 15C21 15.55 20.55 16 20 16H7L3 20V4C3 3.45 3.45 3 4 3H20C20.55 3 21 3.45 21 4V15Z"
          stroke={active ? '#0D9E7E' : '#9CA3AF'}
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          fill={active ? '#E8F7F3' : 'none'}/>
        <path d="M8 9H16M8 12H13"
          stroke={active ? '#0D9E7E' : '#9CA3AF'}
          strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/passager/evaluations',
    label: 'Évaluations',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          stroke={active ? '#0D9E7E' : '#9CA3AF'}
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          fill={active ? '#E8F7F3' : 'none'}/>
      </svg>
    ),
  },
  {
    href: '/passager/profil',
    label: 'Profil',
    // ✅ L'icône sera remplacée par l'avatar dans le rendu
    icon: null,
  },
];

export default function BottomBarPassager() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState(false);

  // ✅ Chargement de l'utilisateur depuis le localStorage
  useEffect(() => {
    const loadUser = () => {
      const userData = localStorage.getItem('user');
      if (userData && userData !== 'undefined' && userData !== 'null') {
        try {
          const parsed = JSON.parse(userData);
          setUser({
            prenom: parsed.prenom || '',
            nom: parsed.nom || '',
            photo: parsed.photo || null,
          });
          const fullUrl = getFullPhotoUrl(parsed.photo);
          setPhotoUrl(fullUrl);
          setPhotoError(false);
        } catch {
          setUser(null);
        }
      }
    };

    loadUser();

    // Écouteur pour les mises à jour du profil
    window.addEventListener('user-updated', loadUser);
    return () => window.removeEventListener('user-updated', loadUser);
  }, []);

  // ✅ Calcul des initiales
  const getInitials = () => {
    if (!user) return '?';
    const prenom = user.prenom?.charAt(0)?.toUpperCase() || '';
    const nom = user.nom?.charAt(0)?.toUpperCase() || '';
    return (prenom + nom).substring(0, 2) || '?';
  };

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '430px',
      background: '#FFFFFF',
      borderTop: '1px solid #F0F0F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '10px 0 24px',
      zIndex: 100,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
    }}>
      {links.map(link => {
        const active = pathname === link.href || pathname.startsWith(link.href + '/');

        // ✅ Cas spécial pour le Profil : afficher l'avatar au lieu de l'icône SVG
        if (link.href === '/passager/profil') {
          return (
            <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 20px',
                borderRadius: '14px',
                background: active ? '#E8F7F3' : 'transparent',
                transition: 'all 0.2s ease',
              }}>
                {/* ✅ Avatar : Photo OU Initiales */}
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: photoUrl && !photoError
                    ? 'transparent'
                    : 'linear-gradient(135deg, #0D9E7E, #0A7B62)',
                  border: active ? '1.5px solid #0D9E7E' : '1.5px solid transparent',
                  flexShrink: 0,
                }}>
                  {photoUrl && !photoError ? (
                    <img
                      src={photoUrl}
                      alt="Profil"
                      onError={() => setPhotoError(true)}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '50%',
                      }}
                    />
                  ) : (
                    <span style={{
                      fontSize: '9px',
                      fontWeight: '700',
                      color: '#FFFFFF',
                      letterSpacing: '0.3px',
                    }}>
                      {getInitials()}
                    </span>
                  )}
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: active ? '600' : '400',
                  color: active ? '#0D9E7E' : '#9CA3AF',
                  letterSpacing: '0.2px',
                }}>
                  {link.label}
                </span>
              </div>
            </Link>
          );
        }

        // ✅ Cas classique pour les autres liens
        return (
          <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 20px',
              borderRadius: '14px',
              background: active ? '#E8F7F3' : 'transparent',
              transition: 'all 0.2s ease',
            }}>
              {link.icon && link.icon(active)}
              <span style={{
                fontSize: '11px',
                fontWeight: active ? '600' : '400',
                color: active ? '#0D9E7E' : '#9CA3AF',
                letterSpacing: '0.2px',
              }}>
                {link.label}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}