'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/app/lib/ThemeContext';

interface Message {
  id: number;
  contenu: string;
  dateEnvoi: string;
  estLu: boolean;
  estMoi: boolean;
  estSignale?: boolean;
  expediteur: { id: number; nom: string; prenom: string; photo?: string | null };
  destinataire?: { id: number; nom: string; prenom: string; photo?: string | null };
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
    arrowLeft: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
    ),
    message: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    send: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"/>
        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
      </svg>
    ),
  };
  return <span style={{ lineHeight: 0, display: 'inline-flex' }}>{icons[name] || null}</span>;
};

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const { t, darkMode } = useTheme();
  const theme = darkMode ? 'dark' : 'light';
  const userId = Number(params.userId);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhoto, setContactPhoto] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showSignaler, setShowSignaler] = useState<number | null>(null);
  const [raisonSignalement, setRaisonSignalement] = useState('');
  const [error, setError] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const currentUserId = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}').id : null;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    fetchConversation();
    pollRef.current = setInterval(fetchConversation, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [userId, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversation = async () => {
    try {
      const res = await fetch(`/api/messages/conversation/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const response = await res.json();
      const data = response.data || [];
      
      if (Array.isArray(data)) {
        const formattedMessages = data.map((msg: any) => ({
          ...msg,
          estMoi: msg.expediteur.id === currentUserId
        }));
        setMessages(formattedMessages);
        
        if (data.length > 0) {
          const firstMsg = data[0];
          const isMe = firstMsg.expediteur.id === currentUserId;
          const otherUser = isMe ? firstMsg.destinataire : firstMsg.expediteur;
          
          setContactName(`${otherUser.prenom} ${otherUser.nom}`);
          setContactPhoto(otherUser.photo || null);
        }
      }
    } catch (err) { console.error("Erreur chargement:", err); } 
    finally { setLoading(false); }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const tempId = Date.now();
    const optimisticMessage: Message = {
      id: tempId,
      contenu: newMessage.trim(),
      dateEnvoi: new Date().toISOString(),
      estLu: false,
      estMoi: true,
      expediteur: { id: currentUserId, nom: '', prenom: '', photo: null }
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          destinataireId: userId, 
          contenu: optimisticMessage.contenu,
          typeMessage: 'simple'
        })
      });
      
      if (!res.ok) {
        setMessages(prev => prev.filter(m => m.id !== tempId));
        setError(t('messageSendFailed')); setTimeout(() => setError(''), 4000);
      } else {
        fetchConversation(); 
      }
    } catch (err) {
      console.error("Erreur envoi:", err);
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  const handleSignaler = async (messageId: number) => {
    try {
      const res = await fetch(`/api/messages/${messageId}/signaler`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ raison: raisonSignalement || null })
      });
      if (res.ok) {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, estSignale: true } : m));
        setShowSignaler(null);
        setRaisonSignalement('');
      }
    } catch (err) { console.error('Erreur signalement:', err); }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <>
        <div style={{ padding: '40px', textAlign: 'center', color: GRAY }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `3px solid ${EMERALD_LIGHT}`, borderTopColor: EMERALD, animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p>{t('loadingConversation')}</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
        </div>
      </>
    );
  }

  const initials = contactName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <>
      <div style={{ 
        maxWidth: '900px', 
        margin: '0 auto', 
        height: isMobile ? 'calc(100dvh - 60px)' : 'calc(100vh - 100px)', 
        display: 'flex', 
        flexDirection: 'column', 
        background: theme === 'dark' ? '#1D1D1D' : '#FFFFFF', 
        borderRadius: isMobile ? '0' : '20px', 
        border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : BORDER}`, 
        overflow: 'hidden',
        boxShadow: theme === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.04)'
      }}>
        {error && (
          <div style={{ padding: '10px 16px', background: '#FEE2E2', borderBottom: '1px solid #FECACA', display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626', fontSize: '13px', fontWeight: '600' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            {error}
          </div>
        )}
        
        {/* Header */}
        <div style={{ 
          padding: isMobile ? '12px 16px' : '16px 24px', 
          borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : BORDER}`, 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          background: theme === 'dark' ? '#1D1D1D' : '#FFFFFF' 
        }}>
          <Link 
            href="/passager/chat" 
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '36px', height: '36px', borderRadius: '10px', 
              textDecoration: 'none', color: BLACK,
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = LIGHT_GRAY}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Icon name="arrowLeft" size={20} />
          </Link>
          
          <div style={{ position: 'relative', width: '40px', height: '40px', flexShrink: 0 }}>
            {contactPhoto && (
              <img
                src={contactPhoto.startsWith('http') ? contactPhoto : `/uploads/profils/${contactPhoto}`}
                alt={t('photoOf').replace('{name}', contactName)}
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
              background: `linear-gradient(135deg, ${BLACK}, #1a2e1a)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: '700', color: EMERALD,
              position: 'relative', zIndex: 1
            }}>
              {initials}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: '700', color: theme === 'dark' ? '#FFFFFF' : BLACK }}>{contactName || t('conversation')}</div>
            <div style={{ fontSize: '12px', color: EMERALD, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: EMERALD, display: 'inline-block' }}></span>
              {t('online')}
            </div>
          </div>
        </div>

        {/* Zone des messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: isMobile ? '16px' : '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          background: theme === 'dark' ? '#0D0D0D' : '#EFEAE2'
        }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: GRAY, marginTop: '40px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: EMERALD_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Icon name="message" size={28} />
              </div>
              <p style={{ fontSize: '15px', fontWeight: '600', color: theme === 'dark' ? '#FFFFFF' : BLACK }}>{t('startConversation')}</p>
              <p style={{ fontSize: '13px', color: GRAY, marginTop: '4px' }}>{t('sendFirstMessage')}</p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.estMoi ? 'flex-end' : 'flex-start',
              maxWidth: isMobile ? '85%' : '70%'
            }}>
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                borderBottomRightRadius: msg.estMoi ? '2px' : '8px',
                borderBottomLeftRadius: msg.estMoi ? '8px' : '2px',
                background: msg.estMoi ? '#DCF8C6' : '#FFFFFF',
                color: BLACK,
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                wordBreak: 'break-word',
                position: 'relative'
              }}>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.4' }}>{msg.contenu}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <span style={{
                  fontSize: '11px',
                  color: '#8E8E8E',
                  marginRight: msg.estMoi ? '4px' : '0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: '500'
                }}>
                  {formatTime(msg.dateEnvoi)}
                  {msg.estMoi && (
                    <span style={{ color: msg.estLu ? '#34B7F1' : '#8E8E8E', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '1px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      {msg.estLu && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft:'-6px'}}><polyline points="20 6 9 17 4 12"/></svg>}
                    </span>
                  )}
                </span>
                {!msg.estMoi && !msg.estSignale && showSignaler !== msg.id && (
                  <button onClick={() => setShowSignaler(msg.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#8E8E8E', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }} title={t('reportMessage')}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                    {t('reportMessage')}
                  </button>
                )}
                {msg.estSignale && (
                  <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                    {t('reportedLabel')}
                  </span>
                )}
              </div>
              {showSignaler === msg.id && (
                <div style={{ marginTop: '8px', padding: '10px', background: '#FEF2F2', borderRadius: '8px', border: '1px solid #FECACA', display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '200px' }}>
                  <input
                    type="text"
                    value={raisonSignalement}
                    onChange={e => setRaisonSignalement(e.target.value)}
                    placeholder={t('reasonOptional')}
                    style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #FECACA', fontSize: '12px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                  />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => handleSignaler(msg.id)} style={{ flex: 1, padding: '6px', background: '#DC2626', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>{t('confirmBtn')}</button>
                    <button onClick={() => { setShowSignaler(null); setRaisonSignalement(''); }} style={{ flex: 1, padding: '6px', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>{t('cancel')}</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Zone de saisie */}
        <form onSubmit={handleSend} style={{ 
          padding: isMobile ? '12px 16px' : '16px 24px', 
          borderTop: `1px solid ${BORDER}`, 
          display: 'flex', 
          gap: '12px', 
          background: '#FFFFFF' 
        }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t('writeMessagePlaceholder')}
            style={{ 
              flex: 1, 
              padding: '12px 18px', 
              borderRadius: '24px', 
              border: `1px solid ${BORDER}`, 
              outline: 'none', 
              fontSize: '14px',
              background: LIGHT_GRAY,
              transition: 'all 0.2s'
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = EMERALD;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${EMERALD_LIGHT}`;
              e.currentTarget.style.background = '#FFFFFF';
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = BORDER;
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.background = LIGHT_GRAY;
            }}
            disabled={sending}
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim() || sending}
            style={{ 
              width: '48px', height: '48px', borderRadius: '50%', border: 'none', 
              background: newMessage.trim() && !sending ? `linear-gradient(135deg, ${EMERALD}, ${EMERALD_DARK})` : '#E5E7EB', 
              color: '#FFFFFF', 
              cursor: newMessage.trim() && !sending ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              transition: 'all 0.2s',
              boxShadow: newMessage.trim() && !sending ? `0 4px 12px rgba(13,158,126,0.3)` : 'none'
            }}
            onMouseEnter={e => {
              if (newMessage.trim() && !sending) {
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={e => {
              if (newMessage.trim() && !sending) {
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            <Icon name="send" size={20} />
          </button>
        </form>
      </div>
    </>
  );
}