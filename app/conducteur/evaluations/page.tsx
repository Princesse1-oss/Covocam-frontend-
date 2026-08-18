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

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHeure = Math.floor(diffMin / 60);
  const diffJour = Math.floor(diffHeure / 24);
  const diffSemaine = Math.floor(diffJour / 7);
  const diffMois = Math.floor(diffJour / 30);

  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  if (diffHeure < 24) return `il y a ${diffHeure}h`;
  if (diffJour === 1) return "hier";
  if (diffJour < 7) return `il y a ${diffJour} jours`;
  if (diffSemaine === 1) return "il y a 1 semaine";
  if (diffSemaine < 4) return `il y a ${diffSemaine} semaines`;
  if (diffMois === 1) return "il y a 1 mois";
  if (diffMois < 12) return `il y a ${diffMois} mois`;
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function MesEvaluationsPage() {
  const router = useRouter();
  const { darkMode } = useTheme();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteMoyenne, setNoteMoyenne] = useState<number>(0);
  const [totalEvaluations, setTotalEvaluations] = useState<number>(0);
  const [filtreNote, setFiltreNote] = useState<number | null>(null);

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

  const bg = darkMode ? '#1A1A1A' : '#FFFFFF';
  const textColor = darkMode ? '#FFFFFF' : BK;
  const textSec = darkMode ? '#9CA3AF' : GR;
  const borderC = darkMode ? '#2A2A2A' : BD;

  if (loading) {
    return (
      <ConducteurLayout>
        <div style={{ padding: '80px', textAlign: 'center', color: textSec }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `3px solid ${EL}`, borderTopColor: E, animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p>Chargement de vos évaluations...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
        </div>
      </ConducteurLayout>
    );
  }

  return (
    <ConducteurLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 16px 40px' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: textColor, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icon name="star" size={24} color={E} /> Avis des passagers
          </h1>
          <p style={{ fontSize: '14px', color: textSec, margin: 0 }}>
            {totalEvaluations} avis reçus au total
          </p>
        </div>

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
                {totalEvaluations} avis
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
          <span style={{ fontSize: '13px', fontWeight: '600', color: textSec, marginRight: '4px' }}>Filtrer :</span>
          <button
            onClick={() => setFiltreNote(null)}
            style={{
              padding: '6px 14px', borderRadius: '20px', border: `1px solid ${filtreNote === null ? E : borderC}`,
              background: filtreNote === null ? E : 'transparent',
              color: filtreNote === null ? '#FFF' : textSec,
              fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            Tous ({totalEvaluations})
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
              {filtreNote !== null ? `Aucun avis avec ${filtreNote} étoile${filtreNote > 1 ? 's' : ''}` : 'Aucune évaluation pour le moment'}
            </h3>
            <p style={{ fontSize: '14px', color: textSec, margin: 0 }}>
              {filtreNote !== null ? 'Essayez un autre filtre.' : 'Vos évaluations apparaîtront ici une fois que les passagers auront terminé leurs trajets.'}
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
                          src={photo.startsWith('http') ? photo : `${typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000` : ''}/uploads/profils/${photo}`}
                          alt="Photo passager"
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
                          {getRelativeTime(evaluation.dateEvaluation)}
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
