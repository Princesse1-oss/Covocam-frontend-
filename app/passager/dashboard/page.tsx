'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/app/lib/ThemeContext';

interface Trajet {
  id: number;
  villeDepart: string;
  villeArrivee: string;
  dateDepart: string;
  heureDepart: string;
  placesDisponibles?: number;
  nbPlacesDisponibles?: number;
  prixParPlace: number;
  statut: string;
  description: string | null;
  conducteur: {
    id: number;
    nom: string;
    prenom: string;
    noteMoyenne: number | null;
    photo: string | null;
  };
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
    search: <svg style={s} viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2"/><path d="m21 21-4.3-4.3" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>,
    mapPin: <svg style={s} viewBox="0 0 24 24" fill="none"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" stroke={color} strokeWidth="2"/><circle cx="12" cy="10" r="3" stroke={color} strokeWidth="2"/></svg>,
    calendar: <svg style={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="3" stroke={color} strokeWidth="2" fill={BLL}/><path d="M16 2V6M8 2V6M3 10H21" stroke={color} strokeWidth="2" strokeLinecap="round"/><path d="M8 14H16M8 17H13" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>,
    car: <svg style={s} viewBox="0 0 24 24" fill="none"><path d="M5 11L6.5 6.5C6.8 5.6 7.6 5 8.6 5H15.4C16.4 5 17.2 5.6 17.5 6.5L19 11" stroke={color} strokeWidth="2" strokeLinecap="round"/><rect x="2" y="11" width="20" height="7" rx="2" stroke={color} strokeWidth="2" fill={EL}/><circle cx="7" cy="18" r="2" stroke={color} strokeWidth="2" fill="white"/><circle cx="17" cy="18" r="2" stroke={color} strokeWidth="2" fill="white"/></svg>,
    users: <svg style={s} viewBox="0 0 24 24" fill="none"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="2"/><circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2"/><path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke={color} strokeWidth="2"/><path d="M16 3.13a4 4 0 0 1 0 7.75" stroke={color} strokeWidth="2"/></svg>,
    route: <svg style={s} viewBox="0 0 24 24" fill="none"><circle cx="6" cy="19" r="3" stroke={color} strokeWidth="2"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" stroke={color} strokeWidth="2"/><circle cx="18" cy="5" r="3" stroke={color} strokeWidth="2"/></svg>,
    bell: <svg style={s} viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth="2"/><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={color} strokeWidth="2"/></svg>,
    fileText: <svg style={s} viewBox="0 0 24 24" fill="none"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" stroke={color} strokeWidth="2"/><path d="M14 2v4a2 2 0 0 0 2 2h4" stroke={color} strokeWidth="2"/><path d="M10 9H8M16 13H8M16 17H8" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>,
    send: <svg style={s} viewBox="0 0 24 24" fill="none"><line x1="22" y1="2" x2="11" y2="13" stroke={color} strokeWidth="2"/><polygon points="22 2 15 22 11 13 2 9 22 2" stroke={color} strokeWidth="2" strokeLinejoin="round"/></svg>,
    x: <svg style={s} viewBox="0 0 24 24" fill="none"><path d="M18 6 6 18M6 6l12 12" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>,
    arrowRight: <svg style={s} viewBox="0 0 24 24" fill="none"><path d="M5 12H19M14 7L19 12L14 17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    star: <svg style={s} viewBox="0 0 24 24" fill="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={AL}/></svg>,
    starEmpty: <svg style={s} viewBox="0 0 24 24" fill="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    checkCircle: <svg style={s} viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="22 4 12 14.01 9 11.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    wave: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>,
  };
  return <span style={{ lineHeight: 0, display: 'inline-flex' }}>{icons[name] || null}</span>;
};

