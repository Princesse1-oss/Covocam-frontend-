'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import SvgIcon from './SvgIcon';

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
const CAMEROON_MIN_ZOOM = 6;

const departIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background: #16A34A; width: 40px; height: 40px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.4); display: flex; align-items: center; justify-content: center;">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 6v6l4 2" stroke="white" stroke-width="2" fill="none"/>
    </svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const arriveeIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background: #DC2626; width: 40px; height: 40px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4); display: flex; align-items: center; justify-content: center;">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 8v8M8 12h8" stroke="white" stroke-width="2" fill="none"/>
    </svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timeout = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timeout);
  }, [map]);
  return null;
}

interface CarteRamassageProps {
  center: [number, number];
  zoom: number;
  departure: [number, number];
  arrival: [number, number];
  departureLabel: string;
  arrivalLabel: string;
  color?: string;
  driverPosition?: [number, number] | null;
  driverLabel?: string;
  passengerPositions?: { id: number; nom: string; prenom: string; lat: number; lng: number; photo?: string }[];
  onRecenter?: () => void;
}

export default function CarteRamassage({
  center,
  zoom,
  departure,
  arrival,
  departureLabel,
  arrivalLabel,
  color = '#0D9E7E',
  driverPosition = null,
  driverLabel = 'Position actuelle',
  passengerPositions = [],
  onRecenter,
}: CarteRamassageProps) {
  const driverIcon = new L.DivIcon({
    className: 'custom-marker',
    html: `<div style="background: #3B82F6; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5); display: flex; align-items: center; justify-content: center; animation: pulse 2s infinite;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <path d="M5 11L6.5 6.5C6.8 5.6 7.6 5 8.6 5H15.4C16.4 5 17.2 5.6 17.5 6.5L19 11"/>
        <rect x="2" y="11" width="20" height="7" rx="2" fill="white" stroke="white"/>
        <circle cx="7" cy="18" r="2" fill="white"/>
        <circle cx="17" cy="18" r="2" fill="white"/>
      </svg>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

  const passengerIcon = new L.DivIcon({
    className: 'custom-marker',
    html: `<div style="background: #8B5CF6; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4); display: flex; align-items: center; justify-content: center;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  function RecenterButton({ target }: { target: [number, number] }) {
    const map = useMap();
    return (
      <button
        onClick={() => map.flyTo(target, zoom, { animate: true })}
        style={{
          position: 'absolute', bottom: '80px', right: '12px', zIndex: 1000,
          width: '36px', height: '36px', borderRadius: '8px', border: 'none',
          background: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        title="Recentrer sur ma position"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
        </svg>
      </button>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
      zoomControl={false}
      maxBounds={CAMEROON_BOUNDS}
      maxBoundsViscosity={1.0}
      minZoom={CAMEROON_MIN_ZOOM}
    >
      <ZoomControl position="bottomright" />
      <MapResizer />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />

      <Marker position={departure} icon={departIcon}>
        <Popup>
          <div style={{ fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <SvgIcon name="depart" size={16} color="#16A34A" /> Point de départ
          </div>
          <div style={{ fontSize: '13px', color: '#6B7280' }}>{departureLabel}</div>
        </Popup>
      </Marker>

      <Marker position={arrival} icon={arriveeIcon}>
        <Popup>
          <div style={{ fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <SvgIcon name="arrivee" size={16} color="#DC2626" /> Point d'arrivée
          </div>
          <div style={{ fontSize: '13px', color: '#6B7280' }}>{arrivalLabel}</div>
        </Popup>
      </Marker>

      {driverPosition && (
        <Marker position={driverPosition} icon={driverIcon}>
          <Popup>
            <div style={{ fontWeight: '600', fontSize: '14px', color: '#3B82F6' }}>
              🚗 {driverLabel}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
              {driverPosition[0].toFixed(5)}, {driverPosition[1].toFixed(5)}
            </div>
          </Popup>
        </Marker>
      )}

      {passengerPositions.map(p => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={passengerIcon}>
          <Popup>
            <div style={{ fontWeight: '600', fontSize: '13px', color: '#8B5CF6' }}>
              {p.prenom} {p.nom}
            </div>
            <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
              Passager
            </div>
          </Popup>
        </Marker>
      ))}

      <RecenterButton target={driverPosition || center} />

      <Polyline
        positions={[departure, arrival]}
        pathOptions={{ color, weight: 4, dashArray: '10, 10', opacity: 0.7 }}
      />
    </MapContainer>
  );
}
