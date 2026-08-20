'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/app/lib/ThemeContext';

const API_URL = '/api';

const E = '#0D9E7E';
const EL = '#E8F7F3';
const ED = '#0A7B62';
const BK = '#0D0D0D';
const GR = '#6B7280';
const BD = '#EBEBEB';
const RD = '#DC2626';
const RL = '#FEE2E2';
const BL = '#2563EB';
const BLL = '#DBEAFE';
const AM = '#F59E0B';
const AL = '#FEF3C7';

const Icon = ({ name, size = 20, color = E }: { name: string; size?: number; color?: string }) => {
  const s = { width: size, height: size, display: 'inline-block', verticalAlign: 'middle' } as React.CSSProperties;
  const icons: Record<string, React.ReactNode> = {
    arrowLeft: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
    mapPin: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    calendar: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    clock: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    users: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    money: <svg style={s} viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="14" rx="3" fill="#DCFCE7"/><path d="M2 10H22"/><path d="M6 15H10"/><circle cx="17" cy="15" r="1.5" fill="#16A34A"/></svg>,
    check: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    alert: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    message: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    eye: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    creditCard: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    plus: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8V16M8 12H16"/></svg>,
    x: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  };
  return <span style={{ lineHeight: 0, display: 'inline-flex' }}>{icons[name] || null}</span>;
};

interface Demande {
  id: number;
  villeDepart: string;
  villeArrivee: string;
  quartierDepart?: string | null;
  quartierArrivee?: string | null;
  dateDepart: string;
  heureDepart?: string | null;
  nbPlaces: number;
  budgetMax: number;
  statut: string;
  prixPropose?: number | null;
  conducteurAcceptant?: { id: number; nom: string; prenom: string; photo?: string | null } | null;
}

