'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ConducteurLayout from '../../../components/conducteur/ConducteurLayout';
import Link from 'next/link';
import { useTheme } from '@/app/lib/ThemeContext';

interface Stats {
  totalTrajets: number;
  trajetsOuverts: number;
  trajetsComplets: number;
  trajetsAnnules: number;
  trajetsBrouillons: number;
  totalReservations: number;
  reservationsEnAttente: number;
  reservationsConfirmees: number;
  noteMoyenne: number | null;
  totalEvaluations: number;
  totalNet: number;
}

interface Trajet {
  id: number;
  villeDepart: string;
  villeArrivee: string;
  dateDepart: string;
  heureDepart: string;
  placesDisponibles: number;
  prixParPlace: number;
  statut: string;
  nbReservationsConfirmees: number;
}

interface Reservation {
  id: number;
  placesReservees: number;
  statut: string;
  dateReservation: string;
  prixTotal: number;
  passager: { nom: string; prenom: string; photo?: string | null };
  trajet: { villeDepart: string; villeArrivee: string };
}

const E = '#0D9E7E';
const EL = '#E8F7F3';
const ED = '#0A7B62';
const BK = '#0D0D0D';
const GR = '#6B7280';
const LG = '#F8FAFB';
const BD = '#EBEBEB';
const AM = '#F59E0B';
const AL = '#FEF3C7';
const BL = '#2563EB';
const BLL = '#DBEAFE';
const RD = '#DC2626';
const RL = '#FEE2E2';

