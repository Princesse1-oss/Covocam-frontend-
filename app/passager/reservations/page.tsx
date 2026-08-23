'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/app/lib/ThemeContext';

const E = '#0D9E7E';
const EL = '#E8F7F3';
const ED = '#0A7B62';
const BK = '#0D0D0D';
const GR = '#6B7280';
const LG = '#F5F5F5';
const BD = '#EBEBEB';
const RD = '#DC2626';
const RL = '#FEE2E2';
const BL = '#2563EB';
const BLL = '#DBEAFE';
const AM = '#F59E0B';
const AL = '#FEF3C7';

// ─── Icônes SVG ───
const Icon = ({ name, size = 20, color = E }: { name: string; size?: number; color?: string }) => {
  const s = { width: size, height: size, display: 'inline-block', verticalAlign: 'middle' } as React.CSSProperties;
  const icons: Record<string, React.ReactNode> = {
    check: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
    ),
    clock: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    x: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    ),
    creditCard: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
      </svg>
    ),
    search: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
      </svg>
    ),
    calendar: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="3" /><path d="M16 2V6M8 2V6M3 10H21" />
      </svg>
    ),
    arrowRight: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    ),
    eye: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
      </svg>
    ),
    message: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    trash: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      </svg>
    ),
    info: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    ),
    mapPin: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    star: (
      <svg style={s} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
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
  };
  return <span style={{ lineHeight: 0, display: 'inline-flex' }}>{icons[name] || null}</span>;
};

// ─── Composant Étoiles SVG Interactives ───
const StarRating = ({ rating, setRating }: { rating: number; setRating: (n: number) => void }) => {
  const [hover, setHover] = useState(0);

  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '20px 0' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'transform 0.2s' }}
          onClick={() => setRating(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <svg 
            width="40" 
            height="40" 
            viewBox="0 0 24 24" 
            fill={star <= (hover || rating) ? '#F59E0B' : '#E5E7EB'} 
            stroke={star <= (hover || rating) ? '#F59E0B' : '#D1D5DB'} 
            strokeWidth="1"
            style={{ transition: 'all 0.2s' }}
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
      ))}
    </div>
  );
};

interface Reservation {
  id: number;
  placesReservees: number;
  statut: string;
  dateReservation: string;
  prixTotal: number;
  estPassee?: boolean;
  trajet: {
    id: number;
    villeDepart: string;
    villeArrivee: string;
    dateDepart: string;
    heureDepart: string | null;
    heureArriveeEstimee?: string | null;
    prixParPlace: number;
    statut: string;
    conducteur: {
      id: number;
      nom: string;
      prenom: string;
      noteMoyenne: number | null;
      telephone: string | null;
      photo?: string | null;
    };
  };
}

