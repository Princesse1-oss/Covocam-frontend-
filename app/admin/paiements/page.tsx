'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

interface Paiement {
  id: number;
  montantTotal: number;
  commission: number;
  montantNet: number;
  statut: string;
  datePaiement: string;
  campayReference: string;
  modePaiement?: string;
  reservationId?: number;
  passager: {
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    photo?: string | null;
  } | null;
  reservation: {
    id: number;
    nbPlaces: number;
    statut?: string;
    trajet: {
      villeDepart: string;
      villeArrivee: string;
      dateDepart: string | null;
      conducteur: {
        nom: string;
        prenom: string;
      } | null;
    } | null;
  } | null;
}

export default function AdminPaiements() {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('tous');
  const [periodeDe, setPeriodeDe] = useState('');
  const [periodeA, setPeriodeA] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!token) { window.location.href = '/login'; return; }
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        if (!parsed.roles?.includes('ROLE_ADMIN')) { window.location.href = '/login'; return; }
      } catch { window.location.href = '/login'; return; }
    }
    fetch('/api/paiements', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setPaiements(Array.isArray(data) ? data : []))
      .catch(() => setPaiements([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = paiements.filter(p => {
    const searchStr = (
      (p.passager?.nom || '') + ' ' + (p.passager?.prenom || '') + ' ' +
      (p.passager?.email || '') + ' ' + (p.campayReference || '') + ' ' +
      (p.reservation?.trajet?.villeDepart || '') + ' ' +
      (p.reservation?.trajet?.villeArrivee || '')
    ).toLowerCase();
    const matchSearch = searchStr.includes(search.toLowerCase());
    const matchStatut = filterStatut === 'tous' || p.statut === filterStatut;
    let matchDe = true, matchA = true;
    if (p.datePaiement && p.datePaiement !== 'En attente') {
      const pDate = new Date(p.datePaiement);
      matchDe = !periodeDe || pDate >= new Date(periodeDe);
      matchA = !periodeA || pDate <= new Date(periodeA + 'T23:59:59');
    }
    return matchSearch && matchStatut && matchDe && matchA;
  });

  const totalMontant = filtered.filter(p => p.statut === 'REUSSI').reduce((a, p) => a + (p.montantTotal || 0), 0);
  const totalCommission = filtered.filter(p => p.statut === 'REUSSI').reduce((a, p) => a + (p.commission || 0), 0);

  const statutStyle = (s: string): React.CSSProperties => {
    if (s === 'REUSSI') return { background: '#dcfce7', color: '#15803d' };
    if (s === 'EN_ATTENTE') return { background: '#fef3c7', color: '#d97706' };
    if (s === 'REMBOURSE') return { background: '#fee2e2', color: '#dc2626' };
    if (s === 'ECHEC') return { background: '#fee2e2', color: '#dc2626' };
    return { background: '#f3f4f6', color: '#6b7280' };
  };

  const statutLabel = (s: string) => {
    if (s === 'REUSSI') return 'Réussi';
    if (s === 'EN_ATTENTE') return 'En attente';
    if (s === 'REMBOURSE') return 'Remboursé';
    if (s === 'ECHEC') return 'Échoué';
    return s;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)' }}>
          <p style={{ color: '#6b7280' }}>Chargement des paiements...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}>

        {/* Header */}
        <div style={{ background: '#fff', padding: isMobile ? '12px 16px' : '0 24px', height: isMobile ? 'auto' : '56px', display: 'flex', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', flexShrink: 0, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '10px' : '0' }}>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>Paiements</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
            <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '7px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', width: isMobile ? '100%' : '200px', flex: isMobile ? 1 : 'none', boxSizing: 'border-box' }} />
            <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fff', color: '#374151' }}>
              <option value="tous">Tous les statuts</option>
              <option value="REUSSI">Réussi</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="ECHEC">Échoué</option>
              <option value="REMBOURSE">Remboursé</option>
            </select>
          </div>
        </div>

        <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '20px 24px', background: '#f8fafb' }}>

          {/* Campay info banner */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <path d="M12 18h.01" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>Campay</div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Tous les paiements sont traités via Campay (MTN Money / Orange Money)</div>
            </div>
          </div>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' }}>
            {[
              { label: 'Transactions', value: filtered.length, border: '#0D9E7E', bg: '#E8F7F3', color: '#0D9E7E', icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0D9E7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" />
                </svg>
              )},
              { label: 'Montant total', value: totalMontant, border: '#22c55e', bg: '#dcfce7', color: '#15803d', suffix: ' XAF', icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
              )},
              { label: 'Commission Campay', value: totalCommission, border: '#f59e0b', bg: '#fef3c7', color: '#d97706', suffix: ' XAF', icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
              )},
            ].map((card, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '10px', padding: '16px', border: '1px solid #e5e7eb', borderTop: `3px solid ${card.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{card.icon}</div>
                  <span style={{ fontSize: '11px', color: '#6b7280' }}>{card.label}</span>
                </div>
                <div style={{ fontSize: '22px', fontWeight: '700', color: '#111827', lineHeight: 1 }}>
                  {card.value.toLocaleString()}{card.suffix || ''}
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>Historique</span>
              <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' }}>{filtered.length}</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['#', 'Référence', 'Passager', 'Trajet', 'Montant', 'Commission', 'Date', 'Statut'].map(h => (
                      <th key={h} style={{ fontSize: '11px', color: '#6b7280', textAlign: 'left', padding: '10px 14px', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: '600', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '50px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}>
                          <rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" />
                        </svg>
                        <div>Aucun paiement trouvé</div>
                      </td>
                    </tr>
                  ) : filtered.map((p, i) => (
                    <tr key={p.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 14px', fontSize: '12px', color: '#9ca3af', fontWeight: '600' }}>#{p.id}</td>
                      <td style={{ padding: '12px 14px', fontSize: '11px', color: '#6b7280', fontFamily: 'monospace' }}>{p.campayReference || '—'}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ position: 'relative', width: '28px', height: '28px', flexShrink: 0 }}>
                            {p.passager?.photo && (
                              <img src={p.passager.photo.startsWith('http') ? p.passager.photo : `/uploads/profils/${p.passager.photo}`} alt="" onError={e => e.currentTarget.style.display = 'none'} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 2, border: '1px solid #e5e7eb' }} />
                            )}
                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#0D9E7E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff', fontWeight: '700', position: 'relative', zIndex: 1 }}>
                              {p.passager?.prenom?.charAt(0)}{p.passager?.nom?.charAt(0)}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>{p.passager?.prenom} {p.passager?.nom}</div>
                            <div style={{ fontSize: '10px', color: '#9ca3af' }}>{p.passager?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>{p.reservation?.trajet?.villeDepart || '—'}</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>{p.reservation?.trajet?.villeArrivee || '—'}</span>
                        </div>
                        <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>
                          {p.reservation?.trajet?.dateDepart ? new Date(p.reservation.trajet.dateDepart).toLocaleDateString('fr-FR') : ''}
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#15803d' }}>{p.montantTotal?.toLocaleString()}</span>
                        <span style={{ fontSize: '10px', color: '#9ca3af' }}> XAF</span>
                      </td>
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#d97706' }}>{p.commission?.toLocaleString()}</span>
                        <span style={{ fontSize: '10px', color: '#9ca3af' }}> XAF</span>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '12px', color: '#374151', whiteSpace: 'nowrap' }}>
                        {p.datePaiement && p.datePaiement !== 'En attente' ? new Date(p.datePaiement).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ ...statutStyle(p.statut), padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                          {statutLabel(p.statut)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length > 0 && (
              <div style={{ padding: '12px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{filtered.length} transaction(s)</span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  Total : <strong style={{ color: '#15803d' }}>{totalMontant.toLocaleString()} XAF</strong>
                </span>
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminLayout>
  );
}
