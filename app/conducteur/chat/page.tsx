'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ConducteurLayout from '../../../components/conducteur/ConducteurLayout';
import { useTheme } from '@/app/lib/ThemeContext';

const E = '#0D9E7E';
const EL = '#E8F7F3';
const ED = '#0A7B62';
const BK = '#0D0D0D';
const GR = '#6B7280';
const BD = '#EBEBEB';

// ─── SVG Icons inline ───
const Icon = ({ name, size = 20, color = E }: { name: string; size?: number; color?: string }) => {
  const s = { width: size, height: size, display: 'inline-block', verticalAlign: 'middle' } as React.CSSProperties;
  const icons: Record<string, React.ReactNode> = {
    chat: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    mail: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    arrowRight: (
      <svg style={s} viewBox="0 0 24 24" fill="none"><path d="M5 12H19M14 7L19 12L14 17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ),
  };
  return <span style={{ lineHeight: 0, display: 'inline-flex' }}>{icons[name] || null}</span>;
};

interface Contact {
  id: number;
  nom: string;
  prenom: string;
  photo: string | null;
  dernierMessage: string;
  dateEnvoi: string;
  nonLu: boolean;
}

export default function ConducteurChatList() {
  const router = useRouter();
  // ✅ CORRECTION : useTheme contient t() et darkMode
  const { t, darkMode } = useTheme();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const currentUserId = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}').id : null;

  useEffect(() => {
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
  }, [token, router, currentUserId]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    return isToday ? date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  // Styles dynamiques selon le mode sombre
  const bgColor = darkMode ? '#1A1A1A' : '#FFFFFF';
  const textColor = darkMode ? '#FFFFFF' : '#111827';
  const textSecondary = darkMode ? '#9CA3AF' : '#6B7280';
  const borderColor = darkMode ? '#2A2A2A' : '#e5e7eb';
  const cardBg = darkMode ? '#1A1A1A' : '#fff';
  const cardBgNonLu = darkMode ? '#2D2D2D' : '#f0fdf4';
  const cardHoverBg = darkMode ? '#2D2D2D' : '#f9fafb';
  const shadow = darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)';

  if (loading) {
    return (
      <ConducteurLayout>
        <div style={{ padding: '40px', textAlign: 'center', color: darkMode ? '#9CA3AF' : '#6b7280' }}>
          {t('loading')}
        </div>
      </ConducteurLayout>
    );
  }

  return (
    <ConducteurLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: '800', 
          color: textColor, 
          marginBottom: '20px' 
        }}>
          <Icon name="chat" size={24} /> {t('chat')}
        </h1>
        
        {contacts.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px', 
            background: cardBg, 
            borderRadius: '16px', 
            border: `1px solid ${borderColor}`,
            boxShadow: shadow
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>
              <Icon name="mail" size={48} color={darkMode ? '#9CA3AF' : GR} />
            </div>
            <p style={{ color: textSecondary }}>{t('noMessages')}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {contacts.map(contact => (
              <Link 
                key={contact.id} 
                href={`/conducteur/chat/${contact.id}`}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px', 
                  padding: '16px', 
                  background: contact.nonLu ? cardBgNonLu : cardBg, 
                  borderRadius: '12px', 
                  border: `1px solid ${borderColor}`, 
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  boxShadow: shadow,
                  color: textColor
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = darkMode ? '0 8px 30px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = shadow;
                }}
              >
                <div style={{ position: 'relative', width: '50px', height: '50px', flexShrink: 0 }}>
                  {contact.photo && (
                    <img
                      src={contact.photo.startsWith('http') ? contact.photo : `/uploads/profils/${contact.photo}`}
                      alt={`Photo de ${contact.prenom}`}
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                      style={{
                        width: '100%', height: '100%', borderRadius: '50%',
                        objectFit: 'cover', border: '2px solid #fff',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                        position: 'absolute', top: 0, left: 0, zIndex: 10
                      }}
                    />
                  )}
                  <div style={{
                    width: '100%', height: '100%', borderRadius: '50%',
                    background: darkMode ? '#2D2D2D' : '#0a0a0a',
                    color: darkMode ? '#FFFFFF' : '#22c55e',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', fontWeight: '700',
                    position: 'relative', zIndex: 1
                  }}>
                    {contact.prenom?.charAt(0)}{contact.nom?.charAt(0)}
                  </div>
                  
                  {contact.nonLu && (
                    <div style={{ 
                      position: 'absolute', top: '0', right: '0', 
                      width: '12px', height: '12px', background: '#dc2626', 
                      borderRadius: '50%', border: '2px solid #fff', zIndex: 20 
                    }} />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ 
                      fontSize: '15px', 
                      fontWeight: '700', 
                      color: contact.nonLu ? (darkMode ? '#FFFFFF' : '#111827') : (darkMode ? '#9CA3AF' : '#374151') 
                    }}>
                      {contact.prenom} {contact.nom}
                    </span>
                    <span style={{ fontSize: '12px', color: darkMode ? '#6B7280' : '#9ca3af' }}>
                      {formatTime(contact.dateEnvoi)}
                    </span>
                  </div>
                  <p style={{ 
                    fontSize: '13px', 
                    color: darkMode ? '#9CA3AF' : '#6b7280', 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    fontWeight: contact.nonLu ? '600' : '400' 
                  }}>
                    {contact.dernierMessage}
                  </p>
                </div>

                <Icon name="arrowRight" size={18} color={darkMode ? '#6B7280' : '#9ca3af'} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </ConducteurLayout>
  );
}