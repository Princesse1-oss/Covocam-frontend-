'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  {
    href: '/conducteur',
    label: 'Accueil',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z"
          stroke={active ? '#0D9E7E' : '#050505'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          fill={active ? '#eef3f1' : 'none'}/>
      </svg>
    ),
  },
  {
    href: '/conducteur/trajets',
    label: 'Trajets',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="5" cy="18" r="2" stroke={active ? '#0D9E7E' : '#0d5f19'} strokeWidth="1.8" fill={active ? '#E8F7F3' : 'none'}/>
        <circle cx="19" cy="6" r="2" stroke={active ? '#0D9E7E' : '#0d5f19'} strokeWidth="1.8" fill={active ? '#E8F7F3' : 'none'}/>
        <path d="M5 16V12C5 10.9 5.9 10 7 10H17C18.1 10 19 9.1 19 8V8"
          stroke={active ? '#0D9E7E' : '#000000'} strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M3 18H5M19 6H21" stroke={active ? '#0D9E7E' : '#0d5f19'} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/conducteur/reservations',
    label: 'Réservations',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="3"
          stroke={active ? '#0D9E7E' : '#000000'} strokeWidth="1.8"
          fill={active ? '#E8F7F3' : 'none'}/>
        <path d="M16 2V6M8 2V6M3 10H21" stroke={active ? '#0D9E7E' : '#000000'} strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M8 14H16M8 17H13" stroke={active ? '#0D9E7E' : '#0d5f19'} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/conducteur/paiements',
    label: 'Paiements',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="6" width="20" height="14" rx="3"
          stroke={active ? '#0D9E7E' : '#000000'} strokeWidth="1.8"
          fill={active ? '#E8F7F3' : 'none'}/>
        <path d="M2 10H22" stroke={active ? '#0D9E7E' : '#000000'} strokeWidth="1.8"/>
        <path d="M6 15H10" stroke={active ? '#0D9E7E' : '#0d5f19'} strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="17" cy="15" r="1.5" fill={active ? '#0D9E7E' : '#660505'}/>
      </svg>
    ),
  },
  {
    href: '/conducteur/vehicule',
    label: 'Véhicule',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M5 11L6.5 6.5C6.8 5.6 7.6 5 8.6 5H15.4C16.4 5 17.2 5.6 17.5 6.5L19 11"
          stroke={active ? '#0D9E7E' : '#000000'} strokeWidth="1.8" strokeLinecap="round"/>
        <rect x="2" y="11" width="20" height="7" rx="2"
          stroke={active ? '#0D9E7E' : '#000000'} strokeWidth="1.8"
          fill={active ? '#E8F7F3' : 'none'}/>
        <circle cx="7" cy="18" r="2" stroke={active ? '#0D9E7E' : '#000000'} strokeWidth="1.8" fill="white"/>
        <circle cx="17" cy="18" r="2" stroke={active ? '#0D9E7E' : '#000000'} strokeWidth="1.8" fill="white"/>
        <path d="M2 14H22" stroke={active ? '#0D9E7E' : '#000000'} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function BottomBarConducteur() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '430px',
      background: '#FFFFFF',
      borderTop: '1px solid #EBEBEB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '10px 0 20px',
      zIndex: 100,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
    }}>
      {links.map(link => {
        const active = pathname === link.href;
        return (
          <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              borderRadius: '12px',
              background: active ? '#E8F7F3' : 'transparent',
              transition: 'all 0.2s',
            }}>
              {link.icon(active)}
              <span style={{
                fontSize: '10px',
                fontWeight: active ? '600' : '400',
                color: active ? '#0D9E7E' : '#000000',
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