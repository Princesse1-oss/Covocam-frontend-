'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import ConducteurLayout from '../../../../../components/conducteur/ConducteurLayout';
import { useTheme } from '@/app/lib/ThemeContext';

// La carte (Leaflet) est chargée uniquement côté client pour éviter l'erreur SSR "window is not defined"
const CarteRamassage = dynamic(() => import('../../../../../components/CarteRamassage'), { ssr: false });

const API_URL = '/api';

const E = '#0D9E7E';
const EL = '#E8F7F3';
const ED = '#0A7B62';
const BK = '#0D0D0D';
const GR = '#6B7280';
const BD = '#EBEBEB';
const AM = '#F59E0B';

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
  'Mfou': [3.9500, 11.8000],
  'Mbalmayo': [3.5167, 11.5000],
  'Akono': [3.4900, 11.3100],
  'Eseka': [3.6500, 10.7667],
  'Edéa': [3.8000, 10.1333],
  'Limbe': [4.0200, 9.2100],
  'Buea': [4.1500, 9.2400],
  'Tiko': [4.0800, 9.3600],
  'Mamfe': [5.7750, 9.3000],
  'Kumba': [4.6400, 9.4400],
  'Nkongsamba': [4.9500, 9.9333],
  'Dschang': [5.4500, 10.0500],
  'Fundong': [6.2500, 10.2667],
  'Jakiri': [6.1000, 10.1667],
  'Wum': [6.4167, 10.0667],
  'Njinikom': [6.2333, 10.2167],
  'Batibo': [5.8333, 9.8500],
  'Mankon': [5.9833, 10.1000],
  'Kumbo': [6.2000, 10.6667],
  'Nkambe': [6.5000, 10.6833],
  'Ndu': [6.3833, 10.7333],
  'Tchamba': [7.4500, 12.3500],
  'Tibati': [6.4667, 12.6333],
  'Meiganga': [6.5167, 14.3000],
  'Ngaoundal': [6.5000, 13.2667],
  'Doumere': [7.5833, 13.1500],
  'Yoko': [5.5333, 12.3167],
  'Batouri': [4.4333, 14.3667],
  'Kentzou': [4.1667, 14.8500],
  'Lomie': [3.1500, 13.4667],
  'Ambam': [2.3833, 11.2667],
  'Minta': [3.6000, 11.5167],
  'Akonolinga': [3.7667, 12.2500],
  'Ayos': [3.9000, 12.5333],
  'Nanga-Eboko': [4.6833, 12.3667],
  'Mbandjock': [4.4500, 12.7333],
  'Essaki': [4.1167, 12.9500],
  'Bonaberi': [4.0700, 9.6600],
  'Dakar': [3.9500, 11.4500],
  'Simbock': [3.8167, 11.4833],
  'Mvan': [3.8167, 11.5167],
  'Bastos': [3.8833, 11.4833],
  'Mendong': [3.8333, 11.4500],
  'Nkolfoulou': [3.8167, 11.6500],
  'Soa': [3.8667, 11.6333],
  'Biyem-Assi': [3.8333, 11.4667],
  'Mokolo': [10.7417, 13.8000],
  'Yagoua': [10.3417, 14.9417],
  'Waza': [11.0500, 14.3750],
  'Kousseri': [12.0833, 14.5333],
  'Logone-Birni': [11.4500, 14.2500],
  'Poli': [8.3500, 13.1833],
  'Rey-Bouba': [8.6667, 13.9833],
  'Touboro': [7.8500, 14.4167],
  'Blangoua': [12.3500, 14.2500],
  'Gouna': [9.6500, 13.5833],
  'Mayo-Baléo': [7.8000, 13.5333],
  'Bouba': [6.6667, 12.4500],
  'Mindif': [6.8667, 14.1167],
  'Dargala': [11.2167, 13.8333],
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
    navigation: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 11 22 2 13 21 11 13 3 11"/>
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
    clock: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    check: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    alert: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
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

