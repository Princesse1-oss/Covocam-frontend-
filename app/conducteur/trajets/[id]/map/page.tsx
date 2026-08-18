'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import ConducteurLayout from '../../../../../components/conducteur/ConducteurLayout';
import { useTheme } from '@/app/lib/ThemeContext';

const BACKEND_URL = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000` : '';

// La carte (Leaflet) est chargée uniquement côté client pour éviter l'erreur SSR "window is not defined"
const CarteTrajetConducteur = dynamic(() => import('../../../../../components/CarteTrajetConducteur'), { ssr: false });

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
    users: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    mapPin: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
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
}

interface Passager {
  id: number;
  nom: string;
  prenom: string;
  telephone?: string;
  photo?: string | null;
  quartierRamassage?: string;
  latitude?: number;
  longitude?: number;
}

export default function ConducteurMapPage() {
  const params = useParams();
  const router = useRouter();
  const { darkMode } = useTheme();
  const [trajet, setTrajet] = useState<Trajet | null>(null);
  const [passagers, setPassagers] = useState<Passager[]>([]);
  const [loading, setLoading] = useState(true);
  const [driverPosition, setDriverPosition] = useState<[number, number] | null>(null);

  const trajetId = params.id as string;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const cleanToken = token.replace(/"/g, '').trim();

    // Charger les données du trajet
    Promise.all([
      fetch(`${API_URL}/trajets/${trajetId}`, {
        headers: { Authorization: `Bearer ${cleanToken}` }
      }),
      fetch(`${API_URL}/conducteur/trajets/${trajetId}/reservations`, {
        headers: { Authorization: `Bearer ${cleanToken}` }
      })
    ])
      .then(([resTrajet, resPassagers]) => Promise.all([resTrajet.json(), resPassagers.json()]))
      .then(([dataTrajet, dataPassagers]) => {
        setTrajet(dataTrajet);
        const passagersList = Array.isArray(dataPassagers) ? dataPassagers : (dataPassagers.reservations || []);
        setPassagers(passagersList.map((r: any) => ({
          id: r.passager.id,
          nom: r.passager.nom,
          prenom: r.passager.prenom,
          telephone: r.passager.telephone,
          quartierRamassage: r.quartierRamassage,
          latitude: r.latitude,
          longitude: r.longitude
        })));
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur chargement:', err);
        setLoading(false);
      });
  }, [trajetId, router]);

  // Suivre la position du conducteur en temps réel
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const cleanToken = token.replace(/"/g, '').trim();

    const fetchPosition = async () => {
      try {
        const res = await fetch(`${API_URL}/trajets/${trajetId}/position`, {
          headers: { Authorization: `Bearer ${cleanToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.latitude && data.longitude) {
            setDriverPosition([data.latitude, data.longitude]);
          }
        }
      } catch { /* Ignoré silencieusement */ }
    };

    fetchPosition();
    const interval = setInterval(fetchPosition, 15000);
    return () => clearInterval(interval);
  }, [trajetId]);

  const getCoordinates = (ville: string) => {
    return VILLES_COORDS[ville] || [3.8480, 11.5021]; // Default to Yaoundé
  };

  if (loading) {
    return (
      <ConducteurLayout>
        <div style={{ padding: '80px', textAlign: 'center', color: darkMode ? '#9CA3AF' : GR }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `3px solid ${EL}`, borderTopColor: E, animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p>Chargement de la carte...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
        </div>
      </ConducteurLayout>
    );
  }

  const bgCard = darkMode ? '#1A1A1A' : '#FFFFFF';
  const borderCard = darkMode ? '#2A2A2A' : BD;
  const textColor = darkMode ? '#FFFFFF' : BK;
  const textSecondary = darkMode ? '#9CA3AF' : GR;

  return (
    <ConducteurLayout>
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
              Carte de ramassage
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
            <CarteTrajetConducteur
              departure={getCoordinates(trajet.villeDepart)}
              arrival={getCoordinates(trajet.villeArrivee)}
              departureName={trajet.villeDepart}
              arrivalName={trajet.villeArrivee}
              passagers={passagers}
              driverPosition={driverPosition}
              darkMode={darkMode}
            />
          </div>
        )}

        {/* Passagers List */}
        <div style={{
          background: bgCard,
          borderRadius: '16px',
          border: `1px solid ${borderCard}`,
          padding: '20px',
          boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.04)'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: textColor, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="users" size={20} /> Passagers ({passagers.length})
          </h2>
          
          {passagers.length === 0 ? (
            <p style={{ color: textSecondary, textAlign: 'center', padding: '20px' }}>
              Aucun passager pour ce trajet
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {passagers.map((passager) => (
                <div key={passager.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px',
                  borderRadius: '12px',
                  border: `1px solid ${borderCard}`,
                  background: darkMode ? '#2D2D2D' : '#FAFAFA'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ position: 'relative', width: '44px', height: '44px', flexShrink: 0 }}>
                      {passager.photo && (
                        <img src={passager.photo.startsWith('http') ? passager.photo : `${BACKEND_URL}/uploads/profils/${passager.photo}`} alt="" onError={e => e.currentTarget.style.display = 'none'} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 10 }} />
                      )}
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${E}, ${ED})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#FFF',
                        position: 'relative',
                        zIndex: 1
                      }}>
                        {passager.prenom.charAt(0)}{passager.nom.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: textColor }}>
                        {passager.prenom} {passager.nom}
                      </div>
                      {passager.quartierRamassage && (
                        <div style={{ fontSize: '12px', color: textSecondary, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Icon name="mapPin" size={12} /> {passager.quartierRamassage}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {passager.telephone && (
                    <a
                      href={`tel:${passager.telephone}`}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        border: 'none',
                        background: EL,
                        color: E,
                        cursor: 'pointer',
                        display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textDecoration: 'none'
                    }}
                    title="Appeler"
                    >
                      <Icon name="phone" size={18} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ConducteurLayout>
  );
}
