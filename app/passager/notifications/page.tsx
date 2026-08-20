'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/app/lib/ThemeContext';

// ✅ Utilisation du proxy Next.js pour éviter tout problème CORS
const API_URL = '/api';

// Couleurs de la charte graphique
const EMERALD = '#0D9E7E';
const EMERALD_LIGHT = '#E8F7F3';
const EMERALD_DARK = '#0A7B62';
const BLACK = '#0D0D0D';
const GRAY = '#6B7280';
const BORDER = '#EBEBEB';

// ─── SVG Icons inline ───
const Icon = ({ name, size = 20, color = EMERALD }: { name: string; size?: number; color?: string }) => {
  const s = { width: size, height: size, display: 'inline-block', verticalAlign: 'middle' } as React.CSSProperties;
  const icons: Record<string, React.ReactNode> = {
    bell: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
    check: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
    ),
    clock: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    trash: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      </svg>
    ),
  };
  return <span style={{ lineHeight: 0, display: 'inline-flex' }}>{icons[name] || null}</span>;
};

interface Notification {
  id: number;
  titre: string;
  message: string;
  type: string;
  estLu: boolean;
  dateEnvoi: any; // Peut être une string ou un objet Doctrine
  dateLecture: any | null;
  url: string | null;
  icone: string | null;
  couleur: string | null;
  passager?: { id: number; nom: string; prenom: string; photo?: string | null } | null;
}

