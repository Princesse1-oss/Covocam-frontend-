'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/app/lib/ThemeContext';
import ConducteurLayout from '../../../../components/conducteur/ConducteurLayout'; // ✅ IMPORT AJOUTÉ

const API_URL = '/api';

const E = '#0D9E7E';
const EL = '#E8F7F3';
const ED = '#0A7B62';
const BK = '#0D0D0D';
const GR = '#6B7280';
const BD = '#EBEBEB';
const RD = '#DC2626';
const RL = '#FEE2E2';
const AM = '#F59E0B';
const AL = '#FEF3C7';

const Icon = ({ name, size = 20, color = E }: { name: string; size?: number; color?: string }) => {
  const s = { width: size, height: size, display: 'inline-block', verticalAlign: 'middle' } as React.CSSProperties;
  const icons: Record<string, React.ReactNode> = {
    edit: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
    trash: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      </svg>
    ),
    check: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    x: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    ),
    mapPin: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    calendar: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    clock: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    car: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 11L6.5 6.5C6.8 5.6 7.6 5 8.6 5H15.4C16.4 5 17.2 5.6 17.5 6.5L19 11" />
        <rect x="2" y="11" width="20" height="7" rx="2" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
      </svg>
    ),
    users: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    alert: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    file: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      </svg>
    ),
  };
  return <span style={{ lineHeight: 0, display: 'inline-flex' }}>{icons[name] || null}</span>;
};

interface TrajetBrouillon {
  id: number;
  villeDepart: string;
  villeArrivee: string;
  quartierDepart?: string;
  quartierArrivee?: string;
  dateDepart: string;
  heureDepart?: string;
  placesDisponibles: number;
  prixParPlace: number;
  statut: string;
  vehicule?: {
    id: number;
    marque: string;
    modele: string;
    immatriculation: string;
  };
  description?: string;
  createdAt?: string;
}

interface Vehicule {
  id: number;
  marque: string;
  modele: string;
  immatriculation: string;
}