export default function PassagerDashboard() {
  const router = useRouter();
  const { t, darkMode, lang } = useTheme();

  const [trajets, setTrajets] = useState<Trajet[]>([]);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [activeDrivers, setActiveDrivers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  const [villeDepart, setVilleDepart] = useState('');
  const [villeArrivee, setVilleArrivee] = useState('');
  const [date, setDate] = useState('');
  const [searched, setSearched] = useState(false);

  const villes = [
    'Yaoundé', 'Douala', 'Bafoussam', 'Bamenda', 'Garoua',
    'Maroua', 'Ngaoundéré', 'Bertoua', 'Ebolowa', 'Kribi',
  ];

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      router.push('/login');
      return;
    }

    if (userData && userData !== 'undefined' && userData !== 'null') {
      try { setUser(JSON.parse(userData)); } catch {}
    }
  }, [router]);

  const fetchTrajets = useCallback(async (token: string, params?: string) => {
    setLoading(true);
    setError(null);

    const cleanToken = token.replace(/"/g, '').trim();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const url = params ? `/api/trajets/search?${params}` : `/api/trajets/search`;
      const res = await fetch(url, {
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

      if (!res.ok) throw new Error(`Erreur ${res.status}`);

      const data = await res.json();
      const all = Array.isArray(data) ? data : [];
      setTrajets(all.slice(0, 10));
      setTotalAvailable(all.filter((t: Trajet) => (t.placesDisponibles ?? t.nbPlacesDisponibles ?? 0) > 0).length);
      setActiveDrivers(new Set(all.map((t: Trajet) => t.conducteur?.id).filter(Boolean)).size);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError("Impossible de charger les trajets. Vérifiez votre connexion.");
      }
      setTrajets([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) fetchTrajets(token);
  }, [fetchTrajets]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    const params = new URLSearchParams();
    if (villeDepart) params.append('villeDepart', villeDepart);
    if (villeArrivee) params.append('villeArrivee', villeArrivee);
    if (date) params.append('date', date);

    setSearched(true);
    fetchTrajets(token, params.toString());
  };

  const handleReset = () => {
    setVilleDepart('');
    setVilleArrivee('');
    setDate('');
    setSearched(false);
    setError(null);
    const token = localStorage.getItem('token');
    if (token) fetchTrajets(token);
  };

  const stars = (note: number | null) => {
    if (!note) return 0;
    return Math.round(note);
  };

  const formatDate = (d: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .dashboard-container { max-width: 1400px; margin: 0 auto; padding: 40px 32px 48px; }
        .search-grid { display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 14px; align-items: end; }
        .trajet-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; }
        .chips-scroll { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
        .chips-scroll::-webkit-scrollbar { display: none; }
        .stat-card { animation: fadeUp 0.4s ease both; transition: all 0.25s; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.1) !important; }
        .trajet-card { animation: fadeUp 0.4s ease both; transition: all 0.25s; }
        .trajet-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(13,158,126,0.12) !important; }
        @media (max-width: 900px) { .search-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 600px) {
          .dashboard-container { padding: 24px 16px 40px; }
          .search-grid { grid-template-columns: 1fr; }
          .trajet-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="dashboard-container">

        {/* ===== HERO BANNER ===== */}
        <div style={{
          background: 'linear-gradient(135deg, #0D0D0D 0%, #0f2d1a 50%, #0a1a0a 100%)',
          borderRadius: '24px', padding: '36px 40px', marginBottom: '32px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(13,158,126,0.2)',
        }}>
          <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '240px', height: '240px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,158,126,0.15) 0%, transparent 70%)' }}/>
          <div style={{ position: 'absolute', bottom: '-40px', left: '30%', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,158,126,0.08) 0%, transparent 70%)' }}/>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1, flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: E }}/>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px' }}>{t ? t('dashboard') : 'Tableau de bord'}</span>
              </div>
              <h1 style={{
                fontSize: '30px', fontWeight: '800', color: '#FFFFFF', margin: '0 0 8px',
                letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
              }}>
                <span>{t ? t('welcome') : 'Bienvenue'} {mounted && user?.prenom ? user.prenom : 'voyageur'} !</span>
                <Icon name="wave" size={32} color="#FCD34D" />
              </h1>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', margin: 0 }}>
                {t ? t('welcomeBack') : 'Heureux de vous revoir sur CovoCam.'}
              </p>
            </div>
            <Link href="/passager/demandes/creer" style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '14px', textDecoration: 'none',
              background: `linear-gradient(135deg, ${E}, ${ED})`, color: '#FFFFFF', fontSize: '14px', fontWeight: '700',
              boxShadow: `0 6px 20px rgba(13,158,126,0.4)`, transition: 'all 0.2s', flexShrink: 0,
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(13,158,126,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(13,158,126,0.4)'; }}
            >
              <Icon name="send" size={18} color="white" />
              {lang === 'fr' ? 'Émettre une demande' : 'Emit a request'}
            </Link>
          </div>
        </div>

        {/* ===== RACCOURCIS ===== */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', animation: 'fadeUp 0.4s ease both', animationDelay: '0.08s' }}>
          <a href="/passager/notifications" style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: '14px',
            background: darkMode ? '#1A1A1A' : '#FFF', border: `1px solid ${darkMode ? '#2A2A2A' : BD}`,
            color: darkMode ? '#FFFFFF' : BK, fontSize: '13px', fontWeight: '600',
            textDecoration: 'none', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <Icon name="bell" size={16} color={AM} />
            {t ? t('notifications') : 'Notifications'}
          </a>
          <a href="/passager/reservations" style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: '14px',
            background: darkMode ? '#1A1A1A' : '#FFF', border: `1px solid ${darkMode ? '#2A2A2A' : BD}`,
            color: darkMode ? '#FFFFFF' : BK, fontSize: '13px', fontWeight: '600',
            textDecoration: 'none', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <Icon name="fileText" size={16} color={BL} />
            {t ? t('myReservations') : 'Mes réservations'}
          </a>
          <a href="/passager/evaluations" style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: '14px',
            background: darkMode ? '#1A1A1A' : '#FFF', border: `1px solid ${darkMode ? '#2A2A2A' : BD}`,
            color: darkMode ? '#FFFFFF' : BK, fontSize: '13px', fontWeight: '600',
            textDecoration: 'none', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <Icon name="star" size={16} color={AM} />
            {t ? t('myEvaluations') : 'Mes évaluations'}
          </a>
        </div>

        {/* ===== STATS ===== */}
        {!searched && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
            {[
              { label: t ? t('availableTrips') : 'Trajets disponibles', value: totalAvailable, icon: <Icon name="car" size={22} />, color: E, bg: EL, sub: `${totalAvailable} ${t ? t('seats') : 'places'}` },
              { label: t ? t('activeDrivers') : 'Conducteurs actifs', value: activeDrivers, icon: <Icon name="users" size={22} color={BL} />, color: BL, bg: BLL, sub: lang === 'fr' ? 'Sur la plateforme' : 'On the platform' },
              { label: t ? t('regionsCovered') : 'Régions couvertes', value: 10, icon: <Icon name="route" size={22} color="#16A34A" />, color: '#16A34A', bg: '#F0FDF4', sub: lang === 'fr' ? 'Cameroun' : 'Cameroon' },
            ].map((stat, i) => (
              <div key={i} className="stat-card" style={{
                background: darkMode ? '#1A1A1A' : '#FFFFFF', borderRadius: '18px', padding: '22px',
                border: `1px solid ${darkMode ? '#2A2A2A' : BD}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                animationDelay: `${i * 0.08}s`,
              }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  {stat.icon}
                </div>
                <div style={{ fontSize: '26px', fontWeight: '800', color: darkMode ? '#FFFFFF' : BK, lineHeight: 1, marginBottom: '4px' }}>{stat.value}</div>
                <div style={{ fontSize: '13px', color: darkMode ? '#9CA3AF' : GR, marginBottom: '4px' }}>{stat.label}</div>
                <div style={{ fontSize: '11px', color: stat.color, fontWeight: '600' }}>{stat.sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* ===== RECHERCHE ===== */}
        <div style={{
          background: darkMode ? '#1A1A1A' : '#FFFFFF', borderRadius: '20px', padding: '24px 28px',
          marginBottom: 28, border: `1px solid ${darkMode ? '#2A2A2A' : BD}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)', animation: 'fadeUp 0.4s ease both', animationDelay: '0.16s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Icon name="search" size={18} />
            <p style={{ color: E, fontSize: 12, fontWeight: 700, margin: 0, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              {t ? t('search') : 'Rechercher'}
            </p>
          </div>
          <form onSubmit={handleSearch} className="search-grid">
            <div>
              <label style={{ display: 'block', fontSize: 11, color: GR, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t ? t('departure') : 'Départ'}</label>
              <select value={villeDepart} onChange={e => setVilleDepart(e.target.value)}
                style={{
                  width: '100%', padding: '12px 14px 12px 40px', borderRadius: '14px',
                  background: darkMode ? '#2D2D2D' : LG, border: `1px solid ${darkMode ? '#2A2A2A' : BD}`,
                  color: darkMode ? '#FFFFFF' : (villeDepart ? BK : GR), fontSize: 14, fontWeight: 500,
                  outline: 'none', boxSizing: 'border-box', cursor: 'pointer', appearance: 'none',
                  position: 'relative',
                }}>
                <option value="">{t ? t('selectCity') : 'Ville de départ'}</option>
                {villes.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', lineHeight: 0 }}><Icon name="mapPin" size={16} /></span>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: GR, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t ? t('arrival') : 'Arrivée'}</label>
              <select value={villeArrivee} onChange={e => setVilleArrivee(e.target.value)}
                style={{
                  width: '100%', padding: '12px 14px 12px 40px', borderRadius: '14px',
                  background: darkMode ? '#2D2D2D' : LG, border: `1px solid ${darkMode ? '#2A2A2A' : BD}`,
                  color: darkMode ? '#FFFFFF' : (villeArrivee ? BK : GR), fontSize: 14, fontWeight: 500,
                  outline: 'none', boxSizing: 'border-box', cursor: 'pointer', appearance: 'none',
                }}>
                <option value="">{t ? t('selectCity') : 'Ville d\'arrivée'}</option>
                {villes.filter(v => v !== villeDepart).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', lineHeight: 0 }}><Icon name="mapPin" size={16} /></span>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: GR, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t ? t('date') : 'Date'}</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: '14px',
                  background: darkMode ? '#2D2D2D' : LG, border: `1px solid ${darkMode ? '#2A2A2A' : BD}`,
                  color: darkMode ? '#FFFFFF' : (date ? BK : GR), fontSize: 14, fontWeight: 500,
                  outline: 'none', boxSizing: 'border-box',
                }} />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="submit" style={{
                flex: 1, padding: '12px 22px', background: `linear-gradient(135deg, ${E}, ${ED})`,
                border: 'none', borderRadius: 14, color: '#FFF', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 4px 16px rgba(13,158,126,0.25)', transition: 'all .2s',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Icon name="search" size={16} color="#FFF" />
                {t ? t('search') : 'Rechercher'}
              </button>
              {searched && (
                <button type="button" onClick={handleReset} style={{
                  padding: '12px 16px', background: darkMode ? '#2D2D2D' : LG,
                  border: `1px solid ${darkMode ? '#2A2A2A' : BD}`, borderRadius: 14,
                  color: GR, fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name="x" size={16} color={GR} />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ===== CHIPS POPULAIRES ===== */}
        {!searched && (
          <div style={{ marginBottom: 28, animation: 'fadeUp 0.4s ease both', animationDelay: '0.24s' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: darkMode ? '#6B7280' : GR, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {lang === 'fr' ? 'Destinations populaires' : 'Popular destinations'}
            </p>
            <div className="chips-scroll">
              {villes.map(ville => (
                <button key={ville} onClick={() => setVilleDepart(ville)}
                  style={{
                    flexShrink: 0, padding: '8px 18px', borderRadius: 20,
                    border: villeDepart === ville ? `1.5px solid ${E}` : `1px solid ${darkMode ? '#2A2A2A' : BD}`,
                    background: villeDepart === ville ? EL : (darkMode ? '#1A1A1A' : '#FFF'),
                    color: villeDepart === ville ? E : (darkMode ? '#FFFFFF' : BK),
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    transition: 'all .2s', whiteSpace: 'nowrap',
                  }}>
                  {ville}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ===== HEADER RÉSULTATS ===== */}
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', animation: 'fadeUp 0.4s ease both', animationDelay: '0.32s' }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: darkMode ? '#FFFFFF' : BK, margin: 0, letterSpacing: '-0.3px' }}>
              {searched ? (t ? t('searchResults') : 'Résultats') : (t ? t('availableTrips') : 'Trajets disponibles')}
            </h2>
            <p style={{ fontSize: 13, color: darkMode ? '#6B7280' : GR, marginTop: 4, fontWeight: 500 }}>
              {loading ? (t ? t('loading') : 'Chargement...') : `${trajets.length} ${t ? t('tripsFound') : 'trajets trouvés'}`}
            </p>
          </div>
        </div>

        {/* ===== ERREUR ===== */}
        {error && (
          <div style={{
            textAlign: 'center', padding: '40px 24px', background: RL,
            borderRadius: 20, border: `1px solid ${RD}22`, marginBottom: 24,
          }}>
            <p style={{ color: darkMode ? '#FFFFFF' : RD, fontSize: 14, fontWeight: 600, margin: 0 }}>{error}</p>
            <button onClick={handleReset} style={{
              marginTop: 12, padding: '8px 16px', background: '#FFF',
              border: `1px solid ${RD}44`, borderRadius: 10, color: RD,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              {t ? t('retry') : 'Réessayer'}
            </button>
          </div>
        )}

        {/* ===== LISTE TRAJETS ===== */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: GR }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${EL}`, borderTopColor: E, animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 15, fontWeight: 600 }}>{t ? t('loadingTrips') : 'Chargement des trajets...'}</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : trajets.length === 0 && !error ? (
          <div style={{
            textAlign: 'center', padding: '80px 24px', background: darkMode ? '#1A1A1A' : '#FFF',
            borderRadius: 24, border: `1px solid ${darkMode ? '#2A2A2A' : BD}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20, background: darkMode ? '#2D2D2D' : LG,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            }}>
              <Icon name="search" size={28} color={GR} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: darkMode ? '#FFFFFF' : BK, marginBottom: 8 }}>
              {lang === 'fr' ? 'Aucun trajet disponible' : 'No trips available'}
            </h3>
            <p style={{ fontSize: 14, color: darkMode ? '#6B7280' : GR, margin: 0, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
              {lang === 'fr' ? 'Essayez de modifier vos critères ou revenez plus tard.' : 'Try changing your criteria or come back later.'}
            </p>
          </div>
        ) : (
          <div className="trajet-grid">
            {trajets.map((trajet, i) => {
              const places = trajet.placesDisponibles ?? trajet.nbPlacesDisponibles ?? 0;
              const isFull = places === 0;

              return (
                <div key={trajet.id} className="trajet-card" onClick={() => router.push(`/passager/trajets/${trajet.id}`)}
                  style={{
                    background: darkMode ? '#1A1A1A' : '#FFF',
                    borderRadius: 20, border: `1px solid ${darkMode ? '#2A2A2A' : BD}`,
                    padding: 22, cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden',
                    animationDelay: `${0.35 + i * 0.05}s`,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = E;
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(13,158,126,0.12)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = darkMode ? '#2A2A2A' : BD;
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                  }}
                >
                  <div style={{ position: 'absolute', top: 18, right: 18 }}>
                    <span style={{
                      background: isFull ? RL : EL,
                      color: isFull ? RD : '#15803d',
                      fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
                      border: isFull ? `1px solid ${RL}` : `1px solid #D1FAE5`,
                    }}>
                      {isFull ? (t ? t('full') : 'Complet') : `${places} ${t ? t('seats') : 'places'}`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
                      {trajet.conducteur?.photo && (
                        <img
                          src={trajet.conducteur.photo.startsWith('http') ? trajet.conducteur.photo : `/uploads/profils/${trajet.conducteur.photo}`}
                          alt={`Photo de ${trajet.conducteur.prenom}`}
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                          style={{
                            width: '100%', height: '100%', borderRadius: 14, objectFit: 'cover',
                            border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            position: 'absolute', top: 0, left: 0, zIndex: 10,
                          }}
                        />
                      )}
                      <div style={{
                        width: '100%', height: '100%', borderRadius: 14,
                        background: `linear-gradient(135deg, ${E}, ${ED})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 800, color: '#FFF',
                        position: 'relative', zIndex: 1,
                      }}>
                        {trajet.conducteur?.prenom?.charAt(0)}{trajet.conducteur?.nom?.charAt(0)}
                      </div>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: darkMode ? '#FFFFFF' : BK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {trajet.conducteur?.prenom} {trajet.conducteur?.nom}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 2 }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i}>
                            {i < stars(trajet.conducteur?.noteMoyenne)
                              ? <Icon name="star" size={14} color="#F59E0B" />
                              : <Icon name="starEmpty" size={14} />
                            }
                          </span>
                        ))}
                        <span style={{ fontSize: 11, color: GR, marginLeft: 4, fontWeight: 600 }}>
                          {trajet.conducteur?.noteMoyenne ? trajet.conducteur.noteMoyenne.toFixed(1) : (t ? t('new') : 'Nouveau')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
                    padding: 16, background: darkMode ? '#2D2D2D' : LG, borderRadius: 16,
                  }}>
                    <div style={{ textAlign: 'center', flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: darkMode ? '#FFFFFF' : BK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {trajet.villeDepart}
                      </div>
                      <div style={{ fontSize: 10, color: darkMode ? '#6B7280' : GR, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 2 }}>{t ? t('departure') : 'Départ'}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                      <div style={{ fontSize: 11, color: E, fontWeight: 700, background: EL, padding: '2px 8px', borderRadius: 6 }}>
                        {trajet.heureDepart}
                      </div>
                      <Icon name="arrowRight" size={18} />
                    </div>
                    <div style={{ textAlign: 'center', flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: darkMode ? '#FFFFFF' : BK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {trajet.villeArrivee}
                      </div>
                      <div style={{ fontSize: 10, color: darkMode ? '#6B7280' : GR, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 2 }}>{t ? t('arrival') : 'Arrivée'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: darkMode ? '#6B7280' : GR, fontSize: 12, fontWeight: 500 }}>
                      <Icon name="calendar" size={14} />
                      {formatDate(trajet.dateDepart)}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 22, fontWeight: 800, color: E }}>
                        {trajet.prixParPlace?.toLocaleString()}
                      </span>
                      <span style={{ fontSize: 12, color: darkMode ? '#6B7280' : GR, fontWeight: 600, marginLeft: 2 }}>FCFA</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
