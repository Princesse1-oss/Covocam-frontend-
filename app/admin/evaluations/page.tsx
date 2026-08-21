'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

interface Evaluation {
  id: number;
  note: number;
  commentaire: string | null;
  dateEvaluation: string;
  auteur: { nom: string; prenom: string; email: string; photo?: string | null };
}

type PeriodKey = '1m' | '3m' | '6m' | 'all';

const PERIOD_OPTIONS: { key: PeriodKey; label: string; months: number | null }[] = [
  { key: '1m', label: '1 mois', months: 1 },
  { key: '3m', label: '3 mois', months: 3 },
  { key: '6m', label: '6 mois', months: 6 },
  { key: 'all', label: 'Tout', months: null },
];

const GREEN = '#0D9E7E';
const TEXT = '#111827';
const MUTED = '#6b7280';
const BORDER = '#e5e7eb';
const BG = '#f8fafb';
const STAR_FILLED = '#f59e0b';
const STAR_EMPTY = '#e5e7eb';

const BAR_COLORS: Record<number, string> = {
  5: '#0D9E7E',
  4: '#10b981',
  3: '#eab308',
  2: '#f97316',
  1: '#ef4444',
};

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  return isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function StarIcon({ size = 14, filled = true }: { size?: number; filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? STAR_FILLED : STAR_EMPTY}>
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

function Stars({ note, size = 14 }: { note: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <StarIcon key={i} size={size} filled={i <= Math.round(note)} />
      ))}
    </span>
  );
}

