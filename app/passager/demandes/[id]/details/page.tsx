'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
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
const AM = '#F59E0B';

const Icon = ({ name, size = 20, color = E }: { name: string; size?: number; color?: string }) => {
  const s = { width: size, height: size, display: 'inline-block', verticalAlign: 'middle' } as React.CSSProperties;
  const icons: Record<string, React.ReactNode> = {
    arrowLeft: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
    mapPin: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    calendar: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    clock: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    users: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    check: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    checkCircle: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    alert: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    shield: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    car: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11"/><rect x="2" y="11" width="20" height="7" rx="2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>,
    money: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    star: <svg style={s} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    arrowRight: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
    message: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    lock: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    info: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
    creditCard: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    eye: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  };
  return <span style={{ lineHeight: 0, display: 'inline-flex' }}>{icons[name] || null}</span>;
};

export default function DemandeConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const { t, darkMode, lang } = useTheme();

  const [demande, setDemande] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const id = params?.id as string;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    const fetchDemande = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const res = await fetch(`${API_URL}/demandes/mes-demandes`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`Erreur API: ${res.status}`);

        const demandes = await res.json();
        const found = Array.isArray(demandes) ? demandes.find((d: any) => d.id === Number(id)) : null;

        if (found) {
          setDemande(found);
        } else {
          setError(lang === 'fr' ? `Demande ID ${id} introuvable.` : 'Request not found.');
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        setError(err.name === 'AbortError' ? 'Délai dépassé.' : `Erreur: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDemande();
  }, [id, router, lang]);

  const bgCard = darkMode ? '#1A1A1A' : '#FFFFFF';
  const textColor = darkMode ? '#FFFFFF' : BK;
  const textSecondary = darkMode ? '#9CA3AF' : GR;
  const borderColor = darkMode ? '#2A2A2A' : BD;
  const bgSubtle = darkMode ? '#2A2A2A' : '#F9FAFB';

  const formatDate = (d: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: darkMode ? '#0D0D0D' : '#F9FAFB' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: `3px solid ${EL}`, borderTopColor: E, animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: textSecondary, fontSize: '14px' }}>{lang === 'fr' ? 'Chargement...' : 'Loading...'}</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error || !demande) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: darkMode ? '#0D0D0D' : '#F9FAFB' }}>
      <div style={{ background: bgCard, borderRadius: '24px', padding: '48px', maxWidth: '500px', width: '100%', textAlign: 'center', border: `1px solid ${borderColor}` }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: RL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}><Icon name="alert" size={32} color={RD} /></div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: textColor, marginBottom: '12px' }}>{lang === 'fr' ? 'Oups !' : 'Oops!'}</h2>
        <p style={{ fontSize: '15px', color: textSecondary, marginBottom: '24px' }}>{error}</p>
        <Link href="/passager/demandes" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', background: E, color: '#FFF', textDecoration: 'none', fontSize: '14px', fontWeight: '700' }}>
          <Icon name="arrowLeft" size={16} color="#FFF" /> {lang === 'fr' ? 'Retour' : 'Back'}
        </Link>
      </div>
    </div>
  );

  const isAcceptee = demande.statut === 'ACCEPTEE';
  const isConfirmee = demande.statut === 'CONFIRMEE';
  const conducteur = demande.conducteurAcceptant;

  return (
    <div style={{ minHeight: '100vh', background: darkMode ? '#0D0D0D' : '#F9FAFB', padding: '32px 16px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @media (max-width: 500px) { .det-grid { grid-template-columns: 1fr !important; } }`}</style>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>

        {/* Back */}
        <Link href="/passager/demandes" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', color: E, fontSize: '14px', fontWeight: '600', marginBottom: '24px' }}>
          <Icon name="arrowLeft" size={16} /> {lang === 'fr' ? 'Retour aux demandes' : 'Back to requests'}
        </Link>

        {/* Success banner */}
        {isAcceptee && (
          <div style={{
            background: '#DCFCE7', border: '1px solid #BBF7D0', borderRadius: '16px',
            padding: '20px 24px', marginBottom: '24px',
            display: 'flex', alignItems: 'center', gap: '14px',
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="checkCircle" size={26} color="#FFF" />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#166534', margin: '0 0 4px' }}>
                {lang === 'fr' ? 'Demande acceptée !' : 'Request accepted!'}
              </h2>
              <p style={{ fontSize: '13px', color: '#15803D', margin: 0, lineHeight: '1.4' }}>
                {lang === 'fr'
                  ? 'Un conducteur a accepté votre demande. Procédez au paiement pour confirmer votre place.'
                  : 'A driver accepted your request. Proceed to payment to confirm your seat.'}
              </p>
            </div>
          </div>
        )}

        {isConfirmee && (
          <div style={{
            background: EL, border: `1px solid ${E}40`, borderRadius: '16px',
            padding: '20px 24px', marginBottom: '24px',
            display: 'flex', alignItems: 'center', gap: '14px',
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: E, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="check" size={26} color="#FFF" />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: '800', color: ED, margin: '0 0 4px' }}>
                {lang === 'fr' ? 'Paiement confirmé' : 'Payment confirmed'}
              </h2>
              <p style={{ fontSize: '13px', color: E, margin: 0, lineHeight: '1.4' }}>
                {lang === 'fr' ? 'Votre réservation est finalisée.' : 'Your reservation is finalized.'}
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: textColor, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icon name="eye" size={24} /> {lang === 'fr' ? 'Détails de la demande' : 'Request Details'}
          </h1>
          <p style={{ fontSize: '14px', color: textSecondary, margin: 0 }}>
            {lang === 'fr' ? `Demande #${demande.id}` : `Request #${demande.id}`}
          </p>
        </div>

        {/* Main card */}
        <div style={{ background: bgCard, borderRadius: '20px', border: `1px solid ${borderColor}`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '24px' }}>

            {/* Route */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '11px', fontWeight: '700', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon name="mapPin" size={14} /> {lang === 'fr' ? 'Trajet' : 'Route'}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: bgSubtle, borderRadius: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: E, border: `2px solid ${EL}` }} />
                  <div style={{ width: '2px', height: '24px', background: `${E}40` }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: RD, border: `2px solid ${RL}` }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: textColor }}>{demande.villeDepart || '—'}</div>
                  <div style={{ fontSize: '11px', color: textSecondary, marginTop: '2px' }}>{lang === 'fr' ? 'Départ' : 'Departure'}</div>
                  <div style={{ height: '1px', background: borderColor, margin: '8px 0' }} />
                  <div style={{ fontSize: '16px', fontWeight: '700', color: textColor }}>{demande.villeArrivee || '—'}</div>
                  <div style={{ fontSize: '11px', color: textSecondary, marginTop: '2px' }}>{lang === 'fr' ? 'Arrivée' : 'Arrival'}</div>
                </div>
              </div>
            </div>

            {/* Date / Time / Seats */}
            <div className="det-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '24px' }}>
              <div style={{ background: bgSubtle, padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                <Icon name="calendar" size={16} color={E} />
                <div style={{ fontSize: '11px', color: textSecondary, marginTop: '4px' }}>{lang === 'fr' ? 'Date' : 'Date'}</div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: textColor, marginTop: '2px' }}>{formatDate(demande.dateDepart)}</div>
              </div>
              <div style={{ background: bgSubtle, padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                <Icon name="clock" size={16} color={E} />
                <div style={{ fontSize: '11px', color: textSecondary, marginTop: '4px' }}>{lang === 'fr' ? 'Heure' : 'Time'}</div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: textColor, marginTop: '2px' }}>{demande.heureDepart || '—'}</div>
              </div>
              <div style={{ background: bgSubtle, padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                <Icon name="users" size={16} color={E} />
                <div style={{ fontSize: '11px', color: textSecondary, marginTop: '4px' }}>{lang === 'fr' ? 'Places' : 'Seats'}</div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: textColor, marginTop: '2px' }}>{demande.nbPlaces || 0}</div>
              </div>
            </div>

            {/* Driver info */}
            {conducteur && (
              <div style={{ marginBottom: '24px', padding: '16px', background: bgSubtle, borderRadius: '14px' }}>
                <h3 style={{ fontSize: '11px', fontWeight: '700', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icon name="users" size={14} /> {lang === 'fr' ? 'Votre conducteur' : 'Your Driver'}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ position: 'relative', width: '44px', height: '44px', flexShrink: 0 }}>
                    {conducteur.photo && (
                      <img src={conducteur.photo.startsWith('http') ? conducteur.photo : `${BACKEND_URL}/uploads/profils/${conducteur.photo}`} alt="" onError={e => e.currentTarget.style.display = 'none'} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 10, border: '2px solid #fff' }} />
                    )}
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `linear-gradient(135deg, ${E}, ${ED})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '700', color: '#FFF', position: 'relative', zIndex: 1 }}>
                      {conducteur.prenom?.charAt(0)}{conducteur.nom?.charAt(0)}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: textColor }}>{conducteur.prenom} {conducteur.nom}</div>
                    <div style={{ fontSize: '12px', color: E, fontWeight: '600', marginTop: '2px' }}>
                      {isAcceptee ? (lang === 'fr' ? 'A accepté votre demande' : 'Accepted your request') : (lang === 'fr' ? 'Conducteur assigné' : 'Assigned driver')}
                    </div>
                  </div>
                  {conducteur.noteMoyenne > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Icon name="star" size={14} color={AM} />
                      <span style={{ fontSize: '13px', fontWeight: '700', color: textColor }}>{conducteur.noteMoyenne?.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pricing summary */}
            <div style={{ borderTop: `1px dashed ${borderColor}`, paddingTop: '20px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '11px', fontWeight: '700', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon name="money" size={14} /> {lang === 'fr' ? 'Tarif' : 'Pricing'}
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px', color: textSecondary }}>{lang === 'fr' ? 'Prix par place' : 'Price per seat'}</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: textColor }}>{(demande.prixPropose || demande.budgetMax || 0).toLocaleString()} FCFA</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '14px', color: textSecondary }}>{lang === 'fr' ? 'Nombre de places' : 'Number of seats'}</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: textColor }}>x {demande.nbPlaces || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: `2px solid ${borderColor}` }}>
                <span style={{ fontSize: '16px', fontWeight: '800', color: textColor }}>{lang === 'fr' ? 'Total' : 'Total'}</span>
                <span style={{ fontSize: '24px', fontWeight: '800', color: E }}>{((demande.prixPropose || demande.budgetMax || 0) * (demande.nbPlaces || 1)).toLocaleString()} <span style={{ fontSize: '13px', fontWeight: '600', color: textSecondary }}>FCFA</span></span>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {/* Chat with driver */}
              {conducteur && (
                <Link href={`/passager/chat?conducteur=${conducteur.id}&demande=${demande.id}`} style={{ textDecoration: 'none', flex: 1, minWidth: '140px' }}>
                  <button style={{
                    width: '100%', padding: '14px', borderRadius: '12px', border: `1px solid ${E}`, background: EL, color: E,
                    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'all 0.2s',
                  }}>
                    <Icon name="message" size={16} /> {lang === 'fr' ? 'Contacter' : 'Chat'}
                  </button>
                </Link>
              )}

              {/* Pay / Confirm */}
              {isAcceptee && (
                <Link href={`/passager/paiement/${demande.id}`} style={{ textDecoration: 'none', flex: 1, minWidth: '140px' }}>
                  <button style={{
                    width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: `linear-gradient(135deg, ${E}, ${ED})`, color: '#FFF',
                    fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: `0 4px 14px rgba(13,158,126,0.3)`,
                    transition: 'all 0.2s',
                  }}>
                    <Icon name="creditCard" size={16} color="#FFF" /> {lang === 'fr' ? 'Payer maintenant' : 'Pay now'}
                  </button>
                </Link>
              )}

              {/* Already confirmed */}
              {isConfirmee && (
                <div style={{ flex: 1, minWidth: '140px', padding: '14px', borderRadius: '12px', background: EL, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Icon name="checkCircle" size={16} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: E }}>{lang === 'fr' ? 'Confirmé' : 'Confirmed'}</span>
                </div>
              )}
            </div>

            {/* Info note for ACCEPTEE */}
            {isAcceptee && (
              <div style={{ marginTop: '16px', padding: '12px 16px', background: darkMode ? '#1E293B' : '#F0F9FF', borderRadius: '10px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Icon name="info" size={16} color="#3B82F6" />
                <p style={{ fontSize: '12px', color: darkMode ? '#93C5FD' : '#1D4ED8', margin: 0, lineHeight: '1.5' }}>
                  {lang === 'fr'
                    ? 'Votre place sera réservée après le paiement. Le conducteur a été informé de votre demande.'
                    : 'Your seat will be reserved after payment. The driver has been informed of your request.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