const Icon = ({ name, size = 20, color = E }: { name: string; size?: number; color?: string }) => {
  const s = { width: size, height: size, display: 'inline-block', verticalAlign: 'middle' } as React.CSSProperties;
  const icons: Record<string, React.ReactNode> = {
    plus: <svg style={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/><path d="M12 8V16M8 12H16" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>,
    car: <svg style={s} viewBox="0 0 24 24" fill="none"><path d="M5 11L6.5 6.5C6.8 5.6 7.6 5 8.6 5H15.4C16.4 5 17.2 5.6 17.5 6.5L19 11" stroke={color} strokeWidth="2" strokeLinecap="round"/><rect x="2" y="11" width="20" height="7" rx="2" stroke={color} strokeWidth="2" fill={EL}/><circle cx="7" cy="18" r="2" stroke={color} strokeWidth="2" fill="white"/><circle cx="17" cy="18" r="2" stroke={color} strokeWidth="2" fill="white"/></svg>,
    calendar: <svg style={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="3" stroke={color} strokeWidth="2" fill={BLL}/><path d="M16 2V6M8 2V6M3 10H21" stroke={color} strokeWidth="2" strokeLinecap="round"/><path d="M8 14H16M8 17H13" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>,
    money: <svg style={s} viewBox="0 0 24 24" fill="none"><rect x="2" y="6" width="20" height="14" rx="3" stroke="#16A34A" strokeWidth="2" fill="#DCFCE7"/><path d="M2 10H22" stroke="#16A34A" strokeWidth="2"/><path d="M6 15H10" stroke="#16A34A" strokeWidth="2" strokeLinecap="round"/><circle cx="17" cy="15" r="1.5" fill="#16A34A"/></svg>,
    star: <svg style={s} viewBox="0 0 24 24" fill="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={AL}/></svg>,
    arrowRight: <svg style={s} viewBox="0 0 24 24" fill="none"><path d="M5 12H19M14 7L19 12L14 17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    draft: <svg style={s} viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="14 2 14 8 20 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="16" y1="13" x2="8" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round"/><line x1="16" y1="17" x2="8" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>,
    clock: <svg style={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/><polyline points="12 6 12 12 16 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    checkCircle: <svg style={s} viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="22 4 12 14.01 9 11.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    xCircle: <svg style={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/><line x1="15" y1="9" x2="9" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="9" y1="9" x2="15" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    wave: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>,
    hourglass: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20h16V2H4z"/><path d="M4 12h16"/><path d="M8 2v4l4 6-4 6v4"/><path d="M16 2v4l-4 6 4 6v4"/></svg>,
    clipboard: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
  };
  return <span style={{ lineHeight: 0, display: 'inline-flex' }}>{icons[name] || null}</span>;
};

export default function ConducteurDashboard() {
  const router = useRouter();
  const { t, darkMode } = useTheme();
  
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [trajets, setTrajets] = useState<Trajet[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activeTrajet, setActiveTrajet] = useState<Trajet | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const rawToken = localStorage.getItem('token');
    const token = rawToken ? rawToken.replace(/^"|"$/g, '').trim() : null;
    
    if (!token) { 
      router.push('/login'); 
      return; 
    }

    const ud = localStorage.getItem('user');
    if (ud) { try { setUser(JSON.parse(ud)); } catch {} }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    const API = '/api';

    const fetchData = async () => {
      try {
        const resTrips = await fetch(`${API}/conducteur/trajets`, { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal });
        const resReservations = await fetch(`${API}/reservations/conducteur/mes-reservations`, { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal });

        let gainsData = { stats: { totalNet: 0 } };
        try {
          const resGains = await fetch(`${API}/paiements/conducteur/mes-gains`, { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal });
          if (resGains.ok) {
            gainsData = await resGains.json();
            // ✅ AJOUT : Log pour vérifier ce que le serveur renvoie exactement
            console.log("📊 Données des gains reçues du backend :", gainsData);
          } else {
            console.warn("⚠️ Échec de la récupération des gains (Status:", resGains.status, ")");
          }
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            console.warn("⚠️ Erreur gains:", err);
          }
        }

        clearTimeout(timeoutId);

        if (resTrips.status === 401 || resReservations.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }

        const cData = resTrips.ok ? await resTrips.json() : [];
        const rData = resReservations.ok ? await resReservations.json() : [];

        const tj: Trajet[] = Array.isArray(cData) ? cData : (cData.trajets || []);
        const rs: Reservation[] = Array.isArray(rData) ? rData : [];

        setStats({
          totalTrajets: tj.length,
          trajetsOuverts: tj.filter((t:any) => ['OUVERT','OPEN'].includes(t.statut?.toUpperCase())).length,
          trajetsComplets: tj.filter((t:any) => ['COMPLET','FULL', 'TERMINE'].includes(t.statut?.toUpperCase())).length,
          trajetsAnnules: tj.filter((t:any) => ['ANNULE','ANNULÉ', 'CANCELLED'].includes(t.statut?.toUpperCase())).length,
          trajetsBrouillons: tj.filter((t:any) => ['BROUILLON','DRAFT'].includes(t.statut?.toUpperCase())).length,
          totalReservations: rs.length,
          reservationsEnAttente: rs.filter((r:any) => r.statut === 'EN_ATTENTE').length,
          reservationsConfirmees: rs.filter((r:any) => ['CONFIRMEE','A_PAYER'].includes(r.statut)).length,
          totalNet: gainsData?.stats?.totalNet ?? 0,
          noteMoyenne: cData?.noteMoyenne || null,
          totalEvaluations: cData?.totalEvaluations || 0,
        });
        
        const sortedTrajets = [...tj].sort((a, b) => {
          if (a.statut === 'BROUILLON' && b.statut !== 'BROUILLON') return -1;
          if (a.statut !== 'BROUILLON' && b.statut === 'BROUILLON') return 1;
          return 0;
        });

        setTrajets(sortedTrajets.slice(0, 6));
        setReservations(rs.slice(0, 6));

        const active = tj.find((t: any) => ['EN_COURS', 'EN_ATTENTE_DEPART', 'EN_ATTENTE_VALIDATION'].includes(t.statut?.toUpperCase()));
        setActiveTrajet(active ? { ...active, statut: active.statut } : null);

        setLoading(false);

      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name !== 'AbortError') {
          console.error("❌ Erreur dashboard:", err);
        }
        setLoading(false);
      }
    };

    fetchData();
    return () => { 
      controller.abort(); 
      clearTimeout(timeoutId); 
    };
  }, [router]);

  const statutColorTrajet = (s: string) => {
    const u = s?.toUpperCase() || '';
    if (['OUVERT','OPEN'].includes(u)) return { bg: EL, color: '#15803d' };
    if (['COMPLET','FULL','TERMINE'].includes(u)) return { bg: BLL, color: BL };
    if (['BROUILLON','DRAFT'].includes(u)) return { bg: AL, color: AM };
    if (['ANNULE','ANNULÉ','CANCELLED'].includes(u)) return { bg: RL, color: RD };
    return { bg: LG, color: GR };
  };

  const statutColorRes = (s: string) => {
    if (['CONFIRMEE','A_PAYER'].includes(s)) return { bg: EL, color: '#15803d' };
    if (s === 'EN_ATTENTE') return { bg: AL, color: AM };
    if (['ANNULEE','ANNULE','REFUSEE'].includes(s)) return { bg: RL, color: RD };
    return { bg: LG, color: GR };
  };

  const statutLabel = (s: string) => {
    if (['CONFIRMEE','A_PAYER'].includes(s)) return t('confirmed');
    if (s === 'EN_ATTENTE') return t('pending');
    if (['ANNULEE','REFUSEE'].includes(s)) return t('cancelled');
    return s;
  };

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' }) : '—';

  // ✅ CORRECTION : Remplacement de "F" par "FCFA" pour un affichage clair
  const statCards = [
    { label: t('totalTrips'), value: stats?.totalTrajets ?? 0, sub: `${stats?.trajetsOuverts ?? 0} ${t('inProgress')}`, icon: <Icon name="car" size={22} />, color: E, bg: EL, delay: '0s' },
    { label: t('totalReservations'), value: stats?.totalReservations ?? 0, sub: `${stats?.reservationsEnAttente ?? 0} ${t('pending')}`, icon: <Icon name="calendar" size={22} color={BL} />, color: BL, bg: BLL, delay: '0.08s' },
    { label: t('totalEarnings'), value: `${(stats?.totalNet ?? 0).toLocaleString()} FCFA`, sub: t('totalEarningsDesc'), icon: <Icon name="money" size={22} />, color: '#16A34A', bg: '#F0FDF4', delay: '0.16s' },
    { label: t('rating'), value: stats?.noteMoyenne ? `${stats.noteMoyenne.toFixed(1)}/5` : 'N/A', sub: `${stats?.totalEvaluations ?? 0} ${t('reviewsCount')}`, icon: <Icon name="star" size={22} />, color: AM, bg: AL, delay: '0.24s' },
  ];

  const statusItems = [
    { label: t('draftTrips'), val: stats?.trajetsBrouillons ?? 0, color: AM, bg: AL, icon: <Icon name="draft" size={24} color={AM} /> },
    { label: t('pending'), val: stats?.trajetsOuverts ?? 0, color: '#15803d', bg: EL, icon: <Icon name="clock" size={24} color="#15803d" /> },
    { label: t('completed'), val: stats?.trajetsComplets ?? 0, color: BL, bg: BLL, icon: <Icon name="checkCircle" size={24} color={BL} /> },
    { label: t('cancelled'), val: stats?.trajetsAnnules ?? 0, color: RD, bg: RL, icon: <Icon name="xCircle" size={24} color={RD} /> },
  ];

  if (loading) {
    return (
      <ConducteurLayout>
        <div style={{ padding: '80px', textAlign: 'center', color: darkMode ? '#9CA3AF' : '#6b7280' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `3px solid ${EL}`, borderTopColor: E, animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p>{t('loading')}</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
      </ConducteurLayout>
    );
  }

  return (
    <ConducteurLayout>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        
        .dashboard-container { max-width: 1400px; margin: 0 auto; padding: 40px 32px 48px; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
        .status-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 32px; }
        .content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .hero-banner { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; }
        
        .stat-card { animation: fadeUp 0.4s ease both; transition: all 0.25s; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.1) !important; }
        .hover-row:hover { background: ${EL} !important; }

        @media (max-width: 1024px) {
          .stats-grid, .status-grid { grid-template-columns: repeat(2, 1fr); }
        }
        
        @media (max-width: 600px) {
          .dashboard-container { padding: 24px 16px 40px; }
          .stats-grid, .status-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .stat-card { padding: 16px !important; }
          .stat-card > div:first-child { width: 40px !important; height: 40px !important; margin-bottom: 12px !important; }
          .stat-card > div:nth-child(2) { font-size: 22px !important; }
          .stat-card > div:nth-child(3) { font-size: 12px !important; }
          .stat-card > div:nth-child(4) { font-size: 10px !important; }
          
          .content-grid { grid-template-columns: 1fr; }
          .hero-banner { flex-direction: column; align-items: flex-start; gap: 20px; }
          .hero-banner h1 { font-size: 24px !important; }
          .hero-banner a { width: 100%; justify-content: center; }
        }
      `}</style>

      <div className="dashboard-container">

        {/* ===== HERO BANNER ===== */}
        <div style={{
          background: darkMode ? 'linear-gradient(135deg, #0D0D0D 0%, #0f2d1a 50%, #0a1a0a 100%)' : 'linear-gradient(135deg, #0D0D0D 0%, #0f2d1a 50%, #0a1a0a 100%)',
          borderRadius: '24px', padding: '36px 40px', marginBottom: '32px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(13,158,126,0.2)',
        }}>
          <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '240px', height: '240px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,158,126,0.15) 0%, transparent 70%)' }}/>
          <div style={{ position: 'absolute', bottom: '-40px', left: '30%', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,158,126,0.08) 0%, transparent 70%)' }}/>

          <div className="hero-banner">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: E }}/>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px' }}>{t('dashboard')}</span>
              </div>
              <h1 style={{ 
                fontSize: '30px', 
                fontWeight: '800', 
                color: '#FFFFFF', 
                margin: '0 0 8px', 
                letterSpacing: '-0.5px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                flexWrap: 'wrap' 
              }}>
                <span>
                  {t('welcome')}                   {mounted && user?.prenom ? user.prenom : t('driver')} !
                </span>
                <Icon name="wave" size={32} color="#FCD34D" />
              </h1>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', margin: 0 }}>
                {t('welcomeBack')}
              </p>
            </div>
            <Link href="/conducteur/trajets/creer" style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '14px', textDecoration: 'none',
              background: `linear-gradient(135deg, ${E}, ${ED})`, color: '#FFFFFF', fontSize: '14px', fontWeight: '700',
              boxShadow: `0 6px 20px rgba(13,158,126,0.4)`, transition: 'all 0.2s', flexShrink: 0,
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 10px 28px rgba(13,158,126,0.5)`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 6px 20px rgba(13,158,126,0.4)`; }}
            >
              <Icon name="plus" size={18} color="white" />
              {t('publish')}
            </Link>
          </div>
        </div>

        {/* ===== ALERTE BROUILLONS ===== */}
        {(stats?.trajetsBrouillons ?? 0) > 0 && (
          <div style={{
            background: darkMode ? '#2A1F0A' : AL, border: `1px solid ${darkMode ? '#4A3A1A' : '#FDE68A'}`,
            borderRadius: '16px', padding: '16px 24px', marginBottom: '24px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'fadeUp 0.4s ease',
            flexWrap: 'wrap', gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Icon name="hourglass" size={32} color={darkMode ? '#FCD34D' : '#92400E'} />
              <div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: darkMode ? '#FCD34D' : '#92400E' }}>
                  {stats?.trajetsBrouillons} {t('draftsPendingWord')}
                </div>
                <div style={{ fontSize: '13px', color: darkMode ? '#FCD34D99' : '#A16207' }}>
                  {t('completeDraftsDesc')}
                </div>
              </div>
            </div>
            <Link href="/conducteur/trajets/brouillons" style={{
              padding: '10px 20px', background: AM, color: '#FFFFFF', borderRadius: '10px',
              textDecoration: 'none', fontSize: '13px', fontWeight: '700', flexShrink: 0, transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {t('viewDrafts')}
            </Link>
          </div>
        )}

        {/* ===== TRAJET EN COURS ===== */}
        {activeTrajet && (
          <div style={{
            background: darkMode ? 'linear-gradient(135deg, #0A2A1A 0%, #0D3D2A 100%)' : 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
            border: `2px solid ${darkMode ? '#0D9E7E' : '#6EE7B7'}`,
            borderRadius: '20px', padding: '24px', marginBottom: '24px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'fadeUp 0.4s ease',
            flexWrap: 'wrap', gap: '16px', boxShadow: '0 4px 20px rgba(13,158,126,0.15)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '16px',
                background: `linear-gradient(135deg, ${E}, ${ED})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(13,158,126,0.3)',
              }}>
                <Icon name="car" size={28} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: darkMode ? '#6EE7B7' : '#059669', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {activeTrajet.statut.toUpperCase() === 'EN_ATTENTE_DEPART' ? t('readyToDepart') : t('tripInProgressShort')}
                </div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: darkMode ? '#FFFFFF' : '#064E3B' }}>
                  {activeTrajet.villeDepart} <span style={{ color: E }}>&rarr;</span> {activeTrajet.villeArrivee}
                </div>
                <div style={{ fontSize: '13px', color: darkMode ? '#A7F3D0' : '#047857', marginTop: '4px' }}>
                  {activeTrajet.heureDepart} {activeTrajet.dateDepart ? `(${new Date(activeTrajet.dateDepart).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })})` : ''}
                  {activeTrajet.placesDisponibles !== undefined && ` - ${activeTrajet.nbReservationsConfirmees || 0}/${activeTrajet.placesDisponibles} ${t('seats')}`}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link href={`/conducteur/trajets/${activeTrajet.id}/carte-ramassage`} style={{
                padding: '12px 20px', borderRadius: '12px', border: `2px solid ${E}`, background: 'rgba(255,255,255,0.1)',
                color: darkMode ? '#A7F3D0' : '#065F46', fontSize: '13px', fontWeight: '700', textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', backdropFilter: 'blur(4px)',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = E; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = darkMode ? '#A7F3D0' : '#065F46'; }}
              >
                <Icon name="map" size={16} /> {t('pickupMapShort')}
              </Link>
              {activeTrajet.statut?.toUpperCase() === 'EN_ATTENTE_VALIDATION' && (
                <Link href={`/conducteur/trajets/${activeTrajet.id}`} style={{
                  padding: '12px 20px', borderRadius: '12px', border: 'none',
                  background: `linear-gradient(135deg, ${E}, ${ED})`, color: '#fff',
                  fontSize: '13px', fontWeight: '700', textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  boxShadow: '0 4px 15px rgba(13,158,126,0.3)', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(13,158,126,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(13,158,126,0.3)'; }}
                >
                  <Icon name="users" size={16} color="#fff" /> {t('validatePresences')}
                </Link>
              )}
            </div>
          </div>
        )}

        {/* ===== STATS PRINCIPALES ===== */}
        <div className="stats-grid">
          {statCards.map((s, i) => (
            <div key={i} className="stat-card" style={{
              background: darkMode ? '#1A1A1A' : '#FFFFFF', borderRadius: '18px', padding: '22px',
              border: `1px solid ${darkMode ? '#2A2A2A' : BD}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', animationDelay: s.delay,
            }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                {s.icon}
              </div>
              <div style={{ fontSize: '26px', fontWeight: '800', color: darkMode ? '#FFFFFF' : BK, lineHeight: 1, marginBottom: '4px' }}>{s.value}</div>
              <div style={{ fontSize: '13px', color: darkMode ? '#9CA3AF' : GR, marginBottom: '4px' }}>{s.label}</div>
              <div style={{ fontSize: '11px', color: s.color, fontWeight: '600' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ===== RÉSUMÉ STATUTS TRAJETS ===== */}
        <div className="status-grid">
          {statusItems.map((s, i) => (
            <div key={i} style={{
              background: darkMode ? '#1A1A1A' : '#FFFFFF', borderRadius: '16px', padding: '18px 20px',
              border: `1px solid ${darkMode ? '#2A2A2A' : BD}`, display: 'flex', alignItems: 'center', gap: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '26px', fontWeight: '800', color: s.color, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: '13px', color: darkMode ? '#9CA3AF' : GR, marginTop: '4px' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ===== GRILLE TRAJETS + RÉSERVATIONS ===== */}
        <div className="content-grid">

          {/* Mes trajets récents */}
          <div style={{ background: darkMode ? '#1A1A1A' : '#FFFFFF', borderRadius: '20px', border: `1px solid ${darkMode ? '#2A2A2A' : BD}`, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${darkMode ? '#2A2A2A' : BD}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: darkMode ? '#FFFFFF' : BK, margin: '0 0 2px' }}>{t('recentTrips')}</h3>
                <p style={{ fontSize: '12px', color: darkMode ? '#9CA3AF' : GR, margin: 0 }}>{trajets.length} {t('myTrips')}</p>
              </div>
              <Link href="/conducteur/trajets" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: E, textDecoration: 'none', fontWeight: '600' }}>
                {t('viewAll')} <Icon name="arrowRight" size={14} />
              </Link>
            </div>

            {trajets.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                  <Icon name="car" size={48} color={darkMode ? '#4B5563' : '#9CA3AF'} />
                </div>
                <p style={{ color: darkMode ? '#9CA3AF' : GR, fontSize: '14px', marginBottom: '20px' }}>{t('noRecentTrips')}</p>
                <Link href="/conducteur/trajets/creer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: E, color: 'white', borderRadius: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: '700' }}>
                  <Icon name="plus" size={16} color="white" /> {t('publish')}
                </Link>
              </div>
            ) : trajets.map((trajet, i) => (
              <Link key={trajet.id} href={`/conducteur/trajets/${trajet.id}`} className="hover-row"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', textDecoration: 'none',
                  borderBottom: i < trajets.length - 1 ? `1px solid ${darkMode ? '#2A2A2A' : LG}` : 'none', transition: 'background 0.15s', color: darkMode ? '#FFFFFF' : BK,
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: EL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name="car" size={20} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: darkMode ? '#FFFFFF' : BK, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{trajet.villeDepart}</span>
                      <Icon name="arrowRight" size={14} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{trajet.villeArrivee}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: darkMode ? '#9CA3AF' : GR }}>
                      {fmtDate(trajet.dateDepart)} · {trajet.heureDepart} · <span style={{ fontWeight: '600', color: darkMode ? '#FFFFFF' : BK }}>{trajet.prixParPlace?.toLocaleString()} FCFA</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0, marginLeft: '12px' }}>
                  <span style={{ ...statutColorTrajet(trajet.statut), padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                    {trajet.statut}
                  </span>
                  <span style={{ fontSize: '11px', color: darkMode ? '#9CA3AF' : GR }}>{trajet.nbReservationsConfirmees ?? 0} {t('reservationsCount')}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Réservations récentes */}
          <div style={{ background: darkMode ? '#1A1A1A' : '#FFFFFF', borderRadius: '20px', border: `1px solid ${darkMode ? '#2A2A2A' : BD}`, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${darkMode ? '#2A2A2A' : BD}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: darkMode ? '#FFFFFF' : BK, margin: '0 0 2px' }}>{t('reservationsCount')}</h3>
                  <p style={{ fontSize: '12px', color: darkMode ? '#9CA3AF' : GR, margin: 0 }}>{reservations.length} {t('reservationsCount')}</p>
                </div>
                {(stats?.reservationsEnAttente ?? 0) > 0 && (
                  <span style={{ background: AL, color: AM, fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' }}>
                    {stats?.reservationsEnAttente} {t('pending')}
                  </span>
                )}
              </div>
              <Link href="/conducteur/demandes" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: E, textDecoration: 'none', fontWeight: '600' }}>
                {t('viewAll')} <Icon name="arrowRight" size={14} />
              </Link>
            </div>

            {reservations.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                  <Icon name="clipboard" size={48} color={darkMode ? '#4B5563' : '#9CA3AF'} />
                </div>
                <p style={{ color: darkMode ? '#9CA3AF' : GR, fontSize: '14px' }}>{t('noData')}</p>
              </div>
            ) : reservations.map((r, i) => (
              <div key={r.id} className="hover-row"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', transition: 'background 0.15s',
                  borderBottom: i < reservations.length - 1 ? `1px solid ${darkMode ? '#2A2A2A' : LG}` : 'none', color: darkMode ? '#FFFFFF' : BK,
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                  <div style={{ position: 'relative', width: '42px', height: '42px', flexShrink: 0 }}>
                    {r.passager?.photo && (
                      <img src={r.passager.photo.startsWith('http') ? r.passager.photo : `/uploads/profils/${r.passager.photo}`} alt="" 
                        onError={e => e.currentTarget.style.display = 'none'}
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 10, border: '2px solid white' }}
                      />
                    )}
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: EL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: E, position: 'relative', zIndex: 1 }}>
                      {r.passager?.prenom?.charAt(0)}{r.passager?.nom?.charAt(0)}
                    </div>
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: darkMode ? '#FFFFFF' : BK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '3px' }}>
                      {r.passager?.prenom} {r.passager?.nom}
                    </div>
                    <div style={{ fontSize: '12px', color: darkMode ? '#9CA3AF' : GR, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.trajet?.villeDepart} → {r.trajet?.villeArrivee} · {r.placesReservees} {t('seats')}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px', flexShrink: 0, marginLeft: '12px' }}>
                  <span style={{ ...statutColorRes(r.statut), padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                    {statutLabel(r.statut)}
                  </span>
                  <span style={{ fontSize: '11px', color: darkMode ? '#9CA3AF' : GR }}>{fmtDate(r.dateReservation)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ConducteurLayout>
  );
}