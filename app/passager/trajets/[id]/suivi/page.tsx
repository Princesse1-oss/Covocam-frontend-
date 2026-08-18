'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import SvgIcon from '../../../../../components/SvgIcon';
import { useTheme } from '@/app/lib/ThemeContext';

const BACKEND_URL = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000` : '';

// La carte (Leaflet) est chargée uniquement côté client pour éviter l'erreur SSR "window is not defined"
const CarteSuivi = dynamic(() => import('../../../../../components/CarteSuiviTrajet'), { ssr: false });

const API_URL = '/api';

// Palette de couleurs CovoCam
const EMERALD = '#0D9E7E';
const ED = '#0A7B62';
const BLACK = '#0D0D0D';
const GRAY = '#6B7280';

// Coordonnées approximatives des villes du Cameroun
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
    photo: string | null;
    telephone?: string;
  };
}

// Vérifie si c'est l'heure du suivi (30 min avant jusqu'à 2 h après le départ)
const estLHeureDuSuivi = (dateDepart: string, heureDepart: string) => {
  const maintenant = new Date();
  const dateHeureDepart = new Date(`${dateDepart}T${heureDepart}`);
  const diffMinutes = (maintenant.getTime() - dateHeureDepart.getTime()) / (1000 * 60);
  return diffMinutes >= -30 && diffMinutes <= 120;
};

export default function SuiviTrajetPage() {
  const params = useParams();
  const router = useRouter();
  const [trajet, setTrajet] = useState<Trajet | null>(null);
  const [loading, setLoading] = useState(true);
  const [driverSignaled, setDriverSignaled] = useState<boolean | null>(null);
  const { t } = useTheme();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch(`${API_URL}/trajets/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setTrajet(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur chargement trajet:', err);
        setLoading(false);
      });
  }, [params.id, router]);

  if (loading) {
    return (
      <div style={{ padding: '80px', textAlign: 'center', color: GRAY }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `3px solid #E8F7F3`, borderTopColor: EMERALD, animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p>{t('loadingTracking')}</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
      </div>
    );
  }

  if (!trajet) {
    return (
      <div style={{ padding: '80px', textAlign: 'center', color: GRAY }}>
        <p>{t('tripNotFound')}</p>
        <button onClick={() => router.push('/passager/reservations')} style={{ marginTop: '16px', padding: '10px 20px', background: EMERALD, color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
          {t('backToReservations')}
        </button>
      </div>
    );
  }

  if (!estLHeureDuSuivi(trajet.dateDepart, trajet.heureDepart) && trajet.statut !== 'EN_COURS') {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '40px', textAlign: 'center', background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}><SvgIcon name="clock" size={48} color={GRAY} /></div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: BLACK, marginBottom: '8px' }}>{t('trackingNotAvailable')}</h2>
        <p style={{ color: GRAY, marginBottom: '24px', lineHeight: '1.5' }} dangerouslySetInnerHTML={{ __html: t('geolocationNote').replace('{heure}', trajet.heureDepart) }} />
        <button onClick={() => router.push('/passager/reservations')} style={{ padding: '12px 24px', background: EMERALD, color: '#FFF', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>
          {t('backToMyReservations')}
        </button>
      </div>
    );
  }

  const depCoords = VILLES_COORDS[trajet.villeDepart] || [3.8480, 11.5021];
  const arrCoords = VILLES_COORDS[trajet.villeArrivee] || [4.0483, 9.7043];

  const conducteurPhoto = trajet.conducteur.photo
    ? (trajet.conducteur.photo.startsWith('http') ? trajet.conducteur.photo : `${BACKEND_URL}/uploads/profils/${trajet.conducteur.photo}`)
    : null;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 16px' }}>
      <button onClick={() => router.back()} style={{ marginBottom: '20px', background: 'transparent', border: 'none', color: EMERALD, cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
        ← {t('back')}
      </button>

      {/* Info Card */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: BLACK, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SvgIcon name="car" size={22} color={EMERALD} /> {t('realTimeTracking')}
        </h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <div style={{ fontSize: '12px', color: GRAY, marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase' }}>{t('trip')}</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: BLACK }}>{trajet.villeDepart} {trajet.quartierDepart && `(${trajet.quartierDepart})`}</div>
            <div style={{ fontSize: '14px', color: GRAY, margin: '4px 0' }}>↓</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: BLACK }}>{trajet.villeArrivee} {trajet.quartierArrivee && `(${trajet.quartierArrivee})`}</div>
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ fontSize: '12px', color: GRAY, marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase' }}>{t('driver')}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {conducteurPhoto ? (
                <img
                  src={conducteurPhoto}
                  alt={`${trajet.conducteur.prenom} ${trajet.conducteur.nom}`}
                  style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${EMERALD}` }}
                />
              ) : (
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `linear-gradient(135deg, ${EMERALD}, ${ED})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '800', color: 'white' }}>
                  {trajet.conducteur.prenom[0]}{trajet.conducteur.nom[0]}
                </div>
              )}
              <div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: BLACK }}>{trajet.conducteur.prenom} {trajet.conducteur.nom}</div>
                {trajet.conducteur.telephone && (
                  <a href={`tel:${trajet.conducteur.telephone}`} style={{ fontSize: '13px', color: EMERALD, textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <SvgIcon name="phone" size={14} color={EMERALD} /> {trajet.conducteur.telephone}
                  </a>
                )}
              </div>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '150px' }}>
            <div style={{ fontSize: '12px', color: GRAY, marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase' }}>{t('statusLabel')}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: trajet.statut === 'EN_COURS' ? '#E8F7F3' : '#F3F4F6', borderRadius: '20px', fontSize: '13px', fontWeight: '700', color: trajet.statut === 'EN_COURS' ? EMERALD : GRAY }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: trajet.statut === 'EN_COURS' ? EMERALD : GRAY, animation: trajet.statut === 'EN_COURS' ? 'pulse 2s infinite' : 'none' }} />
              {trajet.statut === 'EN_COURS' ? t('inProgress') : t('soon')}
            </div>
          </div>
        </div>
      </div>

      {/* Carte de suivi (chargée côté client uniquement) */}
      <CarteSuivi
        trajetId={Number(params.id)}
        pointDepart={{ lat: depCoords[0], lng: depCoords[1] }}
        pointArrivee={{ lat: arrCoords[0], lng: arrCoords[1] }}
        heureDepart={trajet.heureDepart}
        forceActive={trajet.statut === 'EN_COURS'}
        onDriverSignal={setDriverSignaled}
      />

      {driverSignaled === false && (
        <div style={{ marginTop: '16px', padding: '14px 16px', borderRadius: '12px', background: '#FEF3C7', border: '1px solid #FCD34D', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <SvgIcon name="alert" size={20} color="#B45309" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#92400E' }}>{t('driverNotStarted')}</div>
            <div style={{ fontSize: '13px', color: '#B45309', marginTop: '2px', lineHeight: '1.4' }}>
              {t('departureTimePassed')
                .replace('{heure}', trajet.heureDepart)
                .replace('{tel}', trajet.conducteur.telephone || t('numberInReservation'))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