// ✅ Fonction robuste pour formater les dates venant de Doctrine (objet ou string)
const formatDate = (dateValue: any) => {
  if (!dateValue) return 'Date inconnue';
  
  let dateStr = '';
  if (typeof dateValue === 'object' && dateValue.date) {
    dateStr = dateValue.date; 
  } else if (typeof dateValue === 'string') {
    dateStr = dateValue;
  } else {
    return 'Date inconnue';
  }

  try {
    const date = new Date(dateStr);
    return `${date.toLocaleDateString('fr-FR')} à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  } catch (e) {
    return 'Date invalide';
  }
};

export default function PassagerNotifications() {
  const router = useRouter();
  // ✅ CORRECTION : On récupère 'darkMode' au lieu de 'theme'
  const { darkMode } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const fetchNotifications = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Clean token
      const cleanToken = token.replace(/"/g, '').trim();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const res = await fetch(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${cleanToken}` },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }

        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : data.data || []);
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    return () => window.removeEventListener('resize', checkMobile);
  }, [router]);

  const marquerLu = async (id: number) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/notifications/${id}/lire`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, estLu: true, dateLecture: new Date().toISOString() } : n));
      window.dispatchEvent(new Event('notifications-updated'));
    } catch {
      // Ignorer
    }
  };

  const marquerToutLu = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/notifications/lire-tout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, estLu: true, dateLecture: new Date().toISOString() })));
      window.dispatchEvent(new Event('notifications-updated'));
    } catch {
      // Ignorer
    }
  };

  const supprimer = async (id: number) => {
    if (!confirm('Supprimer cette notification ?')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {
      // Ignorer
    }
  };

  const nonLues = notifications.filter(n => !n.estLu).length;

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        padding: isMobile ? '20px' : '40px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            border: `3px solid ${EMERALD_LIGHT}`, 
            borderTopColor: EMERALD, 
            animation: 'spin 1s linear infinite', 
            margin: '0 auto 12px' 
          }} />
          <p style={{ color: GRAY, fontSize: '14px' }}>Chargement des notifications...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? '20px 16px' : '32px 24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        gap: isMobile ? '16px' : '0',
        marginBottom: isMobile ? '24px' : '32px' 
      }}>
        <div>
          <h1 style={{ 
            fontSize: isMobile ? '22px' : '28px', 
            fontWeight: '800', 
            // ✅ CORRECTION : Utilisation de darkMode
            color: darkMode ? '#FFFFFF' : BLACK, 
            margin: '0 0 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Icon name="bell" size={28} />
            Notifications
          </h1>
          <p style={{ color: GRAY, fontSize: isMobile ? '13px' : '14px', margin: 0 }}>
            {nonLues > 0 ? (
              <span style={{ color: EMERALD, fontWeight: '600' }}>{nonLues} notification(s) non lue(s)</span>
            ) : (
              'Tout est lu !'
            )}
          </p>
        </div>
        
        {notifications.length > 0 && nonLues > 0 && (
          <button
            onClick={marquerToutLu}
            style={{ 
              padding: isMobile ? '10px 16px' : '10px 20px', 
              background: EMERALD_LIGHT, 
              border: `1px solid #bbf7d0`, 
              color: EMERALD_DARK, 
              borderRadius: '10px', 
              fontSize: '13px', 
              fontWeight: '600', 
              cursor: 'pointer', 
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
              width: isMobile ? '100%' : 'auto',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => { 
              e.currentTarget.style.background = '#d1fae5'; 
            }}
            onMouseLeave={(e) => { 
              e.currentTarget.style.background = EMERALD_LIGHT; 
            }}
          >
            <Icon name="check" size={16} />
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Empty State */}
      {notifications.length === 0 ? (
        <div style={{ 
          // ✅ CORRECTION : Utilisation de darkMode
          background: darkMode ? '#1D1D1D' : '#FFFFFF', 
          borderRadius: '16px', 
          padding: isMobile ? '40px 20px' : '60px 40px', 
          textAlign: 'center', 
          border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : BORDER}`,
          boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            background: EMERALD_LIGHT, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 16px' 
          }}>
            <Icon name="bell" size={32} />
          </div>
          <p style={{ color: darkMode ? '#FFFFFF' : BLACK, fontSize: '16px', fontWeight: '700', margin: '0 0 8px' }}>Aucune notification</p>
          <p style={{ color: GRAY, fontSize: '14px', margin: 0 }}>Vous serez notifié des nouvelles activités ici.</p>
        </div>
      ) : (
        /* List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map((notif) => {
            const isTrajetNotif = notif.type === 'nouvelle_reservation' || notif.type === 'reservation_annulee';
            const isTermine = notif.type === 'trajet_termine' || (notif.message && notif.message.toLowerCase().includes('termin'));
            const initials = notif.passager
              ? `${notif.passager.prenom?.charAt(0) || ''}${notif.passager.nom?.charAt(0) || ''}`
              : (notif.titre?.charAt(0) || '');
            const showAvatar = isTrajetNotif || notif.passager;

            return (
              <div
                key={notif.id}
                style={{
                  background: notif.estLu ? (darkMode ? '#1D1D1D' : '#FFFFFF') : '#F0FDF4',
                  borderRadius: '16px',
                  padding: isMobile ? '16px' : '20px',
                  border: `1px solid ${notif.estLu ? (darkMode ? 'rgba(255,255,255,0.1)' : BORDER) : '#86efac'}`,
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: isMobile ? '12px' : '16px',
                  boxShadow: notif.estLu ? 'none' : '0 2px 8px rgba(13,158,126,0.08)'
                }}
                onMouseEnter={(e) => { 
                  if (!notif.estLu) {
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(13,158,126,0.12)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => { 
                  if (!notif.estLu) {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(13,158,126,0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {/* Avatar / Photo */}
                <div style={{ flexShrink: 0, width: '40px', height: '40px' }}>
                  {showAvatar ? (
                    <div style={{ position: 'relative', width: '40px', height: '40px' }}>
                      {notif.passager?.photo && (
                        <img src={notif.passager.photo.startsWith('http') ? notif.passager.photo : `/uploads/profils/${notif.passager.photo}`} alt="" onError={e => e.currentTarget.style.display = 'none'} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 10 }} />
                      )}
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: `linear-gradient(135deg, ${EMERALD}, ${EMERALD_DARK})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: '700', color: '#FFFFFF',
                        position: 'relative', zIndex: 1
                      }}>
                        {typeof initials === 'string' && initials.length > 0 ? initials : <Icon name="bell" size={14} color="#FFFFFF" />}
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: EMERALD_LIGHT,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '18px'
                    }}>
                      <Icon name="bell" size={18} />
                    </div>
                  )}
                </div>

                {/* Centre : titre + message + date */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ 
                      fontSize: isMobile ? '15px' : '16px', 
                      fontWeight: '700', 
                      color: darkMode ? '#FFFFFF' : BLACK,
                      wordBreak: 'break-word'
                    }}>
                      {notif.titre}
                    </span>
                  </div>
                  
                  <p style={{ 
                    color: notif.estLu ? GRAY : (darkMode ? '#D1D5DB' : BLACK), 
                    fontSize: isMobile ? '13px' : '14px', 
                    marginTop: '0', 
                    marginBottom: '8px',
                    lineHeight: '1.5',
                    wordBreak: 'break-word'
                  }}>
                    {notif.message}
                  </p>
                  
                  <div style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    fontSize: '12px', 
                    color: GRAY, 
                    flexWrap: 'wrap',
                    alignItems: 'center'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Icon name="clock" size={14} />
                      {formatDate(notif.dateEnvoi)}
                    </span>
                    {notif.estLu && (
                      <span style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px', 
                        color: EMERALD,
                        fontWeight: '600'
                      }}>
                        <Icon name="check" size={14} />
                        Lu
                      </span>
                    )}
                  </div>
                </div>

                {/* Droite : badge non lu + boutons d'action */}
                <div style={{ 
                  display: 'flex', 
                  gap: '6px', 
                  flexShrink: 0,
                  flexDirection: 'column',
                  alignItems: 'flex-end'
                }}>
                  {!notif.estLu && (
                    <span style={{ 
                      display: 'inline-block', 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      background: EMERALD, 
                      flexShrink: 0,
                      boxShadow: `0 0 0 2px ${EMERALD_LIGHT}`
                    }} />
                  )}
                  <div style={{ 
                    display: 'flex', 
                    gap: '6px', 
                    flexWrap: 'wrap',
                    justifyContent: 'flex-end'
                  }}>
                    {notif.url && (
                      <a
                        href={notif.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ 
                          padding: '6px 12px', 
                          background: EMERALD_LIGHT, 
                          border: `1px solid #bbf7d0`, 
                          color: EMERALD_DARK, 
                          borderRadius: '8px', 
                          fontSize: '12px', 
                          fontWeight: '600', 
                          cursor: 'pointer', 
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        Voir
                      </a>
                    )}
                    {isTermine && (
                      <Link
                        href="/passager/reservations"
                        style={{ 
                          padding: '6px 12px', 
                          background: '#16A34A', 
                          border: 'none',
                          color: '#FFFFFF', 
                          borderRadius: '8px', 
                          fontSize: '12px', 
                          fontWeight: '600', 
                          cursor: 'pointer', 
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        Évaluer
                      </Link>
                    )}
                    {!notif.estLu && (
                      <button
                        onClick={() => marquerLu(notif.id)}
                        style={{ 
                          padding: '6px 12px', 
                          background: EMERALD_LIGHT, 
                          border: `1px solid #bbf7d0`, 
                          color: EMERALD_DARK, 
                          borderRadius: '8px', 
                          fontSize: '12px', 
                          fontWeight: '600', 
                          cursor: 'pointer', 
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#d1fae5'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = EMERALD_LIGHT; }}
                      >
                        <Icon name="check" size={14} />
                        Lu
                      </button>
                    )}
                    <button
                      onClick={() => supprimer(notif.id)}
                      style={{ 
                        padding: '6px 12px', 
                        background: 'transparent', 
                        border: `1px solid ${EMERALD}`, 
                        color: EMERALD, 
                        borderRadius: '8px', 
                        fontSize: '12px', 
                        fontWeight: '600', 
                        cursor: 'pointer', 
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      onMouseEnter={(e) => { 
                        e.currentTarget.style.background = EMERALD; 
                        e.currentTarget.style.color = '#FFFFFF'; 
                      }}
                      onMouseLeave={(e) => { 
                        e.currentTarget.style.background = 'transparent'; 
                        e.currentTarget.style.color = EMERALD; 
                      }}
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}