export default function TrajetsBrouillonsPage() {
  const router = useRouter();
  const { t, darkMode } = useTheme();
  
  const [brouillons, setBrouillons] = useState<TrajetBrouillon[]>([]);
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTrajet, setSelectedTrajet] = useState<TrajetBrouillon | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const [vehiculeId, setVehiculeId] = useState('');
  const [heureDepart, setHeureDepart] = useState('');
  const [pointDepart, setPointDepart] = useState('');
  const [pointArrivee, setPointArrivee] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchBrouillons(token);
    fetchVehicules(token);

    return () => window.removeEventListener('resize', checkMobile);
  }, [router]);

  const fetchBrouillons = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/conducteur/trajets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        const maintenant = new Date();
        const brouillonsFiltres = data.filter((t: any) => {
          if (t.statut !== 'BROUILLON') return false;
          if (t.dateDepart) {
            const dateLimite = new Date(t.dateDepart);
            dateLimite.setDate(dateLimite.getDate() + 2);
            if (dateLimite < maintenant) return false;
          }
          return true;
        });
        setBrouillons(brouillonsFiltres);
      }
    } catch (err) {
      console.error('Erreur chargement brouillons:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicules = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/conducteur/vehicules`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setVehicules(data);
      }
    } catch (err) {
      console.error('Erreur chargement vehicules:', err);
    }
  };

  const handleCompleter = (trajet: TrajetBrouillon) => {
    setSelectedTrajet(trajet);
    setVehiculeId(trajet.vehicule?.id?.toString() || '');
    setHeureDepart(trajet.heureDepart || '');
    setPointDepart(trajet.quartierDepart || trajet.villeDepart);
    setPointArrivee(trajet.quartierArrivee || trajet.villeArrivee);
    setDescription(trajet.description || '');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!selectedTrajet || !vehiculeId) {
      setError('Veuillez sélectionner un véhicule'); setTimeout(() => setError(''), 4000);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Session expirée. Veuillez vous reconnecter.'); setTimeout(() => { setError(''); router.push('/login'); }, 2000);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/conducteur/trajets/${selectedTrajet.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vehiculeId: parseInt(vehiculeId),
          heureDepart,
          pointDepart,
          pointArrivee,
          description,
          statut: 'OUVERT'
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Trajet publié avec succès !'); setTimeout(() => { setSuccess(''); setShowModal(false); fetchBrouillons(token); }, 2000);
      } else {
        setError(data.error || 'Erreur lors de la publication'); setTimeout(() => setError(''), 4000);
      }
    } catch (err) {
      setError('Erreur de connexion'); setTimeout(() => setError(''), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSupprimer = async (id: number) => {
    if (confirmDeleteId !== id) { setConfirmDeleteId(id); return; }
    setConfirmDeleteId(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Session expirée. Veuillez vous reconnecter.'); setTimeout(() => { setError(''); router.push('/login'); }, 2000);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/conducteur/trajets/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setBrouillons(prev => prev.filter(t => t.id !== id));
        setSuccess('Brouillon supprimé'); setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Erreur lors de la suppression'); setTimeout(() => setError(''), 4000);
      }
    } catch (err) {
      setError('Erreur de connexion'); setTimeout(() => setError(''), 4000);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const bgCard = darkMode ? '#1A1A1A' : '#FFFFFF';
  const textColor = darkMode ? '#FFFFFF' : BK;
  const textSecondary = darkMode ? '#9CA3AF' : GR;
  const borderColor = darkMode ? '#2A2A2A' : BD;
  const inputBg = darkMode ? '#2A2A2A' : '#FFFFFF';

  if (loading) {
    return (
      <ConducteurLayout>
        <div style={{ padding: '80px', textAlign: 'center', color: textSecondary }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `3px solid ${EL}`, borderTopColor: E, animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p>Chargement des brouillons...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
        </div>
      </ConducteurLayout>
    );
  }

  return (
    <ConducteurLayout>
      <div style={{ padding: isMobile ? '20px 16px' : '32px 24px', maxWidth: '1000px', margin: '0 auto' }}>
        
        {error && (
          <div style={{ padding: '12px 16px', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626', fontSize: '13px', fontWeight: '600' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            {error}
          </div>
        )}
        {success && (
          <div style={{ padding: '12px 16px', background: '#DCFCE7', border: '1px solid #BBF7D0', borderRadius: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#15803D', fontSize: '13px', fontWeight: '600' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            {success}
          </div>
        )}
        {confirmDeleteId !== null && (
          <div style={{ marginBottom: '16px', padding: '16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#DC2626' }}>Voulez-vous vraiment supprimer ce brouillon ? Le passager sera notifié.</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setConfirmDeleteId(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#FFF', color: '#374151', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Annuler</button>
              <button onClick={() => handleSupprimer(confirmDeleteId)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#DC2626', color: '#FFF', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Supprimer</button>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '800', color: textColor, margin: '0 0 8px' }}>
            Trajets en brouillon
          </h1>
          <p style={{ fontSize: '14px', color: textSecondary, margin: 0 }}>
            Complétez ces trajets pour les publier. Vous avez 24h pour les finaliser.
          </p>
        </div>

        {/* Alerte info */}
        {brouillons.length > 0 && (
          <div style={{
            padding: '14px 18px', background: AL, borderRadius: '12px',
            border: '1px solid #FCD34D', marginBottom: '24px',
            display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            <Icon name="alert" size={20} color={AM} />
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#92400E' }}>
                Action requise
              </div>
              <div style={{ fontSize: '13px', color: '#78350F' }}>
                Vous avez {brouillons.length} trajet(s) en brouillon à compléter avant leur expiration.
              </div>
            </div>
          </div>
        )}

        {/* Liste des brouillons */}
        {brouillons.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: isMobile ? '40px 20px' : '60px',
            background: bgCard, borderRadius: '16px', border: `1px dashed ${borderColor}`
          }}>
            <div style={{ fontSize: '14px', marginBottom: '16px', fontWeight: '700', color: textSecondary }}>[ ]</div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: textColor, marginBottom: '8px' }}>
              Aucun brouillon en attente
            </h3>
            <p style={{ fontSize: '14px', color: textSecondary, marginBottom: '24px' }}>
              Les trajets créés suite à l'acceptation d'une demande apparaîtront ici.
            </p>
            <Link href="/conducteur/demandes" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', borderRadius: '12px',
              background: E, color: '#FFF', textDecoration: 'none',
              fontSize: '14px', fontWeight: '700'
            }}>
              Voir les demandes disponibles
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {brouillons.map(trajet => {
              const isComplet = trajet.vehicule && trajet.heureDepart;
              
              return (
                <div key={trajet.id} style={{
                  background: bgCard, borderRadius: '16px', border: `1px solid ${borderColor}`,
                  overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s'
                }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'}
                >
                  {/* Bandeau statut */}
                  <div style={{
                    background: isComplet ? EL : AL,
                    padding: '10px 20px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    borderBottom: `1px solid ${borderColor}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isComplet ? E : '#F59E0B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg></span>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: isComplet ? E : AM }}>
                        {isComplet ? 'Prêt à publier' : 'Informations manquantes'}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: textSecondary }}>
                      Créé le {formatDate(trajet.createdAt || '')}
                    </span>
                  </div>

                  {/* Contenu */}
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                      
                      {/* Infos Trajet */}
                      <div style={{ flex: 1, minWidth: '250px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: EL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name="mapPin" size={20} color={E} />
                          </div>
                          <div>
                            <div style={{ fontSize: '16px', fontWeight: '700', color: textColor }}>
                              {trajet.villeDepart} {trajet.quartierDepart && <span style={{ fontSize: '13px', color: textSecondary }}>({trajet.quartierDepart})</span>}
                            </div>
                            <div style={{ fontSize: '12px', color: E, margin: '2px 0' }}>↓</div>
                            <div style={{ fontSize: '16px', fontWeight: '700', color: textColor }}>
                              {trajet.villeArrivee} {trajet.quartierArrivee && <span style={{ fontSize: '13px', color: textSecondary }}>({trajet.quartierArrivee})</span>}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: textSecondary }}>
                            <Icon name="calendar" size={14} color={GR} />
                            {formatDate(trajet.dateDepart)}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: trajet.heureDepart ? E : RD }}>
                            <Icon name="clock" size={14} color={trajet.heureDepart ? E : RD} />
                            {trajet.heureDepart || 'Heure non définie'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: textSecondary }}>
                            <Icon name="users" size={14} color={GR} />
                            {trajet.placesDisponibles} {trajet.placesDisponibles > 1 ? 'places' : 'place'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#16A34A', fontWeight: '600' }}>
                            <Icon name="file" size={14} color="#16A34A" />
                            {trajet.prixParPlace.toLocaleString()} FCFA/place
                          </div>
                        </div>

                        {/* Checklist */}
                        <div style={{
                          padding: '12px', background: darkMode ? '#2A2A2A' : '#F9FAFB',
                          borderRadius: '10px', marginTop: '12px'
                        }}>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: textColor, marginBottom: '8px', textTransform: 'uppercase' }}>
                            Checklist de publication
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: trajet.vehicule ? '#16A34A' : RD }}>
                              {trajet.vehicule ? <Icon name="check" size={14} color="#16A34A" /> : <Icon name="x" size={14} color={RD} />}
                              Véhicule sélectionné
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: trajet.heureDepart ? '#16A34A' : RD }}>
                              {trajet.heureDepart ? <Icon name="check" size={14} color="#16A34A" /> : <Icon name="x" size={14} color={RD} />}
                              Heure de départ précise
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: pointDepart ? '#16A34A' : GR }}>
                              {pointDepart ? <Icon name="check" size={14} color="#16A34A" /> : <Icon name="x" size={14} color={GR} />}
                              Point de rendez-vous
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{
                      marginTop: '20px', paddingTop: '16px', borderTop: `1px solid ${borderColor}`,
                      display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end'
                    }}>
                      <button
                        onClick={() => handleSupprimer(trajet.id)}
                        style={{
                          padding: '10px 18px', borderRadius: '10px',
                          border: `1px solid ${RD}`, background: RL, color: RD,
                          fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '6px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#FECACA'}
                        onMouseLeave={(e) => e.currentTarget.style.background = RL}
                      >
                        <Icon name="trash" size={14} color={RD} /> Supprimer
                      </button>
                      <button
                        onClick={() => handleCompleter(trajet)}
                        style={{
                          padding: '12px 24px', borderRadius: '10px',
                          border: 'none',
                          background: `linear-gradient(135deg, ${E}, ${ED})`,
                          color: '#FFF', fontSize: '14px', fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '8px',
                          boxShadow: `0 4px 15px rgba(13, 158, 126, 0.3)`,
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        <Icon name="edit" size={16} color="#FFF" />
                        {isComplet ? 'Publier le trajet' : 'Compléter les infos'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODALE : Compléter un brouillon */}
      {showModal && selectedTrajet && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px', overflowY: 'auto'
        }}
          onClick={() => setShowModal(false)}
        >
          <div style={{
            background: bgCard, borderRadius: '20px', padding: isMobile ? '24px' : '32px', 
            maxWidth: '600px', width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            maxHeight: '90vh', overflowY: 'auto'
          }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '14px', marginBottom: '12px', fontWeight: '700', color: textSecondary }}>&gt;_</div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: textColor, marginBottom: '8px' }}>
                Compléter le trajet
              </h3>
              <p style={{ fontSize: '14px', color: textSecondary }}>
                {selectedTrajet.villeDepart} → {selectedTrajet.villeArrivee}
              </p>
            </div>

            {/* Véhicule */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: textColor, marginBottom: '8px' }}>
                <Icon name="car" size={14} color={E} /> Véhicule *
              </label>
              <select
                value={vehiculeId}
                onChange={(e) => setVehiculeId(e.target.value)}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: '10px',
                  border: `1.5px solid ${borderColor}`, background: inputBg,
                  color: textColor, fontSize: '14px', outline: 'none'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = E}
                onBlur={(e) => e.currentTarget.style.borderColor = borderColor}
              >
                <option value="">Sélectionnez un véhicule...</option>
                {vehicules.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.marque} {v.modele} - {v.immatriculation}
                  </option>
                ))}
              </select>
              {vehicules.length === 0 && (
                <div style={{ fontSize: '12px', color: RD, marginTop: '6px' }}>
                  Vous n'avez pas de véhicule enregistré. <Link href="/conducteur/vehicule" style={{ color: E, fontWeight: '600' }}>Ajouter un véhicule</Link>
                </div>
              )}
            </div>

            {/* Heure */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: textColor, marginBottom: '8px' }}>
                <Icon name="clock" size={14} color={E} /> Heure de départ précise *
              </label>
              <input
                type="time"
                value={heureDepart}
                onChange={(e) => setHeureDepart(e.target.value)}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: '10px',
                  border: `1.5px solid ${borderColor}`, background: inputBg,
                  color: textColor, fontSize: '14px', outline: 'none'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = E}
                onBlur={(e) => e.currentTarget.style.borderColor = borderColor}
              />
            </div>

            {/* Points de RDV */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: textColor, marginBottom: '8px' }}>
                  Point de rendez-vous départ
                </label>
                <input
                  type="text"
                  value={pointDepart}
                  onChange={(e) => setPointDepart(e.target.value)}
                  placeholder="Ex: Gare routière, Place..."
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '10px',
                    border: `1.5px solid ${borderColor}`, background: inputBg,
                    color: textColor, fontSize: '14px', outline: 'none'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = E}
                  onBlur={(e) => e.currentTarget.style.borderColor = borderColor}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: textColor, marginBottom: '8px' }}>
                  Point de rendez-vous arrivée
                </label>
                <input
                  type="text"
                  value={pointArrivee}
                  onChange={(e) => setPointArrivee(e.target.value)}
                  placeholder="Ex: Marché central, Gare..."
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '10px',
                    border: `1.5px solid ${borderColor}`, background: inputBg,
                    color: textColor, fontSize: '14px', outline: 'none'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = E}
                  onBlur={(e) => e.currentTarget.style.borderColor = borderColor}
                />
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: textColor, marginBottom: '8px' }}>
                Description (optionnel)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Informations supplémentaires pour les passagers..."
                rows={3}
                maxLength={500}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: '10px',
                  border: `1.5px solid ${borderColor}`, background: inputBg,
                  color: textColor, fontSize: '14px', outline: 'none',
                  resize: 'vertical', fontFamily: 'inherit'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = E}
                onBlur={(e) => e.currentTarget.style.borderColor = borderColor}
              />
            </div>

            {/* Boutons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1, padding: '14px', borderRadius: '10px',
                  border: `1.5px solid ${borderColor}`, background: 'transparent',
                  color: textColor, fontSize: '14px', fontWeight: '600', cursor: 'pointer'
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !vehiculeId || !heureDepart}
                style={{
                  flex: 2, padding: '14px', borderRadius: '10px',
                  border: 'none',
                  background: (submitting || !vehiculeId || !heureDepart) ? GR : `linear-gradient(135deg, ${E}, ${ED})`,
                  color: '#FFF', fontSize: '14px', fontWeight: '700',
                  cursor: (submitting || !vehiculeId || !heureDepart) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                {submitting ? (
                  <>
                    <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Publication...
                  </>
                ) : (
                  <>
                    <Icon name="check" size={16} color="#FFF" />
                    Publier le trajet
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </ConducteurLayout>
  );
}