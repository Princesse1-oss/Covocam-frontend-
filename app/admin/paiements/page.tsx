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
        telephone?: string;
        photo?: string | null;
      } | null;
    } | null;
  } | null;
}

export default function AdminPaiements() {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('tous');
  const [filterMode, setFilterMode] = useState('tous');
  const [periodeDe, setPeriodeDe] = useState('');
  const [periodeA, setPeriodeA] = useState('');
  const [user, setUser] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; reservationId: number; conducteurNom: string; montant: number }>({
    open: false,
    reservationId: 0,
    conducteurNom: '',
    montant: 0
  });
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
        setUser(parsed);
      } catch (e) {
        window.location.href = '/login';
        return;
      }
    }
    fetchPaiements();
  }, []);

  const fetchPaiements = async () => {
    try {
      const res = await fetch('/api/paiements', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();
      
      if (data.error) {
        console.error("🚨 ERREUR DU BACKEND :", data.error);
        setPaiements([]);
      } else {
        setPaiements(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("❌ Erreur réseau:", err);
      setPaiements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMoney = (reservationId: number, conducteurNom: string, montant: number) => {
    if (reservationId === 0) {
      alert('Impossible : pas de réservation associée à ce paiement');
      return;
    }
    setConfirmModal({
      open: true,
      reservationId,
      conducteurNom,
      montant
    });
  };

  const confirmPayment = async () => {
    const { reservationId, conducteurNom } = confirmModal;
    alert(`Envoi de l'argent à ${conducteurNom} (réservation #${reservationId})`);
    setConfirmModal({ open: false, reservationId: 0, conducteurNom: '', montant: 0 });
  };

  const filtered = paiements.filter(p => {
    const searchStr = (
      (p.passager?.nom || '') + ' ' + (p.passager?.prenom || '') + ' ' +
      (p.passager?.email || '') + ' ' + (p.campayReference || '') + ' ' +
      (p.reservation?.trajet?.villeDepart || '') + ' ' +
      (p.reservation?.trajet?.villeArrivee || '')
    ).toLowerCase();
    
    const matchSearch = searchStr.includes(search.toLowerCase());
    const matchStatut = filterStatut === 'tous' || p.statut === filterStatut;
    const matchMode = filterMode === 'tous' || (p.modePaiement || 'MOBILE_MONEY') === filterMode;
    
    let matchDe = true;
    let matchA = true;
    if (p.datePaiement && p.datePaiement !== 'En attente') {
      const pDate = new Date(p.datePaiement);
      matchDe = !periodeDe || pDate >= new Date(periodeDe);
      matchA = !periodeA || pDate <= new Date(periodeA + 'T23:59:59');
    }

    return matchSearch && matchStatut && matchMode && matchDe && matchA;
  });

  const totalMontant = filtered.filter(p => p.statut === 'REUSSI').reduce((acc, p) => acc + (p.montantTotal || 0), 0);
  const enAttenteMontant = filtered.filter(p => p.statut === 'EN_ATTENTE').reduce((acc, p) => acc + (p.montantTotal || 0), 0);
  const remboursesMontant = filtered.filter(p => p.statut === 'REMBOURSE').reduce((acc, p) => acc + (p.montantTotal || 0), 0);

  const totalConfirmes = filtered.filter(p => p.statut === 'REUSSI').length;
  const totalEnAttente = filtered.filter(p => p.statut === 'EN_ATTENTE').length;
  const totalRembourses = filtered.filter(p => p.statut === 'REMBOURSE').length;

  const statutStyle = (s: string): React.CSSProperties => {
    if (s === 'REUSSI') return { background: '#dcfce7', color: '#15803d' };
    if (s === 'EN_ATTENTE') return { background: '#E8F7F3', color: '#0D9E7E' };
    if (s === 'REMBOURSE') return { background: '#fee2e2', color: '#dc2626' };
    if (s === 'ECHEC') return { background: '#fee2e2', color: '#dc2626' };
    return { background: '#f3f4f6', color: '#6b7280' };
  };

  const statutLabel = (s: string) => {
    if (s === 'REUSSI') return 'Reussi';
    if (s === 'EN_ATTENTE') return 'En attente';
    if (s === 'REMBOURSE') return 'Rembourse';
    if (s === 'ECHEC') return 'Echec';
    return s;
  };

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const modeIcon = (m: string) => {
    if (m === 'MTN_MONEY') return <span style={{ color: '#eab308' }}>&#9679;</span>;
    if (m === 'ESPECES') return <span style={{ color: '#22c55e' }}>&#9679;</span>;
    return <span style={{ color: '#3b82f6' }}>&#9679;</span>;
  };

  const modeLabel = (m: string) => {
    if (m === 'MTN_MONEY') return 'MTN Money';
    if (m === 'ESPECES') return 'Espèces';
    return 'Mobile Money';
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
        <header style={{ background: '#fff', padding: isMobile ? '12px 16px' : '0 24px', height: isMobile ? 'auto' : '56px', display: 'flex', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', flexShrink: 0, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '10px' : '0' }}>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>Gestion des paiements</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
            <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '7px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', width: isMobile ? '100%' : '200px', flex: isMobile ? 1 : 'none', boxSizing: 'border-box' }} />
            <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fff', color: '#374151', flex: isMobile ? 1 : 'none', minWidth: 0 }}>
              <option value="tous">Tous les statuts</option>
              <option value="SUCCES">Succès</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="ECHEC">Échec</option>
            </select>
            <select value={filterMode} onChange={e => setFilterMode(e.target.value)} style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fff', color: '#374151', flex: isMobile ? 1 : 'none', minWidth: 0 }}>
              <option value="tous">Tous les modes</option>
              <option value="CAMPAY">Campay</option>
              <option value="MTN_MONEY">MTN Money</option>
              <option value="ORANGE_MONEY">Orange Money</option>
              <option value="ESPECES">Espèces</option>
            </select>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '20px 24px', background: '#f8fafb' }}>
          {/* Stat cards avec SVG */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' }}>
            {[
              { label: 'Revenus confirmés', value: totalMontant, count: totalConfirmes, border: '#22c55e', bg: '#dcfce7', color: '#15803d', icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17L4 12" />
                </svg>
              )},
              { label: 'En attente', value: enAttenteMontant, count: totalEnAttente, border: '#0D9E7E', bg: '#E8F7F3', color: '#0D9E7E', icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D9E7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              )},
              { label: 'Remboursés', value: remboursesMontant, count: totalRembourses, border: '#dc2626', bg: '#fee2e2', color: '#dc2626', icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12l4 4-4 4" />
                  <path d="M21 12l-4 4 4 4" />
                  <path d="M12 3v18" />
                </svg>
              )},
            ].map((card, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '10px', padding: '18px', border: '1px solid #e5e7eb', borderTop: `3px solid ${card.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {card.icon}
                  </div>
                  <span style={{ background: card.bg, color: card.color, fontSize: '11px', padding: '3px 8px', borderRadius: '20px', fontWeight: '600' }}>{card.count} paiement(s)</span>
                </div>
                <div style={{ fontSize: '22px', fontWeight: '700', color: '#111827', lineHeight: 1 }}>{card.value.toLocaleString()} FCFA</div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>{card.label}</div>
              </div>
            ))}
          </div>

          {/* Résumé par mode de paiement avec SVG */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {[
              { mode: 'MTN_MONEY', label: 'MTN Money', color: '#0D9E7E', bg: '#E8F7F3', icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D9E7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              )},
              { mode: 'ORANGE_MONEY', label: 'Orange Money', color: '#0D9E7E', bg: '#E8F7F3', icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D9E7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8" />
                  <path d="M8 12h8" />
                </svg>
              )},
              { mode: 'MOBILE_MONEY', label: 'Mobile Money (Campay)', color: '#15803d', bg: '#dcfce7', icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" />
                  <path d="M12 18h.01" />
                </svg>
              )},
            ].map((m, i) => {
              const count = paiements.filter(p => (p.modePaiement || 'MOBILE_MONEY') === m.mode).length;
              const montant = paiements.filter(p => (p.modePaiement || 'MOBILE_MONEY') === m.mode && p.statut === 'REUSSI').reduce((acc, p) => acc + (p.montantTotal || 0), 0);
              return (
                <div key={i} style={{ background: '#fff', borderRadius: '10px', padding: '14px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {m.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>{m.label}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>{count} transaction(s)</div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: m.color }}>{montant.toLocaleString()} FCFA</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tableau paiements */}
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" />
                  <path d="M1 10h22" />
                  <circle cx="17" cy="14" r="2" fill="#111827" />
                </svg>
              </span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>Historique des paiements</span>
              <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' }}>{filtered.length}</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['#', 'Référence', 'Passager', 'Trajet', 'Conducteur', 'Montant', 'Commission', 'Mode', 'Date paiement', 'Statut', 'Actions'].map(h => (
                      <th key={h} style={{ fontSize: '11px', color: '#6b7280', textAlign: 'left', padding: '10px 14px', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: '600', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={11} style={{ padding: '50px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                        <div style={{ fontSize: '36px', marginBottom: '10px' }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="1" y="4" width="22" height="16" rx="2" />
                            <path d="M1 10h22" />
                            <circle cx="17" cy="14" r="2" />
                          </svg>
                        </div>
                        Aucun paiement trouvé
                      </td>
                    </tr>
                  ) : filtered.map((p, i) => {
                    const passagerPhoto = p.passager?.photo;
                    const conducteurPhoto = p.reservation?.trajet?.conducteur?.photo;
                    
                    return (
                      <tr key={p.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px 14px', fontSize: '12px', color: '#9ca3af', fontWeight: '600' }}>#{p.id}</td>
                        <td style={{ padding: '12px 14px', fontSize: '11px', color: '#6b7280', fontFamily: 'monospace' }}>{p.campayReference || '—'}</td>
                        
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ position: 'relative', width: '28px', height: '28px', flexShrink: 0 }}>
                              {passagerPhoto && (
                                <img
                                  src={passagerPhoto.startsWith('http') ? passagerPhoto : `/uploads/profils/${passagerPhoto}`}
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
                                {p.passager?.prenom?.charAt(0)}{p.passager?.nom?.charAt(0)}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>{p.passager?.prenom} {p.passager?.nom}</div>
                              <div style={{ fontSize: '11px', color: '#9ca3af' }}>{p.passager?.email}</div>
                            </div>
                          </div>
                        </td>
                        
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: '#111827' }}>{p.reservation?.trajet?.villeDepart || 'N/A'}</span>
                            <span style={{ color: '#22c55e' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12L19 12" />
                                <path d="M12 5L19 12L12 19" />
                              </svg>
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: '#111827' }}>{p.reservation?.trajet?.villeArrivee || 'N/A'}</span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                            {p.reservation?.trajet?.dateDepart ? new Date(p.reservation.trajet.dateDepart).toLocaleDateString('fr-FR') : ''}
                          </div>
                        </td>
                        
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ position: 'relative', width: '28px', height: '28px', flexShrink: 0 }}>
                              {conducteurPhoto && (
                                <img
                                  src={conducteurPhoto.startsWith('http') ? conducteurPhoto : `/uploads/profils/${conducteurPhoto}`}
                                  alt="Photo conducteur"
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
                                {p.reservation?.trajet?.conducteur?.prenom?.charAt(0)}{p.reservation?.trajet?.conducteur?.nom?.charAt(0)}
                              </div>
                            </div>
                            <span style={{ fontSize: '12px', color: '#374151' }}>{p.reservation?.trajet?.conducteur?.prenom || 'N/A'} {p.reservation?.trajet?.conducteur?.nom || 'N/A'}</span>
                          </div>
                        </td>
                        
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: '#15803d' }}>{p.montantTotal?.toLocaleString()}</span>
                          <span style={{ fontSize: '11px', color: '#9ca3af' }}> FCFA</span>
                        </td>
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: '#d97706' }}>{p.commission?.toLocaleString()}</span>
                          <span style={{ fontSize: '11px', color: '#9ca3af' }}> FCFA</span>
                        </td>
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '16px' }}>{modeIcon(p.modePaiement || 'MOBILE_MONEY')}</span>
                            <span style={{ fontSize: '11px', color: '#374151' }}>{modeLabel(p.modePaiement || 'MOBILE_MONEY')}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '12px', color: '#374151', whiteSpace: 'nowrap' }}>
                          {p.datePaiement && p.datePaiement !== 'En attente' ? new Date(p.datePaiement).toLocaleDateString('fr-FR') : '—'}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ ...statutStyle(p.statut), padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                            {statutLabel(p.statut)}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          {p.statut === 'REUSSI' && p.reservation?.statut !== 'PAYEE_CONDUCTEUR' && (
                            <button
                              onClick={() => handleSendMoney(p.reservation?.id || p.reservationId || 0, `${p.reservation?.trajet?.conducteur?.prenom} ${p.reservation?.trajet?.conducteur?.nom}`, p.montantTotal || 0)}
                              style={{
                                padding: '6px 12px',
                                background: '#0D9E7E',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#0A7B62'}
                              onMouseLeave={(e) => e.currentTarget.style.background = '#0D9E7E'}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2v20" />
                                <path d="M8 18l4 4 4-4" />
                                <path d="M8 6l4-4 4 4" />
                              </svg>
                              Envoyer
                            </button>
                          )}
                          {p.reservation?.statut === 'PAYEE_CONDUCTEUR' && (
                            <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6L9 17L4 12" />
                              </svg>
                              Envoyé
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filtered.length > 0 && (
              <div style={{ padding: '14px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb' }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{filtered.length} paiement(s) affiché(s)</span>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    Total confirmé : <strong style={{ color: '#15803d', fontSize: '14px' }}>{totalMontant.toLocaleString()} FCFA</strong>
                  </span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    En attente : <strong style={{ color: '#d97706' }}>{enAttenteMontant.toLocaleString()} FCFA</strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal de confirmation pour paiement */}
      {confirmModal.open && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#E8F7F3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D9E7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" />
                  <path d="M1 10h22" />
                  <circle cx="17" cy="14" r="2" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>
                  Envoyer le paiement
                </h3>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>
                  Confirmez l'envoi de l'argent au conducteur
                </p>
              </div>
            </div>
            
            <div style={{
              background: '#f9fafb',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>Conducteur:</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{confirmModal.conducteurNom}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>Montant:</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#0D9E7E' }}>{confirmModal.montant.toLocaleString()} FCFA</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmModal({ open: false, reservationId: 0, conducteurNom: '', montant: 0 })}
                style={{
                  padding: '10px 20px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>
              <button
                onClick={confirmPayment}
                style={{
                  padding: '10px 20px',
                  background: '#0D9E7E',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}