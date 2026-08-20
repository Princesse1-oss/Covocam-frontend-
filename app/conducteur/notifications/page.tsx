'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ConducteurLayout from '../../../components/conducteur/ConducteurLayout';

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
    bell: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
    clipboard: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
    ),
    x: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    ),
    check: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    phone: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
    trash: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
      </svg>
    ),
    trashDone: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        <path d="M9 14l2 2 4-4"/>
      </svg>
    ),
  };
  return <span style={{ lineHeight: 0, display: 'inline-flex' }}>{icons[name] || null}</span>;
};

interface Notification {
  id: number;
  titre: string;
  message: string;
  estLu: boolean;
  dateEnvoi: any; // Peut être string ou objet Doctrine
  type?: string;
}

interface ReservationNotif {
  id: number;
  placesReservees: number;
  statut: string;
  dateReservation: any; // Peut être string ou objet Doctrine
  passager: { nom: string; prenom: string; email: string; telephone: string | null; photo?: string | null };
  trajet: { id: number; villeDepart: string; villeArrivee: string; dateDepart: any; heureDepart: any | null };
}

// ✅ FONCTION ROBUSTE POUR FORMATER LES DATES (gère les objets Doctrine)
const formatDate = (dateValue: any): string => {
  if (!dateValue) return '—';
  
  let dateStr = '';
  
  // Si c'est un objet Doctrine avec la propriété 'date'
  if (typeof dateValue === 'object' && dateValue !== null && 'date' in dateValue) {
    dateStr = dateValue.date;
  } 
  // Si c'est déjà une string
  else if (typeof dateValue === 'string') {
    dateStr = dateValue;
  } 
  else {
    return '—';
  }

  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) {
    return '—';
  }
};

// ✅ FONCTION ROBUSTE POUR FORMATER DATE + HEURE
const formatDateTime = (dateValue: any): string => {
  if (!dateValue) return '—';
  
  let dateStr = '';
  
  if (typeof dateValue === 'object' && dateValue !== null && 'date' in dateValue) {
    dateStr = dateValue.date;
  } else if (typeof dateValue === 'string') {
    dateStr = dateValue;
  } else {
    return '—';
  }

  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '—';
  }
};

// ✅ NOUVELLE FONCTION POUR FORMATER UNIQUEMENT L'HEURE (pour heureDepart)
const formatTime = (timeValue: any): string => {
  if (!timeValue) return '';
  
  let timeStr = '';
  
  // Si c'est un objet Doctrine
  if (typeof timeValue === 'object' && timeValue !== null && 'date' in timeValue) {
    timeStr = timeValue.date;
  } 
  // Si c'est une string (ex: "14:30:00" ou "1970-01-01 14:30:00")
  else if (typeof timeValue === 'string') {
    timeStr = timeValue;
  } 
  else {
    return '';
  }

  try {
    // Essayer de parser comme DateTime complet
    const date = new Date(timeStr);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Si c'est juste une heure (ex: "14:30:00")
    if (timeStr.includes(':')) {
      const parts = timeStr.split(':');
      return `${parts[0]}:${parts[1]}`;
    }
    
    return timeStr;
  } catch (e) {
    return timeStr;
  }
};

