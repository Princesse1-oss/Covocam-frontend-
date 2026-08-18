'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ConducteurLayout from '../../../../../components/conducteur/ConducteurLayout';
import { useTheme } from '@/app/lib/ThemeContext';

const BACKEND_URL = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000` : '';

const API_URL = '/api';

const E = '#0D9E7E';
const EL = '#E8F7F3';
const ED = '#0A7B62';
const BK = '#0D0D0D';
const GR = '#6B7280';
const BD = '#EBEBEB';
const RD = '#DC2626';
const RL = '#FEE2E2';

// ─── SVG Icons inline ───
const Icon = ({ name, size = 20, color = E }: { name: string; size?: number; color?: string }) => {
  const s = { width: size, height: size, display: 'inline-block', verticalAlign: 'middle' } as React.CSSProperties;
  const icons: Record<string, React.ReactNode> = {
    arrowLeft: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
    ),
    users: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    check: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    x: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    ),
    mapPin: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    calendar: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  };
  return <span style={{ lineHeight: 0, display: 'inline-flex' }}>{icons[name] || null}</span>;
};

interface Reservation {
  id: number;
  placesReservees: number;
  statut: string;
  passager: { nom: string; prenom: string; telephone?: string | null; photo?: string | null };
}

export default function PresenceValidationPage() {
  const params = useParams();
  const router = useRouter();
  const { t, darkMode } = useTheme();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [trajet, setTrajet] = useState<any>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  
  // État pour suivre les présences : { reservationId: number, present: boolean }
  const [presences, setPresences] = useState<{ reservationId: number; present: boolean }[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const cleanToken = token.replace(/"/g, '').trim();

    // 1. Récupérer les détails du trajet
    fetch(`${API_URL}/trajets/${id}`, {
      headers: { Authorization: `Bearer ${cleanToken}` }
    })
      .then(res => res.json())
      .then(data => {
        setTrajet(data);
      })
      .catch(err => console.error('Erreur trajet:', err));

    // 2. Récupérer les réservations confirmées pour ce trajet
    fetch(`${API_URL}/reservations/conducteur/mes-reservations`, {
      headers: { Authorization: `Bearer ${cleanToken}` }
    })
      .then(res => res.json())
      .then(data => {
        const reservationsDuTrajet = (Array.isArray(data) ? data : [])
          .filter((r: any) => r.trajet?.id === parseInt(id) && ['CONFIRMEE', 'A_PAYER'].includes(r.statut));
        
        setReservations(reservationsDuTrajet);
        
        // Initialiser toutes les présences à "true" par défaut (optimisation UX)
        const initialPresences = reservationsDuTrajet.map((r: Reservation) => ({
          reservationId: r.id,
          present: true
        }));
        setPresences(initialPresences);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur réservations:', err);
        setLoading(false);
      });
  }, [id, router]);

  const togglePresence = (reservationId: number) => {
    setPresences(prev => 
      prev.map(p => 
        p.reservationId === reservationId ? { ...p, present: !p.present } : p
      )
    );
  };

  const handleSubmit = async () => {
    if (!confirm('Êtes-vous sûr de vouloir valider ces présences et terminer le trajet ? Cette action est irréversible.')) {
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}/conducteur/trajets/${id}/valider-presences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ presences })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/conducteur/trajets');
        }, 2500);
      } else {
        alert(data.error || 'Erreur lors de la validation');
      }
    } catch (err) {
      console.error('Erreur réseau:', err);
      alert('Erreur de connexion au serveur');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ConducteurLayout>
        <div style={{ padding: '80px', textAlign: 'center', color: darkMode ? '#9CA3AF' : GR }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `3px solid ${EL}`, borderTopColor: E, animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p>Chargement des passagers...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
        </div>
      </ConducteurLayout>
    );
  }

  if (success) {
    return (
      <ConducteurLayout>
        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: EL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Icon name="check" size={40} color={E} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: darkMode ? '#FFFFFF' : BK, marginBottom: '8px' }}>Trajet terminé avec succès !</h2>
          <p style={{ fontSize: '15px', color: GR, marginBottom: '24px' }}>Les présences ont été enregistrées et les gains ont été calculés.</p>
          <p style={{ fontSize: '13px', color: E, fontWeight: '600' }}>Redirection en cours...</p>
        </div>
      </ConducteurLayout>
    );
  }

  const nbPresents = presences.filter(p => p.present).reduce((acc, curr) => {
    const res = reservations.find(r => r.id === curr.reservationId);
    return acc + (res ? res.placesReservees : 0);
  }, 0);

  return (
    <ConducteurLayout>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px 16px 40px' }}>
        
        {/* Header */}
        <button 
          onClick={() => router.back()} 
          style={{ 
            marginBottom: '20px', background: 'transparent', border: 'none', color: E, 
            cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' 
          }}
        >
          <Icon name="arrowLeft" size={16} /> Retour
        </button>

        <h1 style={{ fontSize: '22px', fontWeight: '800', color: darkMode ? '#FFFFFF' : BK, marginBottom: '4px' }}>
          Validation des présences
        </h1>
        <p style={{ fontSize: '14px', color: GR, marginBottom: '24px' }}>
          Cochez uniquement les passagers physiquement présents dans le véhicule.
        </p>

        {/* Résumé du trajet */}
        <div style={{ 
          background: darkMode ? '#1A1A1A' : '#FFFFFF', borderRadius: '16px', padding: '20px', 
          marginBottom: '24px', border: `1px solid ${darkMode ? '#2A2A2A' : BD}` 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: EL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="mapPin" size={20} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: darkMode ? '#FFFFFF' : BK }}>
                {trajet?.villeDepart} <span style={{ color: E }}>→</span> {trajet?.villeArrivee}
              </div>
              <div style={{ fontSize: '13px', color: GR, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <Icon name="calendar" size={12} /> 
                {trajet?.dateDepart ? new Date(trajet.dateDepart).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''} à {trajet?.heureDepart}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: darkMode ? '#2D2D2D' : '#F9FAFB', borderRadius: '10px' }}>
            <span style={{ fontSize: '13px', color: GR, fontWeight: '600' }}>Places réservées</span>
            <span style={{ fontSize: '15px', fontWeight: '800', color: E }}>{nbPresents} / {trajet?.placesDisponibles}</span>
          </div>
        </div>

        {/* Liste des passagers */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: darkMode ? '#9CA3AF' : GR, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Passagers ({reservations.length})
          </h3>

          {reservations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', background: darkMode ? '#1A1A1A' : '#FFF', borderRadius: '12px', border: `1px dashed ${BD}` }}>
              <p style={{ color: GR, fontSize: '14px' }}>Aucun passager confirmé pour ce trajet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reservations.map((res) => {
                const isPresent = presences.find(p => p.reservationId === res.id)?.present ?? true;
                
                return (
                  <div 
                    key={res.id} 
                    onClick={() => togglePresence(res.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '16px', borderRadius: '12px', cursor: 'pointer',
                      background: isPresent ? (darkMode ? '#1A2E27' : '#F0FDF4') : (darkMode ? '#2D2D2D' : '#FEF2F2'),
                      border: `1px solid ${isPresent ? '#86efac' : '#fca5a5'}`,
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ position: 'relative', width: '42px', height: '42px', flexShrink: 0 }}>
                        {res.passager?.photo && (
                          <img src={res.passager.photo.startsWith('http') ? res.passager.photo : `${BACKEND_URL}/uploads/profils/${res.passager.photo}`} alt="" onError={e => e.currentTarget.style.display = 'none'} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 10 }} />
                        )}
                        <div style={{ 
                          width: '42px', height: '42px', borderRadius: '50%', 
                          background: isPresent ? E : GR, 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '15px', fontWeight: '700', color: '#FFF', flexShrink: 0,
                          position: 'relative', zIndex: 1
                        }}>
                          {res.passager?.prenom?.charAt(0)}{res.passager?.nom?.charAt(0)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: darkMode ? '#FFFFFF' : BK }}>
                          {res.passager?.prenom} {res.passager?.nom}
                        </div>
                        <div style={{ fontSize: '12px', color: GR }}>
                          {res.placesReservees} {res.placesReservees > 1 ? 'places' : 'place'}
                          {res.passager?.telephone && ` · ${res.passager.telephone}`}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: isPresent ? E : '#FFF',
                      border: `2px solid ${isPresent ? E : '#D1D5DB'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}>
                      {isPresent && <Icon name="check" size={16} color="#FFF" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bouton d'action */}
        <button
          onClick={handleSubmit}
          disabled={submitting || reservations.length === 0}
          style={{
            width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
            background: (submitting || reservations.length === 0) ? GR : `linear-gradient(135deg, ${E}, ${ED})`,
            color: '#FFF', fontSize: '16px', fontWeight: '700', cursor: (submitting || reservations.length === 0) ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: (submitting || reservations.length === 0) ? 'none' : `0 4px 15px rgba(13,158,126,0.3)`,
            transition: 'all 0.2s'
          }}
        >
          {submitting ? (
            <>
              <div style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#FFF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Traitement en cours...
            </>
          ) : (
            <>
              <Icon name="check" size={20} color="#FFF" />
              Valider et terminer le trajet
            </>
          )}
        </button>

      </div>
      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </ConducteurLayout>
  );
}