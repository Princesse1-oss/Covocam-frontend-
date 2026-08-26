'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ConducteurLayout from '../../../components/conducteur/ConducteurLayout';
import { useTheme } from '@/app/lib/ThemeContext';

const API_URL = '/api';

const E = '#0D9E7E';
const EL = '#E8F7F3';
const ED = '#0A7B62';
const BK = '#0D0D0D';
const GR = '#6B7280';
const BD = '#EBEBEB';

const Icon = ({ name, size = 20, color = E }: { name: string; size?: number; color?: string }) => {
  const s = { width: size, height: size, display: 'inline-block', verticalAlign: 'middle' } as React.CSSProperties;
  const icons: Record<string, React.ReactNode> = {
    star: (
      <svg style={s} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    starEmpty: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    users: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    mapPin: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    message: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    filter: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
      </svg>
    ),
  };
  return <span style={{ lineHeight: 0, display: 'inline-flex' }}>{icons[name] || null}</span>;
};

interface Evaluation {
  id: number;
  note: number;
  commentaire: string | null;
  dateEvaluation: string;
  auteur: {
    id: number;
    nom: string;
    prenom: string;
    photo?: string;
  };
  cible: {
    id: number;
    nom: string;
    prenom: string;
  };
  reservation: {
    id: number;
    trajet: {
      id: number;
      villeDepart: string;
      villeArrivee: string;
      dateDepart: string;
    } | null;
  } | null;
}

