'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl, useMap } from 'react-leaflet';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import LegendeCarte from './LegendeCarte';
import RouteProgressBand from './RouteProgressBand';
import { DepartIcon, ArriveeIcon, VoitureIcon, PassagerIcon } from './mapIcons';
import SvgIcon from './SvgIcon';
import { useTheme } from '@/app/lib/ThemeContext';

const E = '#0D9E7E';

// Correction des icônes Leaflet par défaut
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Limites de la carte : Cameroun uniquement
const CAMEROON_BOUNDS: [[number, number], [number, number]] = [
  [1.8, 8.3],
  [13.3, 16.5],
];
const CAMEROON_CENTER: [number, number] = [5.7, 12.5];
const CAMEROON_MIN_ZOOM = 6;

const departIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background: #16A34A; width: 40px; height: 40px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.4); display: flex; align-items: center; justify-content: center;">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
      <line x1="4" y1="22" x2="4" y2="15"/>
    </svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const arriveeIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background: #DC2626; width: 40px; height: 40px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4); display: flex; align-items: center; justify-content: center;">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3" fill="white" stroke="none"/>
    </svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const conducteurIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background: ${E}; width: 40px; height: 40px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 12px rgba(13, 158, 126, 0.4); display: flex; align-items: center; justify-content: center;">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 11L6.5 6.5C6.8 5.6 7.6 5 8.6 5H15.4C16.4 5 17.2 5.6 17.5 6.5L19 11"/>
      <rect x="2" y="11" width="20" height="7" rx="2"/>
      <circle cx="7" cy="18" r="2" fill="white" stroke="none"/>
      <circle cx="17" cy="18" r="2" fill="white" stroke="none"/>
    </svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const userIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background: #3B82F6; width: 40px; height: 40px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); display: flex; align-items: center; justify-content: center;">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

interface CarteTrajetPassagerProps {
  departure: [number, number];
  arrival: [number, number];
  departureName: string;
  arrivalName: string;
  driverPosition?: [number, number] | null;
  userPosition?: [number, number] | null;
  driverName?: string;
  darkMode?: boolean;
}

// Boutons flottants pour recentrer la carte (conducteur / utilisateur)
function RecenterButtons({
  driverPosition,
  userPosition,
  departure,
  darkMode,
}: {
  driverPosition?: [number, number] | null;
  userPosition?: [number, number] | null;
  departure: [number, number];
  darkMode?: boolean;
}) {
  const map = useMap();
  const hasFocused = useRef(false);

  const focusDriver = () => {
    const target = driverPosition || departure;
    map.flyTo(target, driverPosition ? 13 : 12, { duration: 1 });
  };

  const focusUser = () => {
    if (userPosition) {
      map.flyTo(userPosition, 14, { duration: 1 });
    }
  };

  // Ne recentrer qu'une seule fois au premier signal GPS pour ne pas gêner la manipulation manuelle
  useEffect(() => {
    if (hasFocused.current) return;
    const target = driverPosition || userPosition;
    if (target) {
      hasFocused.current = true;
      map.flyTo(target, driverPosition ? 13 : 12, { duration: 1 });
    }
  }, [map, driverPosition, userPosition]);

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
  const { t, lang } = useTheme();
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
      <button style={dirBtn} onClick={() => pan(0, -STEP)} aria-label={t('moveUp')} title={t('moveUp')}>
        <SvgIcon name="chevronUp" size={18} />
      </button>
      <div />
      <button style={dirBtn} onClick={() => pan(-STEP, 0)} aria-label={t('moveLeft')} title={t('moveLeft')}>
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
      <button style={dirBtn} onClick={() => pan(STEP, 0)} aria-label={t('moveRight')} title={t('moveRight')}>
        <SvgIcon name="chevronRight" size={18} />
      </button>
      <div />
      <button style={dirBtn} onClick={() => pan(0, STEP)} aria-label={t('moveDown')} title={t('moveDown')}>
        <SvgIcon name="chevronDown" size={18} />
      </button>
      <div />
    </div>
  );
}

export default function CarteTrajetPassager({
  departure,
  arrival,
  departureName,
  arrivalName,
  driverPosition,
  userPosition,
  driverName,
  darkMode = false,
}: CarteTrajetPassagerProps) {
  const center: [number, number] = driverPosition || userPosition || departure || CAMEROON_CENTER;
  const zoom = driverPosition ? 12 : 10;

  return (
    <div style={{ position: 'relative' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '520px', width: '100%' }}
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
          driverPosition={driverPosition}
          userPosition={userPosition}
          departure={departure}
          darkMode={darkMode}
        />
        <PanControls darkMode={darkMode} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={departure} icon={departIcon}>
          <Popup>
            <div style={{ fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <SvgIcon name="depart" size={16} color="#10B981" /> Départ: {departureName}
            </div>
          </Popup>
        </Marker>

        <Marker position={arrival} icon={arriveeIcon}>
          <Popup>
            <div style={{ fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <SvgIcon name="arrivee" size={16} color="#EF4444" /> Arrivée: {arrivalName}
            </div>
          </Popup>
        </Marker>

        <Polyline positions={[departure, arrival]} color={E} weight={4} opacity={0.8} />

        {driverPosition && (
          <Marker position={driverPosition} icon={conducteurIcon}>
            <Popup>
              <div style={{ fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <SvgIcon name="car" size={16} color="#0D9E7E" /> {driverName || 'Conducteur'}
              </div>
            </Popup>
          </Marker>
        )}

        {userPosition && (
          <Marker position={userPosition} icon={userIcon}>
            <Popup>
              <div style={{ fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <SvgIcon name="location" size={16} color="#3B82F6" /> Vous êtes ici
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      <LegendeCarte
        darkMode={darkMode}
        items={[
          { label: 'Départ', svg: <DepartIcon size={22} /> },
          { label: 'Arrivée', svg: <ArriveeIcon size={22} /> },
          { label: 'Conducteur', svg: <VoitureIcon size={22} /> },
          { label: 'Vous', svg: <PassagerIcon size={22} /> },
        ]}
      />
      <RouteProgressBand
        darkMode={darkMode}
        departure={{ lat: departure[0], lng: departure[1], name: departureName }}
        arrival={{ lat: arrival[0], lng: arrival[1], name: arrivalName }}
        position={driverPosition ? { lat: driverPosition[0], lng: driverPosition[1] } : null}
        label="Le conducteur a parcouru"
      />
    </div>
  );
}
