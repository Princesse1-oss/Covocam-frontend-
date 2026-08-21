'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTheme } from '@/app/lib/ThemeContext';

const API_URL = '/api';
const E = '#0D9E7E';
const EL = '#E8F7F3';
const ED = '#0A7B62';
const BK = '#0D0D0D';
const GR = '#6B7280';
const BD = '#EBEBEB';
const GRAY = '#6B7280';
const LIGHT_GRAY = '#FCA5A5';

// ─── SVG Icons inline ───
const Icon = ({ name, size = 20, color = E }: { name: string; size?: number; color?: string }) => {
  const s = { width: size, height: size, display: 'inline-block', verticalAlign: 'middle' } as React.CSSProperties;
  const icons: Record<string, React.ReactNode> = {
    clipboard: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="2" width="6" height="4" rx="2"/><path d="M3 6h18v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z"/>
      </svg>
    ),
    arrowLeft: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
    ),
    alert: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    users: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    check: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
    ),
    x: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    ),
    flag: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
        <line x1="4" y1="22" x2="4" y2="15"/>
      </svg>
    ),
    clock: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    map: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
        <line x1="8" y1="2" x2="8" y2="18"/>
        <line x1="16" y1="6" x2="16" y2="22"/>
      </svg>
    ),
  };
  return <span style={{ lineHeight: 0, display: 'inline-flex' }}>{icons[name] || null}</span>;
};

