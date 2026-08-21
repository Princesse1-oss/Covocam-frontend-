'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

interface Evaluation {
  id: number;
  note: number;
  commentaire: string | null;
  dateEvaluation: string;
  auteur: { id?: number; nom: string; prenom: string; email: string; photo?: string | null };
  cible: { id?: number; nom: string; prenom: string; email: string; photo?: string | null };
  trajet: { villeDepart: string; villeArrivee: string; dateDepart: string };
}

export default function AdminEvaluations() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filterNote, setFilterNote] = useState('toutes');
  const [adminError, setAdminError] = useState('');
  const [confirmDeleteEvalId, setConfirmDeleteEvalId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) { window.location.href = '/login'; return; }
    if (userData) {
      const parsed = JSON.parse(userData);
      if (!parsed.roles?.includes('ROLE_ADMIN')) { window.location.href = '/login'; return; }
      setUser(parsed);
    }
    fetch('/api/evaluations', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setEvaluations(Array.isArray(data) ? data : data.evaluations || []))
      .catch(() => setEvaluations([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (confirmDeleteEvalId !== id) { setConfirmDeleteEvalId(id); return; }
    setConfirmDeleteEvalId(null);
    const token = localStorage.getItem('token');
    try {
      await fetch(`/api/evaluations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvaluations(evaluations.filter(e => e.id !== id));
    } catch {
      setAdminError('Erreur lors de la suppression');
      setTimeout(() => setAdminError(''), 4000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const filtered = evaluations.filter(e => {
    const matchSearch = (
      e.auteur?.nom + ' ' + e.auteur?.prenom +
      e.cible?.nom + ' ' + e.cible?.prenom +
      (e.commentaire || '')
    ).toLowerCase().includes(search.toLowerCase());
    const matchNote = filterNote === 'toutes' || e.note === parseInt(filterNote);
    return matchSearch && matchNote;
  });

  const noteMoyenne = evaluations.length > 0
    ? evaluations.reduce((acc, e) => acc + e.note, 0) / evaluations.length
    : 0;

  const noteRepartition = [5, 4, 3, 2, 1].map(n => ({
    note: n,
    count: evaluations.filter(e => e.note === n).length,
    pct: evaluations.length > 0 ? Math.round((evaluations.filter(e => e.note === n).length / evaluations.length) * 100) : 0,
  }));

  const stars = (note: number) => '★'.repeat(note) + '☆'.repeat(5 - note);
  const starColor = (note: number) => note >= 4 ? '#16a34a' : note === 3 ? '#d97706' : '#dc2626';

  if (loading) return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)' }}>
        <p style={{ color: '#6b7280' }}>Chargement...</p>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}>
        {adminError && (
          <div style={{ padding: '12px 16px', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626', fontSize: '13px', fontWeight: '600' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            {adminError}
          </div>
        )}
        {confirmDeleteEvalId !== null && (
          <div style={{ marginBottom: '16px', padding: '16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#DC2626' }}>Supprimer cette évaluation ?</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setConfirmDeleteEvalId(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#FFF', color: '#374151', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Annuler</button>
              <button onClick={() => handleDelete(confirmDeleteEvalId)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#DC2626', color: '#FFF', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Supprimer</button>
            </div>
          </div>
        )}
        <header style={{ background: '#fff', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </span>
            Gestion des évaluations
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '7px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', width: '180px' }}
            />
            <select value={filterNote} onChange={e => setFilterNote(e.target.value)}
              style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fff', color: '#374151' }}>
              <option value="toutes">Toutes les notes</option>
              {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} étoile{n > 1 ? 's' : ''}</option>)}
            </select>
            <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600' }}>
              {evaluations.length} évaluation(s)
            </span>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: '#f8fafb' }}>

          {/* Stat cards avec SVG */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            {[
              { label: 'Total évaluations', value: evaluations.length, border: '#22c55e', bg: '#dcfce7', icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              )},
              { label: 'Note moyenne', value: noteMoyenne.toFixed(1) + ' / 5', border: '#d97706', bg: '#fef3c7', icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12v-2a5 5 0 00-5-5H8a5 5 0 00-5 5v2" />
                  <circle cx="12" cy="16" r="5" />
                  <path d="M12 11v5" />
                  <path d="M9 14h6" />
                </svg>
              )},
              { label: '5 étoiles', value: noteRepartition.find(n => n.note === 5)?.count ?? 0, border: '#15803d', bg: '#dcfce7', icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              )},
              { label: '1 étoile', value: noteRepartition.find(n => n.note === 1)?.count ?? 0, border: '#dc2626', bg: '#fee2e2', icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
              )},
            ].map((card, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '10px', padding: '16px', border: '1px solid #e5e7eb', borderTop: `3px solid ${card.border}` }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                  {card.icon}
                </div>
                <div style={{ fontSize: '22px', fontWeight: '700', color: '#111827', lineHeight: 1 }}>{card.value}</div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>{card.label}</div>
              </div>
            ))}
          </div>

          {/* Répartition des notes avec SVG */}
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px', marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </span>
              Répartition des notes
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {noteRepartition.map(n => (
                <div key={n.note} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '13px', color: starColor(n.note), fontWeight: '700', minWidth: '20px' }}>{n.note}</span>
                  <span style={{ fontSize: '14px', color: '#f59e0b', minWidth: '70px', display: 'flex', gap: '1px' }}>
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < n.note ? '#f59e0b' : '#e5e7eb'} stroke={i < n.note ? '#f59e0b' : '#e5e7eb'} strokeWidth="1">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </span>
                  <div style={{ flex: 1, background: '#f3f4f6', borderRadius: '20px', height: '8px', overflow: 'hidden' }}>
                    <div style={{ width: `${n.pct}%`, height: '100%', background: starColor(n.note), borderRadius: '20px', transition: 'width .3s' }} />
                  </div>
                  <span style={{ fontSize: '12px', color: '#6b7280', minWidth: '50px', textAlign: 'right' }}>{n.count} ({n.pct}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tableau avec SVG */}
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>Liste des évaluations</span>
              <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' }}>{filtered.length}</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['#', 'Auteur', 'Conducteur noté', 'Trajet', 'Note', 'Commentaire', 'Date', 'Action'].map(h => (
                      <th key={h} style={{ fontSize: '11px', color: '#6b7280', textAlign: 'left', padding: '10px 14px', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: '600', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '60px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                        <div style={{ fontSize: '40px', marginBottom: '10px' }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        </div>
                        Aucune évaluation trouvée
                      </td>
                    </tr>
                  ) : filtered.map((e, i) => (
                    <tr key={e.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f3f4f6' }}>

                      <td style={{ padding: '12px 14px', fontSize: '12px', color: '#9ca3af', fontWeight: '600' }}>#{e.id}</td>

                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ position: 'relative', width: '28px', height: '28px', flexShrink: 0 }}>
                            {e.auteur?.photo && (
                              <img
                                src={e.auteur.photo.startsWith('http') ? e.auteur.photo : `/uploads/profils/${e.auteur.photo}`}
                                alt=""
                                onError={(ev) => { (ev.currentTarget as HTMLImageElement).style.display = 'none'; }}
                                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 2, border: '1px solid #e5e7eb' }}
                              />
                            )}
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff', fontWeight: '700', position: 'relative', zIndex: 1 }}>
                              {e.auteur?.prenom?.charAt(0)}{e.auteur?.nom?.charAt(0)}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>{e.auteur?.prenom} {e.auteur?.nom}</div>
                            <div style={{ fontSize: '10px', color: '#9ca3af' }}>{e.auteur?.email}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ position: 'relative', width: '28px', height: '28px', flexShrink: 0 }}>
                            {e.cible?.photo && (
                              <img
                                src={e.cible.photo.startsWith('http') ? e.cible.photo : `/uploads/profils/${e.cible.photo}`}
                                alt=""
                                onError={(ev) => { (ev.currentTarget as HTMLImageElement).style.display = 'none'; }}
                                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 2, border: '1px solid #e5e7eb' }}
                              />
                            )}
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#22c55e', fontWeight: '700', position: 'relative', zIndex: 1 }}>
                              {e.cible?.prenom?.charAt(0)}{e.cible?.nom?.charAt(0)}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>{e.cible?.prenom} {e.cible?.nom}</div>
                            <div style={{ fontSize: '10px', color: '#9ca3af' }}>{e.cible?.email}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>{e.trajet?.villeDepart}</span>
                          <span style={{ color: '#22c55e' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 12L19 12" />
                              <path d="M12 5L19 12L12 19" />
                            </svg>
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>{e.trajet?.villeArrivee}</span>
                        </div>
                        <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                          {e.trajet?.dateDepart ? new Date(e.trajet.dateDepart).toLocaleDateString('fr-FR') : '—'}
                        </div>
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '14px', color: '#f59e0b', display: 'flex', gap: '1px' }}>
                            {[...Array(5)].map((_, idx) => (
                              <svg key={idx} width="16" height="16" viewBox="0 0 24 24" fill={idx < e.note ? '#f59e0b' : '#e5e7eb'} stroke={idx < e.note ? '#f59e0b' : '#e5e7eb'} strokeWidth="1">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            ))}
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: starColor(e.note) }}>{e.note}/5</span>
                        </div>
                      </td>

                      <td style={{ padding: '12px 14px', maxWidth: '160px' }}>
                        {e.commentaire ? (
                          <div style={{ fontSize: '12px', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={e.commentaire}>
                            {e.commentaire}
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#d1d5db', fontStyle: 'italic' }}>Aucun commentaire</span>
                        )}
                      </td>

                      <td style={{ padding: '12px 14px', fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                        {e.dateEvaluation ? new Date(e.dateEvaluation).toLocaleDateString('fr-FR') : '—'}
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <button onClick={() => handleDelete(e.id)} style={{ background: '#fee2e2', border: 'none', color: '#dc2626', padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          onMouseEnter={ev => ev.currentTarget.style.background = '#fecaca'}
                          onMouseLeave={ev => ev.currentTarget.style.background = '#fee2e2'}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" />
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length > 0 && (
              <div style={{ padding: '12px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{filtered.length} évaluation(s) affichée(s)</span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  Moyenne filtrée : <strong style={{ color: '#d97706' }}>
                    {(filtered.reduce((acc, e) => acc + e.note, 0) / filtered.length).toFixed(1)}/5
                  </strong>
                </span>
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminLayout>
  );
}