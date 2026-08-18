'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import LegendeCarte from './LegendeCarte';
import RouteProgressBand from './RouteProgressBand';
import { DepartIcon, ArriveeIcon, VoitureIcon, PassagerIcon } from './mapIcons';
import { estimatedDistanceKm, estimatedDurationMinutes, formatDistance, formatDuration } from './distanceUtils';
import SvgIcon from './SvgIcon';

// Limites de la carte : Cameroun uniquement
const CAMEROON_BOUNDS: [[number, number], [number, number]] = [
  [1.8, 8.3],
  [13.3, 16.5],
];
const CAMEROON_MIN_ZOOM = 6;

// Icônes SVG personnalisées
const createSVGIcon = (color: string, svgContent: string) => {
  return L.divIcon({
    className: 'custom-svg-icon',
    html: `<div style="background-color: ${color}; width: 40px; height: 40px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">${svgContent}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const SVG_DEPART = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>`;

const SVG_ARRIVEE = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;

const SVG_VOITURE = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17h14M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h8l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2M5 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm14 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>`;

const SVG_USER = `<svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

const departIcon = createSVGIcon('#10B981', SVG_DEPART);
const arriveeIcon = createSVGIcon('#EF4444', SVG_ARRIVEE);
const voitureIcon = createSVGIcon('#0D9E7E', SVG_VOITURE);
const userIcon = createSVGIcon('#3B82F6', SVG_USER);

interface CarteSuiviTrajetProps {
  trajetId: number;
  pointDepart: { lat: number; lng: number };
  pointArrivee: { lat: number; lng: number };
  heureDepart: string;
  forceActive?: boolean;
  onDriverSignal?: (hasSignal: boolean) => void;
}

// Boutons flottants pour recentrer (conducteur / ma position)
function RecenterButtons({
  positionConducteur,
  userPosition,
  pointDepart,
  darkMode,
}: {
  positionConducteur: { lat: number; lng: number } | null;
  userPosition: { lat: number; lng: number } | null;
  pointDepart: { lat: number; lng: number };
  darkMode?: boolean;
}) {
  const map = useMap();
  const hasFocused = useRef(false);

  const focusDriver = () => {
    if (positionConducteur) {
      map.flyTo([positionConducteur.lat, positionConducteur.lng], 15, { duration: 1 });
    } else {
      map.flyTo([pointDepart.lat, pointDepart.lng], 13, { duration: 1 });
    }
  };

  const focusUser = () => {
    if (userPosition) {
      map.flyTo([userPosition.lat, userPosition.lng], 14, { duration: 1 });
    }
  };

  // Ne recentrer qu'une seule fois au premier signal GPS pour ne pas gêner la manipulation manuelle
  useEffect(() => {
    if (hasFocused.current) return;
    const target = positionConducteur || userPosition;
    if (target) {
      hasFocused.current = true;
      map.flyTo([target.lat, target.lng], positionConducteur ? 14 : 13, { duration: 1 });
    }
  }, [map, positionConducteur, userPosition]);

  const btnBase: React.CSSProperties = {
    position: 'absolute',
    zIndex: 1000,
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: darkMode ? '#2A2A2A' : '#FFFFFF',
    color: darkMode ? '#FFFFFF' : '#0D0D0D',
    boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
    fontSize: '20px',
    lineHeight: 1,
  };

  return (
    <>
      <button
        onClick={focusDriver}
        aria-label="Recentrer sur le conducteur"
        style={{ ...btnBase, top: '12px', right: '12px' }}
        title="Recentrer sur le conducteur"
      >
        <SvgIcon name="target" size={20} />
      </button>
      {userPosition && (
        <button
          onClick={focusUser}
          aria-label="Recentrer sur ma position"
          style={{ ...btnBase, top: '62px', right: '12px' }}
          title="Recentrer sur ma position"
        >
          <SvgIcon name="location" size={20} />
        </button>
      )}
    </>
  );
}

// Pavé directionnel : boutons haut / bas / gauche / droite pour déplacer la carte
function PanControls({ darkMode }: { darkMode?: boolean }) {
  const map = useMap();
  const STEP = 160;

  const pan = (dx: number, dy: number) => {
    map.panBy([dx, dy], { animate: true });
  };

  const dirBtn: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: darkMode ? '#2A2A2A' : '#FFFFFF',
    color: darkMode ? '#FFFFFF' : '#0D0D0D',
    boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
    fontSize: '18px',
    lineHeight: 1,
    padding: 0,
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '16px',
        left: '12px',
        zIndex: 1000,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 40px)',
        gridTemplateRows: 'repeat(3, 40px)',
        gap: '4px',
      }}
    >
      <div />
      <button style={dirBtn} onClick={() => pan(0, -STEP)} aria-label="Déplacer vers le haut" title="Haut">
        <SvgIcon name="chevronUp" size={18} />
      </button>
      <div />
      <button style={dirBtn} onClick={() => pan(-STEP, 0)} aria-label="Déplacer vers la gauche" title="Gauche">
        <SvgIcon name="chevronLeft" size={18} />
      </button>
      <div
        style={{
          ...dirBtn,
          cursor: 'default',
          background: 'transparent',
          boxShadow: 'none',
          color: darkMode ? '#6B7280' : '#9CA3AF',
          fontSize: '11px',
          fontWeight: '700',
          borderRadius: '8px',
        }}
      >
        OK
      </div>
      <button style={dirBtn} onClick={() => pan(STEP, 0)} aria-label="Déplacer vers la droite" title="Droite">
        <SvgIcon name="chevronRight" size={18} />
      </button>
      <div />
      <button style={dirBtn} onClick={() => pan(0, STEP)} aria-label="Déplacer vers le bas" title="Bas">
        <SvgIcon name="chevronDown" size={18} />
      </button>
      <div />
    </div>
  );
}