// ✅ Fonction pour vérifier si on est dans la fenêtre d'affichage (-10min à +2h)
const estDansFenetreRamassage = (dateDepart: string, heureDepart: string) => {
  if (!dateDepart || !heureDepart) return false;
  const maintenant = new Date();
  const dateOnly = dateDepart.split(' ')[0];
  const dateHeureDepart = new Date(`${dateOnly}T${heureDepart}`);
  if (isNaN(dateHeureDepart.getTime())) return false;
  const diffMinutes = (maintenant.getTime() - dateHeureDepart.getTime()) / (1000 * 60);
  return diffMinutes >= -10 && diffMinutes <= 120;
};

// ✅ Fonction pour générer un lien Google Maps
const getGoogleMapsLink = (origin: [number, number], destination: [number, number]) => {
  return `https://www.google.com/maps/dir/?api=1&origin=${origin[0]},${origin[1]}&destination=${destination[0]},${destination[1]}&travelmode=driving`;
};

interface Passager {
  id: number;
  reservationId: number;
  nom: string;
  prenom: string;
  telephone: string | null;
  photo?: string | null;
  placesReservees: number;
}

export default function CarteRamassagePage() {
  const params = useParams();
  const router = useRouter();
  const { t, darkMode } = useTheme();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [trajet, setTrajet] = useState<any>(null);
  const [passagers, setPassagers] = useState<Passager[]>([]);
  const [driverPos, setDriverPos] = useState<[number, number] | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const cleanToken = token.replace(/"/g, '').trim();

    // 1. Charger les détails du trajet
    fetch(`${API_URL}/trajets/${id}`, {
      headers: { Authorization: `Bearer ${cleanToken}` }
    })
      .then(res => res.json())
      .then(data => {
        setTrajet(data);
        // Use trajet GPS coordinates if available
        if (data.positionActuelleLat && data.positionActuelleLng) {
          setDriverPos([data.positionActuelleLat, data.positionActuelleLng]);
        }
      })
      .catch(err => console.error('Erreur trajet:', err));

    // 2. Charger les passagers confirmés
    fetch(`${API_URL}/reservations/conducteur/mes-reservations`, {
      headers: { Authorization: `Bearer ${cleanToken}` }
    })
      .then(res => res.json())
      .then(data => {
        const passagersDuTrajet = (Array.isArray(data) ? data : [])
          .filter((r: any) => r.trajet?.id === parseInt(id) && ['CONFIRMEE', 'A_PAYER'].includes(r.statut))
          .map((r: any) => ({
            id: r.passager?.id,
            reservationId: r.id,
            nom: r.passager?.nom || 'Inconnu',
            prenom: r.passager?.prenom || '',
            telephone: r.passager?.telephone,
            photo: r.passager?.photo,
            placesReservees: r.placesReservees || 1,
          }));
        setPassagers(passagersDuTrajet);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur passagers:', err);
        setLoading(false);
      });

    // 3. Poll driver position every 10s for live tracking
    const pollPosition = setInterval(() => {
      fetch(`${API_URL}/trajets/${id}/position-conducteur`, {
        headers: { Authorization: `Bearer ${cleanToken}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.position?.lat && data.position?.lng) {
            setDriverPos([data.position.lat, data.position.lng]);
          }
        })
        .catch(() => {});
    }, 10000);

    return () => clearInterval(pollPosition);
  }, [id, router]);

  if (loading) {
    return (
      <ConducteurLayout>
        <div style={{ padding: '80px', textAlign: 'center', color: darkMode ? '#9CA3AF' : GR }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `3px solid ${EL}`, borderTopColor: E, animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p>Chargement de la carte de ramassage...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
        </div>
      </ConducteurLayout>
    );
  }

  if (!trajet) {
    return (
      <ConducteurLayout>
        <div style={{ padding: '80px', textAlign: 'center', color: GR }}>
          <p>Trajet introuvable.</p>
          <button onClick={() => router.push('/conducteur/trajets')} style={{ marginTop: '16px', padding: '10px 20px', background: E, color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
            Retour aux trajets
          </button>
        </div>
      </ConducteurLayout>
    );
  }

  // ✅ Vérifier si l'heure de départ est déjà passée
  const maintenant = new Date();
  const dateOnly = trajet.dateDepart.split(' ')[0];
  const depart = new Date(`${dateOnly}T${trajet.heureDepart}`);
  const diffMinutes = Math.round((depart.getTime() - maintenant.getTime()) / (1000 * 60));
  const departPasse = diffMinutes <= 0;

  // ✅ Si on n'est pas encore dans la fenêtre de ramassage (sauf si départ déjà passé, EN_ATTENTE_DEPART ou EN_COURS)
  if (!departPasse && !estDansFenetreRamassage(trajet.dateDepart, trajet.heureDepart) && trajet.statut !== 'EN_ATTENTE_DEPART' && trajet.statut !== 'EN_COURS') {
    const heures = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    return (
      <ConducteurLayout>
        <div style={{ maxWidth: '600px', margin: '40px auto', padding: '40px 24px', textAlign: 'center', background: darkMode ? '#1A1A1A' : '#FFFFFF', borderRadius: '16px', border: `1px solid ${darkMode ? '#2A2A2A' : BD}` }}>
          <div style={{ width: '80px', height: '80px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="clock" size={64} color={AM} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: darkMode ? '#FFFFFF' : BK, marginBottom: '8px' }}>
            Trop tôt pour la carte de ramassage
          </h2>
          <p style={{ color: GR, marginBottom: '24px', lineHeight: '1.6' }}>
            La carte de ramassage sera disponible <strong>10 minutes avant le départ</strong>.
          </p>
          <div style={{ padding: '16px', background: darkMode ? '#2D2D2D' : EL, borderRadius: '12px', marginBottom: '24px' }}>
            <div style={{ fontSize: '13px', color: GR, marginBottom: '4px' }}>Départ prévu dans</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: E }}>
              {heures > 0 && `${heures}h `}{minutes}min
            </div>
            <div style={{ fontSize: '13px', color: GR, marginTop: '8px' }}>
              à {trajet.heureDepart}
            </div>
          </div>
          <button onClick={() => router.push('/conducteur/trajets')} style={{ padding: '12px 24px', background: E, color: '#FFF', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>
            Retour à mes trajets
          </button>
        </div>
      </ConducteurLayout>
    );
  }

  const depCoords: [number, number] = (trajet.pointDepartLat && trajet.pointDepartLng) 
    ? [trajet.pointDepartLat, trajet.pointDepartLng]
    : VILLES_COORDS[trajet.villeDepart] || [3.8480, 11.5021];
  const arrCoords: [number, number] = (trajet.pointArriveeLat && trajet.pointArriveeLng) 
    ? [trajet.pointArriveeLat, trajet.pointArriveeLng]
    : VILLES_COORDS[trajet.villeArrivee] || [4.0483, 9.7043];
  const center: [number, number] = driverPos || [(depCoords[0] + arrCoords[0]) / 2, (depCoords[1] + arrCoords[1]) / 2];
  const distance = Math.sqrt(Math.pow(arrCoords[0] - depCoords[0], 2) + Math.pow(arrCoords[1] - depCoords[1], 2));
  const zoom = distance < 1 ? 11 : distance < 3 ? 9 : 8;

  const googleMapsLink = getGoogleMapsLink(depCoords, arrCoords);

  return (
    <ConducteurLayout>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px 16px 40px' }}>
        
        {/* Header */}
        <button 
          onClick={() => router.back()} 
          style={{ 
            marginBottom: '16px', background: 'transparent', border: 'none', color: E, 
            cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' 
          }}
        >
          <Icon name="arrowLeft" size={16} /> Retour
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: darkMode ? '#FFFFFF' : BK, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="map" size={24} /> Carte de ramassage
            </h1>
            <p style={{ fontSize: '14px', color: GR, margin: 0 }}>
              {passagers.length} passager{passagers.length > 1 ? 's' : ''} à récupérer
            </p>
          </div>
          <a 
            href={googleMapsLink} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', borderRadius: '10px',
              background: `linear-gradient(135deg, ${E}, ${ED})`,
              color: '#FFF', textDecoration: 'none', fontSize: '14px', fontWeight: '700',
              boxShadow: '0 4px 12px rgba(13, 158, 126, 0.3)'
            }}
          >
            <Icon name="navigation" size={16} color="#FFF" />
            Ouvrir Google Maps
          </a>
        </div>

        {/* Résumé du trajet */}
        <div style={{ 
          background: darkMode ? '#1A1A1A' : '#FFFFFF', borderRadius: '16px', padding: '20px', 
          marginBottom: '20px', border: `1px solid ${darkMode ? '#2A2A2A' : BD}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' 
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: GR, marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase' }}>Départ</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: darkMode ? '#FFFFFF' : BK, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="mapPin" size={18} color="#16A34A" /> {trajet.villeDepart} {trajet.quartierDepart && `(${trajet.quartierDepart})`}
              </div>
              <div style={{ fontSize: '13px', color: GR, marginTop: '2px' }}>
                <Icon name="clock" size={12} /> {trajet.heureDepart}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: GR, marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase' }}>Arrivée</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: darkMode ? '#FFFFFF' : BK, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="mapPin" size={18} color="#DC2626" /> {trajet.villeArrivee} {trajet.quartierArrivee && `(${trajet.quartierArrivee})`}
              </div>
              {trajet.heureArriveeEstimee && (
                <div style={{ fontSize: '13px', color: GR, marginTop: '2px' }}>
                  <Icon name="clock" size={12} /> {typeof trajet.heureArriveeEstimee === 'string' ? trajet.heureArriveeEstimee : trajet.heureArriveeEstimee.slice(0, 5)}
                </div>
              )}
            </div>
            <div>
              <div style={{ fontSize: '12px', color: GR, marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase' }}>Places</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: E }}>
                {passagers.reduce((acc, p) => acc + p.placesReservees, 0)} / {trajet.placesDisponibles}
              </div>
              <div style={{ fontSize: '13px', color: GR, marginTop: '2px' }}>
                <Icon name="users" size={12} /> {passagers.length} passager{passagers.length > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Carte */}
        <div style={{ 
          borderRadius: '16px', overflow: 'hidden', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: `1px solid ${darkMode ? '#2A2A2A' : BD}`, 
          height: '420px', marginBottom: '24px' 
        }}>
          <CarteRamassage
            center={center}
            zoom={zoom}
            departure={depCoords}
            arrival={arrCoords}
            departureLabel={`${trajet.villeDepart}${trajet.quartierDepart ? ` (${trajet.quartierDepart})` : ''}`}
            arrivalLabel={`${trajet.villeArrivee}${trajet.quartierArrivee ? ` (${trajet.quartierArrivee})` : ''}`}
            color={E}
            driverPosition={driverPos}
            driverLabel={`Position conducteur`}
          />
        </div>

        {/* Liste des passagers - Tableau compact */}
        <div>
          <h3 style={{ 
            fontSize: '14px', fontWeight: '700', color: darkMode ? '#9CA3AF' : GR, 
            marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' 
          }}>
            Passagers à récupérer ({passagers.length})
          </h3>

          {passagers.length === 0 ? (
            <div style={{ 
              textAlign: 'center', padding: '40px 20px', 
              background: darkMode ? '#1A1A1A' : '#FFF', borderRadius: '12px', 
              border: `1px dashed ${BD}` 
            }}>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: EL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="users" size={30} color={E} />
                </div>
              </div>
              <p style={{ color: GR, fontSize: '14px', margin: 0 }}>
                Aucun passager confirmé pour ce trajet.<br />
                Vous pouvez partir sans problème.
              </p>
            </div>
          ) : (
            <div style={{ 
              background: darkMode ? '#1A1A1A' : '#FFFFFF', borderRadius: '12px', 
              border: `1px solid ${darkMode ? '#2A2A2A' : BD}`, overflow: 'hidden' 
            }}>
              {/* Table header */}
              <div style={{ 
                display: 'grid', gridTemplateColumns: '40px 1fr 80px 100px',
                padding: '10px 16px', background: darkMode ? '#2D2D2D' : '#F9FAFB',
                borderBottom: `1px solid ${darkMode ? '#333' : BD}`,
                fontSize: '11px', fontWeight: '700', color: GR, textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                <span>#</span>
                <span>Nom</span>
                <span style={{ textAlign: 'center' }}>Places</span>
                <span style={{ textAlign: 'right' }}>Actions</span>
              </div>
              {passagers.map((passager, i) => (
                <div 
                  key={passager.reservationId}
                  style={{
                    display: 'grid', gridTemplateColumns: '40px 1fr 80px 100px',
                    alignItems: 'center', padding: '10px 16px',
                    borderBottom: i < passagers.length - 1 ? `1px solid ${darkMode ? '#222' : '#F3F4F6'}` : 'none',
                    background: i % 2 === 0 ? 'transparent' : (darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)')
                  }}
                >
                  <div style={{ 
                    width: '28px', height: '28px', borderRadius: '50%', 
                    background: `linear-gradient(135deg, ${E}, ${ED})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: '800', color: '#FFF'
                  }}>
                    {passager.photo ? (
                      <img src={passager.photo.startsWith('http') ? passager.photo : `/uploads/profils/${passager.photo}`}
                        alt="" onError={(e) => (e.currentTarget.style.display = 'none')}
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <>{passager.prenom.charAt(0)}{passager.nom.charAt(0)}</>
                    )}
                  </div>
                  <div style={{ minWidth: 0, marginLeft: '8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: darkMode ? '#FFF' : BK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {passager.prenom} {passager.nom}
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: E, textAlign: 'center' }}>
                    {passager.placesReservees}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    {passager.telephone && (
                      <a href={`tel:${passager.telephone}`} style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: EL, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        textDecoration: 'none', transition: 'all 0.2s'
                      }} title={`Appeler ${passager.prenom}`}>
                        <Icon name="phone" size={14} color={E} />
                      </a>
                    )}
                    <a href={`https://www.google.com/maps/dir/?api=1&origin=${depCoords[0]},${depCoords[1]}&destination=${arrCoords[0]},${arrCoords[1]}&travelmode=driving`}
                      target="_blank" rel="noopener noreferrer"
                      style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        textDecoration: 'none', transition: 'all 0.2s'
                      }} title={`Naviguer vers ${passager.prenom}`}>
                      <Icon name="navigation" size={14} color="#3B82F6" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bouton d'action rapide : Démarrer le trajet */}
        {trajet.statut === 'EN_ATTENTE_DEPART' && (
          <div style={{ marginTop: '24px', padding: '16px', background: AM + '20', borderRadius: '12px', border: `1px solid ${AM}`, textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
              <Icon name="alert" size={18} color={AM} />
              <span style={{ fontSize: '14px', fontWeight: '700', color: AM }}>Départ imminent</span>
            </div>
            <p style={{ fontSize: '13px', color: GR, margin: '0 0 12px' }}>
              Une fois tous les passagers récupérés, démarrez le trajet pour activer le suivi GPS.
            </p>
            <button 
              onClick={() => router.push(`/conducteur/trajets/${id}/demarrer`)}
              style={{
                padding: '12px 24px', borderRadius: '10px', border: 'none',
                background: `linear-gradient(135deg, ${E}, ${ED})`,
                color: '#FFF', fontSize: '15px', fontWeight: '700', cursor: 'pointer',
                boxShadow: `0 4px 15px rgba(13,158,126,0.3)`
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="navigation" size={18} color="#FFF" />
                Démarrer le trajet
              </span>
            </button>
          </div>
        )}

      </div>
      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </ConducteurLayout>
  );
}