'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ConducteurLayout from '../../../../components/conducteur/ConducteurLayout';
import Link from 'next/link';

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
    send: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
      </svg>
    ),
    check: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    checkDouble: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/><polyline points="20 12 9 23 4 18"/>
      </svg>
    ),
    hand: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
      </svg>
    ),
  };
  return <span style={{ lineHeight: 0, display: 'inline-flex' }}>{icons[name] || null}</span>;
};

interface Message {
  id: number;
  contenu: string;
  dateEnvoi: string;
  estLu: boolean;
  estMoi: boolean;
  expediteur: { id: number; nom: string; prenom: string; photo?: string | null };
  destinataire?: { id: number; nom: string; prenom: string; photo?: string | null };
}

export default function ConducteurConversationPage() {
  const params = useParams();
  const router = useRouter();
  const userId = Number(params.userId);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [contactName, setContactName] = useState('Discussion');
  const [contactPhoto, setContactPhoto] = useState<string | null>(null); // ✅ AJOUTÉ
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const currentUserId = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}').id : null;

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    fetchConversation();
  }, [userId, token]);

  useEffect(() => { scrollToBottom(); }, [messages]);

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
        
        // ✅ EXTRACTION DU NOM ET DE LA PHOTO DE L'INTERLOCUTEUR
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
      id: tempId, contenu: newMessage.trim(), dateEnvoi: new Date().toISOString(),
      estLu: false, estMoi: true, expediteur: { id: currentUserId, nom: '', prenom: '', photo: null }
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ destinataireId: userId, contenu: optimisticMessage.contenu, typeMessage: 'simple' })
      });
      if (!res.ok) {
        setMessages(prev => prev.filter(m => m.id !== tempId));
      } else {
        fetchConversation(); 
      }
    } catch (err) { console.error("Erreur envoi:", err); } 
    finally { setSending(false); }
  };

  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  if (loading) return <ConducteurLayout><div style={{padding: '40px', textAlign: 'center'}}>Chargement...</div></ConducteurLayout>;

  // Calcul des initiales pour le fallback
  const initials = contactName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <ConducteurLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        
        {/* ✅ EN-TÊTE AVEC PHOTO OU INITIALES */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '12px', background: '#f9fafb' }}>
          <Link href="/conducteur/chat" style={{ fontSize: '20px', textDecoration: 'none', color: '#374151' }}>←</Link>
          
          <div style={{ position: 'relative', width: '40px', height: '40px', flexShrink: 0 }}>
            {contactPhoto && (
              <img
                src={contactPhoto.startsWith('http') ? contactPhoto : `/uploads/profils/${contactPhoto}`}
                alt="Photo"
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
              background: '#0a0a0a', color: '#22c55e',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '700', fontSize: '14px',
              position: 'relative', zIndex: 1
            }}>
              {initials}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>{contactName}</div>
            <div style={{ fontSize: '12px', color: '#16a34a' }}><span style={{width:8,height:8,borderRadius:'50%',background:'#22c55e',display:'inline-block',marginRight:6,verticalAlign:'middle'}} /> En ligne</div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#EFEAE2' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '40px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#DCF8C6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <p style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}><Icon name="hand" size={16} /> Démarrez la conversation !</p>
              <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>Envoyez votre premier message</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.estMoi ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
              <div style={{
                padding: '10px 14px', borderRadius: '8px', borderBottomRightRadius: msg.estMoi ? '2px' : '8px', borderBottomLeftRadius: msg.estMoi ? '8px' : '2px',
                background: msg.estMoi ? '#DCF8C6' : '#FFFFFF', color: '#111827',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)', border: msg.estMoi ? 'none' : '1px solid #e5e7eb'
              }}>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.4', wordBreak: 'break-word' }}>{msg.contenu}</p>
              </div>
              <span style={{ fontSize: '11px', color: '#8E8E8E', marginTop: '4px', marginRight: msg.estMoi ? '4px' : '0', fontWeight: '500' }}>
                {formatTime(msg.dateEnvoi)} {msg.estMoi && (
                  <span style={{ color: msg.estLu ? '#34B7F1' : '#8E8E8E', fontWeight: '600' }}>
                    {msg.estLu ? <Icon name="checkDouble" size={10} color="#34B7F1" /> : <Icon name="check" size={10} color="#8E8E8E" />}
                  </span>
                )}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} style={{ padding: '16px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '10px', background: '#fff' }}>
          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Écrivez votre message..." style={{ flex: 1, padding: '12px 16px', borderRadius: '24px', border: '1px solid #d1d5db', outline: 'none', fontSize: '14px' }} disabled={sending} />
          <button type="submit" disabled={!newMessage.trim() || sending} style={{ width: '48px', height: '48px', borderRadius: '50%', border: 'none', background: newMessage.trim() ? '#16a34a' : '#d1d5db', color: '#fff', fontSize: '18px', cursor: newMessage.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="send" size={18} color="white" /></button>
        </form>
      </div>
    </ConducteurLayout>
  );
}