function getRelativeTime(dateStr: string, lang: 'fr' | 'en'): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHeure = Math.floor(diffMin / 60);
  const diffJour = Math.floor(diffHeure / 24);
  const diffSemaine = Math.floor(diffJour / 7);
  const diffMois = Math.floor(diffJour / 30);

  if (diffMin < 1) return lang === 'en' ? "just now" : "à l'instant";
  if (diffMin < 60) return lang === 'en' ? `${diffMin} min ago` : `il y a ${diffMin} min`;
  if (diffHeure < 24) return lang === 'en' ? `${diffHeure}h ago` : `il y a ${diffHeure}h`;
  if (diffJour === 1) return lang === 'en' ? "yesterday" : "hier";
  if (diffJour < 7) return lang === 'en' ? `${diffJour} days ago` : `il y a ${diffJour} jours`;
  if (diffSemaine === 1) return lang === 'en' ? "1 week ago" : "il y a 1 semaine";
  if (diffSemaine < 4) return lang === 'en' ? `${diffSemaine} weeks ago` : `il y a ${diffSemaine} semaines`;
  if (diffMois === 1) return lang === 'en' ? "1 month ago" : "il y a 1 mois";
  if (diffMois < 12) return lang === 'en' ? `${diffMois} months ago` : `il y a ${diffMois} mois`;
  return new Date(dateStr).toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function MesEvaluationsPage() {
  const router = useRouter();
  const { t, lang, darkMode } = useTheme();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteMoyenne, setNoteMoyenne] = useState<number>(0);
  const [totalEvaluations, setTotalEvaluations] = useState<number>(0);
  const [filtreNote, setFiltreNote] = useState<number | null>(null);
  const [reservationsAEvaluer, setReservationsAEvaluer] = useState<any[]>([]);
  const [evalNote, setEvalNote] = useState<number>(0);
  const [evalComment, setEvalComment] = useState('');
  const [evaluatingId, setEvaluatingId] = useState<number | null>(null);
  const [evalSentIds, setEvalSentIds] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<'evaluer' | 'recues'>('evaluer');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const cleanToken = token.replace(/"/g, '').trim();

    fetch(`${API_URL}/evaluations/recues`, {
      headers: { Authorization: `Bearer ${cleanToken}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEvaluations(data);
          if (data.length > 0) {
            const total = data.reduce((acc: number, evaluation: Evaluation) => acc + evaluation.note, 0);
            setNoteMoyenne(Math.round((total / data.length) * 10) / 10);
          }
          setTotalEvaluations(data.length);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur chargement évaluations:', err);
        setLoading(false);
      });
  }, [router]);

  const repartition = [5, 4, 3, 2, 1].map(star => {
    const count = evaluations.filter(e => e.note === star).length;
    const percentage = totalEvaluations > 0 ? (count / totalEvaluations) * 100 : 0;
    return { star, count, percentage };
  });

  const evaluationsFiltrees = filtreNote !== null
    ? evaluations.filter(e => e.note === filtreNote)
    : evaluations;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const cleanToken = token.replace(/"/g, '').trim();
    fetch(`${API_URL}/conducteur/reservations-a-evaluer`, {
      headers: { Authorization: `Bearer ${cleanToken}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setReservationsAEvaluer(data);
      })
      .catch(() => {});
  }, []);

  const handleEvaluerPassager = async (reservationId: number) => {
    if (evalNote < 1) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const cleanToken = token.replace(/"/g, '').trim();
    setEvaluatingId(reservationId);
    try {
      const res = await fetch(`${API_URL}/conducteur/evaluations/evaluer-passager`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cleanToken}` },
        body: JSON.stringify({ reservationId, note: evalNote, commentaire: evalComment }),
      });
      if (res.ok) {
        setEvalSentIds(prev => new Set([...prev, reservationId]));
        setReservationsAEvaluer(prev => prev.map(r => r.id === reservationId ? { ...r, dejaEvalue: true } : r));
        setEvalNote(0);
        setEvalComment('');
      }
    } catch {}
    setEvaluatingId(null);
  };

  const bg = darkMode ? '#1A1A1A' : '#FFFFFF';
  const textColor = darkMode ? '#FFFFFF' : BK;
  const textSec = darkMode ? '#9CA3AF' : GR;
  const borderC = darkMode ? '#2A2A2A' : BD;

  if (loading) {
    return (
      <ConducteurLayout>
        <div style={{ padding: '80px', textAlign: 'center', color: textSec }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `3px solid ${EL}`, borderTopColor: E, animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p>{t('loadingEvaluations')}</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
        </div>
      </ConducteurLayout>
    );
  }

  const unevaluatedCount = reservationsAEvaluer.filter(r => !r.dejaEvalue && !evalSentIds.has(r.id)).length;

  return (
    <ConducteurLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 16px 40px' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: textColor, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icon name="star" size={24} color={E} /> {t('evaluationsTitle') || 'Évaluations'}
          </h1>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <button
            onClick={() => setActiveTab('evaluer')}
            style={{
              padding: '10px 20px', borderRadius: '10px', border: `1px solid ${activeTab === 'evaluer' ? E : borderC}`,
              background: activeTab === 'evaluer' ? E : 'transparent', color: activeTab === 'evaluer' ? '#FFF' : textSec,
              fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            {t('evaluatePassengers') || 'Évaluer passagers'}
            {unevaluatedCount > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', fontSize: '11px', padding: '2px 7px', borderRadius: '20px', fontWeight: '700' }}>{unevaluatedCount}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('recues')}
            style={{
              padding: '10px 20px', borderRadius: '10px', border: `1px solid ${activeTab === 'recues' ? E : borderC}`,
              background: activeTab === 'recues' ? E : 'transparent', color: activeTab === 'recues' ? '#FFF' : textSec,
              fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Icon name="star" size={14} color={activeTab === 'recues' ? '#FFF' : '#F59E0B'} />
            {t('passengerReviewsLabel') || 'Avis reçus'} ({totalEvaluations})
          </button>
        </div>

        {/* ═══ TAB: Évaluer passagers ═══ */}
        {activeTab === 'evaluer' && (
          <div>
            {reservationsAEvaluer.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: bg, borderRadius: '16px', border: `1px dashed ${borderC}` }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: EL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Icon name="users" size={32} color={E} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: textColor, marginBottom: '8px' }}>
                  {t('noTripsToEvaluate') || 'Aucun trajet à évaluer'}
                </h3>
                <p style={{ fontSize: '14px', color: textSec, margin: 0 }}>
                  {t('noTripsToEvaluateDesc') || 'Les trajets terminés avec des passagers apparaîtront ici.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {reservationsAEvaluer.map((reservation) => {
                  const isEvaluated = reservation.dejaEvalue || evalSentIds.has(reservation.id);
                  return (
                    <div key={reservation.id} style={{ background: bg, borderRadius: '16px', padding: '22px 24px', border: `1px solid ${borderC}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                        <div style={{ position: 'relative', width: '44px', height: '44px', flexShrink: 0 }}>
                          {reservation.passager.photo && (
                            <img src={reservation.passager.photo.startsWith('http') ? reservation.passager.photo : `/uploads/profils/${reservation.passager.photo}`} alt="" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 2, border: `2px solid ${darkMode ? '#2A2A2A' : '#F3F4F6'}` }} />
                          )}
                          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `linear-gradient(135deg, ${E}, ${ED})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '700', color: '#FFF', position: 'relative', zIndex: 1 }}>
                            {reservation.passager.prenom?.charAt(0)}{reservation.passager.nom?.charAt(0)}
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '700', color: textColor, fontSize: '15px', marginBottom: '4px' }}>{reservation.passager.prenom} {reservation.passager.nom}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: textSec, marginBottom: isEvaluated ? 0 : '12px' }}>
                            <Icon name="mapPin" size={12} color={textSec} />
                            {reservation.trajet.villeDepart} → {reservation.trajet.villeArrivee}
                            <span style={{ margin: '0 4px' }}>·</span>
                            {reservation.trajet.dateDepart}
                          </div>
                          {isEvaluated ? (
                            <div style={{ padding: '8px 14px', background: EL, borderRadius: '8px', fontSize: '13px', color: ED, fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={E} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17L4 12" /></svg>
                              {evalSentIds.has(reservation.id) ? (t('evaluationSent') || 'Évaluation envoyée') : (t('alreadyEvaluated') || 'Déjà évalué')}
                            </div>
                          ) : (
                            <div>
                              {/* Star selector */}
                              <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
                                {[1, 2, 3, 4, 5].map(star => (
                                  <button key={star} onClick={() => setEvalNote(star)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', transition: 'transform 0.15s' }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.2)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                                  >
                                    <Icon name={star <= evalNote ? 'star' : 'starEmpty'} size={22} color={star <= evalNote ? '#F59E0B' : '#D1D5DB'} />
                                  </button>
                                ))}
                                <span style={{ fontSize: '13px', color: textSec, marginLeft: '8px', alignSelf: 'center' }}>
                                  {evalNote > 0 ? `${evalNote}/5` : (t('selectRating') || 'Choisir une note')}
                                </span>
                              </div>
                              <textarea
                                value={evalComment}
                                onChange={e => setEvalComment(e.target.value)}
                                placeholder={t('optionalComment') || 'Commentaire (optionnel)...'}
                                rows={2}
                                style={{
                                  width: '100%', padding: '10px 14px', background: darkMode ? '#2A2A2A' : '#F3F4F6',
                                  border: `1px solid ${borderC}`, borderRadius: '10px', fontSize: '13px', resize: 'vertical',
                                  color: textColor, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: '10px'
                                }}
                              />
                              <button
                                onClick={() => handleEvaluerPassager(reservation.id)}
                                disabled={evaluatingId === reservation.id || evalNote < 1}
                                style={{
                                  padding: '8px 18px', borderRadius: '8px', border: 'none',
                                  background: evaluatingId === reservation.id || evalNote < 1 ? GR : `linear-gradient(135deg, ${E}, ${ED})`,
                                  color: '#fff', fontSize: '13px', fontWeight: '600',
                                  cursor: evaluatingId === reservation.id || evalNote < 1 ? 'not-allowed' : 'pointer',
                                  display: 'flex', alignItems: 'center', gap: '6px'
                                }}
                              >
                                {evaluatingId === reservation.id ? (
                                  <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                ) : null}
                                {t('sendEvaluation') || 'Envoyer l\'évaluation'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══ TAB: Avis reçus ═══ */}
        {activeTab === 'recues' && (<>
        {/* ═══ Stats Section ═══ */}
        {totalEvaluations > 0 && (
          <div style={{
            background: bg, borderRadius: '16px', padding: '28px',
            marginBottom: '28px', border: `1px solid ${borderC}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '32px', alignItems: 'center'
          }}>
            {/* Left: Big number + stars */}
            <div style={{ textAlign: 'center', minWidth: '140px' }}>
              <div style={{ fontSize: '56px', fontWeight: '800', color: E, lineHeight: 1 }}>
                {noteMoyenne.toFixed(1)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', margin: '10px 0 6px' }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i}>
                    {i < Math.round(noteMoyenne) ? (
                      <Icon name="star" size={20} color="#F59E0B" />
                    ) : (
                      <Icon name="starEmpty" size={20} />
                    )}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: '13px', color: textSec }}>
                {totalEvaluations} {t('reviewsShort')}
              </div>
            </div>

            {/* Right: 5 bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {repartition.map(({ star, count, percentage }) => (
                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', minWidth: '70px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: textColor, minWidth: '14px' }}>{star}</span>
                    <Icon name="star" size={13} color="#F59E0B" />
                  </div>
                  <div style={{ flex: 1, height: '10px', background: darkMode ? '#2A2A2A' : '#F3F4F6', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #F59E0B, #F97316)',
                      borderRadius: '5px',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                  <span style={{ fontSize: '12px', color: textSec, minWidth: '36px', textAlign: 'right' }}>
                    {Math.round(percentage)}%
                  </span>
                  <span style={{ fontSize: '11px', color: textSec, minWidth: '20px', textAlign: 'right' }}>
                    ({count})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ Filter bar ═══ */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          marginBottom: '20px', flexWrap: 'wrap'
        }}>
          <Icon name="filter" size={16} color={textSec} />
          <span style={{ fontSize: '13px', fontWeight: '600', color: textSec, marginRight: '4px' }}>{t('filterLabel')}</span>
          <button
            onClick={() => setFiltreNote(null)}
            style={{
              padding: '6px 14px', borderRadius: '20px', border: `1px solid ${filtreNote === null ? E : borderC}`,
              background: filtreNote === null ? E : 'transparent',
              color: filtreNote === null ? '#FFF' : textSec,
              fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            {t('all')} ({totalEvaluations})
          </button>
          {[5, 4, 3, 2, 1].map(star => {
            const count = evaluations.filter(e => e.note === star).length;
            if (count === 0) return null;
            return (
              <button
                key={star}
                onClick={() => setFiltreNote(filtreNote === star ? null : star)}
                style={{
                  padding: '6px 14px', borderRadius: '20px', border: `1px solid ${filtreNote === star ? '#F59E0B' : borderC}`,
                  background: filtreNote === star ? '#F59E0B' : 'transparent',
                  color: filtreNote === star ? '#FFF' : textSec,
                  fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s'
                }}
              >
                {star} <Icon name="star" size={11} color={filtreNote === star ? '#FFF' : '#F59E0B'} /> ({count})
              </button>
            );
          })}
        </div>

        {/* ═══ Reviews List ═══ */}
        {evaluationsFiltrees.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: bg, borderRadius: '16px',
            border: `1px dashed ${borderC}`
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: EL, display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 16px'
            }}>
              <Icon name="star" size={32} color={E} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: textColor, marginBottom: '8px' }}>
              {filtreNote !== null ? `${t('noReviewsWithPrefix')} ${filtreNote} ${filtreNote > 1 ? t('starsPlural') : t('starSingular')}` : t('noEvaluationsYet')}
            </h3>
            <p style={{ fontSize: '14px', color: textSec, margin: 0 }}>
              {filtreNote !== null ? t('tryAnotherFilter') : t('noEvaluationsDesc')}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {evaluationsFiltrees.map((evaluation) => {
              const photo = evaluation.auteur.photo;
              const initials = `${evaluation.auteur.prenom?.charAt(0) || ''}${evaluation.auteur.nom?.charAt(0) || ''}`.toUpperCase();

              return (
                <div
                  key={evaluation.id}
                  style={{
                    background: bg, borderRadius: '16px', padding: '22px 24px',
                    border: `1px solid ${borderC}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                  }}
                >
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>

                    {/* Left: Avatar */}
                    <div style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0 }}>
                      {photo && (
                        <img
                          src={photo.startsWith('http') ? photo : `/uploads/profils/${photo}`}
                          alt={t('passengerPhotoAlt')}
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                          style={{
                            width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover',
                            position: 'absolute', top: 0, left: 0, zIndex: 2,
                            border: `2px solid ${darkMode ? '#2A2A2A' : '#F3F4F6'}`
                          }}
                        />
                      )}
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: `linear-gradient(135deg, ${E}, ${ED})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '16px', fontWeight: '700', color: '#FFF',
                        position: 'relative', zIndex: 1
                      }}>
                        {initials}
                      </div>
                    </div>

                    {/* Center: Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Line 1: Name + relative date */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                        <span style={{ fontSize: '15px', fontWeight: '700', color: textColor }}>
                          {evaluation.auteur.prenom} {evaluation.auteur.nom}
                        </span>
                        <span style={{ fontSize: '12px', color: textSec, whiteSpace: 'nowrap' }}>
                          {getRelativeTime(evaluation.dateEvaluation, lang)}
                        </span>
                      </div>

                      {/* Line 2: Stars */}
                      <div style={{ display: 'flex', gap: '3px', marginBottom: '10px' }}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <span key={i}>
                            {i < evaluation.note ? (
                              <Icon name="star" size={16} color="#F59E0B" />
                            ) : (
                              <Icon name="starEmpty" size={16} />
                            )}
                          </span>
                        ))}
                      </div>

                      {/* Line 3: Comment in chat bubble */}
                      {evaluation.commentaire && (
                        <div style={{
                          padding: '14px 16px',
                          background: darkMode ? '#2A2A2A' : '#F3F4F6',
                          borderRadius: '4px 12px 12px 12px',
                          fontSize: '14px',
                          color: darkMode ? '#E5E7EB' : '#374151',
                          lineHeight: '1.55',
                          marginBottom: evaluation.reservation?.trajet ? '10px' : 0
                        }}>
                          {evaluation.commentaire}
                        </div>
                      )}

                      {/* Line 4: Trip badge */}
                      {evaluation.reservation?.trajet && (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '6px 12px', background: EL, borderRadius: '8px',
                          fontSize: '12px', color: ED, fontWeight: '600', marginTop: '2px'
                        }}>
                          <Icon name="mapPin" size={12} color={E} />
                          {evaluation.reservation.trajet.villeDepart} → {evaluation.reservation.trajet.villeArrivee}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </>)}
      </div>

      <style jsx>{`
        @media (max-width: 600px) {
          div[style*="grid-template-columns: auto 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </ConducteurLayout>
  );
}
