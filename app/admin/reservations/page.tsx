'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

interface Reservation {
  id: number;
  placesReservees?: number;
  nbPlaces?: number;
  statut: string;
  dateReservation: string;
  prixTotal: number;
  passager: {
    nom: string;
    prenom: string;
    email: string;
    photo?: string | null;
  };
  trajet: {
    villeDepart: string;
    villeArrivee: string;
    dateDepart: string;
    heureDepart: any | null;
    prixParPlace: number;
    conducteur: {
      nom: string;
      prenom: string;
      photo?: string | null;
    };
  };
}

export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('tous');
  const [user, setUser] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [sendingIds, setSendingIds] = useState<Set<number>>(new Set());
  const [sentIds, setSentIds] = useState<Set<number>>(new Set());

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!token) { window.location.href = '/login'; return; }
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        if (!parsed.roles?.includes('ROLE_ADMIN')) { window.location.href = '/login'; return; }
        setUser(parsed);
      } catch (e) {
        console.error("Erreur parsing user", e);
      }
    }
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const res = await fetch('/api/admin/reservations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.status === 404) {
        console.warn('Route admin/reservations non trouvée, fallback vers /reservations/mes-reservations');
        const fallbackRes = await fetch('/api/reservations/mes-reservations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await fallbackRes.json();
        setReservations(Array.isArray(data) ? data : data.reservations || []);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setReservations(Array.isArray(data) ? data : data.reservations || []);
    } catch {
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const filtered = reservations.filter(r => {
    const matchSearch = (
      r.passager?.nom + ' ' + r.passager?.prenom +
      r.trajet?.villeDepart + ' ' + r.trajet?.villeArrivee +
      r.trajet?.conducteur?.nom
    ).toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === 'tous' || r.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  const total = reservations.length;
  const enAttente = reservations.filter(r => r.statut === 'EN_ATTENTE').length;
  const confirmees = reservations.filter(r => r.statut === 'CONFIRMEE').length;
  const annulees = reservations.filter(r => r.statut === 'ANNULEE').length;

  const statutStyle = (s: string): React.CSSProperties => {
    const upper = s?.toUpperCase() || '';
    if (upper === 'CONFIRMEE' || upper === 'ACCEPTED') return { background: '#dcfce7', color: '#15803d' };
    if (upper === 'EN_ATTENTE' || upper === 'PENDING') return { background: '#fef3c7', color: '#d97706' };
    if (upper === 'ANNULEE' || upper === 'CANCELLED') return { background: '#fee2e2', color: '#dc2626' };
    return { background: '#f3f4f6', color: '#6b7280' };
  };

  const statutLabel = (s: string) => {
    const upper = s?.toUpperCase() || '';
    if (upper === 'CONFIRMEE' || upper === 'ACCEPTED') return 'Confirmée';
    if (upper === 'EN_ATTENTE' || upper === 'PENDING') return 'En attente';
    if (upper === 'ANNULEE' || upper === 'CANCELLED') return 'Annulée';
    return s || 'Inconnu';
  };

  const handleEnvoyerArgent = async (reservationId: number) => {
    if (sendingIds.has(reservationId) || sentIds.has(reservationId)) return;
    setSendingIds(prev => new Set(prev).add(reservationId));
    try {
      const res = await fetch(`/api/admin/reservations/${reservationId}/envoyer-argent`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSentIds(prev => new Set(prev).add(reservationId));
      } else {
        alert('Erreur lors de l\'envoi de l\'argent');
      }
    } catch {
      alert('Erreur réseau lors de l\'envoi de l\'argent');
    } finally {
      setSendingIds(prev => { const next = new Set(prev); next.delete(reservationId); return next; });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)' }}>
          <p style={{ color: '#6b7280' }}>Chargement...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}>
        <header style={{ background: '#fff', padding: isMobile ? '12px 16px' : '0 24px', height: isMobile ? 'auto' : '56px', display: 'flex', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', flexShrink: 0, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '10px' : '0' }}>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>Gestion des réservations</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
            <input
              type="text"
              placeholder="Rechercher une réservation..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '7px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', width: isMobile ? '100%' : '200px', flex: isMobile ? 1 : 'none', boxSizing: 'border-box' }}
            />
            <select
              value={filterStatut}
              onChange={e => setFilterStatut(e.target.value)}
              style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fff', color: '#374151', flex: isMobile ? 1 : 'none', minWidth: 0 }}
            >
              <option value="tous">Tous les statuts</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="CONFIRMEE">Confirmée</option>
              <option value="ANNULEE">Annulée</option>
            </select>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '20px 24px', background: '#f8fafb' }}>
          {/* Stat cards avec SVG */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
            {[
              { label: 'Total réservations', value: total, border: '#22c55e', bg: '#dcfce7', icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="3" />
                  <path d="M16 2V6M8 2V6M3 10H21" />
                  <path d="M8 14H16M8 17H13" />
                </svg>
              )},
              { label: 'En attente', value: enAttente, border: '#d97706', bg: '#fef3c7', icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              )},
              { label: 'Confirmées', value: confirmees, border: '#15803d', bg: '#dcfce7', icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17L4 12" />
                </svg>
              )},
              { label: 'Annulées', value: annulees, border: '#dc2626', bg: '#fee2e2', icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 9L9 15" />
                  <path d="M9 9L15 15" />
                </svg>
              )},
            ].map((card, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '10px', padding: '16px', border: '1px solid #e5e7eb', borderTop: `3px solid ${card.border}` }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                  {card.icon}
                </div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827', lineHeight: 1 }}>{card.value}</div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>{card.label}</div>
              </div>
            ))}
          </div>

          {/* Tableau des réservations */}
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="3" />
                  <path d="M16 2V6M8 2V6M3 10H21" />
                  <path d="M8 14H16M8 17H13" />
                </svg>
              </span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>Liste des réservations</span>
              <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' }}>{filtered.length}</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['#', 'Passager', 'Trajet', 'Conducteur', 'Date départ', 'Places', 'Prix total', 'Date réservation', 'Statut', 'Actions'].map(h => (
                      <th key={h} style={{ fontSize: '11px', color: '#c5c8cf', textAlign: 'left', padding: '10px 14px', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: '600', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ padding: '50px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                        <div style={{ fontSize: '36px', marginBottom: '10px' }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="3" />
                            <path d="M16 2V6M8 2V6M3 10H21" />
                            <path d="M8 14H16M8 17H13" />
                          </svg>
                        </div>
                        Aucune réservation trouvée
                      </td>
                    </tr>
                  ) : filtered.map((r, i) => {
                    const places = r.placesReservees ?? r.nbPlaces ?? 0;
                    const conducteurPhoto = r.trajet?.conducteur?.photo;

                    return (
                      <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px 14px', fontSize: '12px', color: '#9ca3af', fontWeight: '600' }}>#{r.id}</td>

                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ position: 'relative', width: '28px', height: '28px', flexShrink: 0 }}>
                              {r.passager?.photo && (
                                <img
                                  src={r.passager.photo.startsWith('http') ? r.passager.photo : `/uploads/profils/${r.passager.photo}`}
                                  alt="Photo passager"
                                  onError={(e) => (e.currentTarget.style.display = 'none')}
                                  style={{
                                    width: '100%', height: '100%', borderRadius: '50%',
                                    objectFit: 'cover', border: '2px solid #fff',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                                    position: 'absolute', top: 0, left: 0, zIndex: 10
                                  }}
                                />
                              )}
                              <div style={{
                                width: '100%', height: '100%', borderRadius: '50%',
                                background: '#1d4ed8',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '10px', color: '#fff', fontWeight: '700',
                                position: 'relative', zIndex: 1
                              }}>
                                {r.passager?.prenom?.charAt(0)}{r.passager?.nom?.charAt(0)}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>{r.passager?.prenom} {r.passager?.nom}</div>
                              <div style={{ fontSize: '11px', color: '#9ca3af' }}>{r.passager?.email || '—'}</div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>{r.trajet?.villeDepart || '—'}</span>
                            <span style={{ color: '#22c55e', fontSize: '14px' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12L19 12" />
                                <path d="M12 5L19 12L12 19" />
                              </svg>
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>{r.trajet?.villeArrivee || '—'}</span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{r.trajet?.prixParPlace?.toLocaleString() || '0'} FCFA/place</div>
                        </td>

                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ position: 'relative', width: '28px', height: '28px', flexShrink: 0 }}>
                              {conducteurPhoto && (
                                <img
                                  src={conducteurPhoto.startsWith('http') ? conducteurPhoto : `/uploads/profils/${conducteurPhoto}`}
                                  alt="Photo"
                                  onError={(e) => (e.currentTarget.style.display = 'none')}
                                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', position: 'absolute', top: 0, left: 0, zIndex: 10 }}
                                />
                              )}
                              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#22c55e', fontWeight: '700', position: 'relative', zIndex: 1 }}>
                                {r.trajet?.conducteur?.prenom?.charAt(0)}{r.trajet?.conducteur?.nom?.charAt(0)}
                              </div>
                            </div>
                            <span style={{ fontSize: '12px', color: '#374151' }}>{r.trajet?.conducteur?.prenom} {r.trajet?.conducteur?.nom}</span>
                          </div>
                        </td>

                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                          <div style={{ fontSize: '12px', color: '#374151' }}>{r.trajet?.dateDepart ? new Date(r.trajet.dateDepart).toLocaleDateString('fr-FR') : '—'}</div>
                          <div style={{ fontSize: '11px', color: '#9ca3af' }}>{r.trajet?.heureDepart || '—'}</div>
                        </td>

                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <span style={{ background: '#f0fdf4', color: '#15803d', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>{places}</span>
                        </td>

                        <td style={{ padding: '12px 14px', fontSize: '12px', fontWeight: '700', color: '#111827', whiteSpace: 'nowrap' }}>
                          {r.prixTotal?.toLocaleString() || '0'} FCFA
                        </td>

                        <td style={{ padding: '12px 14px', fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                          {r.dateReservation ? new Date(r.dateReservation).toLocaleDateString('fr-FR') : '—'}
                        </td>

                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ ...statutStyle(r.statut), padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                            {statutLabel(r.statut)}
                          </span>
                        </td>

                        <td style={{ padding: '12px 14px' }}>
                          {(r.statut === 'CONFIRMEE' || r.statut === 'TERMINEE') && (
                            <button
                              onClick={() => handleEnvoyerArgent(r.id)}
                              disabled={sendingIds.has(r.id) || sentIds.has(r.id)}
                              style={{
                                background: sentIds.has(r.id) ? '#dcfce7' : '#dcfce7',
                                color: '#15803d',
                                border: '1px solid #86efac',
                                borderRadius: '8px',
                                padding: '6px 14px',
                                fontSize: '11px',
                                fontWeight: '600',
                                cursor: sendingIds.has(r.id) || sentIds.has(r.id) ? 'default' : 'pointer',
                                opacity: sendingIds.has(r.id) ? 0.7 : 1,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {sendingIds.has(r.id) ? (
                                <>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
                                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                  </svg>
                                  Envoi...
                                </>
                              ) : sentIds.has(r.id) ? (
                                'Envoyé ✓'
                              ) : (
                                'Envoyer argent'
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filtered.length > 0 && (
              <div style={{ padding: '12px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{filtered.length} réservation(s) affichée(s)</span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  Total encaissé : <strong style={{ color: '#15803d' }}>{filtered.filter(r => r.statut === 'CONFIRMEE').reduce((acc, r) => acc + (r.prixTotal || 0), 0).toLocaleString()} FCFA</strong>
                </span>
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminLayout>
  );
}