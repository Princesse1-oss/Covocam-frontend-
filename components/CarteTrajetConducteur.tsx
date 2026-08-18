'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import LegendeCarte from './LegendeCarte';
import RouteProgressBand from './RouteProgressBand';
import { DepartIcon, ArriveeIcon, VoitureIcon, PassagerIcon } from './mapIcons';
import SvgIcon from './SvgIcon';

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

const passagerIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background: #3B82F6; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4); display: flex; align-items: center; justify-content: center;">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
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

interface CartePassagerItem {
  id: number;
  prenom: string;
  nom: string;
  latitude?: number;
  longitude?: number;
}

interface CarteTrajetConducteurProps {
  departure: [number, number];
  arrival: [number, number];
  departureName: string;
  arrivalName: string;
  passagers: CartePassagerItem[];
  driverPosition?: [number, number] | null;
  darkMode?: boolean;
}

export default function CarteTrajetConducteur({
  departure,
  arrival,
  departureName,
  arrivalName,
  passagers,
  driverPosition,
  darkMode = false,
}: CarteTrajetConducteurProps) {
  const center: [number, number] = driverPosition || departure || CAMEROON_CENTER;
  const zoom = driverPosition ? 12 : 10;

  return (
    <>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '500px', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={false}
        maxBounds={CAMEROON_BOUNDS}
        maxBoundsViscosity={1.0}
        minZoom={CAMEROON_MIN_ZOOM}
      >
        <ZoomControl position="bottomright" />
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

        {passagers.map((passager) => (
          passager.latitude && passager.longitude ? (
            <Marker
              key={passager.id}
              position={[passager.latitude, passager.longitude]}
              icon={passagerIcon}
            >
              <Popup>
                <div style={{ fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <SvgIcon name="passager" size={16} color="#3B82F6" /> {passager.prenom} {passager.nom}
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}

        {driverPosition && (
          <Marker position={driverPosition} icon={conducteurIcon}>
            <Popup>
              <div style={{ fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <SvgIcon name="car" size={16} color="#0D9E7E" /> Vous (position actuelle)
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
          { label: 'Passager', svg: <PassagerIcon size={22} /> },
        ]}
      />
      <RouteProgressBand
        darkMode={darkMode}
        departure={{ lat: departure[0], lng: departure[1], name: departureName }}
        arrival={{ lat: arrival[0], lng: arrival[1], name: arrivalName }}
        position={driverPosition ? { lat: driverPosition[0], lng: driverPosition[1] } : null}
        label="Vous avez parcouru"
      />
    </>
  );
}
