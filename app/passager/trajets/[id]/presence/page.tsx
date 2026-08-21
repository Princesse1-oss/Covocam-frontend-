'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

const API_URL = '/api';
const E = '#0D9E7E';
const EL = '#E8F7F3';
const ED = '#0A7B62';
const BK = '#0D0D0D';
const GR = '#6B7280';
const BD = '#EBEBEB';

const Icon = ({ name, size = 24, color = E }: { name: string; size?: number; color?: string }) => {
  const s = { width: size, height: size, display: 'inline-block', verticalAlign: 'middle' } as React.CSSProperties;
  const icons: Record<string, React.ReactNode> = {
    mapPin: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    check: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
    ),
    alert: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  };
  return <span style={{ lineHeight: 0, display: 'inline-flex' }}>{icons[name] || null}</span>;
};

export default function PassagerPresencePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [trajet, setTrajet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    fetch(`${API_URL}/trajets/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setTrajet(data); setLoading(false); })
      .catch(() => { setError('Erreur de chargement'); setLoading(false); });
  }, [id, router]);

  const handleJeSuisLa = async () => {
    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée par votre appareil.');
      return;
    }

    setSubmitting(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const token = localStorage.getItem('token');
        try {
          const res = await fetch(`${API_URL}/trajets/${id}/je-suis-la`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            })
          });
          
          const data = await res.json();
          if (res.ok) {
            setSuccess(true);
            setTimeout(() => router.push('/passager/reservations'), 3000);
          } else {
            setError(data.error || 'Erreur lors de la confirmation');
          }
        } catch (err) {
          setError('Erreur de connexion au serveur');
        } finally {
          setSubmitting(false);
        }
      },
      (err) => {
        let msg = 'Impossible d\'accéder à votre position GPS.';
        if (err.code === 1) msg = 'La géolocalisation est refusée. Autorisez-la dans les paramètres de votre navigateur.';
        else if (err.code === 2) msg = 'Position indisponible. Vérifiez que le GPS est activé.';
        else if (err.code === 3) msg = 'Délai d\'attente dépassé. Réessayez dans un lieu dégagé.';
        setError(msg);
        setSubmitting(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (loading) return <><div style={{textAlign:'center', padding:'80px', color:GR}}>Chargement...</div></>;
  if (error && !trajet) return <><div style={{textAlign:'center', padding:'80px', color:'#dc2626'}}>{error}</div></>;

  return (
    <>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 20px' }}>
        {success ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: EL, borderRadius: '16px', border: `1px solid #6EE7B7` }}>
            <div style={{ color: E, marginBottom: '16px' }}><Icon name="check" size={48} color={E} /></div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: ED, marginBottom: '8px' }}>Présence confirmée !</h2>
            <p style={{ fontSize: '14px', color: ED, lineHeight: '1.6' }}>
              Le conducteur a été notifié que vous êtes au point de départ. Bon trajet !
            </p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: BK, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="mapPin" size={24} /> Confirmer votre présence
              </h1>
              <p style={{ fontSize: '14px', color: GR, lineHeight: '1.5' }}>
                Vous êtes sur le point de confirmer que vous êtes au point de départ pour le trajet :<br/>
                <strong style={{ color: BK }}>{trajet?.villeDepart} → {trajet?.villeArrivee}</strong>
              </p>
            </div>

            {error && (
              <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '14px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #FCA5A5', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon name="alert" color="#DC2626" size={20} />
                <span style={{ fontSize: '14px', fontWeight: '600' }}>{error}</span>
              </div>
            )}

            <button
              onClick={handleJeSuisLa}
              disabled={submitting}
              style={{
                width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
                background: submitting ? GR : `linear-gradient(135deg, ${E}, ${ED})`,
                color: '#fff', fontSize: '16px', fontWeight: '700', cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                boxShadow: submitting ? 'none' : `0 4px 15px rgba(13,158,126,0.3)`,
                transition: 'all 0.2s'
              }}
            >
              {submitting ? 'Localisation en cours...' : (
                <>
                  <Icon name="check" size={20} color="#fff" /> Je suis au point de départ
                </>
              )}
            </button>

            <button 
              onClick={() => router.back()} 
              style={{ width: '100%', marginTop: '12px', padding: '14px', borderRadius: '12px', border: `1px solid ${BD}`, background: '#fff', color: GR, fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
            >
              Annuler
            </button>
          </>
        )}
      </div>
    </>
  );
}