export default function MesReservations() {
  const router = useRouter();
  const { t, darkMode } = useTheme();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatut, setFilterStatut] = useState('tous');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [confirmAnnul, setConfirmAnnul] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // ✅ ÉTATS POUR LA MODALE D'ÉVALUATION
  const [evaluationModal, setEvaluationModal] = useState<{ 
    open: boolean; 
    trajetId: number | null; 
    conducteurNom: string;
    conducteurId: number | null;
  }>({
    open: false,
    trajetId: null,
    conducteurNom: '',
    conducteurId: null
  });
  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState('');
  const [submittingEvaluation, setSubmittingEvaluation] = useState(false);
  const [evaluationSuccess, setEvaluationSuccess] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

  const fetchReservations = async () => {
    const token = localStorage.getItem('token');
    console.log("🔑 Token brut trouvé :", token); // <-- AJOUTE CECI

    if (!token) {
      router.push('/login');
      return;
    }

    const cleanToken = token.replace(/"/g, '').trim();
    console.log("🔑 Token nettoyé envoyé :", cleanToken); // <-- AJOUTE CECI

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch('/api/reservations/mes-reservations', {
        headers: { Authorization: `Bearer ${cleanToken}` },
        signal: controller.signal,
      });

        clearTimeout(timeoutId);

        if (res.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }
        
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          setReservations([]);
          setLoading(false);
          return;
        }

        if (data && data.error) {
          setReservations([]);
        } else if (Array.isArray(data)) {
          setReservations(data);
        } else {
          setReservations([]);
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error("❌ Erreur réseau :", error);
        }
        setReservations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
    return () => window.removeEventListener('resize', checkMobile);
  }, [router]);

  const handleAnnuler = async (id: number) => {
    if (confirmAnnul === null) {
      setConfirmAnnul(id);
      return;
    }
    const token = localStorage.getItem('token');
    setProcessingId(id);
    try {
      const res = await fetch(`/api/reservations/${id}/annuler`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ motif: 'Annulé par le passager' })
      });
      if (res.ok) {
        setReservations(prev => prev.filter(r => r.id !== id));
      } else {
        setError('Impossible d\'annuler cette réservation.');
        setTimeout(() => setError(''), 4000);
      }
    } catch {
      setError('Erreur réseau.');
      setTimeout(() => setError(''), 4000);
    } finally {
      setProcessingId(null);
    }
  };

  // ✅ FONCTION POUR SOUMETTRE L'ÉVALUATION
  const handleSubmitEvaluation = async () => {
    if (note === 0) {
      setError('Veuillez sélectionner une note (1 à 5 étoiles)');
      setTimeout(() => setError(''), 4000);
      return;
    }

    setSubmittingEvaluation(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          trajetId: evaluationModal.trajetId,
          note: note,
          commentaire: commentaire
        })
      });

      const data = await response.json();

      if (response.ok) {
        setEvaluationSuccess(true);
        setTimeout(() => {
          setEvaluationModal({ open: false, trajetId: null, conducteurNom: '', conducteurId: null });
          setNote(0);
          setCommentaire('');
          setEvaluationSuccess(false);
          const freshToken = localStorage.getItem('token')?.replace(/"/g, '').trim();
          if (freshToken) {
            fetch('/api/reservations/mes-reservations', {
              headers: { Authorization: `Bearer ${freshToken}` }
            })
              .then(r => r.json())
              .then(data => {
                if (Array.isArray(data)) setReservations(data);
              })
              .catch(() => {});
          }
        }, 2500);
      } else {
        setError(data.error || 'Erreur lors de l\'envoi');
        setTimeout(() => setError(''), 4000);
      }
    } catch (err) {
      console.error('Erreur réseau:', err);
      setError('Erreur de connexion au serveur');
      setTimeout(() => setError(''), 4000);
    } finally {
      setSubmittingEvaluation(false);
    }
  };

  const statutStyle = (s: string) => {
    if (s === 'CONFIRMEE') return { background: EL, color: '#15803d' };
    if (s === 'A_PAYER') return { background: BLL, color: '#1d4ed8' };
    if (s === 'EN_ATTENTE') return { background: AL, color: AM };
    if (s === 'ANNULEE' || s === 'REFUSEE') return { background: RL, color: RD };
    return { background: LG, color: GR };
  };

  const statutLabel = (s: string) => {
    if (s === 'CONFIRMEE') return t('confirmed') || 'Confirmée & Payée';
    if (s === 'A_PAYER') return t('pendingPayment') || 'En attente de paiement';
    if (s === 'EN_ATTENTE') return t('pending') || 'En attente du conducteur';
    if (s === 'ANNULEE') return t('cancelled') || 'Annulée';
    if (s === 'REFUSEE') return 'Refusée';
    return s;
  };

  const getStatutTrajetBadge = (statutTrajet: string) => {
    switch (statutTrajet) {
      case 'OUVERT':
        return { label: 'À venir', bg: '#F3F4F6', color: '#6B7280', icon: <Icon name="calendar" size={14} color="#6B7280" /> };
      case 'EN_ATTENTE_DEPART':
        return { label: 'Départ bientôt', bg: AL, color: AM, icon: <Icon name="clock" size={14} color={AM} /> };
      case 'EN_COURS':
        return { label: 'En cours', bg: BLL, color: BL, icon: <Icon name="car" size={14} color={BL} /> };
      case 'EN_ATTENTE_VALIDATION':
        return { label: 'Arrivée imminente', bg: '#FEF3C7', color: '#B45309', icon: <Icon name="check" size={14} color="#B45309" /> };
      case 'TERMINE':
        return { label: 'Terminé', bg: EL, color: '#15803d', icon: <Icon name="check" size={14} color="#15803d" /> };
      case 'ANNULE':
        return { label: 'Annulé', bg: RL, color: RD, icon: <Icon name="x" size={14} color={RD} /> };
      default:
        return { label: statutTrajet, bg: LG, color: GR, icon: <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: GR, display: 'inline-block' }} /> };
    }
  };

  // Fonction pour vérifier si le bouton map doit être activé (5 minutes avant le départ)
  const estMapActive = (dateDepart: string, heureDepart: string | null) => {
    if (!heureDepart) return false;
    const maintenant = new Date();
    const dateHeureDepart = new Date(`${dateDepart}T${heureDepart}`);
    const diffMinutes = (dateHeureDepart.getTime() - maintenant.getTime()) / (1000 * 60);
    return diffMinutes <= 5; // Activer 5 minutes avant le départ
  };

  const getActionBouton = (r: Reservation) => {
    const statutTrajet = r.trajet?.statut;
    const mapEnabled = estMapActive(r.trajet.dateDepart, r.trajet.heureDepart);
    
    if (statutTrajet === 'EN_ATTENTE_DEPART') {
      if (mapEnabled) {
        return (
          <Link 
            href={`/passager/trajets/${r.trajet.id}/suivi`}
            style={{ 
              flex: '1', padding: '12px', borderRadius: '10px', border: 'none',
              background: `linear-gradient(135deg, ${AM}, #D97706)`,
              color: '#FFFFFF', fontSize: '13px', fontWeight: '700', textDecoration: 'none',
              textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }}
          >
            <Icon name="mapPin" size={16} color="#FFF" /> Suivre le conducteur
          </Link>
        );
      } else {
        return (
          <div style={{ 
            flex: '1', padding: '12px', borderRadius: '10px',
            background: '#F3F4F6', border: '1px solid #E5E7EB',
            color: '#9CA3AF', fontSize: '13px', fontWeight: '600',
            textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}>
            <Icon name="mapPin" size={16} color="#9CA3AF" /> Carte disponible 5 min avant
          </div>
        );
      }
    }

    if (statutTrajet === 'EN_COURS') {
      return (
        <Link 
          href={`/passager/trajets/${r.trajet.id}/suivi`}
          style={{ 
            flex: '1', padding: '12px', borderRadius: '10px', border: 'none',
            background: `linear-gradient(135deg, ${BL}, #1D4ED8)`,
            color: '#FFFFFF', fontSize: '13px', fontWeight: '700', textDecoration: 'none',
            textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            animation: 'pulse 2s infinite'
          }}
        >
          <Icon name="car" size={16} color="#FFF" /> Trajet en cours - Voir la carte
        </Link>
      );
    }

    if (statutTrajet === 'EN_ATTENTE_VALIDATION') {
      return (
        <div style={{ 
          flex: '1', padding: '12px', borderRadius: '10px',
          background: '#FEF3C7', border: '1px solid #FCD34D',
          color: '#B45309', fontSize: '13px', fontWeight: '600',
          textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
        }}>
          Le conducteur finalise le trajet
        </div>
      );
    }

    if (statutTrajet === 'TERMINE' && ['CONFIRMEE', 'TERMINEE'].includes(r.statut)) {
      return (
        <button
          onClick={() => setEvaluationModal({
            open: true,
            trajetId: r.trajet.id,
            conducteurNom: `${r.trajet.conducteur.prenom} ${r.trajet.conducteur.nom}`,
            conducteurId: r.trajet.conducteur.id
          })}
          style={{ 
            flex: '1', padding: '12px', borderRadius: '10px', border: 'none',
            background: `linear-gradient(135deg, ${E}, ${ED})`,
            color: '#FFFFFF', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
            textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: '0 4px 12px rgba(13, 158, 126, 0.3)'
          }}
        >
          <Icon name="star" size={16} color="#FFF" /> Évaluer le conducteur
        </button>
      );
    }

    return null;
  };

  const safeReservations = Array.isArray(reservations) ? reservations : [];

  const filtered = safeReservations.filter(r => {
    if (filterStatut === 'tous') return true;
    if (filterStatut === 'EN_ATTENTE') return r.statut === 'EN_ATTENTE' || r.statut === 'A_PAYER';
    if (filterStatut === 'ANNULEE') return r.statut === 'ANNULEE' || r.statut === 'REFUSEE';
    return r.statut === filterStatut;
  });

  const totalConfirmees = safeReservations.filter(r => r.statut === 'CONFIRMEE' || r.statut === 'TERMINEE').length;
  const totalEnAttente = safeReservations.filter(r => r.statut === 'EN_ATTENTE' || r.statut === 'A_PAYER').length;
  const totalAnnulees = safeReservations.filter(r => r.statut === 'ANNULEE' || r.statut === 'REFUSEE').length;
  const totalDepense = safeReservations
    .filter(r => ['CONFIRMEE', 'TERMINEE'].includes(r.statut))
    .reduce((acc, r) => acc + (r.prixTotal || 0), 0);

  const stars = (note: number | null) => {
    if (!note) return '☆☆☆☆☆';
    return '★'.repeat(Math.round(note)) + '☆'.repeat(5 - Math.round(note));
  };

  const formatDate = (d: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const bgCard = darkMode ? '#1D1D1D' : '#FFFFFF';
  const textColor = darkMode ? '#FFFFFF' : BK;
  const textSecondary = darkMode ? '#9CA3AF' : GR;
  const borderColor = darkMode ? '#2A2A2A' : BD;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: isMobile ? '60px 20px' : '80px', color: textSecondary }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `3px solid ${EL}`, borderTopColor: E, animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p>{t('loading') || 'Chargement de vos réservations...'}</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {error && (
        <div style={{ maxWidth: '900px', margin: '0 auto 16px', padding: '12px 16px', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626', fontSize: '13px', fontWeight: '600' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          {error}
        </div>
      )}

      <div style={{ padding: isMobile ? '20px 16px' : '32px 24px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: isMobile ? '20px' : '24px' }}>
          <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '800', color: textColor, margin: '0 0 8px' }}>
            {t('myReservations') || 'Mes réservations'}
          </h1>
          <p style={{ fontSize: isMobile ? '13px' : '14px', color: textSecondary, margin: 0 }}>
            {t('reservationsCount') || 'Suivez l\'état de vos demandes et effectuez vos paiements'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: isMobile ? '12px' : '14px', marginBottom: isMobile ? '20px' : '24px' }}>
          {[
            { label: t('confirmed') || 'Confirmées', value: totalConfirmees, color: '#15803d', bg: EL, icon: <Icon name="check" size={20} color="#15803d" /> },
            { label: t('pending') || 'En attente', value: totalEnAttente, color: AM, bg: AL, icon: <Icon name="clock" size={20} color={AM} /> },
            { label: t('cancelled') || 'Annulées', value: totalAnnulees, color: RD, bg: RL, icon: <Icon name="x" size={20} color={RD} /> },
            { label: t('totalEarnings') || 'Total dépensé', value: `${totalDepense.toLocaleString()} F`, color: '#16a34a', bg: '#f0fdf4', icon: <Icon name="creditCard" size={20} color="#16a34a" /> },
          ].map((card, i) => (
            <div key={i} style={{ background: bgCard, borderRadius: '16px', padding: isMobile ? '14px' : '16px', border: `1px solid ${borderColor}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ width: isMobile ? '36px' : '40px', height: isMobile ? '36px' : '40px', borderRadius: '10px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                {card.icon}
              </div>
              <div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '800', color: textColor, lineHeight: 1 }}>{card.value}</div>
              <div style={{ fontSize: isMobile ? '11px' : '12px', color: textSecondary, marginTop: '4px' }}>{card.label}</div>
            </div>
          ))}
        </div>

        {confirmAnnul !== null && (
          <div style={{ marginBottom: '16px', padding: '16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#DC2626' }}>Voulez-vous vraiment annuler cette réservation ?</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setConfirmAnnul(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#FFF', color: '#374151', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Non</button>
              <button onClick={() => { const id = confirmAnnul; setConfirmAnnul(null); handleAnnuler(id!); }} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#DC2626', color: '#FFF', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Oui, annuler</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginBottom: isMobile ? '16px' : '20px', flexWrap: 'wrap' }}>
          {[
            { label: t('all') || 'Toutes', value: 'tous' },
            { label: t('confirmed') || 'Confirmées', value: 'CONFIRMEE' },
            { label: t('pending') || 'En attente', value: 'EN_ATTENTE' },
            { label: t('cancelled') || 'Annulées', value: 'ANNULEE' },
          ].map(f => (
            <button key={f.value} onClick={() => setFilterStatut(f.value)} style={{
              padding: isMobile ? '8px 12px' : '8px 16px', borderRadius: '20px', border: '1px solid',
              fontSize: isMobile ? '12px' : '13px', fontWeight: '600', cursor: 'pointer', transition: 'all .2s',
              borderColor: filterStatut === f.value ? E : borderColor,
              background: filterStatut === f.value ? E : (darkMode ? '#1D1D1D' : '#FFFFFF'),
              color: filterStatut === f.value ? '#FFFFFF' : textSecondary,
            }}>
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: isMobile ? '40px 20px' : '60px', background: bgCard, borderRadius: '16px', border: `1px solid ${borderColor}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: EL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icon name="calendar" size={32} color={E} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: textColor, marginBottom: '8px' }}>{t('noData') || 'Aucune réservation à venir'}</h3>
            <Link href="/passager/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '16px', padding: '10px 24px', background: `linear-gradient(135deg, ${E}, ${ED})`, color: '#FFFFFF', textDecoration: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', boxShadow: `0 4px 12px rgba(13, 158, 126, 0.3)` }}>
              <Icon name="search" size={16} color="#FFFFFF" />
              {t('search') || 'Trouver un trajet'}
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filtered.map(r => {
              const badgeTrajet = getStatutTrajetBadge(r.trajet?.statut || 'OUVERT');
              const actionBouton = getActionBouton(r);

              return (
                <div key={r.id} style={{ background: bgCard, borderRadius: '16px', border: `1px solid ${borderColor}`, overflow: 'hidden', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  
                  <div style={{ 
                    background: badgeTrajet.bg, 
                    padding: '10px 16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    borderBottom: `1px solid ${borderColor}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center' }}>{badgeTrajet.icon}</span>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: badgeTrajet.color }}>
                        {badgeTrajet.label}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: badgeTrajet.color, fontWeight: '600' }}>
                      {r.statut === 'CONFIRMEE' ? 'Payée' : statutLabel(r.statut)}
                    </span>
                  </div>

                  <div style={{ background: `linear-gradient(135deg, ${BK}, #1a2e1a)`, padding: isMobile ? '16px' : '20px', display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '800', color: '#FFFFFF' }}>{r.trajet?.villeDepart}</span>
                      <Icon name="arrowRight" size={16} color={E} />
                      <span style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '800', color: '#FFFFFF' }}>{r.trajet?.villeArrivee}</span>
                      <span style={{ fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Icon name="calendar" size={14} color="#9ca3af" />
                        {formatDate(r.trajet?.dateDepart)}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: isMobile ? '12px 16px' : '12px 20px', background: darkMode ? '#2D2D2D' : LG, borderBottom: `1px solid ${borderColor}`, display: 'flex', gap: isMobile ? '12px' : '24px', flexWrap: 'wrap' }}>
                    {r.trajet?.heureDepart && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: textColor }}>
                        <Icon name="clock" size={16} color={E} />
                        <span style={{ fontWeight: '600' }}>{t('departure') || 'Départ'} :</span>
                        <span style={{ fontWeight: '700', color: E }}>{r.trajet.heureDepart}</span>
                      </div>
                    )}
                    {r.trajet?.heureArriveeEstimee && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: textColor }}>
                        <Icon name="clock" size={16} color={AM} />
                        <span style={{ fontWeight: '600' }}>{t('estimatedArrival') || 'Arrivée estimée'} :</span>
                        <span style={{ fontWeight: '700', color: AM }}>{r.trajet.heureArriveeEstimee}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ padding: isMobile ? '16px' : '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: '16px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative', width: '44px', height: '44px', flexShrink: 0 }}>
                          {r.trajet?.conducteur?.photo && (
                            <img src={r.trajet.conducteur.photo.startsWith('http') ? r.trajet.conducteur.photo : `/uploads/profils/${r.trajet.conducteur.photo}`} alt="" onError={(e) => (e.currentTarget.style.display = 'none')} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid #FFFFFF', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', position: 'absolute', top: 0, left: 0, zIndex: 10 }} />
                          )}
                          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: `linear-gradient(135deg, ${BK}, #1a2e1a)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: E, position: 'relative', zIndex: 1 }}>
                            {r.trajet?.conducteur?.prenom?.charAt(0)}{r.trajet?.conducteur?.nom?.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: textColor }}>{r.trajet?.conducteur?.prenom} {r.trajet?.conducteur?.nom}</div>
                          <div style={{ fontSize: '12px', color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '4px' }}>{stars(r.trajet?.conducteur?.noteMoyenne)}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: E }}>{r.prixTotal?.toLocaleString()} FCFA</div>
                        <div style={{ fontSize: '12px', color: textSecondary }}>{r.placesReservees} {t('seats') || 'place(s)'}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: isMobile ? 'wrap' : 'nowrap', flexDirection: isMobile ? 'column' : 'row', paddingTop: '16px', borderTop: `1px solid ${borderColor}` }}>
                      <Link href={`/passager/reservations/${r.id}`} style={{ flex: '1', padding: '12px', borderRadius: '10px', border: `1px solid ${borderColor}`, background: darkMode ? '#2D2D2D' : LG, color: textColor, textDecoration: 'none', fontSize: '13px', fontWeight: '600', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = darkMode ? '#3D3D3D' : BD} onMouseLeave={(e) => e.currentTarget.style.background = darkMode ? '#2D2D2D' : LG}>
                        <Icon name="eye" size={16} /> {t('details') || 'Voir détails'}
                      </Link>

                      {actionBouton}

                      <Link href={`/passager/chat/${r.trajet?.conducteur?.id}`} style={{ flex: '1', padding: '12px', borderRadius: '10px', border: `1px solid ${E}`, background: EL, color: ED, textDecoration: 'none', fontSize: '13px', fontWeight: '700', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#d1fae5'; }} onMouseLeave={(e) => { e.currentTarget.style.background = EL; }}>
                        <Icon name="message" size={16} /> {t('chat') || 'Contacter'}
                      </Link>
                      
                      {r.statut === 'EN_ATTENTE' && (
                        <button onClick={() => handleAnnuler(r.id)} disabled={processingId === r.id} style={{ flex: '1', padding: '12px', borderRadius: '10px', border: `1px solid ${RD}`, background: RL, color: RD, fontSize: '13px', fontWeight: '600', cursor: processingId === r.id ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }} onMouseEnter={(e) => { if (processingId !== r.id) e.currentTarget.style.background = '#fecaca'; }} onMouseLeave={(e) => { if (processingId !== r.id) e.currentTarget.style.background = RL; }}>
                          <Icon name="trash" size={16} /> {processingId === r.id ? (t('loading') || 'Traitement...') : (t('cancel') || 'Annuler')}
                        </button>
                      )}
                      {r.statut === 'A_PAYER' && (
                        <Link href={`/passager/paiement/${r.id}`} style={{ flex: '1', padding: '12px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${E}, ${ED})`, color: '#FFFFFF', fontSize: '13px', fontWeight: '700', textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: `0 4px 12px rgba(13, 158, 126, 0.3)`, transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 16px rgba(13, 158, 126, 0.4)`; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 12px rgba(13, 158, 126, 0.3)`; }}>
                          <Icon name="creditCard" size={16} color="#FFFFFF" /> {t('payments') || 'Payer maintenant'}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ✅ MODALE D'ÉVALUATION COMPLÈTE */}
      {evaluationModal.open && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            background: 'white', borderRadius: '20px', padding: '32px', maxWidth: '500px', width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto'
          }}>
            {evaluationSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: EL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <Icon name="check" size={40} color={E} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: BK, marginBottom: '8px' }}>Merci pour votre avis !</h3>
                <p style={{ fontSize: '14px', color: GR }}>Votre évaluation a été enregistrée avec succès.</p>
              </div>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: AL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Icon name="star" size={28} color="#F59E0B" />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: BK, marginBottom: '8px' }}>
                    Évaluer {evaluationModal.conducteurNom}
                  </h3>
                  <p style={{ fontSize: '14px', color: GR }}>
                    Comment s'est passée votre expérience ?
                  </p>
                </div>

                <StarRating rating={note} setRating={setNote} />

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: BK, marginBottom: '8px' }}>
                    Commentaire (optionnel)
                  </label>
                  <textarea
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    placeholder="Partagez votre expérience..."
                    style={{
                      width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #EBEBEB',
                      minHeight: '100px', resize: 'vertical', fontSize: '14px', fontFamily: 'inherit'
                    }}
                    maxLength={500}
                  />
                  <div style={{ fontSize: '11px', color: GR, marginTop: '4px', textAlign: 'right' }}>
                    {commentaire.length}/500
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => {
                      setEvaluationModal({ open: false, trajetId: null, conducteurNom: '', conducteurId: null });
                      setNote(0);
                      setCommentaire('');
                    }}
                    style={{
                      flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #EBEBEB',
                      background: 'white', color: GR, fontSize: '14px', fontWeight: '600', cursor: 'pointer'
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSubmitEvaluation}
                    disabled={submittingEvaluation || note === 0}
                    style={{
                      flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                      background: (submittingEvaluation || note === 0) ? '#D1D5DB' : `linear-gradient(135deg, ${E}, ${ED})`,
                      color: '#FFF', fontSize: '14px', fontWeight: '700', cursor: (submittingEvaluation || note === 0) ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                  >
                    {submittingEvaluation ? (
                      <>
                        <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        Envoi...
                      </>
                    ) : (
                      <>
                        <Icon name="check" size={16} color="#FFF" />
                        Envoyer mon avis
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}