'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ConducteurLayout from '../../../components/conducteur/ConducteurLayout';
import { useTheme } from '@/app/lib/ThemeContext';

const API_URL = '/api';

const E = '#0D9E7E';
const EL = '#E8F7F3';
const ED = '#0A7B62';
const BK = '#0D0D0D';
const GR = '#6B7280';
const BD = '#EBEBEB';

// ─── SVG Icons inline ───
const Icon = ({ name, size = 20, color = E }: { name: string; size?: number; color?: string }) => {
  const s = { width: size, height: size, display: 'inline-block', verticalAlign: 'middle' } as React.CSSProperties;
  const icons: Record<string, React.ReactNode> = {
    car: (
      <svg style={s} viewBox="0 0 24 24" fill="none">
        <path d="M5 11L6.5 6.5C6.8 5.6 7.6 5 8.6 5H15.4C16.4 5 17.2 5.6 17.5 6.5L19 11" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <rect x="2" y="11" width="20" height="7" rx="2" stroke={color} strokeWidth="2" fill={EL}/>
        <circle cx="7" cy="18" r="2" stroke={color} strokeWidth="2" fill="white"/>
        <circle cx="17" cy="18" r="2" stroke={color} strokeWidth="2" fill="white"/>
      </svg>
    ),
    calendar: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    users: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    eye: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    ),
    edit: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
    x: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      </svg>
    ),
    road: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20a6 6 0 0 0-12 0"/>
        <path d="M2 20h20"/>
        <path d="M12 20V10"/>
        <path d="M12 10a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2z"/>
      </svg>
    ),
    clock: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    map: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
        <line x1="8" y1="2" x2="8" y2="18"/>
        <line x1="16" y1="6" x2="16" y2="22"/>
      </svg>
    ),
  };
  return <span style={{ lineHeight: 0, display: 'inline-flex' }}>{icons[name] || null}</span>;
};

interface Trajet {
  id: number;
  villeDepart: string;
  villeArrivee: string;
  quartierDepart?: string;
  quartierArrivee?: string;
  dateDepart: string;
  heureDepart: string;
  heureArriveeEstimee?: string;
  placesDisponibles: number;
  prixParPlace: number;
  statut: string;
  nbReservations: number;
  nbReservationsConfirmees: number;
}

