'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

const BACKEND_URL = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000` : '';

const API_URL = '/api';

interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  typeUtilisateur: string;
  estActif: boolean;
  noteMoyenne: number | null;
  roles: string[];
  photo?: string | null;
}

interface Evaluation {
  id: number;
  note: number;
  commentaire: string;
  dateEvaluation: string;
  auteur: { nom: string; prenom: string };
}

export default function AdminUtilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConducteur, setSelectedConducteur] = useState<Utilisateur | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [loadingEval, setLoadingEval] = useState(false);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; userId: number | null; userName: string; action: 'suspendre' | 'activer' }>({
    open: false,
    userId: null,
    userName: '',
    action: 'suspendre'
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      console.warn("Aucun token trouvé, redirection vers login");
      window.location.href = '/login';
      return;
    }

    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        if (!parsed.roles?.includes('ROLE_ADMIN')) {
          window.location.href = '/login';
          return;
        }
        setUser(parsed);
      } catch (e) {
        console.error("Erreur de parsing des données utilisateur", e);
      }
    }

    fetch(`${API_URL}/admin/utilisateurs`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    })
      .then(res => {
        if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log("🔍 DONNÉES UTILISATEURS REÇUES DU BACKEND :", data);
        const userList = Array.isArray(data) ? data : data.utilisateurs || [];

        if (userList.length > 0) {
          console.log("📸 Exemple de photo du 1er utilisateur :", userList[0].photo);
          console.log("📞 Exemple de téléphone du 1er utilisateur :", userList[0].telephone);
        }

        setUtilisateurs(userList);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Échec du chargement des utilisateurs:", err);
        setLoading(false);
      });
  }, []);

  const handleSuspendre = (id: number, prenom: string, nom: string, estActif: boolean) => {
    setConfirmModal({
      open: true,
      userId: id,
      userName: `${prenom} ${nom}`,
      action: estActif ? 'suspendre' : 'activer'
    });
  };

  const confirmAction = async () => {
    const token = localStorage.getItem('token');
    const { userId, action } = confirmModal;
    if (!userId) return;

    try {
      await fetch(`${API_URL}/admin/utilisateurs/${userId}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setUtilisateurs(prev => prev.map(u => u.id === userId ? { ...u, estActif: action === 'activer' } : u));
      setConfirmModal({ open: false, userId: null, userName: '', action: 'suspendre' });
    } catch {
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleEvaluation = async (u: Utilisateur) => {
    const token = localStorage.getItem('token');
    setSelectedConducteur(u);
    setShowEvalModal(true);
    setLoadingEval(true);
    try {
      const res = await fetch(`${API_URL}/evaluations/recues?userId=${u.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEvaluations(Array.isArray(data) ? data : []);
    } catch {
      setEvaluations([]);
    } finally {
      setLoadingEval(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const conducteurs = utilisateurs.filter(u =>
    (u.typeUtilisateur === 'conducteur' || u.typeUtilisateur === 'les_deux') &&
    (u.nom + ' ' + u.prenom + ' ' + u.email).toLowerCase().includes(search.toLowerCase())
  );

  const passagers = utilisateurs.filter(u =>
    (u.typeUtilisateur === 'passager' || u.typeUtilisateur === 'les_deux') &&
    (u.nom + ' ' + u.prenom + ' ' + u.email).toLowerCase().includes(search.toLowerCase())
  );

  const conducteursActifs = utilisateurs.filter(u => (u.typeUtilisateur === 'conducteur' || u.typeUtilisateur === 'les_deux') && u.estActif).length;
  const conducteursInactifs = utilisateurs.filter(u => (u.typeUtilisateur === 'conducteur' || u.typeUtilisateur === 'les_deux') && !u.estActif).length;
  const passagersActifs = utilisateurs.filter(u => (u.typeUtilisateur === 'passager' || u.typeUtilisateur === 'les_deux') && u.estActif).length;
  const passagersInactifs = utilisateurs.filter(u => (u.typeUtilisateur === 'passager' || u.typeUtilisateur === 'les_deux') && !u.estActif).length;

  const stars = (note: number | null) => {
    if (!note) return '—';
    return '★'.repeat(Math.round(note)) + '☆'.repeat(5 - Math.round(note));
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
      <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}>
        <header style={{ background: '#fff', padding: isMobile ? '12px 16px' : '0 24px', height: isMobile ? 'auto' : '56px', display: 'flex', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', flexShrink: 0, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '10px' : '0' }}>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>Gestion des utilisateurs</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '7px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', width: isMobile ? '100%' : '220px', flex: isMobile ? 1 : 'none', boxSizing: 'border-box' }}
            />
            <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600' }}>
              {utilisateurs.length} utilisateurs
            </span>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '20px 24px', background: '#f8fafb' }}>
          {/* Stat cards avec SVG */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
            {[
              { label: 'Conducteurs actifs', value: conducteursActifs, bg: '#dcfce7', border: '#22c55e', icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 11L6.5 6.5C6.8 5.6 7.6 5 8.6 5H15.4C16.4 5 17.2 5.6 17.5 6.5L19 11" />
                  <rect x="2" y="11" width="20" height="7" rx="2" />
                  <circle cx="7" cy="18" r="2" fill="white" />
                  <circle cx="17" cy="18" r="2" fill="white" />
                  <path d="M2 14H22" />
                </svg>
              )},
              { label: 'Conducteurs désactivés', value: conducteursInactifs, bg: '#fee2e2', border: '#dc2626', icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 9L9 15" />
                  <path d="M9 9L15 15" />
                </svg>
              )},
              { label: 'Passagers actifs', value: passagersActifs, bg: '#dbeafe', border: '#3b82f6', icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )},
              { label: 'Passagers désactivés', value: passagersInactifs, bg: '#fef3c7', border: '#d97706', icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
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

          {/* Tableau conducteurs */}
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e5e7eb', marginBottom: '20px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 11L6.5 6.5C6.8 5.6 7.6 5 8.6 5H15.4C16.4 5 17.2 5.6 17.5 6.5L19 11" />
                  <rect x="2" y="11" width="20" height="7" rx="2" />
                  <circle cx="7" cy="18" r="2" fill="white" />
                  <circle cx="17" cy="18" r="2" fill="white" />
                  <path d="M2 14H22" />
                </svg>
              </span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>Liste des conducteurs</span>
              <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' }}>{conducteurs.length}</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Nom', 'Email', 'Téléphone', 'Note', 'Statut', 'Actions'].map(h => (
                      <th key={h} style={{ fontSize: '11px', color: '#6b7280', textAlign: 'left', padding: '10px 16px', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: '600' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {conducteurs.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>Aucun conducteur trouvé</td></tr>
                  ) : conducteurs.map((u, i) => (
                    <tr key={u.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#111827', fontWeight: '500' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ position: 'relative', width: '30px', height: '30px', flexShrink: 0 }}>
                            {u.photo && (
                              <img
                                src={u.photo.startsWith('http') ? u.photo : `${BACKEND_URL}/uploads/profils/${u.photo}`}
                                alt={`Photo de ${u.prenom}`}
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
                              fontSize: '11px', color: '#22c55e', fontWeight: '700',
                              position: 'relative', zIndex: 1
                            }}>
                              {u.prenom?.charAt(0)}{u.nom?.charAt(0)}
                            </div>
                          </div>
                          {u.prenom} {u.nom}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: '#6b7280' }}>{u.email}</td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: '#6b7280' }}>{u.telephone || '—'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: '#f59e0b' }}>{stars(u.noteMoyenne)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: u.estActif ? '#dcfce7' : '#fee2e2', color: u.estActif ? '#15803d' : '#dc2626' }}>
                          {u.estActif ? 'Actif' : 'Suspendu'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleEvaluation(u)} style={{ padding: '5px 10px', background: '#0a0a0a', color: '#22c55e', border: '1px solid #22c55e', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            Évaluation
                          </button>
                          <button onClick={() => handleSuspendre(u.id, u.prenom, u.nom, u.estActif)} style={{ padding: '5px 10px', background: u.estActif ? '#fee2e2' : '#dcfce7', color: u.estActif ? '#dc2626' : '#15803d', border: `1px solid ${u.estActif ? '#fca5a5' : '#86efac'}`, borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {u.estActif ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M15 9L9 15" />
                                <path d="M9 9L15 15" />
                              </svg>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6L9 17L4 12" />
                              </svg>
                            )}
                            {u.estActif ? 'Suspendre' : 'Réactiver'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tableau passagers */}
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>Liste des passagers</span>
              <span style={{ background: '#dbeafe', color: '#1d4ed8', fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' }}>{passagers.length}</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Nom', 'Email', 'Téléphone', 'Note', 'Statut'].map(h => (
                      <th key={h} style={{ fontSize: '11px', color: '#6b7280', textAlign: 'left', padding: '10px 16px', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: '600' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {passagers.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>Aucun passager trouvé</td></tr>
                  ) : passagers.map((u, i) => (
                    <tr key={u.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#111827', fontWeight: '500' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ position: 'relative', width: '30px', height: '30px', flexShrink: 0 }}>
                            {u.photo && (
                              <img
                                src={u.photo.startsWith('http') ? u.photo : `${BACKEND_URL}/uploads/profils/${u.photo}`}
                                alt={`Photo de ${u.prenom}`}
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
                              fontSize: '11px', color: '#fff', fontWeight: '700',
                              position: 'relative', zIndex: 1
                            }}>
                              {u.prenom?.charAt(0)}{u.nom?.charAt(0)}
                            </div>
                          </div>
                          {u.prenom} {u.nom}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: '#6b7280' }}>{u.email}</td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: '#6b7280' }}>{u.telephone || '—'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: '#f59e0b' }}>{stars(u.noteMoyenne)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: u.estActif ? '#dcfce7' : '#fee2e2', color: u.estActif ? '#15803d' : '#dc2626' }}>
                          {u.estActif ? 'Actif' : 'Suspendu'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Évaluations */}
      {showEvalModal && selectedConducteur && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '28px', width: '100%', maxWidth: '600px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  Historique des évaluations
                </h3>
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  {selectedConducteur?.prenom} {selectedConducteur?.nom} — Note : {selectedConducteur?.noteMoyenne ? `${selectedConducteur.noteMoyenne.toFixed(1)}/5` : 'Aucune note'}
                </p>
              </div>
              <button onClick={() => { setShowEvalModal(false); setEvaluations([]); setSelectedConducteur(null); }} style={{ background: '#f3f4f6', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18" />
                  <path d="M6 6L18 18" />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loadingEval ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>Chargement...</div>
              ) : evaluations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: '36px', marginBottom: '10px' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                  <p style={{ color: '#9ca3af', fontSize: '13px' }}>Aucune évaluation pour ce conducteur</p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      {['Auteur', 'Note', 'Commentaire', 'Date'].map(h => (
                        <th key={h} style={{ fontSize: '11px', color: '#6b7280', textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: '.5px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {evaluations.map((ev, i) => (
                      <tr key={ev.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                        <td style={{ padding: '10px 12px', fontSize: '12px', color: '#374151', fontWeight: '500' }}>{ev.auteur?.prenom} {ev.auteur?.nom}</td>
                        <td style={{ padding: '10px 12px', fontSize: '13px', color: '#f59e0b' }}>
                          <span style={{ display: 'flex', gap: '1px' }}>
                            {[...Array(5)].map((_, j) => (
                              <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill={j < ev.note ? '#f59e0b' : '#e5e7eb'} stroke={j < ev.note ? '#f59e0b' : '#e5e7eb'} strokeWidth="1">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            ))}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: '12px', color: '#6b7280' }}>{ev.commentaire || '—'}</td>
                        <td style={{ padding: '10px 12px', fontSize: '11px', color: '#9ca3af' }}>{new Date(ev.dateEvaluation).toLocaleDateString('fr-FR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowEvalModal(false); setEvaluations([]); setSelectedConducteur(null); }} style={{ padding: '8px 20px', background: '#0a0a0a', color: '#22c55e', border: '1px solid #22c55e', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation pour suspendre/réactiver */}
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
                background: confirmModal.action === 'suspendre' ? '#fee2e2' : '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {confirmModal.action === 'suspendre' ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M15 9L9 15" />
                    <path d="M9 9L15 15" />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17L4 12" />
                  </svg>
                )}
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>
                  {confirmModal.action === 'suspendre' ? 'Suspendre l\'utilisateur' : 'Réactiver l\'utilisateur'}
                </h3>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>
                  {confirmModal.action === 'suspendre' 
                    ? 'Cet utilisateur ne pourra plus créer de trajets ni faire de réservations.'
                    : 'Cet utilisateur pourra à nouveau utiliser la plateforme.'
                  }
                </p>
              </div>
            </div>
            
            <div style={{
              background: '#f9fafb',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px'
            }}>
              <p style={{ fontSize: '14px', color: '#374151', margin: 0 }}>
                Êtes-vous sûr de vouloir <strong>{confirmModal.action}</strong> <strong>{confirmModal.userName}</strong> ?
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmModal({ open: false, userId: null, userName: '', action: 'suspendre' })}
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
                onClick={confirmAction}
                style={{
                  padding: '10px 20px',
                  background: confirmModal.action === 'suspendre' ? '#dc2626' : '#15803d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {confirmModal.action === 'suspendre' ? 'Suspendre' : 'Réactiver'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}