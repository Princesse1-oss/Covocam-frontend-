'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl, useMap } from 'react-leaflet';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import SvgIcon from '../SvgIcon';

const GREEN = '#0D9E7E';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CAMEROON_BOUNDS: [[number, number], [number, number]] = [
  [1.8, 8.3],
  [13.3, 16.5],
];
const CAMEROON_CENTER: [number, number] = [5.7, 12.5];
const CAMEROON_MIN_ZOOM = 6;

const conducteurIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background: ${GREEN}; width: 40px; height: 40px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 12px rgba(13,158,126,0.4); display: flex; align-items: center; justify-content: center;">
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

const createPhotoIcon = (photoUrl: string | null | undefined, nom: string) => {
  const initials = nom ? nom.substring(0, 2).toUpperCase() : '??';
  const bg = photoUrl
    ? `<img src="${photoUrl}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>`
    : '';
  const fallback = `<div style="width:100%;height:100%;border-radius:50%;background:linear-gradient(135deg,${GREEN},#0A7B62);display:${photoUrl ? 'none' : 'flex'};align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;">${initials}</div>`;
  return new L.DivIcon({
    className: 'custom-photo-marker',
    html: `<div style="width:44px;height:44px;border-radius:50%;border:3px solid white;box-shadow:0 3px 12px rgba(13,158,126,0.4);overflow:hidden;position:relative;">${bg}${fallback}<div style="position:absolute;bottom:-1px;right:-1px;width:14px;height:14px;border-radius:50%;background:${GREEN};border:2px solid white;display:flex;align-items:center;justify-content:center;"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M5 11L6.5 6.5C6.8 5.6 7.6 5 8.6 5H15.4C16.4 5 17.2 5.6 17.5 6.5L19 11"/><rect x="2" y="11" width="20" height="7" rx="2"/></svg></div></div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
};

const departMiniIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background:#10B981;width:18px;height:18px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
    <svg width="8" height="8" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="10"/></svg>
  </div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const arriveeMiniIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background:#EF4444;width:18px;height:18px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
    <svg width="8" height="8" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="10"/></svg>
  </div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export interface ConductorPosition {
  id: number;
  nom: string;
  prenom?: string;
  lat: number;
  lng: number;
  trajetId: number;
  statut: string;
  villeDepart: string;
  villeArrivee: string;
  photo?: string | null;
  pointDepartLat?: number | null;
  pointDepartLng?: number | null;
  pointArriveeLat?: number | null;
  pointArriveeLng?: number | null;
  quartierDepart?: string | null;
  quartierArrivee?: string | null;
  heureDepart?: string | null;
}

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
      <button style={dirBtn} onClick={() => pan(0, -STEP)} aria-label="Haut" title="Haut">
        <SvgIcon name="chevronUp" size={18} />
      </button>
      <div />
      <button style={dirBtn} onClick={() => pan(-STEP, 0)} aria-label="Gauche" title="Gauche">
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
      <button style={dirBtn} onClick={() => pan(STEP, 0)} aria-label="Droite" title="Droite">
        <SvgIcon name="chevronRight" size={18} />
      </button>
      <div />
      <button style={dirBtn} onClick={() => pan(0, STEP)} aria-label="Bas" title="Bas">
        <SvgIcon name="chevronDown" size={18} />
      </button>
      <div />
    </div>
  );
}

function RecenterButton({ darkMode }: { darkMode?: boolean }) {
  const map = useMap();

  const recenter = () => {
    map.flyTo(CAMEROON_CENTER, 7, { duration: 1 });
  };

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

  const ZoomIn = () => (
    <button onClick={() => map.zoomIn()} aria-label="Zoom in" style={{ ...btnBase, top: '12px', left: '12px', width: '38px', height: '38px' }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    </button>
  );

  const ZoomOut = () => (
    <button onClick={() => map.zoomOut()} aria-label="Zoom out" style={{ ...btnBase, top: '56px', left: '12px', width: '38px', height: '38px' }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
    </button>
  );

  return (
    <>
      <ZoomIn />
      <ZoomOut />
      <button
        onClick={recenter}
        aria-label="Recentrer sur le Cameroun"
        style={{ ...btnBase, top: '12px', right: '12px' }}
        title="Recentrer"
      >
        <SvgIcon name="target" size={20} />
      </button>
    </>
  );
}

function MapUpdater({ positions }: { positions: ConductorPosition[] }) {
  const map = useMap();
  const hasFit = useRef(false);

  useEffect(() => {
    if (positions.length > 0 && !hasFit.current) {
      hasFit.current = true;
      const allPoints: [number, number][] = [];
      positions.forEach(p => {
        allPoints.push([p.lat, p.lng]);
        if (p.pointDepartLat && p.pointDepartLng) allPoints.push([p.pointDepartLat, p.pointDepartLng]);
        if (p.pointArriveeLat && p.pointArriveeLng) allPoints.push([p.pointArriveeLat, p.pointArriveeLng]);
      });
      if (allPoints.length === 1) {
        map.flyTo(allPoints[0], 12, { duration: 1 });
      } else {
        map.fitBounds(allPoints, { padding: [50, 50], maxZoom: 12 });
      }
    }
  }, [positions, map]);

  return null;
}

interface AdminPositionsMapProps {
  positions: ConductorPosition[];
  darkMode?: boolean;
}

export default function AdminPositionsMap({ positions, darkMode = false }: AdminPositionsMapProps) {
  const tileUrl = darkMode
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <div style={{ position: 'relative', height: 'calc(100vh - 140px)', width: '100%', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
      <MapContainer
        center={CAMEROON_CENTER}
        zoom={7}
        style={{ height: '100%', width: '100%' }}
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
        <RecenterButton darkMode={darkMode} />
        <PanControls darkMode={darkMode} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={tileUrl}
        />
        <MapUpdater positions={positions} />
        {positions.map(p => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={createPhotoIcon(p.photo, p.nom)}>
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ position: 'relative', width: '36px', height: '36px', flexShrink: 0 }}>
                    {p.photo ? (
                      <img src={p.photo.startsWith('http') ? p.photo : `/uploads/profils/${p.photo}`} alt="" onError={e => e.currentTarget.style.display='none'} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 10, border: '2px solid #fff' }} />
                    ) : null}
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `linear-gradient(135deg, ${GREEN}, #0A7B62)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#FFF', position: 'relative', zIndex: 1 }}>
                      {p.prenom?.charAt(0)}{p.nom?.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '14px' }}>{p.prenom} {p.nom}</div>
                    <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <SvgIcon name="car" size={12} color={GREEN} /> Trajet #{p.trajetId}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <SvgIcon name="depart" size={12} color="#10B981" /> {p.villeDepart}{p.quartierDepart ? ` (${p.quartierDepart})` : ''}{p.heureDepart ? ` - ${p.heureDepart}` : ''}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <SvgIcon name="arrivee" size={12} color="#EF4444" /> {p.villeArrivee}{p.quartierArrivee ? ` (${p.quartierArrivee})` : ''}
                  </div>
                  <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{
                      display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%',
                      background: p.statut === 'EN_COURS' ? '#10B981' : '#F59E0B',
                    }} />
                    <span style={{ fontWeight: '600', color: p.statut === 'EN_COURS' ? '#10B981' : '#F59E0B' }}>
                      {p.statut === 'EN_COURS' ? 'En cours' : p.statut}
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        {positions.map(p => {
          const depLat = p.pointDepartLat;
          const depLng = p.pointDepartLng;
          const arrLat = p.pointArriveeLat;
          const arrLng = p.pointArriveeLng;
          return [
            depLat && depLng ? (
              <Marker key={`dep-${p.trajetId}`} position={[depLat, depLng]} icon={departMiniIcon}>
                <Popup><div style={{ fontSize: '12px', fontWeight: '600', color: '#10B981' }}>Départ: {p.villeDepart}{p.quartierDepart ? ` (${p.quartierDepart})` : ''}</div></Popup>
              </Marker>
            ) : null,
            arrLat && arrLng ? (
              <Marker key={`arr-${p.trajetId}`} position={[arrLat, arrLng]} icon={arriveeMiniIcon}>
                <Popup><div style={{ fontSize: '12px', fontWeight: '600', color: '#EF4444' }}>Arrivée: {p.villeArrivee}{p.quartierArrivee ? ` (${p.quartierArrivee})` : ''}</div></Popup>
              </Marker>
            ) : null,
            depLat && depLng && arrLat && arrLng ? (
              <Polyline key={`poly-${p.trajetId}`} positions={[[depLat, depLng], [arrLat, arrLng]]} pathOptions={{ color: GREEN, weight: 2, dashArray: '6, 6', opacity: 0.5 }} />
            ) : null,
          ];
        })}
      </MapContainer>
    </div>
  );
}