export default function MesDemandesPage() {
  const router = useRouter();
  const { t, darkMode, lang } = useTheme();
  
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'en_cours' | 'historique'>('en_cours');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchDemandes = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const res = await fetch(`${API_URL}/demandes/mes-demandes`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`Erreur serveur: ${res.status}`);
        }

        const data = await res.json();
        if (Array.isArray(data)) {
          setDemandes(data);
        } else {
          setError(lang === 'fr' ? 'Format de données invalide.' : 'Invalid data format.');
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          setError(lang === 'fr' ? 'Le serveur met trop de temps à répondre (Timeout). Le backend est peut-être bloqué.' : 'Server timeout.');
        } else {
          console.error('Erreur chargement:', err);
          setError(lang === 'fr' ? 'Erreur de connexion au serveur.' : 'Server connection error.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDemandes();
  }, [router, lang]);

  const demandesFiltrees = demandes.filter(d => {
    if (activeTab === 'en_cours') {
      return ['EN_ATTENTE', 'ACCEPTEE'].includes(d.statut);
    } else {
      if (!['CONFIRMEE', 'EXPIREE', 'ANNULEE', 'REFUSEE'].includes(d.statut)) return false;
      const maintenant = new Date();
      const dateLimite = new Date(d.dateDepart);
      dateLimite.setDate(dateLimite.getDate() + 1);
      return dateLimite >= maintenant;
    }
  });

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'EN_ATTENTE': return { label: lang === 'fr' ? 'En attente' : 'Pending', bg: AL, color: AM, icon: <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: AM, display: 'inline-block' }} /> };
      case 'ACCEPTEE': return { label: lang === 'fr' ? 'Acceptée' : 'Accepted', bg: BLL, color: BL, icon: <Icon name="check" size={14} color={BL} /> };
      case 'CONFIRMEE': return { label: lang === 'fr' ? 'Confirmée' : 'Confirmed', bg: EL, color: E, icon: <Icon name="check" size={14} color={E} /> };
      case 'EXPIREE': return { label: lang === 'fr' ? 'Expirée' : 'Expired', bg: darkMode ? '#2A2A2A' : '#F3F4F6', color: GR, icon: <Icon name="clock" size={14} color={GR} /> };
      case 'ANNULEE': 
      case 'REFUSEE': return { label: lang === 'fr' ? 'Annulée' : 'Cancelled', bg: RL, color: RD, icon: <Icon name="x" size={14} color={RD} /> };
      default: return { label: statut, bg: GR, color: '#FFF', icon: <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: GR, display: 'inline-block' }} /> };
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const bgCard = darkMode ? '#1A1A1A' : '#FFFFFF';
  const textColor = darkMode ? '#FFFFFF' : BK;
  const textSecondary = darkMode ? '#9CA3AF' : GR;
  const borderColor = darkMode ? '#2A2A2A' : BD;

  if (loading) {
    return (
      <div style={{ padding: '80px', textAlign: 'center', color: textSecondary }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `3px solid ${EL}`, borderTopColor: E, animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p>{lang === 'fr' ? 'Chargement de vos demandes...' : 'Loading your requests...'}</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '80px', textAlign: 'center', color: textSecondary }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: RL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Icon name="alert" size={32} color={RD} />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: textColor, marginBottom: '12px' }}>Oups !</h2>
        <p style={{ fontSize: '15px', color: textSecondary, marginBottom: '24px' }}>{error}</p>
        <button onClick={() => window.location.reload()} style={{ padding: '12px 24px', background: E, color: '#FFF', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>
          {lang === 'fr' ? 'Réessayer' : 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: textColor, margin: '0 0 8px' }}>
            {lang === 'fr' ? 'Mes demandes de trajet' : 'My Trip Requests'}
          </h1>
          <p style={{ fontSize: '14px', color: textSecondary, margin: 0 }}>
            {lang === 'fr' ? 'Suivez l\'état de vos demandes et effectuez vos paiements' : 'Track your requests and make payments'}
          </p>
        </div>
        <Link href="/passager/demandes/creer" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 20px', borderRadius: '12px',
            background: `linear-gradient(135deg, ${E}, ${ED})`,
            color: '#FFF', fontSize: '14px', fontWeight: '700',
            boxShadow: `0 4px 15px rgba(13, 158, 126, 0.3)`,
            transition: 'all 0.2s'
          }}>
            <Icon name="plus" size={16} color="#FFF" />
            {lang === 'fr' ? 'Nouvelle demande' : 'New Request'}
          </div>
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: `1px solid ${borderColor}`, paddingBottom: '12px' }}>
        {[
          { key: 'en_cours', label: lang === 'fr' ? 'En cours' : 'Active', count: demandes.filter(d => ['EN_ATTENTE', 'ACCEPTEE'].includes(d.statut)).length },
          { key: 'historique', label: lang === 'fr' ? 'Historique' : 'History', count: demandes.filter(d => {
            if (!['CONFIRMEE', 'EXPIREE', 'ANNULEE', 'REFUSEE'].includes(d.statut)) return false;
            const maintenant = new Date();
            const dateLimite = new Date(d.dateDepart);
            dateLimite.setDate(dateLimite.getDate() + 1);
            return dateLimite >= maintenant;
          }).length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '10px 20px', borderRadius: '10px 10px 0 0',
              border: 'none', borderBottom: activeTab === tab.key ? `3px solid ${E}` : '3px solid transparent',
              background: activeTab === tab.key ? (darkMode ? '#2A2A2A' : '#F9FAFB') : 'transparent',
              color: activeTab === tab.key ? E : textSecondary,
              fontSize: '14px', fontWeight: '700', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
            <span style={{
              background: activeTab === tab.key ? E : (darkMode ? '#3A3A3A' : '#E5E7EB'),
              color: activeTab === tab.key ? '#FFF' : textSecondary,
              fontSize: '11px', padding: '2px 8px', borderRadius: '10px', fontWeight: '800'
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {demandesFiltrees.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: bgCard, borderRadius: '16px', border: `1px dashed ${borderColor}` }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: EL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icon name={activeTab === 'en_cours' ? 'eye' : 'calendar'} size={32} color={GR} />
            </div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: textColor, marginBottom: '8px' }}>
            {activeTab === 'en_cours' ? (lang === 'fr' ? 'Aucune demande en cours' : 'No active requests') : (lang === 'fr' ? 'Aucun historique' : 'No history')}
          </h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {demandesFiltrees.map(demande => {
            const badge = getStatutBadge(demande.statut);

            return (
              <div key={demande.id} style={{
                background: bgCard, borderRadius: '16px', border: `1px solid ${borderColor}`,
                overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.2s'
              }}>
                <div style={{
                  background: badge.bg, padding: '10px 20px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  borderBottom: `1px solid ${borderColor}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>{badge.icon}</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: badge.color }}>
                      {badge.label}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: textSecondary }}>
                    {lang === 'fr' ? 'Créée le' : 'Created on'} {formatDate(demande.dateDepart)}
                  </span>
                </div>

                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ flex: 1, minWidth: '250px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: EL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name="mapPin" size={20} color={E} />
                        </div>
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: textColor }}>
                            {demande.villeDepart} {demande.quartierDepart && <span style={{ fontSize: '13px', color: textSecondary }}>({demande.quartierDepart})</span>}
                          </div>
                          <div style={{ fontSize: '12px', color: E, margin: '2px 0' }}>↓</div>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: textColor }}>
                            {demande.villeArrivee} {demande.quartierArrivee && <span style={{ fontSize: '13px', color: textSecondary }}>({demande.quartierArrivee})</span>}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: textSecondary }}>
                          <Icon name="calendar" size={14} color={GR} />
                          {formatDate(demande.dateDepart)}
                        </div>
                        {demande.heureDepart && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: textSecondary }}>
                            <Icon name="clock" size={14} color={GR} />
                            {demande.heureDepart}
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: textSecondary }}>
                          <Icon name="users" size={14} color={GR} />
                          {demande.nbPlaces} {demande.nbPlaces > 1 ? (lang === 'fr' ? 'places' : 'seats') : (lang === 'fr' ? 'place' : 'seat')}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: textSecondary }}>
                          <Icon name="money" size={14} color="#16A34A" />
                          {demande.budgetMax.toLocaleString()} FCFA
                        </div>
                      </div>
                    </div>

                    {/* ✅ CORRECTION : Affichage de la photo du conducteur avec fallback sur les initiales */}
                    {demande.conducteurAcceptant && (
                      <div style={{
                        padding: '12px 16px', background: darkMode ? '#2A2A2A' : '#F9FAFB',
                        borderRadius: '12px', minWidth: '200px'
                      }}>
                        <div style={{ fontSize: '11px', color: textSecondary, fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>
                          {lang === 'fr' ? 'Conducteur' : 'Driver'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          
                          {/* Conteneur relatif pour superposer l'image et les initiales */}
                          <div style={{ position: 'relative', width: '36px', height: '36px', flexShrink: 0 }}>
                            {demande.conducteurAcceptant.photo && (
                              <img 
                                src={demande.conducteurAcceptant.photo.startsWith('http') 
                                  ? demande.conducteurAcceptant.photo 
                                  : `/uploads/profils/${demande.conducteurAcceptant.photo}`} 
                                alt="Photo conducteur" 
                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} 
                                style={{ 
                                  width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', 
                                  position: 'absolute', top: 0, left: 0, zIndex: 10, border: '2px solid white' 
                                }} 
                              />
                            )}
                            <div style={{
                              width: '36px', height: '36px', borderRadius: '50%',
                              background: `linear-gradient(135deg, ${E}, ${ED})`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '13px', fontWeight: '700', color: '#FFF',
                              position: 'relative', zIndex: 1
                            }}>
                              {demande.conducteurAcceptant.prenom?.charAt(0)}{demande.conducteurAcceptant.nom?.charAt(0)}
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: textColor }}>
                              {demande.conducteurAcceptant.prenom} {demande.conducteurAcceptant.nom}
                            </div>
                            {demande.prixPropose && (
                              <div style={{ fontSize: '12px', color: E, fontWeight: '600' }}>
                                {demande.prixPropose.toLocaleString()} FCFA/{lang === 'fr' ? 'place' : 'seat'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ✅ BOUTONS D'ACTION */}
                  <div style={{
                    marginTop: '20px', paddingTop: '16px', borderTop: `1px solid ${borderColor}`,
                    display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end'
                  }}>
                    {/* 1. Bouton Détails */}
                    <Link href={`/passager/demandes/${demande.id}/details`} style={{ textDecoration: 'none' }}>
                      <button style={{
                        padding: '10px 18px', borderRadius: '10px',
                        border: `1px solid ${E}`, background: EL, color: E,
                        fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        transition: 'all 0.2s'
                      }}>
                        <Icon name="eye" size={14} color={E} /> {lang === 'fr' ? 'Détails' : 'Details'}
                      </button>
                    </Link>

                    {/* 2. Bouton Converser (visible si un conducteur a accepté) */}
                    {demande.statut === 'ACCEPTEE' && demande.conducteurAcceptant && (
                      <Link href={`/passager/chat?conducteur=${demande.conducteurAcceptant.id}&demande=${demande.id}`} style={{ textDecoration: 'none' }}>
                        <button style={{
                          padding: '10px 18px', borderRadius: '10px',
                          border: `1px solid ${BL}`, background: BLL, color: BL,
                          fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '6px',
                          transition: 'all 0.2s'
                        }}>
                          <Icon name="message" size={14} color={BL} /> {lang === 'fr' ? 'Converser' : 'Chat'}
                        </button>
                      </Link>
                    )}

                    {/* 3. Bouton Payer (visible si la demande est acceptée) */}
                    {demande.statut === 'ACCEPTEE' && (
                      <Link href={`/passager/paiement/${demande.id}`} style={{ textDecoration: 'none' }}>
                        <button style={{
                          padding: '10px 18px', borderRadius: '10px',
                          border: 'none', background: `linear-gradient(135deg, ${E}, ${ED})`,
                          color: '#FFF', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '6px',
                          boxShadow: `0 4px 12px rgba(13,158,126,0.3)`,
                          transition: 'all 0.2s'
                        }}>
                          <Icon name="creditCard" size={14} color="#FFF" /> {lang === 'fr' ? 'Payer' : 'Pay'}
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );
}