export default function ConducteurNotifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reservations, setReservations] = useState<ReservationNotif[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reservations' | 'annulations'>('reservations');
  const [markingAll, setMarkingAll] = useState(false);

  const notifierChangementNotifications = () => {
    window.dispatchEvent(new Event('notifications-updated'));
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Clean token
    const cleanToken = token.replace(/"/g, '').trim();

    const fetchData = async () => {
      const controller = new AbortController();
      // ✅ CORRECTION 1 : Délai augmenté à 10 secondes
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const [notifRes, reservationsRes] = await Promise.all([
          fetch('/api/notifications', {
            headers: { Authorization: `Bearer ${cleanToken}`, 'Accept': 'application/json' },
            signal: controller.signal,
          }),
          fetch('/api/reservations/conducteur/mes-reservations', {
            headers: { Authorization: `Bearer ${cleanToken}`, 'Accept': 'application/json' },
            signal: controller.signal,
          })
        ]);

        clearTimeout(timeoutId);

        if (notifRes.status === 401 || reservationsRes.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }

        const notifText = await notifRes.text();
        const reservText = await reservationsRes.text();

        try {
          const notifData = JSON.parse(notifText);
          setNotifications(notifData?.data || []);
        } catch (e) {
          console.error("❌ Erreur parsing notifications:", notifText);
        }

        try {
          const reservationsData = JSON.parse(reservText);
          setReservations(Array.isArray(reservationsData) ? reservationsData : []);
        } catch (e) {
          console.error("❌ Erreur parsing réservations:", reservText);
        }

      } catch (err: any) {
        // ✅ CORRECTION 2 : Gestion polie de l'AbortError
        if (err.name === 'AbortError') {
          console.warn("⏱️ Le chargement des données a pris plus de 10 secondes. Ce n'est pas une erreur critique.");
        } else {
          console.error("💥 Erreur réseau:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleMarquerLue = async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await fetch(`/api/notifications/${id}/lire`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, estLu: true } : n));
      notifierChangementNotifications();
    } catch (err) {
      console.error("Erreur marquage lu:", err);
    }
  };

  const handleMarquerTout = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setMarkingAll(true);
    try {
      await fetch('/api/notifications/lire-tout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, estLu: true })));
      notifierChangementNotifications();
    } catch (err) {
      console.error("Erreur marquage tout lu:", err);
    } finally { 
      setMarkingAll(false); 
    }
  };

  const handleAccepter = async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`/api/reservations/${id}/accepter`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setReservations(prev => prev.map(r => r.id === id ? { ...r, statut: 'A_PAYER' } : r));
      }
    } catch {
      alert('Erreur lors de l\'acceptation');
    }
  };

  const handleRefuser = async (id: number) => {
    if (!window.confirm('Voulez-vous refuser cette réservation ?')) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`/api/reservations/${id}/refuser`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setReservations(prev => prev.map(r => r.id === id ? { ...r, statut: 'REFUSEE' } : r));
      }
    } catch {
      alert('Erreur lors du refus');
    }
  };

  const handleSupprimerNotif = async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token.replace(/"/g, '').trim()}` },
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        notifierChangementNotifications();
      }
    } catch (err) {
      console.error("Erreur suppression notification:", err);
    }
  };

  const handleSupprimerLues = async () => {
    if (!window.confirm('Supprimer toutes les notifications lues ?')) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('/api/notifications/lues/supprimer', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token.replace(/"/g, '').trim()}` },
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => !n.estLu));
        notifierChangementNotifications();
      }
    } catch (err) {
      console.error("Erreur suppression notifications lues:", err);
    }
  };

  const nouvellesReservations = reservations.filter(r => r.statut === 'EN_ATTENTE');
  const annulations = reservations.filter(r => r.statut === 'ANNULEE' || r.statut === 'REFUSEE');
  const notifNonLues = notifications.filter(n => !n.estLu).length;

  if (loading) {
    return (
      <ConducteurLayout>
        <div style={{ textAlign: 'center', padding: '80px', color: '#6b7280' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}><Icon name="bell" size={48} /></div>
          <p>Chargement des notifications...</p>
        </div>
      </ConducteurLayout>
    );
  }

  return (
    <ConducteurLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', margin: '0 0 4px' }}>Notifications <Icon name="bell" size={24} /></h1>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>Gérez vos réservations et suivez vos activités</p>
        </div>
        {notifNonLues > 0 ? (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={handleMarquerTout} disabled={markingAll} style={{
              padding: '9px 18px', borderRadius: '8px', border: '1px solid rgba(249,115,22,0.3)',
              background: 'rgba(249,115,22,0.05)', color: '#ea580c', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { if (!markingAll) e.currentTarget.style.background = '#ea580c'; if (!markingAll) e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(249,115,22,0.05)'; e.currentTarget.style.color = '#ea580c'; }}
            >
              {markingAll ? '...' : <><Icon name="check" size={12} /> Tout marquer comme lu</>}
            </button>
            {notifications.some(n => n.estLu) && (
              <button onClick={handleSupprimerLues} style={{
                padding: '9px 18px', borderRadius: '8px', border: '1px solid rgba(220,38,38,0.3)',
                background: 'rgba(220,38,38,0.05)', color: '#dc2626', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(220,38,38,0.05)'; e.currentTarget.style.color = '#dc2626'; }}
              >
                <Icon name="trashDone" size={12} /> Supprimer les lues
              </button>
            )}
          </div>
        ) : notifications.length > 0 ? (
          <button onClick={handleSupprimerLues} style={{
            padding: '9px 18px', borderRadius: '8px', border: '1px solid rgba(220,38,38,0.3)',
            background: 'rgba(220,38,38,0.05)', color: '#dc2626', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(220,38,38,0.05)'; e.currentTarget.style.color = '#dc2626'; }}
          >
            <Icon name="trashDone" size={12} /> Supprimer les lues
          </button>
        ) : null}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Nouvelles réservations', value: nouvellesReservations.length, icon: <Icon name="clipboard" size={18} color="#0D9E7E" />, border: '#0D9E7E', bg: '#E8F7F3', color: '#0D9E7E' },
          { label: 'Annulations passagers', value: annulations.length, icon: <Icon name="x" size={18} color="#dc2626" />, border: '#dc2626', bg: '#fee2e2', color: '#dc2626' },
          { label: 'Notifications non lues', value: notifNonLues, icon: <Icon name="bell" size={18} color="#0D9E7E" />, border: '#0D9E7E', bg: '#E8F7F3', color: '#0D9E7E' },
        ].map((card, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e5e7eb', borderTop: `3px solid ${card.border}` }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '10px' }}>{card.icon}</div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: card.color, lineHeight: 1 }}>{card.value}</div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>{card.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { key: 'reservations', label: <><Icon name="clipboard" size={14} /> Nouvelles réservations</>, count: nouvellesReservations.length },
          { key: 'annulations', label: <><Icon name="x" size={14} /> Annulations</>, count: annulations.length },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', border: 'none',
            fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all .2s',
            background: activeTab === tab.key ? 'linear-gradient(135deg, #ea580c, #f97316)' : '#f3f4f6',
            color: activeTab === tab.key ? '#000' : '#6b7280',
            boxShadow: activeTab === tab.key ? '0 4px 15px rgba(249,115,22,0.3)' : 'none',
          }}>
            {tab.label}
            {tab.count > 0 && (
              <span style={{ background: activeTab === tab.key ? 'rgba(0,0,0,0.2)' : '#e5e7eb', color: activeTab === tab.key ? '#000' : '#374151', fontSize: '11px', fontWeight: '800', padding: '2px 7px', borderRadius: '20px' }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'reservations' && (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #0a0a0a, #1a0f00)' }}>
            <span style={{ fontSize: '18px' }}><Icon name="clipboard" size={18} color="#f97316" /></span>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#f97316' }}>Nouvelles réservations</span>
            {nouvellesReservations.length > 0 && (
              <span style={{ background: '#f97316', color: '#000', fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '20px' }}>{nouvellesReservations.length} en attente</span>
            )}
          </div>

          {nouvellesReservations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}><Icon name="clipboard" size={48} /></div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>Aucune nouvelle réservation</h3>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>Les réservations en attente de votre confirmation apparaîtront ici</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Passager', 'Trajet', 'Date trajet', 'Places', 'Date réservation', 'Actions'].map(h => (
                      <th key={h} style={{ fontSize: '11px', color: '#6b7280', textAlign: 'left', padding: '10px 16px', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: '600', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {nouvellesReservations.map((r, i) => (
                    <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ position: 'relative', width: '36px', height: '36px', flexShrink: 0 }}>
                            {r.passager?.photo && (
                               <img src={r.passager.photo.startsWith('http') ? r.passager.photo : `/uploads/profils/${r.passager.photo}`} alt="" onError={e => e.currentTarget.style.display = 'none'} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 10 }} />
                            )}
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #ea580c, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#000', flexShrink: 0, position: 'relative', zIndex: 1 }}>
                              {r.passager?.prenom?.charAt(0)}{r.passager?.nom?.charAt(0)}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>{r.passager?.prenom} {r.passager?.nom}</div>
                            <div style={{ fontSize: '11px', color: '#9ca3af' }}>{r.passager?.email}</div>
                            {r.passager?.telephone && <div style={{ fontSize: '11px', color: '#6b7280' }}><Icon name="phone" size={11} /> {r.passager.telephone}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>{r.trajet?.villeDepart}</span>
                          <span style={{ color: '#f97316', fontSize: '14px' }}>→</span>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>{r.trajet?.villeArrivee}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{formatTime(r.trajet?.heureDepart)}</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: '#374151', whiteSpace: 'nowrap' }}>{formatDate(r.trajet?.dateDepart)}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{ background: '#fff7ed', color: '#ea580c', padding: '3px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: '800' }}>{r.placesReservees}</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap' }}>{formatDateTime(r.dateReservation)}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleAccepter(r.id)} style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', background: '#dcfce7', color: '#15803d', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}><Icon name="check" size={12} color="#15803d" /> Accepter</button>
                          <button onClick={() => handleRefuser(r.id)} style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}><Icon name="x" size={12} color="#dc2626" /> Refuser</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'annulations' && (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #0a0a0a, #1a0f00)' }}>
            <span style={{ fontSize: '18px' }}><Icon name="x" size={18} color="#f97316" /></span>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#f97316' }}>Annulations de passagers</span>
            {annulations.length > 0 && (
              <span style={{ background: '#dc2626', color: '#fff', fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '20px' }}>{annulations.length}</span>
            )}
          </div>

          {annulations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}><Icon name="check" size={48} /></div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>Aucune annulation</h3>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>Les annulations de passagers apparaîtront ici</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Passager', 'Trajet', 'Date trajet', 'Places annulées', 'Date annulation'].map(h => (
                      <th key={h} style={{ fontSize: '11px', color: '#6b7280', textAlign: 'left', padding: '10px 16px', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: '600', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {annulations.map((r, i) => (
                    <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ position: 'relative', width: '36px', height: '36px', flexShrink: 0 }}>
                            {r.passager?.photo && (
                               <img src={r.passager.photo.startsWith('http') ? r.passager.photo : `/uploads/profils/${r.passager.photo}`} alt="" onError={e => e.currentTarget.style.display = 'none'} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 10 }} />
                            )}
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#dc2626', flexShrink: 0, position: 'relative', zIndex: 1 }}>
                              {r.passager?.prenom?.charAt(0)}{r.passager?.nom?.charAt(0)}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>{r.passager?.prenom} {r.passager?.nom}</div>
                            <div style={{ fontSize: '11px', color: '#9ca3af' }}>{r.passager?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>{r.trajet?.villeDepart}</span>
                          <span style={{ color: '#dc2626', fontSize: '14px' }}>→</span>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>{r.trajet?.villeArrivee}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: '#374151', whiteSpace: 'nowrap' }}>{formatDate(r.trajet?.dateDepart)}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{ background: '#fee2e2', color: '#dc2626', padding: '3px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: '800' }}>{r.placesReservees}</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap' }}>{formatDateTime(r.dateReservation)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {notifications.length > 0 && (
        <div style={{ marginTop: '24px', background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}><Icon name="bell" size={18} /></span>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>Notifications système</span>
            {notifNonLues > 0 && (
              <span style={{ background: '#E8F7F3', color: '#0D9E7E', fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '20px' }}>{notifNonLues} non lue(s)</span>
            )}
          </div>
          <div>
            {notifications.map((n, i) => (
              <div key={n.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 20px',
                borderBottom: i < notifications.length - 1 ? '1px solid #f3f4f6' : 'none',
                background: n.estLu ? '#fff' : '#fff7ed', transition: 'background .2s',
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  background: n.estLu ? '#f3f4f6' : 'linear-gradient(135deg, #ea580c, #f97316)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
                }}><Icon name="bell" size={16} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: n.estLu ? '500' : '700', color: '#111827' }}>{n.titre}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '3px', lineHeight: '1.5' }}>{n.message}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>{formatDateTime(n.dateEnvoi)}</div>
                </div>
                {!n.estLu && (
                  <button onClick={() => handleMarquerLue(n.id)} style={{
                    padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(249,115,22,0.3)',
                    background: 'transparent', color: '#ea580c', fontSize: '11px', fontWeight: '600', cursor: 'pointer', flexShrink: 0,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#ea580c'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ea580c'; }}
                  >
                    Marquer lu
                  </button>
                )}
                <button onClick={() => handleSupprimerNotif(n.id)} style={{
                  padding: '5px 8px', borderRadius: '6px', border: '1px solid rgba(220,38,38,0.2)',
                  background: 'transparent', color: '#dc2626', fontSize: '11px', fontWeight: '600', cursor: 'pointer', flexShrink: 0,
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '4px'
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <Icon name="trash" size={12} color="#dc2626" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </ConducteurLayout>
  );
}