export default function AdminEvaluations() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterNote, setFilterNote] = useState('toutes');
  const [period, setPeriod] = useState<PeriodKey>('all');
  const [adminError, setAdminError] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) { window.location.href = '/login'; return; }
    try {
      const parsed = JSON.parse(userData) as { roles?: string[] };
      if (!parsed.roles?.includes('ROLE_ADMIN')) { window.location.href = '/login'; return; }
    } catch {
      window.location.href = '/login';
      return;
    }
    fetch('/api/evaluations', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setEvaluations(Array.isArray(data) ? data : data.evaluations || []))
      .catch(() => setEvaluations([]))
      .finally(() => setLoading(false));
  }, []);

  const periodEvals = useMemo(() => {
    const months = PERIOD_OPTIONS.find(p => p.key === period)?.months ?? null;
    if (months === null) return evaluations;
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);
    return evaluations.filter(e => {
      const d = new Date(e.dateEvaluation);
      return !isNaN(d.getTime()) && d >= cutoff;
    });
  }, [evaluations, period]);

  const stats = useMemo(() => {
    const total = periodEvals.length;
    const avg = total > 0 ? periodEvals.reduce((acc, e) => acc + e.note, 0) / total : 0;
    const best = total > 0 ? Math.max(...periodEvals.map(e => e.note)) : 0;
    const sortedByDate = [...periodEvals].sort(
      (a, b) => new Date(b.dateEvaluation).getTime() - new Date(a.dateEvaluation).getTime()
    );
    return { total, avg, best, latest: sortedByDate[0] };
  }, [periodEvals]);

  const distribution = useMemo(
    () =>
      [5, 4, 3, 2, 1].map(note => {
        const count = periodEvals.filter(e => e.note === note).length;
        return {
          note,
          count,
          pct: periodEvals.length > 0 ? Math.round((count / periodEvals.length) * 100) : 0,
        };
      }),
    [periodEvals]
  );

  const filtered = useMemo(
    () =>
      evaluations.filter(e => {
        const haystack = (
          e.auteur?.prenom + ' ' + e.auteur?.nom + ' ' + e.auteur?.email + ' ' + (e.commentaire || '')
        ).toLowerCase();
        const matchSearch = haystack.includes(search.toLowerCase());
        const matchNote = filterNote === 'toutes' || e.note === parseInt(filterNote);
        return matchSearch && matchNote;
      }),
    [evaluations, search, filterNote]
  );

  const activePeriodLabel = PERIOD_OPTIONS.find(p => p.key === period)?.label ?? 'Tout';

  const confirmDelete = async (id: number) => {
    setPendingDeleteId(null);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/evaluations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('delete failed');
      setEvaluations(prev => prev.filter(e => e.id !== id));
    } catch {
      setAdminError("Erreur lors de la suppression de l'évaluation");
      setTimeout(() => setAdminError(''), 4000);
    }
  };

  if (loading)
    return (
      <AdminLayout>
        <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)', background: BG }}>
          <p style={{ color: MUTED }}>Chargement...</p>
        </div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", minHeight: 'calc(100vh - 64px)', background: BG }}>

        <header style={{
          background: '#fff', padding: '14px 24px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap', borderBottom: `1px solid ${BORDER}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(13,158,126,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <StarIcon size={18} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '19px', fontWeight: 700, color: TEXT }}>Évaluations</h1>
              <span style={{ fontSize: '11px', color: MUTED }}>{evaluations.length} au total sur la plateforme</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Rechercher un auteur, un commentaire..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  padding: '8px 12px 8px 32px', border: `1px solid ${BORDER}`, borderRadius: '8px',
                  fontSize: '13px', outline: 'none', width: '230px', color: TEXT,
                }}
              />
            </div>

            <select
              value={filterNote}
              onChange={e => setFilterNote(e.target.value)}
              style={{
                padding: '8px 12px', border: `1px solid ${BORDER}`, borderRadius: '8px',
                fontSize: '13px', outline: 'none', background: '#fff', color: TEXT,
              }}
            >
              <option value="toutes">Toutes les notes</option>
              {[5, 4, 3, 2, 1].map(n => (
                <option key={n} value={n}>{n} étoile{n > 1 ? 's' : ''}</option>
              ))}
            </select>

            <div style={{ display: 'flex', background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '2px', gap: '2px' }}>
              {PERIOD_OPTIONS.map(p => (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p.key)}
                  style={{
                    padding: '6px 11px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                    border: 'none', borderRadius: '6px', whiteSpace: 'nowrap',
                    background: period === p.key ? GREEN : 'transparent',
                    color: period === p.key ? '#fff' : MUTED,
                    transition: 'background .15s, color .15s',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main style={{ padding: '18px 24px' }}>
          {adminError && (
            <div style={{
              padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px',
              marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626',
              fontSize: '13px', fontWeight: '600',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {adminError}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '18px' }}>
            <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(13,158,126,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <circle cx="3.5" cy="6" r="1" fill={GREEN} />
                  <circle cx="3.5" cy="12" r="1" fill={GREEN} />
                  <circle cx="3.5" cy="18" r="1" fill={GREEN} />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: TEXT, lineHeight: 1.1 }}>{stats.total}</div>
                <div style={{ fontSize: '11px', color: MUTED, marginTop: '3px' }}>Total évaluations</div>
                <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '1px' }}>Période : {activePeriodLabel}</div>
              </div>
            </div>

            <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(13,158,126,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: TEXT, lineHeight: 1.1, display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                  {stats.avg.toFixed(1)}<span style={{ fontSize: '12px', fontWeight: 600, color: MUTED }}>/5</span>
                </div>
                <div style={{ fontSize: '11px', color: MUTED, marginTop: '3px' }}>Note moyenne</div>
                <div style={{ marginTop: '2px' }}><Stars note={stats.avg} size={11} /></div>
              </div>
            </div>

            <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(13,158,126,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: TEXT, lineHeight: 1.1, display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                  {stats.total > 0 ? stats.best : '—'}<span style={{ fontSize: '12px', fontWeight: 600, color: MUTED }}>{stats.total > 0 ? '/5' : ''}</span>
                </div>
                <div style={{ fontSize: '11px', color: MUTED, marginTop: '3px' }}>Meilleure note</div>
                <div style={{ marginTop: '2px' }}>{stats.total > 0 && <Stars note={stats.best} size={11} />}</div>
              </div>
            </div>

            <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(13,158,126,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: TEXT, lineHeight: 1.3 }}>
                  {stats.latest ? formatDate(stats.latest.dateEvaluation) : '—'}
                </div>
                <div style={{ fontSize: '11px', color: MUTED, marginTop: '3px' }}>Dernière note</div>
                <div style={{ marginTop: '2px' }}>{stats.latest && <Stars note={stats.latest.note} size={11} />}</div>
              </div>
            </div>
          </div>

          <section style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '18px 20px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="2" strokeLinecap="round">
                  <line x1="12" y1="20" x2="12" y2="10" />
                  <line x1="18" y1="20" x2="18" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="16" />
                </svg>
                <span style={{ fontSize: '14px', fontWeight: 700, color: TEXT }}>Répartition des notes</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ background: 'rgba(13,158,126,0.1)', color: GREEN, fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: 700 }}>
                  {activePeriodLabel}
                </span>
                <span style={{ fontSize: '12px', color: MUTED }}>
                  {stats.total} avis · moyenne {stats.avg.toFixed(1)}/5
                </span>
              </div>
            </div>

            {stats.total === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: '#9ca3af' }}>
                Aucune évaluation sur cette période
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {distribution.map(row => (
                  <div key={row.note} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: '36px' }}>
                      <StarIcon size={15} />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: TEXT }}>{row.note}</span>
                    </span>
                    <div style={{ flex: 1, height: '10px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: `${row.pct}%`, height: '100%', background: BAR_COLORS[row.note], borderRadius: '999px', transition: 'width .3s ease' }} />
                    </div>
                    <span style={{ fontSize: '12px', color: MUTED, minWidth: '58px', textAlign: 'right' }}>{row.count} avis</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: BAR_COLORS[row.note], minWidth: '40px', textAlign: 'right' }}>{row.pct}%</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="2" strokeLinecap="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              <span style={{ fontSize: '14px', fontWeight: 700, color: TEXT }}>Liste des évaluations</span>
              <span style={{ background: 'rgba(13,158,126,0.1)', color: GREEN, fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: 700 }}>
                {filtered.length}
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['#', 'Auteur', 'Note', 'Commentaire', 'Date', 'Action'].map(h => (
                      <th key={h} style={{
                        fontSize: '11px', color: MUTED, textAlign: 'left', padding: '10px 14px',
                        borderBottom: `1px solid ${BORDER}`, textTransform: 'uppercase', letterSpacing: '.5px',
                        fontWeight: 600, whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '50px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                          <StarIcon size={40} filled={false} />
                        </div>
                        Aucune évaluation trouvée
                      </td>
                    </tr>
                  ) : (
                    filtered.map((e, i) => (
                      <tr key={e.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafbfc', borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px 14px', fontSize: '12px', color: '#9ca3af', fontWeight: 600 }}>#{e.id}</td>

                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ position: 'relative', width: '32px', height: '32px', flexShrink: 0 }}>
                              {e.auteur?.photo && (
                                <img
                                  src={e.auteur.photo.startsWith('http') ? e.auteur.photo : `/uploads/profils/${e.auteur.photo}`}
                                  alt=""
                                  onError={ev => { (ev.currentTarget as HTMLImageElement).style.display = 'none'; }}
                                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 2, border: `1px solid ${BORDER}` }}
                                />
                              )}
                              <div style={{
                                width: '32px', height: '32px', borderRadius: '50%', background: GREEN,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px',
                                color: '#fff', fontWeight: 700, position: 'relative', zIndex: 1,
                              }}>
                                {e.auteur?.prenom?.charAt(0)}{e.auteur?.nom?.charAt(0)}
                              </div>
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: TEXT }}>
                                {e.auteur?.prenom} {e.auteur?.nom}
                              </div>
                              <div style={{ fontSize: '11px', color: '#9ca3af' }}>{e.auteur?.email}</div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <Stars note={e.note} size={15} />
                            <span style={{ fontSize: '11px', fontWeight: 700, color: TEXT }}>{e.note}/5</span>
                          </div>
                        </td>

                        <td style={{ padding: '12px 14px', maxWidth: '260px' }}>
                          {e.commentaire ? (
                            <div style={{ fontSize: '12px', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={e.commentaire}>
                              {e.commentaire}
                            </div>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#d1d5db', fontStyle: 'italic' }}>Aucun commentaire</span>
                          )}
                        </td>

                        <td style={{ padding: '12px 14px', fontSize: '12px', color: MUTED, whiteSpace: 'nowrap' }}>
                          {formatDate(e.dateEvaluation)}
                        </td>

                        <td style={{ padding: '12px 14px' }}>
                          {pendingDeleteId === e.id ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: TEXT, whiteSpace: 'nowrap' }}>Supprimer ?</span>
                              <button
                                onClick={() => confirmDelete(e.id)}
                                title="Confirmer la suppression"
                                style={{
                                  width: '26px', height: '26px', borderRadius: '6px', border: 'none', background: '#DC2626',
                                  color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setPendingDeleteId(null)}
                                title="Annuler"
                                style={{
                                  width: '26px', height: '26px', borderRadius: '6px', border: `1px solid ${BORDER}`, background: '#fff',
                                  color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setPendingDeleteId(e.id)}
                              title="Supprimer cette évaluation"
                              style={{
                                background: '#FEF2F2', border: 'none', color: '#DC2626', padding: '6px 12px', borderRadius: '8px',
                                fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                              }}
                              onMouseEnter={ev => { ev.currentTarget.style.background = '#FEE2E2'; }}
                              onMouseLeave={ev => { ev.currentTarget.style.background = '#FEF2F2'; }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
                              </svg>
                              Supprimer
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filtered.length > 0 && (
              <div style={{ padding: '12px 20px', borderTop: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: MUTED }}>{filtered.length} évaluation(s) affichée(s)</span>
                <span style={{ fontSize: '12px', color: MUTED }}>
                  Moyenne affichée : <strong style={{ color: STAR_FILLED }}>
                    {(filtered.reduce((acc, e) => acc + e.note, 0) / filtered.length).toFixed(1)}/5
                  </strong>
                </span>
              </div>
            )}
          </section>
        </main>
      </div>
    </AdminLayout>
  );
}
