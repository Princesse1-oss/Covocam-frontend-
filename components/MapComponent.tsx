'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import LegendeCarte from './LegendeCarte';
import RouteProgressBand from './RouteProgressBand';
import { DepartIcon, ArriveeIcon, VoitureIcon } from './mapIcons';
import SvgIcon from './SvgIcon';

// Fix pour les icônes Leaflet dans Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ==========================================
// ICÔNES SVG PERSONNALISÉES COVOCAM
// ==========================================
const createSvgIcon = (svgContent: string, size: number = 32) => {
  return new L.DivIcon({
    className: 'custom-svg-icon',
    html: `<div style="display: flex; align-items: center; justify-content: center; width: ${size}px; height: ${size}px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));">${svgContent}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size]
  });
};

const departureIcon = createSvgIcon(`
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#10B981" stroke="#FFFFFF" stroke-width="2"/>
    <text x="12" y="16" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle" font-family="sans-serif">D</text>
  </svg>
`, 32);

const arrivalIcon = createSvgIcon(`
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#EF4444" stroke="#FFFFFF" stroke-width="2"/>
    <text x="12" y="16" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle" font-family="sans-serif">A</text>
  </svg>
`, 32);

const driverIcon = createSvgIcon(`
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="11" fill="#0D9E7E" stroke="#FFFFFF" stroke-width="2"/>
    <path d="M7 12L10 15L17 8" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`, 40);


function MapUpdater({ currentPosition }: { currentPosition?: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (currentPosition) {
      // Glisse doucement vers la nouvelle position du conducteur
      map.flyTo(currentPosition, 14, { duration: 1.5 });
    }
  }, [currentPosition, map]);
  return null;
}

// ==========================================
// COMPOSANT PRINCIPAL
// ==========================================
interface MapComponentProps {
  departure?: { lat: number; lng: number; name: string };
  arrival?: { lat: number; lng: number; name: string };
  currentPosition?: { lat: number; lng: number };
  showRoute?: boolean;
  height?: string;
  zoom?: number;
}

const CAMEROON_CENTER: [number, number] = [5.7, 12.5];
const DEFAULT_ZOOM = 6;

// Limites de la carte : Cameroun uniquement
const CAMEROON_BOUNDS: [[number, number], [number, number]] = [
  [1.8, 8.3],
  [13.3, 16.5],
];
const CAMEROON_MIN_ZOOM = 6;

export default function MapComponent({
  departure,
  arrival,
  currentPosition,
  showRoute = true,
  height = '400px',
  zoom = DEFAULT_ZOOM,
}: MapComponentProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <span style={{ color: '#6b7280', fontSize: '14px' }}>Chargement de la carte...</span>
      </div>
    );
  }

  // Coordonnées des villes camerounaises principales
  const cityCoordinates: { [key: string]: [number, number] } = {
    'Yaoundé': [3.848, 11.502],
    'Douala': [4.0483, 9.7043],
    'Bamenda': [5.9631, 10.1584],
    'Buea': [4.155, 9.239],
    'Garoua': [9.301, 13.393],
    'Maroua': [10.591, 14.315],
    'Ngaoundéré': [7.316, 13.578],
    'Bafoussam': [5.958, 10.417],
    'Kribi': [2.938, 9.912],
    'Ebolowa': [2.916, 11.141],
  };

  const getCityCoordinates = (cityName?: string): [number, number] | null => {
    if (!cityName) return null;
    return cityCoordinates[cityName] || null;
  };

  const departureCoords = (departure?.lat && departure?.lng) 
    ? [departure.lat, departure.lng] as [number, number]
    : getCityCoordinates(departure?.name);
    
  const arrivalCoords = (arrival?.lat && arrival?.lng)
    ? [arrival.lat, arrival.lng] as [number, number]
    : getCityCoordinates(arrival?.name);
    
  const currentCoords = (currentPosition?.lat && currentPosition?.lng)
    ? [currentPosition.lat, currentPosition.lng] as [number, number]
    : null;

  const routePoints: [number, number][] = [];
  if (departureCoords) routePoints.push(departureCoords);
  if (currentCoords) routePoints.push(currentCoords);
  if (arrivalCoords) routePoints.push(arrivalCoords);

  return (
    <div style={{ borderRadius: '16px', overflow: 'hidden', border: '2px solid #0D9E7E' }}>
      <div style={{ height }}>
        <MapContainer
          center={currentCoords || departureCoords || CAMEROON_CENTER}
          zoom={currentCoords ? 14 : zoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          maxBounds={CAMEROON_BOUNDS}
          maxBoundsViscosity={1.0}
          minZoom={CAMEROON_MIN_ZOOM}
        >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* Ce composant permet à la carte de suivre le conducteur en temps réel */}
        <MapUpdater currentPosition={currentCoords} />

        {departureCoords && (
          <Marker position={departureCoords} icon={departureIcon}>
            <Popup>
              <div style={{ fontFamily: 'Arial, sans-serif' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <SvgIcon name="depart" size={16} color="#16A34A" /> <strong>Départ</strong>
                </div>
                {departure?.name || 'Point de départ'}
              </div>
            </Popup>
          </Marker>
        )}

        {arrivalCoords && (
          <Marker position={arrivalCoords} icon={arrivalIcon}>
            <Popup>
              <div style={{ fontFamily: 'Arial, sans-serif' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <SvgIcon name="arrivee" size={16} color="#DC2626" /> <strong>Arrivée</strong>
                </div>
                {arrival?.name || 'Point d\'arrivée'}
              </div>
            </Popup>
          </Marker>
        )}

        {currentCoords && (
          <Marker position={currentCoords} icon={driverIcon}>
            <Popup>
              <div style={{ fontFamily: 'Arial, sans-serif' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <SvgIcon name="car" size={16} color="#0D9E7E" /> <strong>Conducteur</strong>
                </div>
                Position en temps réel
              </div>
            </Popup>
          </Marker>
        )}

        {showRoute && routePoints.length >= 2 && (
          <Polyline
            positions={routePoints}
            pathOptions={{ color: '#0D9E7E', weight: 4, opacity: 0.8, dashArray: '10, 10' }}
          />
        )}
        </MapContainer>
      </div>

      <LegendeCarte
        items={[
          { label: 'Départ', svg: <DepartIcon size={22} /> },
          { label: 'Arrivée', svg: <ArriveeIcon size={22} /> },
          { label: 'Conducteur', svg: <VoitureIcon size={22} /> },
        ]}
      />
      <RouteProgressBand
        departure={departureCoords ? { lat: departureCoords[0], lng: departureCoords[1], name: departure?.name } : null}
        arrival={arrivalCoords ? { lat: arrivalCoords[0], lng: arrivalCoords[1], name: arrival?.name } : null}
        position={currentCoords ? { lat: currentCoords[0], lng: currentCoords[1] } : null}
        label="Votre position"
      />
    </div>
  );
}