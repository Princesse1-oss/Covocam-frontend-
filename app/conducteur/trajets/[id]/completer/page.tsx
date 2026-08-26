'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ConducteurLayout from '../../../../../components/conducteur/ConducteurLayout';
import { useTheme } from '@/app/lib/ThemeContext';

const API_URL = '/api';
const E = '#0D9E7E';
const EL = '#E8F7F3';
const ED = '#0A7B62';
const BK = '#0D0D0D';
const GR = '#6B7280';
const BD = '#EBEBEB';
const AM = '#F59E0B';
const AL = '#FEF3C7';
const RD = '#DC2626';
const RL = '#FEE2E2';

const Icon = ({ name, size = 20, color = E }: { name: string; size?: number; color?: string }) => {
  const s = { width: size, height: size, display: 'inline-block', verticalAlign: 'middle' } as React.CSSProperties;
  const icons: Record<string, React.ReactNode> = {
    car: (<svg style={s} viewBox="0 0 24 24" fill="none"><path d="M5 11L6.5 6.5C6.8 5.6 7.6 5 8.6 5H15.4C16.4 5 17.2 5.6 17.5 6.5L19 11" stroke={color} strokeWidth="2" strokeLinecap="round"/><rect x="2" y="11" width="20" height="7" rx="2" stroke={color} strokeWidth="2" fill={EL}/><circle cx="7" cy="18" r="2" stroke={color} strokeWidth="2" fill="white"/><circle cx="17" cy="18" r="2" stroke={color} strokeWidth="2" fill="white"/></svg>),
    check: (<svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>),
    mapPin: (<svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>),
    clock: (<svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>),
    alert: (<svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>),
    arrowLeft: (<svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>),
    bag: (<svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>),
    info: (<svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>),
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
  heureDepart?: string;
  statut: string;
  placesDisponibles: number;
  description?: string;
  demandeur?: { id: number; nom: string; prenom: string; email: string };
}

interface Vehicule {
  id: number;
  marque: string;
  modele: string;
  immatriculation: string;
  nbPlaces: number;
  photoAvant?: string;
}

export default function CompleterTrajetPage() {
  const params = useParams();
  const router = useRouter();
  const { t, darkMode } = useTheme();
  const trajetId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [trajet, setTrajet] = useState<Trajet | null>(null);
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [vehiculeId, setVehiculeId] = useState('');
  const [heureArriveeEstimee, setHeureArriveeEstimee] = useState('');
  const [bagagesAutorises, setBagagesAutorises] = useState(true);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [description, setDescription] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    fetchTrajet(token);
    fetchVehicules(token);
  }, [router, trajetId]);

  const fetchTrajet = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/trajets/${trajetId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) { setError('Trajet non trouvé'); setLoading(false); return; }
      const data = await res.json();
      const t = data.trajet || data;
      setTrajet(t);
      setDescription(t.description || '');
    } catch {
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicules = async (token: string) => {
    try {
      const cleanToken = token.replace(/"/g, '').trim();
      const res = await fetch(`${API_URL}/conducteur/vehicule`, {
        headers: { Authorization: `Bearer ${cleanToken}` }
      });
      if (!res.ok) { setVehicules([]); return; }
      const data = await res.json();
      if (data.hasVehicule && data.vehicule) {
        setVehicules([{ ...data.vehicule, estDefaut: true }]);
        if (data.vehicule.id) setVehiculeId(String(data.vehicule.id));
      } else if (Array.isArray(data)) {
        setVehicules(data);
        if (data.length > 0 && data[0].id) setVehiculeId(String(data[0].id));
      } else {
        setVehicules([]);
      }
    } catch (err) {
      console.error('Erreur chargement véhicules:', err);
      setVehicules([]);
    }
  };

  const handleSubmit = async () => {
    if (!vehiculeId) { setError('Veuillez sélectionner un véhicule'); return; }
    setError('');

    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/conducteur/trajets/${trajetId}/completer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token.replace(/"/g, '').trim()}` },
        body: JSON.stringify({
          vehiculeId: parseInt(vehiculeId),
          heureArriveeEstimee: heureArriveeEstimee || undefined,
          bagagesAutorises,
          gpsEnabled,
          description: description || undefined,
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/conducteur/trajets'), 3000);
      } else {
        setError(data.error || data.errors?.join(', ') || 'Erreur lors de la publication');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setSubmitting(false);
    }
  };

  const bgCard = darkMode ? '#1A1A1A' : '#FFFFFF';
  const textColor = darkMode ? '#FFFFFF' : BK;
  const textSecondary = darkMode ? '#9CA3AF' : GR;
  const borderColor = darkMode ? '#2A2A2A' : BD;
  const inputBg = darkMode ? '#2A2A2A' : '#FFFFFF';

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: '10px',
    border: `1.5px solid ${borderColor}`, background: inputBg, color: textColor,
    fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '13px', fontWeight: '700', color: textColor, marginBottom: '6px',
  };

  if (loading) {
    return (
      <ConducteurLayout>
        <div style={{ textAlign: 'center', padding: '80px', color: textSecondary }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `3px solid ${EL}`, borderTopColor: E, animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p>Chargement du trajet...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </ConducteurLayout>
    );
  }

  if (success) {
    return (
      <ConducteurLayout>
        <div style={{ padding: '40px 24px', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ background: bgCard, borderRadius: '20px', padding: '48px 32px', textAlign: 'center', border: `1px solid ${borderColor}`, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: EL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Icon name="check" size={40} color={E} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: textColor, margin: '0 0 12px' }}>Trajet publié !</h2>
            <p style={{ fontSize: '15px', color: textSecondary, marginBottom: '24px' }}>
              Votre trajet est maintenant visible par les passagers. Le passager a été notifié.
            </p>
            <p style={{ fontSize: '13px', color: E, fontWeight: '600' }}>Redirection en cours...</p>
          </div>
        </div>
      </ConducteurLayout>
    );
  }

  return (
    <ConducteurLayout>
      <div style={{ padding: '32px 24px', maxWidth: '700px', margin: '0 auto' }}>
        <Link href="/conducteur/trajets" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', color: E, fontSize: '14px', fontWeight: '600', marginBottom: '24px' }}>
          <Icon name="arrowLeft" size={16} /> Retour aux trajets
        </Link>

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: textColor, margin: '0 0 8px' }}>
            Compléter le trajet <Icon name="car" size={24} />
          </h1>
          <p style={{ fontSize: '15px', color: textSecondary, margin: 0 }}>
            {trajet ? `${trajet.villeDepart} → ${trajet.villeArrivee}` : 'Chargement...'}
          </p>
        </div>

        <div style={{ padding: '14px', background: AL, borderRadius: '12px', marginBottom: '24px', fontSize: '13px', color: AM, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Icon name="alert" size={18} color={AM} />
          <span>Vous avez 24h pour compléter ce trajet. Le passager a été notifié de votre acceptation.</span>
        </div>

        {error && (
          <div style={{ background: RL, border: '1px solid #FECACA', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', color: RD, fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icon name="alert" size={16} color={RD} /> {error}
          </div>
        )}

        {/* Véhicule */}
        <div style={{ background: bgCard, borderRadius: '16px', border: `1px solid ${borderColor}`, padding: '24px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: EL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="car" size={18} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: textColor, margin: 0 }}>Véhicule *</h3>
          </div>
          {vehicules.length === 0 ? (
            <div style={{ padding: '20px', background: RL, borderRadius: '10px', color: RD, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Icon name="alert" size={16} color={RD} />
              <span>Aucun véhicule enregistré. <Link href="/conducteur/vehicule" style={{ color: E, fontWeight: '700', textDecoration: 'underline' }}>Ajouter un véhicule</Link></span>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {vehicules.map(v => (
                <label key={v.id} style={{
                  display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', borderRadius: '12px',
                  border: vehiculeId === String(v.id) ? `2px solid ${E}` : `1px solid ${borderColor}`,
                  background: vehiculeId === String(v.id) ? EL : inputBg,
                  cursor: 'pointer', transition: 'all 0.2s'
                }}>
                  <input type="radio" name="vehicule" value={v.id} checked={vehiculeId === String(v.id)} onChange={() => setVehiculeId(String(v.id))} style={{ accentColor: E }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: textColor }}>{v.marque} {v.modele}</div>
                    <div style={{ fontSize: '12px', color: textSecondary, fontFamily: 'monospace' }}>{v.immatriculation}</div>
                  </div>
                  <span style={{ fontSize: '12px', color: textSecondary }}>{v.nbPlaces} places</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Itinéraire (lecture seule - défini par le passager) */}
        <div style={{ background: bgCard, borderRadius: '16px', border: `1px solid ${borderColor}`, padding: '24px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: EL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="mapPin" size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: textColor, margin: 0 }}>Itinéraire</h3>
              <p style={{ fontSize: '12px', color: textSecondary, margin: '2px 0 0' }}>Défini par le passager</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: darkMode ? '#2A2A2A' : '#F9FAFB', borderRadius: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: E, flexShrink: 0 }} />
              <div style={{ width: '2px', height: '24px', background: borderColor }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: RD, flexShrink: 0 }} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', color: textSecondary, marginBottom: '2px' }}>Départ</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: textColor }}>{trajet?.quartierDepart || '—'}</div>
                <div style={{ fontSize: '12px', color: textSecondary }}>{trajet?.villeDepart}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: textSecondary, marginBottom: '2px' }}>Arrivée</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: textColor }}>{trajet?.quartierArrivee || '—'}</div>
                <div style={{ fontSize: '12px', color: textSecondary }}>{trajet?.villeArrivee}</div>
              </div>
            </div>
          </div>
          {trajet?.dateDepart && (
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '12px', color: textSecondary }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Icon name="clock" size={14} color={GR} />
                {new Date(trajet.dateDepart).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
              {trajet.heureDepart && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Icon name="clock" size={14} color={GR} />
                  {trajet.heureDepart}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Options conducteur */}
        <div style={{ background: bgCard, borderRadius: '16px', border: `1px solid ${borderColor}`, padding: '24px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: EL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="clock" size={18} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: textColor, margin: 0 }}>Options</h3>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}><Icon name="clock" size={12} color={E} /> Heure d'arrivée estimée</label>
            <input
              type="time"
              value={heureArriveeEstimee}
              onChange={e => setHeureArriveeEstimee(e.target.value)}
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = E}
              onBlur={e => e.currentTarget.style.borderColor = borderColor}
            />
          </div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: textColor }}>
              <input type="checkbox" checked={bagagesAutorises} onChange={e => setBagagesAutorises(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: E }} />
              <Icon name="bag" size={14} /> Bagages autorisés
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: textColor }}>
              <input type="checkbox" checked={gpsEnabled} onChange={e => setGpsEnabled(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: E }} />
              <Icon name="mapPin" size={14} /> GPS disponible
            </label>
          </div>
        </div>

        {/* Description */}
        <div style={{ background: bgCard, borderRadius: '16px', border: `1px solid ${borderColor}`, padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: EL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="info" size={18} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: textColor, margin: 0 }}>Description (optionnel)</h3>
          </div>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Informations complémentaires pour le passager..."
            rows={3}
            maxLength={500}
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
          />
          <div style={{ fontSize: '11px', color: textSecondary, marginTop: '4px', textAlign: 'right' }}>{description.length}/500</div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/conducteur/trajets" style={{ flex: 1, padding: '14px', borderRadius: '12px', border: `1.5px solid ${borderColor}`, background: 'transparent', color: textColor, fontSize: '15px', fontWeight: '600', textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Annuler
          </Link>
          <button
            onClick={handleSubmit}
            disabled={submitting || vehicules.length === 0}
            style={{
              flex: 2, padding: '14px', borderRadius: '12px', border: 'none',
              background: submitting || vehicules.length === 0 ? '#d1d5db' : `linear-gradient(135deg, ${E}, ${ED})`,
              color: '#FFF', fontSize: '15px', fontWeight: '700',
              cursor: submitting || vehicules.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: submitting ? 'none' : `0 4px 15px rgba(13, 158, 126, 0.3)`,
            }}
          >
            {submitting ? (
              <><div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Publication...</>
            ) : (
              <><Icon name="check" size={18} color="#FFF" /> Publier le trajet</>
            )}
          </button>
        </div>
      </div>
    </ConducteurLayout>
  );
}
