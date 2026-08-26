'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import PassagerLayout from '../../../../../components/passager/PassagerLayout';
import { useTheme } from '@/app/lib/ThemeContext';
import { estimatedDistanceKm, estimatedDurationMinutes, formatDistance, formatDuration } from '../../../../../components/distanceUtils';

// La carte (Leaflet) est chargée uniquement côté client pour éviter l'erreur SSR "window is not defined"
const CarteTrajetPassager = dynamic(() => import('../../../../../components/CarteTrajetPassager'), { ssr: false });

const API_URL = '/api';

const E = '#0D9E7E';
const EL = '#E8F7F3';
const ED = '#0A7B62';
const BK = '#0D0D0D';
const GR = '#6B7280';
const BD = '#EBEBEB';

// Coordonnées des villes du Cameroun
const VILLES_COORDS: Record<string, [number, number]> = {
  'Yaoundé': [3.8480, 11.5021],
  'Douala': [4.0483, 9.7043],
  'Bafoussam': [5.4737, 10.4183],
  'Bamenda': [5.9631, 10.1591],
  'Garoua': [9.3000, 13.4000],
  'Maroua': [10.5950, 14.3150],
  'Ngaoundéré': [7.3167, 13.5833],
  'Bertoua': [4.5833, 13.6833],
  'Ebolowa': [2.9000, 11.1500],
  'Kribi': [2.9400, 9.9100],
};

// ─── SVG Icons inline ───
const Icon = ({ name, size = 20, color = E }: { name: string; size?: number; color?: string }) => {
  const s = { width: size, height: size, display: 'inline-block', verticalAlign: 'middle' } as React.CSSProperties;
  const icons: Record<string, React.ReactNode> = {
    arrowLeft: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
    ),
    phone: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
    clock: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    car: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 11L6.5 6.5C6.8 5.6 7.6 5 8.6 5H15.4C16.4 5 17.2 5.6 17.5 6.5L19 11"/>
        <rect x="2" y="11" width="20" height="7" rx="2"/>
        <circle cx="7" cy="18" r="2"/>
        <circle cx="17" cy="18" r="2"/>
      </svg>
    ),
    mapPin: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    star: (
      <svg style={s} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  };
  return <span style={{ lineHeight: 0, display: 'inline-flex' }}>{icons[name] || null}</span>;
};

interface Trajet {
  id: number;
  villeDepart: string;
  villeArrivee: string;
  quartierDepart?: string;
  quartierArrivee?: string;
  dateDepart: string;
  heureDepart: string;
  statut: string;
  conducteur: {
    id: number;
    nom: string;
    prenom: string;
    telephone?: string;
    photo?: string | null;
    noteMoyenne?: number | null;
  };
}

