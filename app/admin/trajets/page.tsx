'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useTheme } from '@/app/lib/ThemeContext';

interface Trajet {
  id: number;
  villeDepart: string;
  villeArrivee: string;
  dateDepart: string;
  heureDepart: any;
  nbPlaces: number;
  prixParPlace: number;
  statut: string;
  description: string | null;
  dateCreation: string;
  conducteur: {
    nom: string;
    prenom: string;
    email?: string;
    noteMoyenne: number | null;
    photo?: string | null;
  };
  reservations?: { id: number }[];
}

interface DetailTrajet extends Trajet {
  passagers: { nom: string; prenom: string; email: string; nbPlaces: number; statut: string }[];
}

export default function AdminTrajets() {
  const { t, lang } = useTheme();
  const [trajets, setTrajets] = useState<Trajet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('tous');
  const [selectedTrajet, setSelectedTrajet] = useState<DetailTrajet | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [adminError, setAdminError] = useState('');

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
      const parsed = JSON.parse(userData);
      if (!parsed.roles?.includes('ROLE_ADMIN')) { window.location.href = '/login'; return; }
      setUser(parsed);
    }
    fetchTrajets();
  }, []);

  const fetchTrajets = async () => {
    try {
      const res = await fetch('/api/admin/trajets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTrajets(Array.isArray(data) ? data : data.trajets || []);
    } catch {
      setTrajets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/trajets/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrajets(prev => prev.filter(t => t.id !== id));
      setShowConfirmDelete(null);
    } catch {
      setAdminError(t('deleteError'));
      setTimeout(() => setAdminError(''), 4000);
    }
  };

  const handleVoirDetail = async (trajet: Trajet) => {
    try {
      const res = await fetch(`/api/reservations/trajet/${trajet.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const passagers = Array.isArray(data) ? data.map((r: any) => ({
        nom: r.passager?.nom,
        prenom: r.passager?.prenom,
        email: r.passager?.email,
        nbPlaces: r.nbPlaces,
        statut: r.statut,
      })) : [];
      setSelectedTrajet({ ...trajet, passagers });
      setShowDetail(true);
    } catch {
      setSelectedTrajet({ ...trajet, passagers: [] });
      setShowDetail(true);
    }
  };

  const filtered = trajets.filter(t => {
    const matchSearch = (t.villeDepart + ' ' + t.villeArrivee + ' ' + t.conducteur?.nom + ' ' + t.conducteur?.prenom)
      .toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === 'tous' || t.statut?.toUpperCase() === filterStatut;
    return matchSearch && matchStatut;
  });

  const totalTrajets = trajets.length;
  const trajetsOuverts = trajets.filter(t => t.statut?.toUpperCase() === 'OUVERT' || t.statut?.toUpperCase() === 'OPEN').length;
  const trajetsComplets = trajets.filter(t => t.statut?.toUpperCase() === 'COMPLET' || t.statut?.toUpperCase() === 'FULL').length;
  const trajetsEnCours = trajets.filter(t => t.statut?.toUpperCase() === 'EN_COURS' || t.statut?.toUpperCase() === 'EN_ATTENTE_DEPART' || t.statut?.toUpperCase() === 'EN_ATTENTE_VALIDATION').length;
  const trajetsAnnules = trajets.filter(t => {
    const status = t.statut?.toUpperCase() || '';
    return status === 'ANNULE' || status === 'ANNULÉ' || status === 'CANCELLED';
  }).length;

  const statutStyle = (s: string): React.CSSProperties => {
    const upper = s?.toUpperCase() || '';
    if (upper === 'OUVERT' || upper === 'OPEN') return { background: '#dcfce7', color: '#15803d' };
    if (upper === 'COMPLET' || upper === 'FULL') return { background: '#dbeafe', color: '#1d4ed8' };
    if (upper === 'ANNULE' || upper === 'ANNULÉ' || upper === 'CANCELLED') return { background: '#fee2e2', color: '#dc2626' };
    if (upper === 'EN_COURS') return { background: '#dcfce7', color: '#15803d' };
    if (upper === 'EN_ATTENTE_DEPART') return { background: '#fef3c7', color: '#d97706' };
    if (upper === 'EN_ATTENTE_VALIDATION') return { background: '#dbeafe', color: '#2563eb' };
    if (upper === 'TERMINE') return { background: '#f3f4f6', color: '#6b7280' };
    if (upper === 'BROUILLON') return { background: '#f3f4f6', color: '#9ca3af' };
    return { background: '#f3f4f6', color: '#6b7280' };
  };

  const statutLabel = (s: string) => {
    const upper = s?.toUpperCase() || '';
    if (upper === 'OUVERT' || upper === 'OPEN') return t('open');
    if (upper === 'COMPLET' || upper === 'FULL') return t('full');
    if (upper === 'ANNULE' || upper === 'ANNULÉ' || upper === 'CANCELLED') return t('cancelled');
    if (upper === 'EN_COURS') return t('inProgress');
    if (upper === 'EN_ATTENTE_DEPART') return t('statusPending');
    if (upper === 'EN_ATTENTE_VALIDATION') return t('validating');
    if (upper === 'TERMINE') return t('completed');
    if (upper === 'BROUILLON') return t('draft');
    return s || t('statusUnknown');
  };

  const reservStatut = (s: string): React.CSSProperties => {
    const upper = s?.toUpperCase() || '';
    if (upper === 'CONFIRMEE' || upper === 'ACCEPTED') return { background: '#dcfce7', color: '#15803d' };
    if (upper === 'EN_ATTENTE' || upper === 'PENDING') return { background: '#fef3c7', color: '#d97706' };
    if (upper === 'ANNULEE' || upper === 'CANCELLED') return { background: '#fee2e2', color: '#dc2626' };
    return { background: '#f3f4f6', color: '#6b7280' };
  };

  const reservLabel = (s: string) => {
    const upper = s?.toUpperCase() || '';
    if (upper === 'CONFIRMEE' || upper === 'ACCEPTED') return t('confirmedFem');
    if (upper === 'EN_ATTENTE' || upper === 'PENDING') return t('statusPending');
    if (upper === 'ANNULEE' || upper === 'CANCELLED') return t('cancelledFem');
    return s || t('statusUnknown');
  };

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)' }}>
          <p style={{ color: '#6b7280' }}>{t('loading')}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}>
        {adminError && (
          <div style={{ padding: '12px 16px', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626', fontSize: '13px', fontWeight: '600' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            {adminError}
          </div>
        )}
        <header style={{ background: '#fff', padding: isMobile ? '12px 16px' : '0 24px', height: isMobile ? 'auto' : '56px', display: 'flex', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', flexShrink: 0, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '10px' : '0' }}>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>{t('adminTripsTitle')}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
            <input
              type="text"
              placeholder={t('adminTripsSearch')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '7px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', width: isMobile ? '100%' : '200px', flex: isMobile ? 1 : 'none', boxSizing: 'border-box' }}
            />
            <select
              value={filterStatut}
              onChange={e => setFilterStatut(e.target.value)}
              style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fff', color: '#374151', flex: isMobile ? 1 : 'none', minWidth: 0 }}
            >
              <option value="tous">{t('allStatus')}</option>
              <option value="OUVERT">{t('open')}</option>
              <option value="COMPLET">{t('full')}</option>
              <option value="EN_COURS">{t('inProgress')}</option>
              <option value="TERMINE">{t('completed')}</option>
              <option value="ANNULE">{t('cancelled')}</option>
            </select>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '20px 24px', background: '#f8fafb' }}>

          {/* Stat cards avec icônes SVG */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, 1fr)', gap: '14px', marginBottom: '24px' }}>
            {[
              { label: t('totalTrips'), value: totalTrajets, border: '#22c55e', bg: '#dcfce7', icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 17L4 21M16 17L20 21M3 8H21M4 8H20M20 8V18M20 8V6C20 5.46957 19.7893 4.96086 19.4142 4.58579C19.0391 4.21071 18.5304 4 18 4H6C5.46957 4 4.96086 4.21071 4.58579 4.58579C4.21071 4.96086 4 5.46957 4 6V8M4 8V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20H18C18.5304 20 19.0391 19.7893 19.4142 19.4142C19.7893 19.0391 20 18.5304 20 18V8" />
                </svg>
              )},
              { label: t('adminTripsOpen'), value: trajetsOuverts, border: '#15803d', bg: '#dcfce7', icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17L4 12" />
                </svg>
              )},
              { label: t('statInProgress'), value: trajetsEnCours, border: '#d97706', bg: '#fef3c7', icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                </svg>
              )},
              { label: t('adminTripsFull'), value: trajetsComplets, border: '#1d4ed8', bg: '#dbeafe', icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8L12 12L14 14" />
                </svg>
              )},
              { label: t('adminTripsCancelled'), value: trajetsAnnules, border: '#dc2626', bg: '#fee2e2', icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 9L9 15" />
                  <path d="M9 9L15 15" />
                </svg>
              )},
            ].map((card, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '10px', padding: '16px', border: '1px solid #e5e7eb', borderTop: `3px solid ${card.border}` }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '10px' }}>
                  {card.icon}
                </div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827', lineHeight: 1 }}>{card.value}</div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>{card.label}</div>
              </div>
            ))}
          </div>

          {/* Tableau trajets */}
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 17L4 21M16 17L20 21M3 8H21M4 8H20M20 8V18M20 8V6C20 5.46957 19.7893 4.96086 19.4142 4.58579C19.0391 4.21071 18.5304 4 18 4H6C5.46957 4 4.96086 4.21071 4.58579 4.58579C4.21071 4.96086 4 5.46957 4 6V8M4 8V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20H18C18.5304 20 19.0391 19.7893 19.4142 19.4142C19.7893 19.0391 20 18.5304 20 18V8" />
                </svg>
              </span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{t('adminTripsList')}</span>
              <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' }}>{filtered.length}</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['#', t('trip'), t('driver'), t('adminTableDepartureDate'), t('time'), t('adminTableAvailableSeats'), t('adminTablePricePerSeat'), t('reservations'), t('tripStatus'), t('actions')].map(h => (
                      <th key={h} style={{ fontSize: '11px', color: '#6b7280', textAlign: 'left', padding: '10px 14px', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: '600', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ padding: '50px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                        <div style={{ fontSize: '36px', marginBottom: '10px' }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8 17L4 21M16 17L20 21M3 8H21M4 8H20M20 8V18M20 8V6C20 5.46957 19.7893 4.96086 19.4142 4.58579C19.0391 4.21071 18.5304 4 18 4H6C5.46957 4 4.96086 4.21071 4.58579 4.58579C4.21071 4.96086 4 5.46957 4 6V8M4 8V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20H18C18.5304 20 19.0391 19.7893 19.4142 19.4142C19.7893 19.0391 20 18.5304 20 18V8" />
                          </svg>
                        </div>
                        {t('noTripsFoundAdmin')}
                      </td>
                    </tr>
                  ) : filtered.map((trajet, i) => (
                    <tr key={trajet.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 14px', fontSize: '12px', color: '#9ca3af', fontWeight: '600' }}>#{trajet.id}</td>

                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>{trajet.villeDepart}</span>
                          <span style={{ color: '#22c55e', fontSize: '16px' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 12L19 12" />
                              <path d="M12 5L19 12L12 19" />
                            </svg>
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>{trajet.villeArrivee}</span>
                        </div>
                        {trajet.description && (
                          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{trajet.description}</div>
                        )}
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ position: 'relative', width: '28px', height: '28px', flexShrink: 0 }}>
                            {trajet.conducteur?.photo && (
                              <img
                                src={trajet.conducteur.photo.startsWith('http') ? trajet.conducteur.photo : `/uploads/profils/${trajet.conducteur.photo}`}
                                alt={t('photoAlt')}
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
                              background: '#0a0a0a',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '10px', color: '#22c55e', fontWeight: '700',
                              position: 'relative', zIndex: 1
                            }}>
                              {trajet.conducteur?.prenom?.charAt(0)}{trajet.conducteur?.nom?.charAt(0)}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>
                              {trajet.conducteur?.prenom} {trajet.conducteur?.nom}
                            </div>
                            <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                              {trajet.conducteur?.noteMoyenne ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                  </svg>
                                  {trajet.conducteur.noteMoyenne.toFixed(1)}
                                </span>
                              ) : t('adminNoRating')}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '12px 14px', fontSize: '12px', color: '#374151', whiteSpace: 'nowrap' }}>
                        {trajet.dateDepart ? new Date(trajet.dateDepart).toLocaleDateString('fr-FR') : '—'}
                      </td>

                      <td style={{ padding: '12px 14px', fontSize: '12px', color: '#374151' }}>
                        {trajet.heureDepart
                          ? (typeof trajet.heureDepart === 'object' && trajet.heureDepart !== null && 'date' in trajet.heureDepart
                              ? String(trajet.heureDepart.date).substring(0, 5)
                              : String(trajet.heureDepart).substring(0, 5))
                          : '—'}
                      </td>

                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span style={{ background: trajet.nbPlaces === 0 ? '#fee2e2' : '#dcfce7', color: trajet.nbPlaces === 0 ? '#dc2626' : '#15803d', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                          {trajet.nbPlaces}
                        </span>
                      </td>

                      <td style={{ padding: '12px 14px', fontSize: '12px', fontWeight: '700', color: '#111827', whiteSpace: 'nowrap' }}>
                        {trajet.prixParPlace?.toLocaleString()} FCFA
                      </td>

                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span style={{ background: '#f0fdf4', color: '#15803d', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                          {trajet.reservations?.length ?? 0}
                        </span>
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ ...statutStyle(trajet.statut), padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                          {statutLabel(trajet.statut)}
                        </span>
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleVoirDetail(trajet)}
                            style={{ padding: '5px 10px', background: '#0a0a0a', color: '#22c55e', border: '1px solid #22c55e', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            {t('detailsBtn')}
                          </button>
                          <button
                            onClick={() => setShowConfirmDelete(trajet.id)}
                            style={{ padding: '5px 10px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18" />
                              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length > 0 && (
              <div style={{ padding: '12px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{filtered.length} {t('tripsFound')}</span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  {t('adminPopularRoute')} <strong style={{ color: '#15803d' }}>Yaoundé → Douala</strong>
                </span>
              </div>
            )}
          </div>
        </main>

        {/* Modal Passagers */}
        {showDetail && selectedTrajet && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ background: '#fff', borderRadius: '14px', padding: '28px', width: '100%', maxWidth: '600px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 00-3-3.87" />
                        <path d="M16 3.13a4 4 0 010 7.75" />
                      </svg>
                      {t('adminTripPassengers')}
                    </span>
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#22c55e' }}>{selectedTrajet.villeDepart}</span>
                    <span style={{ color: '#22c55e' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12L19 12" />
                        <path d="M12 5L19 12L12 19" />
                      </svg>
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#22c55e' }}>{selectedTrajet.villeArrivee}</span>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>— {selectedTrajet.dateDepart ? new Date(selectedTrajet.dateDepart).toLocaleDateString('fr-FR') : ''} à {selectedTrajet.heureDepart}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    {t('adminDriverLabel')} <strong>{selectedTrajet.conducteur?.prenom} {selectedTrajet.conducteur?.nom}</strong> — {selectedTrajet.prixParPlace?.toLocaleString()} FCFA/place
                  </div>
                </div>
                <button
                  onClick={() => { setShowDetail(false); setSelectedTrajet(null); }}
                  style={{ background: '#f3f4f6', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18" />
                    <path d="M6 6L18 18" />
                  </svg>
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                {selectedTrajet.passagers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '36px', marginBottom: '10px' }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 00-3-3.87" />
                        <path d="M16 3.13a4 4 0 010 7.75" />
                      </svg>
                    </div>
                    <p style={{ color: '#9ca3af', fontSize: '13px' }}>{t('noPassengersForTripAdmin')}</p>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        {[t('passenger'), t('adminTableEmail'), t('adminTablePlaces'), t('adminTableReservationStatus')].map(h => (
                          <th key={h} style={{ fontSize: '11px', color: '#6b7280', textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: '.5px' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTrajet.passagers.map((p, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff', fontWeight: '700', flexShrink: 0 }}>
                                {p.prenom?.charAt(0)}{p.nom?.charAt(0)}
                              </div>
                              <span style={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>{p.prenom} {p.nom}</span>
                            </div>
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: '12px', color: '#6b7280' }}>{p.email}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>{p.nbPlaces}</span>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ ...reservStatut(p.statut), padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                              {reservLabel(p.statut)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => { setShowDetail(false); setSelectedTrajet(null); }}
                  style={{ padding: '8px 20px', background: '#0a0a0a', color: '#22c55e', border: '1px solid #22c55e', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}
                >
                  {t('close')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal confirmation suppression */}
        {showConfirmDelete && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ background: '#fff', borderRadius: '14px', padding: '28px', width: '100%', maxWidth: '400px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4" />
                    <path d="M12 16h.01" />
                  </svg>
                  {t('adminConfirmDelete')}
                </span>
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
                {t('deleteTripIrreversibleConfirm')}
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowConfirmDelete(null)}
                  style={{ padding: '8px 20px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18" />
                    <path d="M6 6L18 18" />
                  </svg>
                  {t('cancel')}
                </button>
                <button
                  onClick={() => handleDelete(showConfirmDelete)}
                  style={{ padding: '8px 20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                  {t('delete')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}