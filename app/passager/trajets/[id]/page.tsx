'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/app/lib/ThemeContext';

interface Trajet {
  id: number;
  villeDepart: string;
  villeArrivee: string;
  quartierDepart: string | null;
  quartierArrivee: string | null;
  pointDepart: string | null;
  pointArrivee: string | null;
  dateDepart: string;
  heureDepart: string;
  heureArriveeEstimee?: string;
  placesDisponibles: number;
  prixParPlace: number | null;
  statut: string;
  description: string | null;
  bagageAutorise: boolean;
  conducteur: {
    id: number;
    nom: string;
    prenom: string;
    noteMoyenne: number | null;
    photo: string | null;
    biographie: string | null;
    telephone: string | null;
  };
  vehicule: {
    marque: string;
    modele: string;
    couleur: string;
    plaqueImmatriculation?: string;
    photo?: string;
  } | null;
}

const EMERALD = '#0D9E7E';
const EMERALD_LIGHT = '#E8F7F3';
const EMERALD_DARK = '#0A7B62';
const BLACK = '#0D0D0D';
const GRAY = '#6B7280';
const LIGHT_GRAY = '#F5F5F5';
const BORDER = '#EBEBEB';

const Icon = ({ name, size = 20, color = EMERALD }: { name: string; size?: number; color?: string }) => {
  const s = { width: size, height: size, display: 'inline-block', verticalAlign: 'middle' } as React.CSSProperties;
  const icons: Record<string, React.ReactNode> = {
    calendar: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
      </svg>
    ),
    check: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
    ),
    mapPin: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    car: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h8l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2M5 17a2 2 0 100 4 2 2 0 000-4zm14 0a2 2 0 100 4 2 2 0 000-4z"/>
      </svg>
    ),
    users: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    creditCard: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
    clock: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    box: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 7l-9-5-9 5v10l9 5 9-5V7z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
    message: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    eye: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
      </svg>
    ),
    image: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
      </svg>
    ),
    arrowLeft: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
    ),
    x: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    ),
    alert: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  };
  return <span style={{ lineHeight: 0, display: 'inline-flex' }}>{icons[name] || null}</span>;
};

