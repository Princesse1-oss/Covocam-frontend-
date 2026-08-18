'use client';

import { DepartIcon, ArriveeIcon, VoitureIcon } from './mapIcons';

interface Point {
  lat: number;
  lng: number;
  name?: string;
}

interface RouteProgressBandProps {
  departure?: Point | null;
  arrival?: Point | null;
  position?: { lat: number; lng: number } | null;
  label?: string;
  darkMode?: boolean;
}

const toRad = (d: number) => (d * Math.PI) / 180;

const distanceKm = (a: Point, b: Point) => {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
};

const progressT = (p: { lat: number; lng: number }, a: Point, b: Point) => {
  const vx = b.lng - a.lng;
  const vy = b.lat - a.lat;
  const wx = p.lng - a.lng;
  const wy = p.lat - a.lat;
  const len2 = vx * vx + vy * vy;
  if (len2 === 0) return 0;
  return Math.max(0, Math.min(1, (wx * vx + wy * vy) / len2));
};

export default function RouteProgressBand({
  departure,
  arrival,
  position,
  label = 'Position actuelle',
  darkMode = false,
}: RouteProgressBandProps) {
  if (!departure || !arrival) return null;

  const totalKm = distanceKm(departure, arrival);
  const t = position ? progressT(position, departure, arrival) : 0;
  const pct = Math.round(t * 100);
  const parcourusKm = totalKm * t;

  const trackBg = darkMode ? '#2A2A2A' : '#E5E7EB';
  const textColor = darkMode ? '#FFFFFF' : '#0D0D0D';
  const textSecondary = darkMode ? '#9CA3AF' : '#6B7280';

  return (
    <div
      style={{
        padding: '16px 20px',
        background: darkMode ? '#1A1A1A' : '#FFFFFF',
        borderTop: `1px solid ${darkMode ? '#2A2A2A' : '#EBEBEB'}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <DepartIcon size={26} />
        <div style={{ flex: 1, position: 'relative', height: '32px' }}>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: '8px',
              transform: 'translateY(-50%)',
              background: trackBg,
              borderRadius: '999px',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              width: `${pct}%`,
              height: '8px',
              transform: 'translateY(-50%)',
              background: 'linear-gradient(90deg, #10B981, #0D9E7E)',
              borderRadius: '999px',
              transition: 'width 0.8s ease',
            }}
          />
          {position && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: `${pct}%`,
                transform: 'translate(-50%, -50%)',
                transition: 'left 0.8s ease',
              }}
            >
              <VoitureIcon size={30} />
            </div>
          )}
        </div>
        <ArriveeIcon size={26} />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '8px',
          fontSize: '12px',
          fontWeight: '600',
          color: textColor,
          gap: '12px',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {departure.name || 'Départ'}
        </span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {arrival.name || 'Arrivée'}
        </span>
      </div>

      {position && (
        <div
          style={{
            marginTop: '6px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: textSecondary,
          }}
        >
          <span>{label}</span>
          <span style={{ fontWeight: '700', color: '#0D9E7E' }}>
            {Math.round(parcourusKm)} km parcourus
          </span>
          <span>· {pct}% du trajet</span>
        </div>
      )}
    </div>
  );
}