export default function CarteSuiviTrajet({ 
  trajetId, 
  pointDepart, 
  pointArrivee, 
  heureDepart,
  forceActive = false,
  onDriverSignal
}: CarteSuiviTrajetProps) {
  const [positionConducteur, setPositionConducteur] = useState<{ lat: number; lng: number } | null>(null);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [trajetActive, setTrajetActive] = useState(false);
  const [timeUntilDeparture, setTimeUntilDeparture] = useState<string>('');
  const [showMap, setShowMap] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Position GPS du passager en temps réel
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => { /* Permission refusée ou indisponible : ignoré */ },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const [hours, minutes] = heureDepart.split(':').map(Number);
      const departure = new Date();
      departure.setHours(hours, minutes, 0, 0);
      
      const diff = departure.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeUntilDeparture('Départ en cours');
        return;
      }
      
      const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
      const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeUntilDeparture(`${hoursLeft}h ${minutesLeft}min`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    
    return () => clearInterval(timer);
  }, [heureDepart]);

  useEffect(() => {
    const checkIfShouldShowMap = () => {
      if (forceActive) {
        setShowMap(true);
        startTracking();
        return;
      }
      const now = new Date();
      const [hours, minutes] = heureDepart.split(':').map(Number);
      const departure = new Date();
      departure.setHours(hours, minutes, 0, 0);
      
      const diff = departure.getTime() - now.getTime();
      const fifteenMinutes = 15 * 60 * 1000;
      
      if (diff <= fifteenMinutes || diff < 0) {
        setShowMap(true);
        startTracking();
      }
    };

    checkIfShouldShowMap();
    const checkInterval = setInterval(checkIfShouldShowMap, 30000);
    
    return () => clearInterval(checkInterval);
  }, [heureDepart, forceActive]);

  const startTracking = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/trajets/${trajetId}/position-conducteur`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.position) {
            setPositionConducteur({
              lat: data.position.lat,
              lng: data.position.lng
            });
            setTrajetActive(data.trajet_active);
            onDriverSignal?.(true);
          } else {
            onDriverSignal?.(false);
          }
        } else {
          onDriverSignal?.(false);
        }
      } catch (error) {
        console.error('Erreur suivi position:', error);
      }
    }, 10000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Distance / temps jusqu'au départ et jusqu'à l'arrivée
  const depCoord: [number, number] = [pointDepart.lat, pointDepart.lng];
  const arrCoord: [number, number] = [pointArrivee.lat, pointArrivee.lng];

  const SPEED_DEPART = 40;
  const SPEED_ROUTE = 50;

  const userPos: [number, number] | null = userPosition ? [userPosition.lat, userPosition.lng] : null;
  const condPos: [number, number] | null = positionConducteur ? [positionConducteur.lat, positionConducteur.lng] : null;

  const distToDepart = userPos ? estimatedDistanceKm(userPos, depCoord) : null;
  const etaToDepart = distToDepart !== null ? estimatedDurationMinutes(distToDepart, SPEED_DEPART) : null;

  const arrivalOrigin = condPos || userPos || null;
  const distToArrival = arrivalOrigin ? estimatedDistanceKm(arrivalOrigin, arrCoord) : null;
  const etaToArrival = distToArrival !== null ? estimatedDurationMinutes(distToArrival, condPos ? SPEED_ROUTE : SPEED_DEPART) : null;

  if (!showMap) {
    return (
      <div style={{
        padding: '24px',
        background: '#FFFFFF',
        borderRadius: '16px',
        textAlign: 'center',
        border: '1px solid #EBEBEB',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          borderRadius: '50%', 
          background: '#E8F7F3', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 16px',
          color: '#0D9E7E'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/>
            <line x1="8" y1="2" x2="8" y2="18"/>
            <line x1="16" y1="6" x2="16" y2="22"/>
          </svg>
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0D0D0D', marginBottom: '8px' }}>
          Carte de suivi
        </h3>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>
          La carte s'activera 15 minutes avant le départ
        </p>
        <div style={{ 
          fontSize: '20px', 
          fontWeight: '800', 
          color: '#0D9E7E',
          background: '#E8F7F3',
          padding: '14px 20px',
          borderRadius: '12px',
          display: 'inline-block'
        }}>
          Départ dans {timeUntilDeparture}
        </div>
      </div>
    );
  }

  return (
    <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #EBEBEB', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <div style={{
        background: 'linear-gradient(135deg, #0D0D0D, #1a2e1a)',
        padding: '16px 20px',
        color: '#FFFFFF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ color: '#10B981' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="3 11 22 2 13 21 11 13 3 11"/>
            </svg>
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 4px' }}>
              Suivi en temps réel
            </h3>
            <p style={{ fontSize: '12px', margin: 0, opacity: 0.8, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: positionConducteur ? '#10B981' : '#F59E0B',
                display: 'inline-block',
                animation: positionConducteur ? 'pulse 2s infinite' : 'none'
              }}></span>
              {positionConducteur ? 'Conducteur en route' : 'En attente du signal conducteur'}
            </p>
          </div>
        </div>
        <div style={{
          background: '#0D9E7E',
          padding: '8px 14px',
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: '700'
        }}>
          {timeUntilDeparture}
        </div>
      </div>

      <MapContainer
        center={[pointDepart.lat, pointDepart.lng]}
        zoom={13}
        style={{ height: '460px', width: '100%' }}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        touchZoom={true}
        zoomControl={false}
        maxBounds={CAMEROON_BOUNDS}
        maxBoundsViscosity={1.0}
        minZoom={CAMEROON_MIN_ZOOM}
      >
        <ZoomControl position="bottomright" />
        <RecenterButtons
          positionConducteur={positionConducteur}
          userPosition={userPosition}
          pointDepart={pointDepart}
        />
        <PanControls />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[pointDepart.lat, pointDepart.lng]} icon={departIcon}>
          <Popup>
            <strong>Point de départ</strong><br />
            {pointDepart.lat.toFixed(6)}, {pointDepart.lng.toFixed(6)}
          </Popup>
        </Marker>

        <Marker position={[pointArrivee.lat, pointArrivee.lng]} icon={arriveeIcon}>
          <Popup>
            <strong>Point d'arrivée</strong><br />
            {pointArrivee.lat.toFixed(6)}, {pointArrivee.lng.toFixed(6)}
          </Popup>
        </Marker>

        {positionConducteur && (
          <Marker position={[positionConducteur.lat, positionConducteur.lng]} icon={voitureIcon}>
            <Popup>
              <strong>Conducteur</strong><br />
              Position en temps réel
            </Popup>
          </Marker>
        )}

        {userPosition && (
          <Marker position={[userPosition.lat, userPosition.lng]} icon={userIcon}>
            <Popup>
              <strong>Vous</strong><br />
              Position en temps réel
            </Popup>
          </Marker>
        )}

        <Polyline
          positions={[
            [pointDepart.lat, pointDepart.lng],
            [pointArrivee.lat, pointArrivee.lng]
          ]}
          pathOptions={{ color: '#0D9E7E', weight: 3, opacity: 0.6, dashArray: '10, 10' }}
        />
      </MapContainer>

      {/* Stats temps réel : distance & temps estimés */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', padding: '16px', background: '#FFFFFF', borderTop: '1px solid #EBEBEB' }}>
        <div style={{
          background: '#F9FAFB',
          borderRadius: '12px',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
            background: '#E8F7F3', color: '#0D9E7E', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <SvgIcon name="location" size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Distance au départ
            </div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#0D0D0D' }}>
              {distToDepart !== null ? (
                <>
                  {formatDistance(distToDepart)}{' '}
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>
                    · ≈ {formatDuration(etaToDepart!)}
                  </span>
                </>
              ) : (
                'En attente du GPS…'
              )}
            </div>
          </div>
        </div>

        <div style={{
          background: '#F9FAFB',
          borderRadius: '12px',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
            background: '#F3F4F6', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <SvgIcon name="flag" size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Arrivée estimée
            </div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#0D0D0D' }}>
              {distToArrival !== null ? (
                <>
                  {formatDistance(distToArrival)}{' '}
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>
                    · ≈ {formatDuration(etaToArrival!)}
                  </span>
                </>
              ) : (
                'En attente du GPS…'
              )}
            </div>
          </div>
        </div>
      </div>

      <LegendeCarte
        items={[
          { label: 'Départ', svg: <DepartIcon size={22} /> },
          { label: 'Arrivée', svg: <ArriveeIcon size={22} /> },
          { label: 'Conducteur', svg: <VoitureIcon size={22} /> },
          { label: 'Vous', svg: <PassagerIcon size={22} /> },
        ]}
      />
      <RouteProgressBand
        departure={{ lat: pointDepart.lat, lng: pointDepart.lng, name: 'Point de départ' }}
        arrival={{ lat: pointArrivee.lat, lng: pointArrivee.lng, name: "Point d'arrivée" }}
        position={positionConducteur}
        label="Le conducteur a parcouru"
      />
    </div>
  );
}
