'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import ConducteurLayout from '../../../../../components/conducteur/ConducteurLayout';
import { useGpsTracking } from '../../../../../hooks/useGpsTracking';
import { useTheme } from '@/app/lib/ThemeContext';

// La carte (Leaflet) est chargée uniquement côté client pour éviter l'erreur SSR "window is not defined"
const MapComponent = dynamic(() => import('../../../../../components/MapComponent'), { ssr: false });

const API_URL = '/api';

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
    map: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
      </svg>
    ),
    arrowLeft: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
    ),
    play: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"/>
      </svg>
    ),
    stop: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      </svg>
    ),
    alert: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    clock: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    users: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  };
  return <span style={{ lineHeight: 0, display: 'inline-flex' }}>{icons[name] || null}</span>;
};

export default function DemarrerTrajetPage() {
  const router = useRouter();
  const params = useParams();
  const { t, darkMode } = useTheme();
  const id = params.id as string;
  const trajetId = id ? Number(id) : null;

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trajet, setTrajet] = useState<any>(null);
  const [error, setError] = useState('');
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  
  // ✅ C'est cette variable qui active/désactive le hook GPS
  const [isTrajetActive, setIsTrajetActive] = useState(false);

  // Le hook gère automatiquement le démarrage et l'arrêt du GPS selon isTrajetActive
  const { isTracking, error: gpsError } = useGpsTracking(trajetId, isTrajetActive);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const cleanToken = token.replace(/"/g, '').trim();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    fetch(`${API_URL}/trajets/${id}`, {
      headers: { Authorization: `Bearer ${cleanToken}` },
      signal: controller.signal,
    })
      .then(async (r) => {
        clearTimeout(timeoutId);
        if (r.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }
        const text = await r.text();
        if (!r.ok) throw new Error('Trajet non trouvé');
        return JSON.parse(text);
      })
      .then(data => {
        setTrajet(data);
        if (data.statut === 'EN_COURS' || data.trajetActive) {
          setIsTrajetActive(true);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || t('loadError'));
        setLoading(false);
      });
  }, [id, router, t]);

  // ✅ Récupère la position GPS du conducteur pour l'afficher sur la carte
  useEffect(() => {
    if (!isTrajetActive) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const cleanToken = token.replace(/"/g, '').trim();

    const fetchPosition = async () => {
      try {
        const res = await fetch(`${API_URL}/trajets/${id}/position`, {
          headers: { Authorization: `Bearer ${cleanToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.latitude && data.longitude) {
            setCurrentPosition({ lat: data.latitude, lng: data.longitude });
          }
        }
      } catch { /* Ignoré silencieusement */ }
    };

    fetchPosition();
    const interval = setInterval(fetchPosition, 10000);
    return () => clearInterval(interval);
  }, [isTrajetActive, id]);

  const handleDemarrer = () => {
    // ✅ Active le hook GPS
    setIsTrajetActive(true);
  };

  const handleTerminer = async () => {
    if (!confirm(t('confirmEndTrip'))) {
      return;
    }

    setSubmitting(true);
    
    // ✅ 1. Couper le suivi GPS IMMÉDIATEMENT
    setIsTrajetActive(false);
    
    const token = localStorage.getItem('token');
    
    try {
      // ✅ 2. Appeler l'API de fin de trajet
      const response = await fetch(`${API_URL}/conducteur/trajets/${id}/terminer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert(t('tripEndedSuccess'));
        router.push('/conducteur/trajets');
      } else {
        alert(t('tripEndError') + (data.error || ''));
      }
    } catch (err) {
      alert(t('serverError'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ConducteurLayout>
        <div style={{ textAlign: 'center', padding: '80px', color: darkMode ? '#9CA3AF' : GR }}>
          <p>{t('loading')}</p>
        </div>
      </ConducteurLayout>
    );
  }

  if (error || !trajet) {
    return (
      <ConducteurLayout>
        <div style={{ textAlign: 'center', padding: '80px', color: '#dc2626' }}>
          <p>{error || t('tripNotFound')}</p>
          <button onClick={() => router.push('/conducteur/trajets')} style={{ marginTop: '20px', padding: '12px 24px', borderRadius: '10px', border: 'none', background: E, color: '#fff', fontWeight: '700', cursor: 'pointer' }}>
            {t('backToList')}
          </button>
        </div>
      </ConducteurLayout>
    );
  }

  const trackingDescText = `${t('trackingDesc')} ${trajet.villeDepart} → ${trajet.villeArrivee}`;

  return (
    <ConducteurLayout>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: darkMode ? '#FFFFFF' : BK, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon name="map" size={24} /> {t('trackingTitle')}
        </h1>
        <p style={{ fontSize: '13px', color: darkMode ? '#9CA3AF' : GR }}>{trackingDescText}</p>
      </div>

      {gpsError && (
        <div style={{ 
          background: '#FEE2E2', color: '#DC2626', padding: '14px 18px', 
          borderRadius: '12px', marginBottom: '20px', border: '1px solid #FCA5A5',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <Icon name="alert" color="#DC2626" />
          <span style={{ fontSize: '14px', fontWeight: '600' }}>{gpsError}</span>
        </div>
      )}

      <div style={{ background: darkMode ? '#1A1A1A' : '#fff', borderRadius: '16px', border: `1px solid ${darkMode ? '#2A2A2A' : BD}`, padding: '20px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <MapComponent 
          departure={{ 
            lat: trajet.pointDepartLat || 3.848, 
            lng: trajet.pointDepartLng || 11.502, 
            name: `${trajet.villeDepart} (${trajet.quartierDepart})` 
          }}
          arrival={{ 
            lat: trajet.pointArriveeLat || 4.0483, 
            lng: trajet.pointArriveeLng || 9.7043, 
            name: `${trajet.villeArrivee} (${trajet.quartierArrivee || 'Centre'})` 
          }}
          currentPosition={currentPosition ?? undefined}
          height="450px"
          zoom={12}
        />
      </div>

      <div style={{ background: darkMode ? '#1A1A1A' : '#fff', borderRadius: '16px', border: `1px solid ${darkMode ? '#2A2A2A' : BD}`, padding: '24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: darkMode ? '#9CA3AF' : GR, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('gpsStatus')}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                width: '10px', height: '10px', borderRadius: '50%', 
                background: isTracking ? E : '#9CA3AF',
                boxShadow: isTracking ? `0 0 0 3px ${EL}` : 'none',
                transition: 'all 0.3s'
              }} />
              <span style={{ fontSize: '16px', fontWeight: '700', color: isTracking ? E : (darkMode ? '#9CA3AF' : GR) }}>
                {isTracking ? t('gpsActive') : t('gpsWaiting')}
              </span>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: darkMode ? '#9CA3AF' : GR, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('estimatedArrivalTime')}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="clock" size={20} color={ED} />
              <span style={{ fontSize: '16px', fontWeight: '700', color: darkMode ? '#FFFFFF' : BK }}>
                {trajet.heureArriveeEstimee || t('notDefined')}
              </span>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: darkMode ? '#9CA3AF' : GR, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('confirmedPassengers')}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="users" size={20} color={E} />
              <span style={{ fontSize: '16px', fontWeight: '700', color: darkMode ? '#FFFFFF' : BK }}>
                {trajet.nbReservationsConfirmees || 0} / {trajet.placesDisponibles}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap', paddingBottom: '40px' }}>
        <button 
          onClick={() => router.push(`/conducteur/trajets/${id}`)} 
          style={{ padding: '12px 24px', borderRadius: '10px', border: `1px solid ${darkMode ? '#2A2A2A' : BD}`, background: darkMode ? '#1A1A1A' : '#fff', color: darkMode ? '#FFFFFF' : '#374151', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Icon name="arrowLeft" size={16} color={darkMode ? '#FFFFFF' : '#374151'} /> {t('backToDetails')}
        </button>
        
        {!isTrajetActive ? (
          <button 
            onClick={handleDemarrer} 
            style={{ padding: '12px 28px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${E}, ${ED})`, color: '#fff', fontSize: '15px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: `0 4px 15px rgba(13,158,126,0.3)` }}
          >
            <Icon name="play" size={18} color="#fff" /> {t('startGps')}
          </button>
        ) : (
          <button 
            onClick={handleTerminer} 
            disabled={submitting}
            style={{ 
              padding: '12px 28px', borderRadius: '10px', border: 'none', 
              background: submitting ? (darkMode ? '#6B7280' : GR) : '#DC2626', 
              color: '#fff', fontSize: '15px', fontWeight: '700', 
              cursor: submitting ? 'not-allowed' : 'pointer', 
              display: 'flex', alignItems: 'center', gap: '8px', 
              boxShadow: submitting ? 'none' : '0 4px 15px rgba(220,38,38,0.3)',
              transition: 'all 0.2s'
            }}
          >
            {submitting ? (
              <>
                <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                {t('finalizing')}
              </>
            ) : (
              <>
                <Icon name="stop" size={18} color="#fff" /> {t('endTrip')}
              </>
            )}
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </ConducteurLayout>
  );
}