export default function MesTrajetsPage() {
  const router = useRouter();
  const { t, darkMode } = useTheme();
  const [trajets, setTrajets] = useState<Trajet[]>([]);
  const [loading, setLoading] = useState(true);
  // ✅ AJOUT : 'brouillon' dans les types de filtre
  const [filter, setFilter] = useState<'tous' | 'ouvert' | 'complet' | 'annule' | 'brouillon' | 'en_cours' | 'termine'>('tous');
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    const rawToken = localStorage.getItem('token');
    const token = rawToken ? rawToken.replace(/^"|"$/g, '').trim() : null;
    
    if (!token) {
      router.push('/login');
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    // ✅ CORRECTION PRINCIPALE : Ajout de '/trajets' à la fin de l'URL
    fetch(`${API_URL}/conducteur/trajets`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then(async (res) => {
        clearTimeout(timeoutId);
        
        if (res.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
          return [];
        }
        
        if (!res.ok) {
          console.error("Erreur API:", await res.text());
          return [];
        }
        return res.json();
      })
      .then((data) => {
        setTrajets(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') {
          console.warn("⏱️ Le chargement a pris plus de 10 secondes. Ce n'est pas une erreur critique.");
        } else {
          console.error("Erreur réseau:", err);
        }
        setTrajets([]);
        setLoading(false);
      });
  }, [router]);

  const handleAnnuler = async (id: number) => {
    if (!window.confirm(t('confirmCancelTrip') || 'Voulez-vous vraiment annuler ce trajet ?')) return;
    
    const token = localStorage.getItem('token');
    setCancellingId(id);
    
    try {
      const res = await fetch(`${API_URL}/conducteur/trajets/${id}/annuler`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        setTrajets((prev) =>
          prev.map((t) => (t.id === id ? { ...t, statut: 'ANNULE' } : t))
        );
      } else {
        alert(t('cancelError') || 'Erreur lors de l\'annulation');
      }
    } catch {
      alert(t('serverError') || 'Erreur serveur');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatutBadge = (statut: string) => {
    switch (statut?.toUpperCase()) {
      case 'EN_COURS':
        return { bg: '#d1fae5', color: '#059669', label: 'En cours' };
      case 'EN_ATTENTE_DEPART':
        return { bg: '#fef3c7', color: '#d97706', label: 'Pret' };
      case 'EN_ATTENTE_VALIDATION':
        return { bg: '#dbeafe', color: '#2563EB', label: 'A valider' };
      case 'OUVERT':
      case 'OPEN':
        return { bg: '#dcfce7', color: '#15803d', label: t('open') || 'Ouvert' };
      case 'COMPLET':
      case 'FULL':
        return { bg: '#dbeafe', color: '#1d4ed8', label: t('full') || 'Complet' };
      case 'ANNULE':
      case 'ANNULÉ':
      case 'CANCELLED':
        return { bg: '#fee2e2', color: '#dc2626', label: t('cancelled') || 'Annulé' };
      case 'TERMINE':
        return { bg: '#f3f4f6', color: '#4b5563', label: t('completed') || 'Terminé' };
      case 'BROUILLON':
      case 'DRAFT':
        return { bg: '#fef3c7', color: '#d97706', label: 'Brouillon' };
      default:
        return { bg: '#f3f4f6', color: '#6b7280', label: statut };
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  const now = new Date();

  const filteredTrajets = trajets.filter((t) => {
    const u = t.statut.toUpperCase();
    const isBrouillon = u === 'BROUILLON' || u === 'DRAFT';

    if (filter === 'tous') {
      if (isBrouillon) return false;
      return true;
    }

    if (filter === 'brouillon') return isBrouillon;

    if (filter === 'complet' || filter === 'annule') {
      const dateDepart = new Date(t.dateDepart);
      const fiveDaysAfter = new Date(dateDepart.getTime() + 5 * 24 * 60 * 60 * 1000);
      if (fiveDaysAfter < now) return false;
    }

    if (filter === 'en_cours') return u === 'EN_COURS' || u === 'EN_ATTENTE_DEPART' || u === 'EN_ATTENTE_VALIDATION';
    if (filter === 'termine') return u === 'TERMINE';

    return u === filter.toUpperCase() || (filter === 'ouvert' && u === 'OPEN');
  });

  const getFilterLabel = (filterKey: string) => {
    const labels: Record<string, string> = {
      tous: t('all') || 'Tous',
      ouvert: t('open') || 'Ouverts',
      complet: t('full') || 'Complets',
      annule: t('cancelled') || 'Annulés',
      brouillon: 'Brouillons', // ✅ AJOUT
    };
    return labels[filterKey] || filterKey;
  };

  if (loading) {
    return (
      <ConducteurLayout>
        <div style={{ textAlign: 'center', padding: '80px', color: darkMode ? '#9CA3AF' : '#6b7280' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}><Icon name="road" size={48} /></div>
          <p>{t('loading') || 'Chargement...'}</p>
        </div>
      </ConducteurLayout>
    );
  }

  return (
    <ConducteurLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: darkMode ? '#FFFFFF' : '#111827', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {t('myTrips') || 'Mes trajets'} <Icon name="road" size={24} />
          </h1>
          <p style={{ fontSize: '13px', color: darkMode ? '#9CA3AF' : '#6b7280' }}>{t('manageTrips') || 'Gérez vos trajets publiés et en brouillon'}</p>
        </div>
        <Link href="/conducteur/trajets/creer" style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', border: 'none',
          background: 'linear-gradient(135deg, #0A7B62, #0D9E7E)', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(13,158,126,0.4)', textDecoration: 'none',
        }}>
          + {t('publish') || 'Publier'}
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { key: 'tous', label: t('all') || 'Tous' }, 
          { key: 'brouillon', label: 'Brouillons' },
          { key: 'ouvert', label: t('open') || 'Ouverts' },
          { key: 'en_cours', label: 'En cours' },
          { key: 'complet', label: t('full') || 'Complets' }, 
          { key: 'termine', label: t('completed') || 'Terminés' },
          { key: 'annule', label: t('cancelled') || 'Annulés' }
        ].map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key as any)} style={{
            padding: '8px 16px', borderRadius: '20px', border: '1px solid #e5e7eb',
            background: filter === f.key ? '#0D9E7E' : (darkMode ? '#1A1A1A' : '#fff'),
            color: filter === f.key ? '#fff' : (darkMode ? '#9CA3AF' : '#6b7280'),
            fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all .2s',
          }}>
            {f.label}
          </button>
        ))}
      </div>

      {filteredTrajets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 40px', background: darkMode ? '#1A1A1A' : '#fff', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}><Icon name="road" size={64} /></div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: darkMode ? '#FFFFFF' : '#111827', marginBottom: '8px' }}>{t('noTripsFound') || 'Aucun trajet trouvé'}</h3>
          <p style={{ fontSize: '13px', color: darkMode ? '#9CA3AF' : '#6b7280', marginBottom: '24px' }}>
            {filter === 'tous' ? (t('noTripsPublished') || 'Vous n\'avez encore publié aucun trajet.') : (t('noTripsFilter') || 'Aucun trajet dans la catégorie') + ' "' + getFilterLabel(filter) + '"'}
          </p>
          {filter === 'tous' && (
            <Link href="/conducteur/trajets/creer" style={{
              padding: '12px 28px', background: 'linear-gradient(135deg, #0A7B62, #0D9E7E)', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700',
              color: '#fff', cursor: 'pointer', textDecoration: 'none', boxShadow: '0 4px 15px rgba(13,158,126,0.4)',
            }}>
              + {t('publishFirstTrip') || 'Publier mon premier trajet'}
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))', gap: '16px' }}>
          {filteredTrajets.map((trajet) => {
            const statut = getStatutBadge(trajet.statut);
            const isActif = statut.label === (t('open') || 'Ouvert') || statut.label === (t('full') || 'Complet');
            const u = trajet.statut.toUpperCase();
            const isActiveEnCours = u === 'EN_COURS' || u === 'EN_ATTENTE_DEPART' || u === 'EN_ATTENTE_VALIDATION';
            const isTermine = u === 'TERMINE';
            const isPast = new Date(trajet.dateDepart) < now && !isActiveEnCours;

            return (
              <div key={trajet.id} style={{ background: darkMode ? '#1A1A1A' : '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', transition: 'all .2s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)')}
              >
                <div style={{ background: 'linear-gradient(135deg, #0a0a0a, #1a1a1a)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon name="car" size={24} color="white" />
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#fff' }}>{trajet.villeDepart} <span style={{ color: '#0D9E7E' }}>→</span> {trajet.villeArrivee}</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{trajet.quartierDepart && trajet.quartierArrivee ? `${trajet.quartierDepart} → ${trajet.quartierArrivee}` : (t('locationDetails') || 'Détails du lieu')}</div>
                    </div>
                  </div>
                  <span style={{ background: statut.bg, color: statut.color, fontSize: '10px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase' }}>
                    {statut.label}
                  </span>
                </div>

                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ background: darkMode ? '#2D2D2D' : '#f9fafb', borderRadius: '8px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '11px', color: darkMode ? '#9CA3AF' : '#9ca3af', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Icon name="calendar" size={11} /> {t('dateTime') || 'Date & Heure'}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: darkMode ? '#FFFFFF' : '#111827' }}>
                        <div>{t('departure') || 'Départ'} : <span style={{ color: '#0D9E7E' }}>{trajet.heureDepart}</span> <span style={{fontWeight: '400', color: darkMode ? '#9CA3AF' : '#6b7280', fontSize: '11px'}}>({formatDate(trajet.dateDepart)})</span></div>
                        {trajet.heureArriveeEstimee && (
                          <div style={{ marginTop: '4px', fontSize: '12px', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Icon name="clock" size={11} color="#059669" /> {t('estimatedArrival') || 'Arrivée est.'} : {trajet.heureArriveeEstimee}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ background: darkMode ? '#2D2D2D' : '#f9fafb', borderRadius: '8px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '11px', color: darkMode ? '#9CA3AF' : '#9ca3af', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Icon name="users" size={11} /> {t('seatsAndPrice') || 'Places & Prix'}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: darkMode ? '#FFFFFF' : '#111827' }}>
                        {trajet.nbReservationsConfirmees}/{trajet.placesDisponibles} {t('reserved') || 'réservés'}<br />
                        <span style={{ color: '#15803d' }}>{trajet.prixParPlace.toLocaleString('fr-FR')} FCFA</span>
                      </div>
                    </div>
                  </div>

                  {!isPast && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {(trajet.statut.toUpperCase() === 'EN_COURS' || trajet.statut.toUpperCase() === 'EN_ATTENTE_DEPART' || trajet.statut.toUpperCase() === 'EN_ATTENTE_VALIDATION') ? (
                      <>
                        <Link href={`/conducteur/trajets/${trajet.id}/carte-ramassage`} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: `linear-gradient(135deg, ${E}, ${ED})`, color: '#fff', fontSize: '12px', fontWeight: '600', textAlign: 'center', textDecoration: 'none', transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <Icon name="map" size={12} color="#fff" /> Carte ramassage
                        </Link>
                        <Link href={`/conducteur/trajets/${trajet.id}`} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(13,158,126,0.3)', background: 'rgba(13,158,126,0.05)', color: '#0D9E7E', fontSize: '12px', fontWeight: '600', textAlign: 'center', textDecoration: 'none', transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <Icon name="users" size={12} color="#0D9E7E" /> Valider presences
                        </Link>
                      </>
                    ) : trajet.statut.toUpperCase() === 'TERMINE' ? (
                      <>
                        <Link href={`/conducteur/trajets/${trajet.id}`} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', background: darkMode ? '#1A1A1A' : '#fff', color: darkMode ? '#FFFFFF' : '#374151', fontSize: '12px', fontWeight: '600', textAlign: 'center', textDecoration: 'none', transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <Icon name="eye" size={12} /> {t('details') || 'Details'}
                        </Link>
                        <Link href={`/conducteur/evaluations`} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#0D9E7E', color: '#fff', fontSize: '12px', fontWeight: '600', textAlign: 'center', textDecoration: 'none', transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <Icon name="star" size={12} color="#fff" /> Noter passagers
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link href={`/conducteur/trajets/${trajet.id}`} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', background: darkMode ? '#1A1A1A' : '#fff', color: darkMode ? '#FFFFFF' : '#374151', fontSize: '12px', fontWeight: '600', textAlign: 'center', textDecoration: 'none', transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <Icon name="eye" size={12} /> {t('details') || 'Details'}
                        </Link>
                        <Link href={`/conducteur/trajets/${trajet.id}/carte-ramassage`} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(13,158,126,0.3)', background: 'rgba(13,158,126,0.05)', color: '#0D9E7E', fontSize: '12px', fontWeight: '600', textAlign: 'center', textDecoration: 'none', transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <Icon name="map" size={12} color="#0D9E7E" /> {t('pickupMap') || 'Carte'}
                        </Link>
                        {isActif && (
                          <>
                            <Link href={`/conducteur/trajets/${trajet.id}/modifier`} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(13,158,126,0.3)', background: 'rgba(13,158,126,0.05)', color: '#0D9E7E', fontSize: '12px', fontWeight: '600', textAlign: 'center', textDecoration: 'none', transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                              <Icon name="edit" size={12} color="#0D9E7E" /> {t('edit') || 'Modifier'}
                            </Link>
                            <button onClick={() => handleAnnuler(trajet.id)} disabled={cancellingId === trajet.id} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #fca5a5', background: '#fee2e2', color: '#dc2626', fontSize: '12px', fontWeight: '600', cursor: cancellingId === trajet.id ? 'not-allowed' : 'pointer', transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                              <Icon name="x" size={12} color="#dc2626" /> {cancellingId === trajet.id ? '...' : (t('cancel') || 'Annuler')}
                            </button>
                          </>
                        )}
                        {(trajet.statut.toUpperCase() === 'BROUILLON' || trajet.statut.toUpperCase() === 'DRAFT') && (
                          <Link href={`/conducteur/trajets/${trajet.id}/completer`} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#0D9E7E', color: '#fff', fontSize: '12px', fontWeight: '600', textAlign: 'center', textDecoration: 'none', transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <Icon name="edit" size={12} color="#fff" /> Complete
                          </Link>
                        )}
                      </>
                    )}
                  </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ConducteurLayout>
  );
}