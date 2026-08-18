'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/app/lib/ThemeContext';

const BACKEND_URL = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000` : '';

interface Contact {
  id: number;
  nom: string;
  prenom: string;
  photo: string | null;
  dernierMessage: string;
  dateEnvoi: string;
  nonLu: boolean;
}

const EMERALD = '#0D9E7E';
const EMERALD_LIGHT = '#E8F7F3';
const EMERALD_DARK = '#0A7B62';
const BLACK = '#0D0D0D';
const GRAY = '#6B7280';
const LIGHT_GRAY = '#F5F5F5';
const BORDER = '#EBEBEB';

// ─── SVG Icons inline ───
const Icon = ({ name, size = 20, color = EMERALD }: { name: string; size?: number; color?: string }) => {
  const s = { width: size, height: size, display: 'inline-block', verticalAlign: 'middle' } as React.CSSProperties;
  const icons: Record<string, React.ReactNode> = {
    message: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    mail: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    search: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
      </svg>
    ),
  };
  return <span style={{ lineHeight: 0, display: 'inline-flex' }}>{icons[name] || null}</span>;
};

export default function ChatList() {
  const router = useRouter();
  const { t, darkMode } = useTheme();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const currentUserId = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}').id : null;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    if (!token) { router.push('/login'); return; }
    
    const cleanToken = token.replace(/"/g, '').trim();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    fetch('/api/messages', {
      headers: { Authorization: `Bearer ${cleanToken}` },
      signal: controller.signal,
    })
      .then(res => {
        clearTimeout(timeoutId);
        if (res.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }
        return res.json();
      })
      .then(response => {
        const messages = response.data || [];
        const contactsMap = new Map();

        messages.forEach((msg: any) => {
          const isMe = msg.expediteur.id === currentUserId;
          const otherUser = isMe ? msg.destinataire : msg.expediteur;
          const userId = otherUser.id;

          if (!contactsMap.has(userId) || new Date(msg.dateEnvoi) > new Date(contactsMap.get(userId).dateEnvoi)) {
            contactsMap.set(userId, {
              id: userId,
              nom: otherUser.nom,
              prenom: otherUser.prenom,
              photo: otherUser.photo,
              dernierMessage: msg.contenu,
              dateEnvoi: msg.dateEnvoi,
              nonLu: !isMe && !msg.estLu
            });
          }
        });

        const sortedContacts = Array.from(contactsMap.values()).sort(
          (a, b) => new Date(b.dateEnvoi).getTime() - new Date(a.dateEnvoi).getTime()
        );
        setContacts(sortedContacts);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    return () => window.removeEventListener('resize', checkMobile);
  }, [token, router, currentUserId]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    return isToday ? date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <>
        <div style={{ padding: isMobile ? '60px 20px' : '80px', textAlign: 'center', color: darkMode ? '#9CA3AF' : GRAY }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `3px solid ${EMERALD_LIGHT}`, borderTopColor: EMERALD, animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p>{t('loading') || 'Chargement des discussions...'}</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
        </div>
      </>
    );
  }

  return (
    <>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: isMobile ? '20px 16px' : '32px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: isMobile ? '20px' : '24px' }}>
          <div style={{ 
            width: '48px', height: '48px', borderRadius: '14px', background: EMERALD_LIGHT, 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <Icon name="message" size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '800', color: darkMode ? '#FFFFFF' : BLACK, margin: '0 0 4px' }}>
              {t('chat') || 'Mes Discussions'}
            </h1>
            <p style={{ fontSize: '14px', color: darkMode ? '#9CA3AF' : GRAY, margin: 0 }}>
              {contacts.length} discussion{contacts.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        {contacts.length === 0 ? (
          <div style={{ 
            textAlign: 'center', padding: isMobile ? '40px 20px' : '60px', 
            background: darkMode ? '#1D1D1D' : '#FFFFFF', borderRadius: '20px', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : BORDER}`,
            boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{ 
              width: '64px', height: '64px', borderRadius: '50%', background: EMERALD_LIGHT, 
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' 
            }}>
              <Icon name="mail" size={32} />
            </div>
            <p style={{ color: darkMode ? '#FFFFFF' : BLACK, fontSize: '16px', fontWeight: '700', margin: '0 0 8px' }}>
              {t('noMessages') || 'Aucune discussion pour le moment'}
            </p>
            <p style={{ color: darkMode ? '#9CA3AF' : GRAY, fontSize: '14px', marginBottom: '20px' }}>
              {t('startChat') || 'Commencez à échanger avec vos conducteurs ou passagers.'}
            </p>
            <Link 
              href="/passager/dashboard" 
              style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '12px 24px', background: `linear-gradient(135deg, ${EMERALD}, ${EMERALD_DARK})`, 
                color: '#FFFFFF', borderRadius: '12px', textDecoration: 'none', fontWeight: '600',
                boxShadow: `0 4px 12px rgba(13, 158, 126, 0.3)`,
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 6px 16px rgba(13, 158, 126, 0.4)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 4px 12px rgba(13, 158, 126, 0.3)`;
              }}
            >
              <Icon name="search" size={18} />
              {t('search') || 'Trouver un trajet'}
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {contacts.map(contact => (
              <Link 
                key={contact.id} 
                href={`/passager/chat/${contact.id}`}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '16px', 
                  padding: isMobile ? '14px' : '16px', 
                  background: contact.nonLu ? EMERALD_LIGHT : (darkMode ? '#1D1D1D' : '#FFFFFF'), 
                  borderRadius: '16px', border: `1px solid ${contact.nonLu ? '#bbf7d0' : (darkMode ? 'rgba(255,255,255,0.1)' : BORDER)}`, 
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  boxShadow: contact.nonLu ? '0 2px 8px rgba(13,158,126,0.08)' : 'none'
                }}
                onMouseEnter={e => {
                  if (!contact.nonLu) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
                    e.currentTarget.style.borderColor = EMERALD;
                  }
                }}
                onMouseLeave={e => {
                  if (!contact.nonLu) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.1)' : BORDER;
                  }
                }}
              >
                {/* Avatar */}
                <div style={{ position: 'relative', width: isMobile ? '48px' : '52px', height: isMobile ? '48px' : '52px', flexShrink: 0 }}>
                  {contact.photo && (
                    <img
                      src={contact.photo.startsWith('http') ? contact.photo : `${BACKEND_URL}/uploads/profils/${contact.photo}`}
                      alt={`Photo de ${contact.prenom}`}
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                      style={{
                        width: '100%', height: '100%', borderRadius: '50%',
                        objectFit: 'cover', border: '2px solid #FFFFFF',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                        position: 'absolute', top: 0, left: 0, zIndex: 10
                      }}
                    />
                  )}
                  <div style={{
                    width: '100%', height: '100%', borderRadius: '50%',
                    background: `linear-gradient(135deg, ${BLACK}, #1a2e1a)`, color: EMERALD,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: isMobile ? '16px' : '18px', fontWeight: '700',
                    position: 'relative', zIndex: 1
                  }}>
                    {contact.prenom?.charAt(0)}{contact.nom?.charAt(0)}
                  </div>
                  
                  {contact.nonLu && (
                    <div style={{ 
                      position: 'absolute', top: '0', right: '0', 
                      width: '14px', height: '14px', background: EMERALD, 
                      borderRadius: '50%', border: '2px solid #FFFFFF', zIndex: 20 
                    }} />
                  )}
                </div>
                
                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ 
                      fontSize: isMobile ? '15px' : '16px', 
                      fontWeight: contact.nonLu ? '700' : '600', 
                      color: darkMode ? '#FFFFFF' : BLACK 
                    }}>
                      {contact.prenom} {contact.nom}
                    </span>
                    <span style={{ 
                      fontSize: '12px', 
                      color: contact.nonLu ? EMERALD_DARK : (darkMode ? '#9CA3AF' : GRAY),
                      fontWeight: contact.nonLu ? '600' : '400'
                    }}>
                      {formatTime(contact.dateEnvoi)}
                    </span>
                  </div>
                  <p style={{ 
                    fontSize: '14px', 
                    color: contact.nonLu ? (darkMode ? '#FFFFFF' : BLACK) : (darkMode ? '#9CA3AF' : GRAY), 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    fontWeight: contact.nonLu ? '600' : '400',
                    margin: 0
                  }}>
                    {contact.dernierMessage}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}