export default function PassagerMapPage() {
  const params = useParams();
  const router = useRouter();
  const { t, darkMode } = useTheme();
  const [trajet, setTrajet] = useState<Trajet | null>(null);
  const [loading, setLoading] = useState(true);
  const [driverPosition, setDriverPosition] = useState<[number, number] | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);

  const trajetId = params.id as string;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const cleanToken = token.replace(/"/g, '').trim();

    // Charger les données du trajet
    fetch(`${API_URL}/trajets/${trajetId}`, {
      headers: { Authorization: `Bearer ${cleanToken}` }
    })
      .then(res => res.json())
      .then(data => {
        setTrajet(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur chargement:', err);
        setLoading(false);
      });
  }, [trajetId, router]);

  // Position exacte de l'utilisateur (passager) via GPS du navigateur
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      () => { /* Permission refusée ou indisponible : ignoré */ },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Position du conducteur en temps réel
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const cleanToken = token.replace(/"/g, '').trim();

    const fetchDriverPosition = async () => {
      try {
        const res = await fetch(`${API_URL}/trajets/${trajetId}/position-conducteur`, {
          headers: { Authorization: `Bearer ${cleanToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.position) {
            setDriverPosition([data.position.lat, data.position.lng]);
          }
        }
      } catch { /* Ignoré silencieusement */ }
    };

    fetchDriverPosition();
    const interval = setInterval(fetchDriverPosition, 10000);
    return () => clearInterval(interval);
  }, [trajetId]);

  const getCoordinates = (ville: string) => {
    return VILLES_COORDS[ville] || [3.8480, 11.5021]; // Default to Yaoundé
  };

  // Vitesses moyennes pour les estimations (route)
  const SPEED_DEPART = 40; // km/h : trajet vers le point de départ
  const SPEED_ROUTE = 50; // km/h : trajet du conducteur vers l'arrivée

  const depCoord = trajet ? getCoordinates(trajet.villeDepart) : [3.8480, 11.5021] as [number, number];
  const arrCoord = trajet ? getCoordinates(trajet.villeArrivee) : [4.0483, 9.7043] as [number, number];

  // Distance / temps du passager jusqu'au point de départ
  const distToDepart = userPosition ? estimatedDistanceKm(userPosition, depCoord) : null;
  const etaToDepart = distToDepart !== null ? estimatedDurationMinutes(distToDepart, SPEED_DEPART) : null;

  // Distance / temps restants jusqu'à l'arrivée (basé sur le conducteur en mouvement, sinon le passager)
  const arrivalOrigin = driverPosition || userPosition || null;
  const distToArrival = arrivalOrigin ? estimatedDistanceKm(arrivalOrigin, arrCoord) : null;
  const etaToArrival = distToArrival !== null ? estimatedDurationMinutes(distToArrival, driverPosition ? SPEED_ROUTE : SPEED_DEPART) : null;

  if (loading) {
    return (
      <PassagerLayout>
        <div style={{ padding: '80px', textAlign: 'center', color: darkMode ? '#9CA3AF' : GR }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `3px solid ${EL}`, borderTopColor: E, animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p>{t('loadingMap')}</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
        </div>
      </PassagerLayout>
    );
  }

  const bgCard = darkMode ? '#1A1A1A' : '#FFFFFF';
  const borderCard = darkMode ? '#2A2A2A' : BD;
  const textColor = darkMode ? '#FFFFFF' : BK;
  const textSecondary = darkMode ? '#9CA3AF' : GR;

  return (
    <PassagerLayout>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px 16px 40px' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => router.back()}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              border: 'none',
              background: darkMode ? '#2A2A2A' : '#F5F5F5',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon name="arrowLeft" size={20} color={darkMode ? '#FFFFFF' : BK} />
          </button>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: textColor, margin: '0 0 4px' }}>
              {t('trackTrip')}
            </h1>
            <p style={{ fontSize: '13px', color: textSecondary, margin: 0 }}>
              {trajet?.villeDepart} → {trajet?.villeArrivee}
            </p>
          </div>
        </div>

        {/* Carte (chargée côté client uniquement) */}
        {trajet && (
          <div style={{ 
            borderRadius: '20px', 
            overflow: 'hidden', 
            border: `1px solid ${borderCard}`,
            boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.08)',
            marginBottom: '24px'
          }}>
            <CarteTrajetPassager
              departure={getCoordinates(trajet.villeDepart)}
              arrival={getCoordinates(trajet.villeArrivee)}
              departureName={trajet.villeDepart}
              arrivalName={trajet.villeArrivee}
              driverPosition={driverPosition}
              userPosition={userPosition}
              driverName={trajet.conducteur ? `${trajet.conducteur.prenom} ${trajet.conducteur.nom}` : undefined}
              darkMode={darkMode}
            />
          </div>
        )}

        {/* Stats temps réel : distance & temps estimés */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            background: bgCard,
            borderRadius: '14px',
            border: `1px solid ${borderCard}`,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
              background: EL, color: E, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="mapPin" size={20} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                {t('distanceToDeparture')}
              </div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: textColor }}>
                {distToDepart !== null ? (
                  <>
                    {formatDistance(distToDepart)}{' '}
                    <span style={{ fontSize: '13px', fontWeight: '600', color: textSecondary }}>
                      · ≈ {formatDuration(etaToDepart!)}
                    </span>
                  </>
                ) : (
                  t('waitingGps')
                )}
              </div>
            </div>
          </div>

          <div style={{
            background: bgCard,
            borderRadius: '14px',
            border: `1px solid ${borderCard}`,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
              background: darkMode ? '#2D2D2D' : '#F5F5F5', color: textSecondary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="clock" size={20} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                {t('estimatedArrivalLabel')}
              </div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: textColor }}>
                {distToArrival !== null ? (
                  <>
                    {formatDistance(distToArrival)}{' '}
                    <span style={{ fontSize: '13px', fontWeight: '600', color: textSecondary }}>
                      · ≈ {formatDuration(etaToArrival!)}
                    </span>
                  </>
                ) : (
                  t('waitingGps')
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Driver Info Card (compact) */}
        {trajet?.conducteur && (
          <div style={{
            background: bgCard,
            borderRadius: '16px',
            border: `1px solid ${borderCard}`,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.04)'
          }}>
            {trajet.conducteur.photo ? (
              <img
                src={trajet.conducteur.photo.startsWith('http') ? trajet.conducteur.photo : `/uploads/profils/${trajet.conducteur.photo}`}
                alt={t('driverPhotoAlt')}
                style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
              />
            ) : (
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${E}, ${ED})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '15px',
                fontWeight: '700',
                color: '#FFF',
                flexShrink: 0
              }}>
                {trajet.conducteur.prenom.charAt(0)}{trajet.conducteur.nom.charAt(0)}
              </div>
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '15px', fontWeight: '700', color: textColor }}>
                  {trajet.conducteur.prenom} {trajet.conducteur.nom}
                </span>
                {trajet.conducteur.noteMoyenne ? (
                  <span style={{ fontSize: '12px', fontWeight: '600', color: E, background: EL, padding: '2px 8px', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <Icon name="star" size={11} /> {trajet.conducteur.noteMoyenne.toFixed(1)}
                  </span>
                ) : null}
                <span style={{
                  fontSize: '11px', fontWeight: '600',
                  color: driverPosition ? E : textSecondary,
                  background: driverPosition ? EL : (darkMode ? '#2A2A2A' : '#F3F4F6'),
                  padding: '2px 8px', borderRadius: '999px',
                  display: 'inline-flex', alignItems: 'center', gap: '5px'
                }}>
                  <span style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: driverPosition ? E : textSecondary,
                    display: 'inline-block'
                  }} />
                  {driverPosition ? t('driverOnline') : t('waitingDriver')}
                </span>
              </div>
              {trajet.dateDepart && trajet.heureDepart && (
                <div style={{ fontSize: '12px', color: textSecondary, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Icon name="clock" size={12} />
                  {trajet.villeDepart} → {trajet.villeArrivee} · {t('dateAtTime').replace('{date}', new Date(trajet.dateDepart).toLocaleDateString('fr-FR')).replace('{heure}', trajet.heureDepart)}
                </div>
              )}
            </div>

            {trajet.conducteur.telephone && (
              <a
                href={`tel:${trajet.conducteur.telephone}`}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '42px', height: '42px', borderRadius: '12px',
                  background: EL, color: E, flexShrink: 0, textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(13,158,126,0.2)'
                }}
                title={t('callDriver')}
              >
                <Icon name="phone" size={18} />
              </a>
            )}
          </div>
        )}
      </div>
    </PassagerLayout>
  );
}