export default function ValidationPresences() {
  const params = useParams();
  const trajetId = params.id as string;
  // ✅ CORRECTION : Utiliser useTheme pour les traductions et le mode sombre
  const { t, darkMode, lang } = useTheme();
  const router = useRouter();
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [heureArrivee, setHeureArrivee] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  const [presences, setPresences] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Nettoyer le token
    const cleanToken = token.replace(/"/g, '').trim();

    // 1. Récupérer l'heure d'arrivée estimée du trajet
    fetch(`${API_URL}/trajets/${trajetId}`, {
      headers: { Authorization: `Bearer ${cleanToken}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.heureArriveeEstimee) {
          setHeureArrivee(data.heureArriveeEstimee.substring(0, 5));
        }
      })
      .catch(console.error);

    // 2. Récupérer les réservations du trajet
    fetch(`${API_URL}/conducteur/trajets/${trajetId}/reservations`, {
      headers: { Authorization: `Bearer ${cleanToken}` }
    })
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.reservations || []);
        setReservations(list);
        
        const initialPresences: Record<number, boolean> = {};
        list.forEach((r: any) => {
          initialPresences[r.passager.id] = r.passager.aConfirmePresence || r.estPresent || false;
        });
        setPresences(initialPresences);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [trajetId]);

  const togglePresence = (passagerId: number, value: boolean) => {
    setPresences(prev => ({ ...prev, [passagerId]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const token = localStorage.getItem('token');
    const cleanToken = token ? token.replace(/"/g, '').trim() : null;
    
    const payload = Object.entries(presences).map(([passagerId, estPresent]) => ({
      passagerId: Number(passagerId),
      estPresent
    }));

    try {
      const res = await fetch(`${API_URL}/conducteur/trajets/${trajetId}/valider-presences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanToken}`
        },
        body: JSON.stringify({ presences: payload })
      });

      if (res.ok) {
        setSuccess('Présences validées avec succès !');
        setTimeout(() => setSuccess(''), 4000);
        router.push(`/conducteur/trajets/${trajetId}`);
      } else {
        setError(t('presenceValidationError') || 'Erreur de validation');
        setTimeout(() => setError(''), 4000);
      }
    } catch (err) {
      setError(t('serverError') || 'Erreur serveur');
      setTimeout(() => setError(''), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <p style={{ color: darkMode ? '#9CA3AF' : GR, textAlign: 'center', padding: '20px' }}>
        {t('loadingPassengers')}
      </p>
    );
  }
  
  if (reservations.length === 0) {
    return (
      <p style={{ color: darkMode ? '#9CA3AF' : GR, textAlign: 'center', padding: '20px' }}>
        {t('noReservationsForTrip')}
      </p>
    );
  }

  // Styles dynamiques selon le mode sombre
  const bgCard = darkMode ? '#1A1A1A' : '#fff';
  const borderCard = darkMode ? '#2A2A2A' : BD;
  const textColor = darkMode ? '#FFFFFF' : BK;
  const textSecondary = darkMode ? '#9CA3AF' : GR;
  const bgRow = darkMode ? '#2D2D2D' : '#fff';
  const bgRowHover = darkMode ? '#2D2D2D' : EL;

  return (
    <div style={{ 
      background: bgCard, 
      borderRadius: '16px', 
      border: `1px solid ${borderCard}`, 
      padding: isMobile ? '16px' : '24px', 
      marginBottom: '24px', 
      boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.04)'
    }}>
      {error && (
        <div style={{ padding: '12px 16px', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626', fontSize: '13px', fontWeight: '600' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          {error}
        </div>
      )}
      {success && (
        <div style={{ padding: '12px 16px', background: '#D1FAE5', border: '1px solid #A7F3D0', borderRadius: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '13px', fontWeight: '600' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          {success}
        </div>
      )}
      <h2 style={{ 
        fontSize: isMobile ? '16px' : '18px', 
        fontWeight: '800', 
        color: textColor, 
        margin: '0 0 16px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px' 
      }}>
        <Icon name="users" size={isMobile ? 20 : 22} /> {t('passengerValidation')}
      </h2>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <button
          onClick={() => router.push(`/conducteur/trajets/${trajetId}/carte-ramassage`)}
          style={{
            padding: isMobile ? '10px 16px' : '12px 20px',
            borderRadius: '10px',
            border: '1px solid rgba(13,158,126,0.3)',
            background: 'rgba(13,158,126,0.05)',
            color: E,
            fontSize: isMobile ? '13px' : '14px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            flex: 1,
            minWidth: '160px',
            justifyContent: 'center',
          }}
        >
          <Icon name="map" size={16} color={E} /> Carte de ramassage
        </button>
        <button
          onClick={() => router.push(`/conducteur/trajets/${trajetId}/demarrer`)}
          style={{
            padding: isMobile ? '10px 16px' : '12px 20px',
            borderRadius: '10px',
            border: 'none',
            background: `linear-gradient(135deg, ${E}, ${ED})`,
            color: '#fff',
            fontSize: isMobile ? '13px' : '14px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: `0 4px 15px rgba(13,158,126,0.3)`,
            transition: 'all 0.2s',
            flex: 1,
            minWidth: '160px',
            justifyContent: 'center',
          }}
        >
          <Icon name="flag" size={16} color="#fff" /> Démarrer le trajet
        </button>
      </div>
      
      {heureArrivee && (
        <div style={{ 
          background: darkMode ? '#2D2D2D' : EL, 
          border: `1px solid ${darkMode ? '#2A2A2A' : '#6EE7B7'}`, 
          borderRadius: '12px', 
          padding: isMobile ? '10px 12px' : '12px 16px', 
          marginBottom: '20px', 
          display: 'flex', 
          alignItems: isMobile ? 'flex-start' : 'center', 
          gap: '10px',
          color: darkMode ? '#FFFFFF' : ED,
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          <Icon name="clock" size={isMobile ? 18 : 20} color={darkMode ? '#FFFFFF' : ED} />
          <div>
            <div style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: '700' }}>
              {t('estimatedArrivalTime')} : {heureArrivee}
            </div>
            <div style={{ fontSize: isMobile ? '11px' : '12px', fontWeight: '500', opacity: 0.9 }}>
              {t('validatePresenceBefore')}
            </div>
          </div>
        </div>
      )}

      <p style={{ fontSize: isMobile ? '12px' : '13px', color: textSecondary, marginBottom: '20px' }}>
        {t('presenceInstructions')}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '10px' : '12px', marginBottom: '24px' }}>
        {reservations.map((res: any) => {
          const isPresent = presences[res.passager.id] ?? false;
          return (
            <div key={res.id} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: isMobile ? '12px' : '14px', 
              borderRadius: '12px', 
              border: `1px solid ${isPresent ? E : borderCard}`,
              background: isPresent ? (darkMode ? '#2D2D2D' : EL) : bgRow,
              transition: 'all 0.2s',
              color: textColor
            }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: textColor }}>
                  {res.passager.prenom} {res.passager.nom}
                </div>
                <div style={{ fontSize: '12px', color: textSecondary, marginTop: '2px' }}>
                  {res.placesReservees} {t('seats')} · {res.prixTotal?.toLocaleString('fr-FR')} FCFA
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => togglePresence(res.passager.id, true)}
                  style={{
                    padding: '8px 14px', 
                    borderRadius: '8px', 
                    border: `1px solid ${isPresent ? E : borderCard}`,
                    background: isPresent ? E : (darkMode ? '#2D2D2D' : '#fff'),
                    color: isPresent ? '#fff' : (darkMode ? '#9CA3AF' : GR),
                    fontSize: '13px', 
                    fontWeight: '700', 
                    cursor: 'pointer',
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                >
                  <Icon name="check" size={16} color={isPresent ? '#fff' : (darkMode ? '#9CA3AF' : GR)} /> {t('present')}
                </button>
                <button
                  onClick={() => togglePresence(res.passager.id, false)}
                  style={{
                    padding: '8px 14px', 
                    borderRadius: '8px', 
                    border: `1px solid ${!isPresent ? '#FCA5A5' : borderCard}`,
                    background: !isPresent ? LIGHT_GRAY : (darkMode ? '#2D2D2D' : '#fff'),
                    color: !isPresent ? GRAY : (darkMode ? '#9CA3AF' : GR),
                    fontSize: '13px', 
                    fontWeight: '700', 
                    cursor: 'pointer',
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                >
                  <Icon name="x" size={16} color={!isPresent ? GRAY : (darkMode ? '#9CA3AF' : GR)} /> {t('absent')}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{
          width: '100%', 
          padding: '14px', 
          borderRadius: '12px', 
          border: 'none',
          background: submitting ? (darkMode ? '#6B7280' : GR) : `linear-gradient(135deg, ${E}, ${ED})`,
          color: '#fff', 
          fontSize: '15px', 
          fontWeight: '700', 
          cursor: submitting ? 'not-allowed' : 'pointer',
          boxShadow: submitting ? 'none' : `0 4px 15px rgba(13,158,126,0.3)`,
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        {submitting ? (
          <>
            <div style={{ 
              width: '16px', 
              height: '16px', 
              border: '2px solid rgba(255,255,255,0.3)', 
              borderTopColor: '#fff', 
              borderRadius: '50%', 
              animation: 'spin 0.8s linear infinite' 
            }} />
            {t('validating')}
          </>
        ) : (
          <>
            <Icon name="check" size={18} color="#fff" /> {t('validatePresencesAndContinue')}
          </>
        )}
      </button>

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}