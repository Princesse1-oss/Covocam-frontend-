'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Palette de couleurs CovoCam
const EMERALD = '#0D9E7E';
const EMERALD_LIGHT = '#E8F7F3';
const EMERALD_DARK = '#0A7B62';
const BLACK = '#0D0D0D';
const GRAY = '#6B7280';
const LIGHT_GRAY = '#F5F5F5';
const BORDER = '#EBEBEB';
const RED = '#DC2626';
const RED_LIGHT = '#FEE2E2';

// ─── SVG Icons inline ───
const Icon = ({ name, size = 20, color = EMERALD }: { name: string; size?: number; color?: string }) => {
  const s = { width: size, height: size, display: 'inline-block', verticalAlign: 'middle' } as React.CSSProperties;
  const icons: Record<string, React.ReactNode> = {
    arrowLeft: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
    ),
    check: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
    ),
    clock: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    mapPin: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    calendar: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    users: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    creditCard: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
    arrowRight: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    ),
    navigation: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 11 22 2 13 21 11 13 3 11"/>
      </svg>
    ),
    alert: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  };
  return <span style={{ lineHeight: 0, display: 'inline-flex' }}>{icons[name] || null}</span>;
};

export default function ReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const token = localStorage.getItem('token');
    if (!token) { 
      router.push('/login'); 
      return; 
    }

    if (!params.id) {
      setError("ID de réservation manquant.");
      setLoading(false);
      return;
    }

    const fetchReservation = async () => {
      try {
        const res = await fetch(`/api/reservations/${params.id}`, {
          headers: { 
            'Authorization': `Bearer ${token}`, 
            'Accept': 'application/json' 
          }
        });

        // ✅ GESTION ROBUSTE DES ERREURS HTTP (404, 500, etc.)
        if (!res.ok) {
          const errorText = await res.text();
          // On essaie de voir si c'est du JSON, sinon on prend le texte brut
          let errorMsg = `Erreur ${res.status}`;
          try {
            const errorJson = JSON.parse(errorText);
            errorMsg = errorJson.error || errorMsg;
          } catch {
            errorMsg = errorText.substring(0, 100) || errorMsg; // Limite la taille si c'est du HTML
          }
          throw new Error(errorMsg);
        }

        const data = await res.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        setReservation(data);
      } catch (err: any) {
        console.error("Erreur chargement réservation:", err);
        setError(err.message || "Impossible de charger les détails de la réservation.");
        setReservation(null);
      } finally {
        // ✅ GARANTIT QUE LE CHARGEMENT S'ARRÊTE TOUJOURS
        setLoading(false);
      }
    };

    fetchReservation();

    return () => window.removeEventListener('resize', checkMobile);
  }, [params.id, router]);

  if (loading) {
    return (
      <div style={{ padding: isMobile ? '60px 20px' : '80px', textAlign: 'center', color: GRAY }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `3px solid ${EMERALD_LIGHT}`, borderTopColor: EMERALD, animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p>Chargement des détails...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div style={{ padding: isMobile ? '60px 20px' : '80px', textAlign: 'center', color: GRAY, maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: RED_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Icon name="alert" size={32} color={RED} />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: BLACK, marginBottom: '12px' }}>Oups !</h2>
        <p style={{ fontSize: '15px', color: GRAY, marginBottom: '24px' }}>{error || 'Réservation introuvable.'}</p>
        <button 
          onClick={() => router.push('/passager/reservations')} 
          style={{ 
            padding: '12px 24px', background: EMERALD, color: '#FFF', border: 'none', 
            borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px',
            display: 'inline-flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Icon name="arrowLeft" size={16} color="#FFF" /> Retour aux réservations
        </button>
      </div>
    );
  }

  const getStatusStyle = (statut: string) => {
    if (statut === 'CONFIRMEE') return { background: EMERALD_LIGHT, color: '#15803d', border: '#bbf7d0' };
    if (statut === 'A_PAYER') return { background: '#FEF3C7', color: '#D97706', border: '#FDE68A' };
    if (statut === 'EN_COURS') return { background: '#DBEAFE', color: '#1D4ED8', border: '#93C5FD' };
    if (statut === 'ANNULEE') return { background: RED_LIGHT, color: RED, border: '#FECACA' };
    return { background: LIGHT_GRAY, color: GRAY, border: BORDER };
  };

  const statusStyle = getStatusStyle(reservation.statut);

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: isMobile ? '20px 16px' : '32px 24px' }}>
      {/* Header */}
      <button 
        onClick={() => router.back()} 
        style={{ 
          marginBottom: '24px', background: 'transparent', border: 'none', color: EMERALD, cursor: 'pointer', 
          fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 0', transition: 'opacity 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        <Icon name="arrowLeft" size={16} />
        Retour aux réservations
      </button>

      {/* Main Card */}
      <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: isMobile ? '24px 20px' : '32px', border: `1px solid ${BORDER}`, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '800', color: BLACK, margin: '0 0 8px' }}>
              Récapitulatif #{reservation.id}
            </h1>
            <p style={{ fontSize: '14px', color: GRAY, margin: 0 }}>Détails de votre réservation</p>
          </div>
          <span style={{ 
            fontWeight: '700', color: statusStyle.color, background: statusStyle.background,
            border: `1px solid ${statusStyle.border}`, padding: '6px 14px', borderRadius: '20px',
            fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            {reservation.statut === 'CONFIRMEE' && <Icon name="check" size={14} />}
            {reservation.statut === 'A_PAYER' && <Icon name="clock" size={14} />}
            {reservation.statut === 'EN_COURS' && <Icon name="navigation" size={14} />}
            {reservation.statut}
          </span>
        </div>

        {/* ✅ ALERTE EN COURS : Affichée uniquement si le trajet a démarré */}
        {reservation.statut === 'EN_COURS' && (
          <div style={{ 
            marginBottom: '24px', padding: '20px', background: '#EFF6FF', borderRadius: '16px', 
            border: '1px solid #93c5fd', textAlign: 'center' 
          }}>
            <h3 style={{ color: '#1D4ED8', fontSize: '18px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Icon name="navigation" size={20} color="#1D4ED8" />
              Le trajet est en cours !
            </h3>
            <p style={{ color: '#1E40AF', fontSize: '14px', marginBottom: '16px' }}>
              Votre conducteur a démarré. Suivez sa position en temps réel sur la carte.
            </p>
            <button
              onClick={() => router.push(`/passager/trajets/${reservation.trajet.id}/suivi`)}
              style={{
                padding: '12px 24px', background: '#2563EB', color: '#FFF', border: 'none',
                borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
              }}
            >
              <Icon name="mapPin" size={18} color="#FFF" />
              Voir la carte en direct
            </button>
          </div>
        )}

        {/* Trajet */}
        <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: `1px solid ${BORDER}` }}>
          <h3 style={{ fontSize: '12px', color: GRAY, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Icon name="mapPin" size={16} />
            Trajet
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '800', color: BLACK }}>{reservation.trajet?.villeDepart || 'N/A'}</span>
            <Icon name="arrowRight" size={20} />
            <span style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '800', color: BLACK }}>{reservation.trajet?.villeArrivee || 'N/A'}</span>
          </div>
          <p style={{ fontSize: '14px', color: GRAY, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Icon name="calendar" size={16} />
            {reservation.trajet?.dateDepart ? new Date(reservation.trajet.dateDepart).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'} 
            {reservation.trajet?.heureDepart && ` à ${reservation.trajet.heureDepart}`}
          </p>
        </div>

        {/* Conducteur */}
        <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: `1px solid ${BORDER}` }}>
          <h3 style={{ fontSize: '12px', color: GRAY, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Icon name="users" size={16} />
            Conducteur
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative', width: '44px', height: '44px', flexShrink: 0 }}>
              {reservation.trajet?.conducteur?.photo && (
                <img src={reservation.trajet.conducteur.photo.startsWith('http') ? reservation.trajet.conducteur.photo : `/uploads/profils/${reservation.trajet.conducteur.photo}`} alt="" onError={e => e.currentTarget.style.display = 'none'} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 10 }} />
              )}
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: EMERALD_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: EMERALD, position: 'relative', zIndex: 1 }}>
                {reservation.trajet?.conducteur?.prenom?.charAt(0)}{reservation.trajet?.conducteur?.nom?.charAt(0)}
              </div>
            </div>
            <div>
              <p style={{ fontSize: '16px', fontWeight: '700', color: BLACK, margin: 0 }}>
                {reservation.trajet?.conducteur?.prenom || 'N/A'} {reservation.trajet?.conducteur?.nom || ''}
              </p>
              {reservation.trajet?.conducteur?.noteMoyenne != null && (
                <p style={{ fontSize: '12px', color: GRAY, margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: '#F59E0B' }}>★</span> {reservation.trajet.conducteur.noteMoyenne.toFixed(1)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Résumé Financier */}
        <div style={{ background: EMERALD_LIGHT, borderRadius: '16px', padding: '20px', border: `1px solid #bbf7d0` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: EMERALD_DARK, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icon name="users" size={16} />
              Places réservées
            </span>
            <span style={{ fontWeight: '800', color: EMERALD_DARK }}>{reservation.placesReservees || 0}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: isMobile ? '18px' : '20px', paddingTop: '12px', borderTop: `1px solid #86efac` }}>
            <span style={{ fontWeight: '800', color: BLACK }}>Total</span>
            <span style={{ fontWeight: '800', color: EMERALD }}>{reservation.prixTotal ? reservation.prixTotal.toLocaleString() : '0'} FCFA</span>
          </div>
        </div>

        {/* Paiement Info */}
        {reservation.paiement && (
          <div style={{ marginTop: '20px', padding: '16px', background: LIGHT_GRAY, borderRadius: '12px', fontSize: '13px', color: GRAY, border: `1px solid ${BORDER}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Icon name="creditCard" size={16} />
              <strong style={{ color: BLACK }}>Référence paiement :</strong> {reservation.paiement.campayReference || 'N/A'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="clock" size={16} />
              <strong style={{ color: BLACK }}>Date :</strong> {reservation.paiement.datePaiement ? new Date(reservation.paiement.datePaiement).toLocaleString('fr-FR') : 'N/A'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}