export default function DetailTrajet() {
  const router = useRouter();
  const params = useParams();
  const { t, darkMode } = useTheme();
  const id = String(params?.id || '');

  const [trajet, setTrajet] = useState<Trajet | null>(null);
  const [loading, setLoading] = useState(true);
  const [nbPlaces, setNbPlaces] = useState(1);
  const [reserving, setReserving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasExistingReservation, setHasExistingReservation] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUserPhoto(parsed.photo || null);
      } catch (e) {
        console.error("Erreur parsing user data", e);
      }
    }

    if (!id) return;

    const cleanToken = token.replace(/"/g, '').trim();

    fetch(`/api/trajets/${id}`, {
      headers: { Authorization: `Bearer ${cleanToken}` },
    })
      .then(r => r.json())
      .then(data => {
        setTrajet(data);
        fetch(`/api/reservations/mes-reservations`, {
          headers: { Authorization: `Bearer ${cleanToken}` }
        })
          .then(r2 => r2.json())
          .then(resData => {
            const list = Array.isArray(resData) ? resData : [];
            const alreadyReserved = list.some((r: any) => r.trajet?.id === parseInt(id) && !['ANNULEE', 'REFUSEE', 'NON_PRESENT'].includes(r.statut));
            setHasExistingReservation(alreadyReserved);
          })
          .catch(() => {});
        setLoading(false);
      })
      .catch(() => setLoading(false));

    return () => window.removeEventListener('resize', checkMobile);
  }, [id, router]);

  const handleReserver = async () => {
    const token = localStorage.getItem('token');
    if (!token || !trajet) { router.push('/login'); return; }
    
    setReserving(true);
    setError('');
    
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trajetId: trajet.id, placesReservees: nbPlaces }),
      });
      
      const data = await res.json();

      if (res.ok) {
        setSuccess(t('tripPublished') || 'Réservation effectuée avec succès ! Le conducteur va confirmer votre place.');
        setShowConfirm(false);
        setTimeout(() => router.push('/passager/reservations'), 2500);
      } else {
        setError(data.error || data.message || t('error') || 'Erreur lors de la réservation');
        setShowConfirm(false);
      }
    } catch (err) {
      setError(t('serverError') || 'Erreur de connexion au serveur. Vérifiez que le backend est lancé.');
      setShowConfirm(false);
    } finally {
      setReserving(false);
    }
  };

  const stars = (note: number | null) => {
    if (!note) return '☆☆☆☆☆';
    return '★'.repeat(Math.round(note)) + '☆'.repeat(5 - Math.round(note));
  };

  const formatDate = (d: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const prixUnitaire = trajet?.prixParPlace || 0;
  const prixTotal = prixUnitaire * nbPlaces;

  const isOuvert = trajet?.statut?.toUpperCase() === 'OUVERT' || trajet?.statut?.toUpperCase() === 'OPEN';
  const isComplet = trajet?.placesDisponibles === 0;

  const bgCard = darkMode ? '#1D1D1D' : '#FFFFFF';
  const textColor = darkMode ? '#FFFFFF' : BLACK;
  const textSecondary = darkMode ? '#9CA3AF' : GRAY;
  const borderColor = darkMode ? '#2A2A2A' : BORDER;

  if (loading) {
    return (
      <>
        <div style={{ textAlign: 'center', padding: isMobile ? '60px 20px' : '80px', color: textSecondary }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `3px solid ${EMERALD_LIGHT}`, borderTopColor: EMERALD, animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p>{t('loading') || 'Chargement du trajet...'}</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
        </div>
      </>
    );
  }

  if (!trajet) {
    return (
      <>
        <div style={{ textAlign: 'center', padding: isMobile ? '60px 20px' : '80px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: darkMode ? '#2D2D2D' : LIGHT_GRAY, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Icon name="x" size={32} color={GRAY} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: textColor, margin: '0 0 8px' }}>{t('tripNotFound') || 'Trajet non trouvé'}</h2>
          <p style={{ color: textSecondary, marginBottom: '16px' }}>{t('noData') || 'Ce trajet n\'existe pas ou a été supprimé.'}</p>
          <Link 
            href="/passager/dashboard"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '10px 24px',
              background: EMERALD,
              color: '#FFFFFF',
              textDecoration: 'none',
              borderRadius: '10px',
              fontSize: '14px', fontWeight: '700'
            }}
          >
            {t('back') || 'Retour aux trajets'}
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div style={{ padding: isMobile ? '20px 16px' : '32px 24px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <Link href="/passager/dashboard" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            color: EMERALD, textDecoration: 'none', fontSize: '14px',
            fontWeight: '600', transition: 'opacity .2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <Icon name="arrowLeft" size={16} />
            {t('back') || 'Retour aux trajets'}
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 360px', gap: '24px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            <div style={{ background: bgCard, borderRadius: '20px', border: `1px solid ${borderColor}`, overflow: 'hidden', boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{
                background: `linear-gradient(135deg, ${BLACK}, #1a2e1a)`,
                padding: isMobile ? '20px' : '24px', borderBottom: `1px solid rgba(13,158,126,0.2)`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                  <span style={{ fontSize: '13px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon name="calendar" size={16} color="#9ca3af" />
                    {formatDate(trajet.dateDepart)}
                  </span>
                  <span style={{
                    background: isOuvert ? 'rgba(13,158,126,0.2)' : 'rgba(220,38,38,0.2)',
                    color: isOuvert ? '#4ade80' : '#f87171',
                    fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}>
                    {isOuvert && <Icon name="check" size={14} color="#4ade80" />}
                    {isOuvert ? (t('open') || 'Disponible') : trajet.statut}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '16px', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                  <div style={{ textAlign: 'center', flex: 1, minWidth: isMobile ? '100%' : 'auto' }}>
                    <div style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '800', color: 'white' }}>{trajet.villeDepart}</div>
                    {trajet.quartierDepart && <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{trajet.quartierDepart}</div>}
                    {trajet.pointDepart && <div style={{ fontSize: '11px', color: '#4ade80', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <Icon name="mapPin" size={12} color="#4ade80" />
                      {trajet.pointDepart}
                    </div>}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#4ade80' }}>{trajet.heureDepart}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: isMobile ? '20px' : '30px', height: '2px', background: '#4ade80' }} />
                      <Icon name="car" size={24} color="#4ade80" />
                      <div style={{ width: isMobile ? '20px' : '30px', height: '2px', background: '#4ade80' }} />
                    </div>
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>Direct</span>
                  </div>

                  <div style={{ textAlign: 'center', flex: 1, minWidth: isMobile ? '100%' : 'auto' }}>
                    <div style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '800', color: 'white' }}>{trajet.villeArrivee}</div>
                    {trajet.quartierArrivee && <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{trajet.quartierArrivee}</div>}
                    {trajet.pointArrivee && <div style={{ fontSize: '11px', color: '#4ade80', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <Icon name="mapPin" size={12} color="#4ade80" />
                      {trajet.pointArrivee}
                    </div>}
                  </div>
                </div>
              </div>

              <div style={{ padding: isMobile ? '16px' : '20px', display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                {[
                  { 
                    icon: <Icon name="users" size={24} />, 
                    label: t('seats') || 'Places disponibles', 
                    value: `${trajet.placesDisponibles} place(s)` 
                  },
                  { 
                    icon: <Icon name="creditCard" size={24} />, 
                    label: t('price') || 'Prix par place', 
                    value: `${prixUnitaire.toLocaleString('fr-FR')} FCFA` 
                  },
                  { 
                    icon: <Icon name="clock" size={24} />, 
                    label: t('departureTime') || 'Heure de départ', 
                    value: trajet.heureDepart 
                  },
                  { 
                    icon: <Icon name="clock" size={24} color={trajet.heureArriveeEstimee ? EMERALD : GRAY} />, 
                    label: t('estimatedArrival') || 'Arrivée estimée', 
                    value: trajet.heureArriveeEstimee || t('notDefined') || 'Non définie',
                    color: trajet.heureArriveeEstimee ? EMERALD : GRAY
                  },
                  { 
                    icon: <Icon name="box" size={24} color={trajet.bagageAutorise ? EMERALD : GRAY} />, 
                    label: t('luggageAllowed') || 'Bagages', 
                    value: trajet.bagageAutorise ? (t('luggageAllowed') || 'Autorisés') : 'Non autorisés',
                    color: trajet.bagageAutorise ? EMERALD : GRAY
                  },
                ].map((info, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: '16px', background: darkMode ? '#2D2D2D' : LIGHT_GRAY, borderRadius: '12px', border: `1px solid ${borderColor}` }}>
                    <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>{info.icon}</div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: info.color || textColor }}>{info.value}</div>
                    <div style={{ fontSize: '12px', color: textSecondary, marginTop: '4px' }}>{info.label}</div>
                  </div>
                ))}
              </div>

              {trajet.description && (
                <div style={{ padding: `0 ${isMobile ? '16px' : '20px'} ${isMobile ? '16px' : '20px'}` }}>
                  <div style={{ background: EMERALD_LIGHT, borderRadius: '12px', padding: '16px', border: `1px solid #bbf7d0` }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: EMERALD_DARK, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Icon name="message" size={16} color={EMERALD_DARK} />
                      {t('description') || 'Message du conducteur'}
                    </div>
                    <div style={{ fontSize: '14px', color: darkMode ? '#FFFFFF' : '#374151', lineHeight: '1.5' }}>{trajet.description}</div>
                  </div>
                </div>
              )}
            </div>

            {trajet.vehicule && (
              <div style={{ background: bgCard, borderRadius: '20px', border: `1px solid ${borderColor}`, padding: isMobile ? '20px' : '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: textColor, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon name="car" size={20} />
                  {t('vehicle') || 'Véhicule'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '12px' }}>
                  {[
                    { label: t('brand') || 'Marque', value: trajet.vehicule.marque },
                    { label: t('model') || 'Modèle', value: trajet.vehicule.modele },
                    { label: t('color') || 'Couleur', value: trajet.vehicule.couleur },
                    { label: t('licensePlate') || 'Immatriculation', value: trajet.vehicule.plaqueImmatriculation || t('notDefined') || 'Non renseignée' },
                  ].map((item, i) => (
                    <div key={i} style={{ padding: '14px', background: darkMode ? '#2D2D2D' : LIGHT_GRAY, borderRadius: '10px', border: `1px solid ${borderColor}` }}>
                      <div style={{ fontSize: '12px', color: textSecondary, marginBottom: '4px' }}>{item.label}</div>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: textColor }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ background: bgCard, borderRadius: '20px', border: `1px solid ${borderColor}`, padding: isMobile ? '20px' : '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: textColor, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="users" size={20} />
                {t('activeDriver') || 'Votre conducteur'}
              </h3>
              <div style={{ display: 'flex', alignItems: isMobile ? 'center' : 'flex-start', gap: '16px', flexDirection: isMobile ? 'column' : 'row', textAlign: isMobile ? 'center' : 'left' }}>
                <div style={{ position: 'relative', width: '64px', height: '64px', flexShrink: 0 }}>
                  {trajet.conducteur?.photo && (
                    <img
                      src={trajet.conducteur.photo.startsWith('http') ? trajet.conducteur.photo : `/uploads/profils/${trajet.conducteur.photo}`}
                      alt={`Photo de ${trajet.conducteur.prenom}`}
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                      style={{
                        width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover',
                        border: `2px solid ${EMERALD_LIGHT}`, boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        position: 'absolute', top: 0, left: 0, zIndex: 10,
                      }}
                    />
                  )}
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '50%', position: 'relative', zIndex: 1,
                    background: `linear-gradient(135deg, ${BLACK}, #1a2e1a)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '22px', fontWeight: '700', color: EMERALD,
                    border: `2px solid ${EMERALD_LIGHT}`
                  }}>
                    {trajet.conducteur?.prenom?.charAt(0)}{trajet.conducteur?.nom?.charAt(0)}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: textColor }}>
                    {trajet.conducteur?.prenom} {trajet.conducteur?.nom}
                  </div>
                  <div style={{ fontSize: '14px', color: '#F59E0B', margin: '6px 0', display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', gap: '6px' }}>
                    {stars(trajet.conducteur?.noteMoyenne)}
                    <span style={{ color: textSecondary, fontSize: '13px' }}>
                      {trajet.conducteur?.noteMoyenne ? `${trajet.conducteur.noteMoyenne.toFixed(1)}/5` : (t('new') || 'Nouveau conducteur')}
                    </span>
                  </div>
                  {trajet.conducteur?.biographie && (
                    <p style={{ fontSize: '14px', color: textSecondary, marginTop: '8px', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {trajet.conducteur.biographie}
                    </p>
                  )}
                  
                  <Link
                    href={`/passager/conducteur/${trajet.conducteur?.id}`}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      marginTop: '16px', padding: '10px 16px',
                      background: EMERALD_LIGHT, border: `1px solid #bbf7d0`,
                      borderRadius: '10px', color: EMERALD_DARK, textDecoration: 'none',
                      fontSize: '13px', fontWeight: '600', transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#d1fae5';
                      e.currentTarget.style.borderColor = '#86efac';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = EMERALD_LIGHT;
                      e.currentTarget.style.borderColor = '#bbf7d0';
                    }}
                  >
                    <Icon name="eye" size={16} />
                    {t('myProfile') || 'Voir le profil complet'}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div style={{ position: isMobile ? 'static' : 'sticky', top: '84px' }}>
            <div style={{ background: bgCard, borderRadius: '20px', border: `1px solid ${borderColor}`, padding: isMobile ? '20px' : '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>

              <h3 style={{ fontSize: '16px', fontWeight: '700', color: textColor, marginBottom: '20px' }}>
                {t('publishTrip') || 'Réserver ce trajet'}
              </h3>

              {success ? (
                <div style={{ background: EMERALD_LIGHT, border: `1px solid #bbf7d0`, borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                    <Icon name="check" size={40} color={EMERALD_DARK} />
                  </div>
                  <p style={{ color: EMERALD_DARK, fontSize: '14px', fontWeight: '600', lineHeight: '1.5' }}>{success}</p>
                </div>
              ) : (
                <>
                  {error && (
                    <div style={{ background: '#F5F5F5', border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '12px', marginBottom: '16px', color: GRAY, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Icon name="x" size={18} color={GRAY} />
                      {error}
                    </div>
                  )}

                  {hasExistingReservation && (
                    <div style={{ 
                      background: EMERALD_LIGHT, border: `1px solid ${EMERALD}`, borderRadius: '10px', 
                      padding: '14px', marginBottom: '16px', color: EMERALD_DARK, fontSize: '13px', lineHeight: '1.5',
                      display: 'flex', alignItems: 'flex-start', gap: '10px'
                    }}>
                      <Icon name="check" size={18} color={EMERALD} />
                      <div>
                        <strong>Vous avez déjà réservé ce trajet.</strong> Vous ne pouvez pas réserver une seconde fois.
                        <Link href="/passager/reservations" style={{ 
                          display: 'block', marginTop: '8px', color: EMERALD, fontWeight: '700', textDecoration: 'underline' 
                        }}>
                          Voir ma réservation
                        </Link>
                      </div>
                    </div>
                  )}

                  {!userPhoto && !hasExistingReservation && (
                    <div style={{ 
                      background: EMERALD_LIGHT, border: `1px solid ${EMERALD_DARK}`, borderRadius: '10px', 
                      padding: '14px', marginBottom: '16px', color: '#0A7B62', fontSize: '13px', lineHeight: '1.5',
                      display: 'flex', alignItems: 'flex-start', gap: '10px'
                    }}>
                      <Icon name="alert" size={18} color={EMERALD} />
                      <div>
                        <strong>{t('profilePhoto') || 'Photo requise :'}</strong> Pour des raisons de sécurité, vous devez ajouter une photo de profil avant de réserver.
                        <Link href="/passager/profil" style={{ 
                          display: 'block', marginTop: '8px', color: EMERALD, fontWeight: '700', textDecoration: 'underline' 
                        }}>
                          + {t('addPhoto') || 'Ajouter ma photo de profil'}
                        </Link>
                      </div>
                    </div>
                  )}

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: textColor, marginBottom: '10px' }}>
                      {t('seats') || 'Nombre de places'}
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        onClick={() => setNbPlaces(Math.max(1, nbPlaces - 1))}
                        style={{ width: '40px', height: '40px', borderRadius: '10px', border: `1px solid ${borderColor}`, background: darkMode ? '#2D2D2D' : LIGHT_GRAY, fontSize: '20px', cursor: 'pointer', fontWeight: '700', color: textColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >−</button>
                      <span style={{ fontSize: '20px', fontWeight: '800', color: textColor, minWidth: '32px', textAlign: 'center' }}>{nbPlaces}</span>
                      <button
                        onClick={() => setNbPlaces(Math.min(trajet.placesDisponibles, nbPlaces + 1))}
                        disabled={nbPlaces >= trajet.placesDisponibles}
                        style={{ width: '40px', height: '40px', borderRadius: '10px', border: `1px solid ${borderColor}`, background: nbPlaces >= trajet.placesDisponibles ? (darkMode ? '#3D3D3D' : '#f3f4f6') : (darkMode ? '#2D2D2D' : LIGHT_GRAY), fontSize: '20px', cursor: nbPlaces >= trajet.placesDisponibles ? 'not-allowed' : 'pointer', fontWeight: '700', color: nbPlaces >= trajet.placesDisponibles ? (darkMode ? '#6B7280' : '#9ca3af') : textColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >+</button>
                    </div>
                  </div>

                  <div style={{ background: darkMode ? '#2D2D2D' : LIGHT_GRAY, borderRadius: '12px', padding: '16px', marginBottom: '20px', border: `1px solid ${borderColor}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: textSecondary, marginBottom: '8px' }}>
                      <span>{prixUnitaire.toLocaleString('fr-FR')} FCFA × {nbPlaces} place(s)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: `1px solid ${borderColor}` }}>
                      <span style={{ fontSize: '15px', fontWeight: '700', color: textColor }}>Total</span>
                      <span style={{ fontSize: '22px', fontWeight: '800', color: EMERALD }}>
                        {prixTotal.toLocaleString('fr-FR')} <span style={{ fontSize: '14px', fontWeight: '600' }}>FCFA</span>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowConfirm(true)}
                    disabled={isComplet || !isOuvert || !userPhoto || hasExistingReservation}
                    style={{
                      width: '100%', padding: '16px',
                      background: (isComplet || !isOuvert || !userPhoto || hasExistingReservation)
                        ? (darkMode ? '#3D3D3D' : '#e5e7eb')
                        : `linear-gradient(135deg, ${EMERALD}, ${EMERALD_DARK})`,
                      border: 'none', borderRadius: '12px',
                      color: (isComplet || !isOuvert || !userPhoto || hasExistingReservation) ? (darkMode ? '#6B7280' : '#9ca3af') : '#FFFFFF',
                      fontSize: '15px', fontWeight: '700',
                      cursor: (isComplet || !isOuvert || !userPhoto || hasExistingReservation) ? 'not-allowed' : 'pointer',
                      boxShadow: (isComplet || !isOuvert || !userPhoto || hasExistingReservation) ? 'none' : `0 4px 15px rgba(13,158,126,0.3)`,
                      transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                    onMouseEnter={e => {
                      if (!isComplet && isOuvert && userPhoto) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = `0 6px 20px rgba(13,158,126,0.4)`;
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isComplet && isOuvert && userPhoto) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = `0 4px 15px rgba(13,158,126,0.3)`;
                      }
                    }}
                  >
                    {!userPhoto ? (
                      <><Icon name="image" size={18} /> {t('profilePhoto') || 'Photo requise'}</>
                    ) : isComplet ? (
                      t('full') || 'Trajet complet'
                    ) : (
                      <><Icon name="check" size={18} /> {t('confirm') || 'Réserver maintenant'}</>
                    )}
                  </button>

                  <p style={{ fontSize: '12px', color: textSecondary, textAlign: 'center', marginTop: '12px', lineHeight: '1.5' }}>
                    {t('pending') || 'Le conducteur devra confirmer votre réservation'}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {showConfirm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(4px)' }}>
            <div style={{ background: bgCard, borderRadius: '20px', padding: isMobile ? '24px 20px' : '32px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <Icon name="car" size={48} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: textColor, marginBottom: '8px' }}>
                {t('confirm') || 'Confirmer la réservation'}
              </h3>
              <p style={{ fontSize: '14px', color: textSecondary, marginBottom: '6px' }}>
                {trajet.villeDepart} → {trajet.villeArrivee}
              </p>
              <p style={{ fontSize: '14px', color: textSecondary, marginBottom: '24px' }}>
                {nbPlaces} {t('seats') || 'place(s)'} — <strong style={{ color: EMERALD }}>{prixTotal.toLocaleString('fr-FR')} FCFA</strong>
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowConfirm(false)}
                  style={{ flex: 1, padding: '14px', background: darkMode ? '#2D2D2D' : LIGHT_GRAY, border: `1px solid ${borderColor}`, borderRadius: '12px', fontSize: '14px', cursor: 'pointer', fontWeight: '600', color: textColor, transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = darkMode ? '#3D3D3D' : BORDER}
                  onMouseLeave={e => e.currentTarget.style.background = darkMode ? '#2D2D2D' : LIGHT_GRAY}
                >
                  {t('cancel') || 'Annuler'}
                </button>
                <button
                  onClick={handleReserver}
                  disabled={reserving}
                  style={{ flex: 1, padding: '14px', background: `linear-gradient(135deg, ${EMERALD}, ${EMERALD_DARK})`, border: 'none', borderRadius: '12px', fontSize: '14px', cursor: reserving ? 'not-allowed' : 'pointer', fontWeight: '700', color: '#FFFFFF', transition: 'all 0.2s' }}
                  onMouseEnter={e => { if (!reserving) e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { if (!reserving) e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  {reserving ? (t('loading') || 'En cours...') : (t('confirm') || 'Confirmer')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}