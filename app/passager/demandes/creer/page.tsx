'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/app/lib/ThemeContext';

const API_URL = '/api';

const E = '#0D9E7E';
const EL = '#E8F7F3';
const ED = '#0A7B62';
const BK = '#0D0D0D';
const GR = '#6B7280';
const BD = '#EBEBEB';
const RD = '#DC2626';
const AM = '#F59E0B';

// ─── Mapping Villes -> Quartiers (✅ DOUBLON 'Djeleng' SUPPRIMÉ) ───
const VILLE_QUARTIERS: Record<string, string[]> = {
  'Yaoundé': ['Bastos', 'Mvan', 'Mfoundi', 'Nlongkak', 'Essos', 'Odza', 'Messa', 'Elig-Essono', 'Carrefour Warda'],
  'Douala': ['Akwa', 'Bonanjo', 'Bonapriso', 'Deido', 'Logbaba', 'Makepe', 'Bonaberi', 'Ndogbong', 'New Bell'],
  'Bafoussam': ['Centre-ville', 'Djeleng', 'Tamdja', 'Famla'],
  'Bamenda': ['Commercial Avenue', 'Nkwen', 'Mile 4', 'Up Station', 'Ntarikon'],
  'Garoua': ['Plateau', 'Doualaré', 'Béka', 'Roumdé Adjia'],
  'Maroua': ['Domayo', 'Pitoaré', 'Doualaré', 'Ziling'],
  'Ngaoundéré': ['Bamyanga', 'Dang', 'Haoussa', 'Baboudjou'],
  'Bertoua': ['Centre-ville', 'Gbadang', 'Nkolbikok', 'Gbiti'],
  'Ebolowa': ['Centre-ville', 'Nkoabang', 'Ekoudoum'],
  'Kribi': ['Centre-ville', 'Londji', 'Grand Batanga', 'Mboro'],
  'Limbé': ['Mile 1', 'Mile 2', 'Down Beach', 'Bota'],
  'Buea': ['Molyko', 'Clerks Quarters', 'Buea Town', 'Great Soppo'],
  'Nkongsamba': ['Centre-ville', 'Nkondi', 'Mbang'],
  'Edéa': ['Centre-ville', 'Logbessou', 'Ndogpassi'],
  'Loum': ['Centre-ville', 'Ndogpassi', 'Mbanga']
};

const VILLES = Object.keys(VILLE_QUARTIERS);

// ─── Icônes SVG ───
const Icon = ({ name, size = 20, color = E }: { name: string; size?: number; color?: string }) => {
  const s = { width: size, height: size, display: 'inline-block', verticalAlign: 'middle' } as React.CSSProperties;
  const icons: Record<string, React.ReactNode> = {
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
    users: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    money: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="14" rx="3" stroke="#16A34A" strokeWidth="2" fill="#DCFCE7"/>
        <path d="M2 10H22" stroke="#16A34A" strokeWidth="2"/>
        <path d="M6 15H10" stroke="#16A34A" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="17" cy="15" r="1.5" fill="#16A34A"/>
      </svg>
    ),
    message: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    lock: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    mail: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    ),
    arrowLeft: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
    ),
    check: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
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

export default function CreerDemandePage() {
  const router = useRouter();
  const { t, darkMode } = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  
  const [villeDepart, setVilleDepart] = useState('');
  const [villeArrivee, setVilleArrivee] = useState('');
  const [quartierDepart, setQuartierDepart] = useState('');
  const [quartierArrivee, setQuartierArrivee] = useState('');
  const [dateDepart, setDateDepart] = useState('');
  const [heureDepart, setHeureDepart] = useState('');
  const [nbPlaces, setNbPlaces] = useState(1);
  const [budgetMax, setBudgetMax] = useState('');
  const [description, setDescription] = useState('');
  const [estPrivee, setEstPrivee] = useState(false);
  const [destinatairePriveEmail, setDestinatairePriveEmail] = useState('');
  const [conducteurs, setConducteurs] = useState<{ id: number; nom: string; prenom: string; email: string; photo?: string | null; noteMoyenne?: number }[]>([]);
  const [loadingConducteurs, setLoadingConducteurs] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setQuartierDepart('');
  }, [villeDepart]);

  useEffect(() => {
    setQuartierArrivee('');
  }, [villeArrivee]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    if (estPrivee && conducteurs.length === 0) {
      const token = localStorage.getItem('token');
      if (token) {
        setLoadingConducteurs(true);
        fetch('/api/utilisateurs/conducteurs/actifs', {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(r => r.json())
          .then(data => { if (Array.isArray(data)) setConducteurs(data); })
          .catch(() => {})
          .finally(() => setLoadingConducteurs(false));
      }
    }
  }, [estPrivee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const data: any = {
      villeDepart,
      villeArrivee,
      quartierDepart: quartierDepart || null,
      quartierArrivee: quartierArrivee || null,
      dateDepart,
      heureDepart: heureDepart || null,
      nbPlaces,
      budgetMax: parseFloat(budgetMax),
      description: description || null,
    };

    if (estPrivee && destinatairePriveEmail.trim()) {
      data.estPrivee = true;
      data.destinatairePriveEmail = destinatairePriveEmail.trim();
    }

    try {
      const response = await fetch(`${API_URL}/demandes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/passager/demandes');
        }, 2500);
      } else {
        setError(result.error || 'Erreur lors de la création de la demande');
      }
    } catch (err) {
      console.error('Erreur réseau:', err);
      setError('Erreur de connexion au serveur. Vérifie que le backend est lancé.');
    } finally {
      setLoading(false);
    }
  };

  const bgCard = darkMode ? '#1A1A1A' : '#FFFFFF';
  const textColor = darkMode ? '#FFFFFF' : BK;
  const textSecondary = darkMode ? '#9CA3AF' : GR;
  const borderColor = darkMode ? '#2A2A2A' : BD;
  const inputBg = darkMode ? '#2A2A2A' : '#FFFFFF';

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: darkMode ? '#0D0D0D' : '#F9FAFB', padding: '20px' }}>
        <div style={{ background: bgCard, borderRadius: '24px', padding: '48px', maxWidth: '500px', width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: EL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Icon name="check" size={40} color={E} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: textColor, marginBottom: '12px' }}>Demande publiée avec succès !</h2>
          <p style={{ fontSize: '15px', color: textSecondary, marginBottom: '24px' }}>Les conducteurs concernés ont été notifiés. Vous recevrez une réponse sous 48h.</p>
          <p style={{ fontSize: '13px', color: E, fontWeight: '600' }}>Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: darkMode ? '#0D0D0D' : '#F9FAFB', padding: isMobile ? '20px 16px' : '48px 24px' }}>
      <div style={{ maxWidth: '700px', width: '100%' }}>
        <div style={{ marginBottom: '32px' }}>
          <Link href="/passager/demandes" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', color: E, fontSize: '14px', fontWeight: '600', marginBottom: '24px' }}>
            <Icon name="arrowLeft" size={16} /> Retour
          </Link>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: textColor, margin: '0 0 8px' }}>Informations du trajet</h2>
          <p style={{ fontSize: '15px', color: textSecondary, margin: 0 }}>Remplissez les détails de votre demande de trajet</p>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '14px 18px', marginBottom: '24px', color: RD, fontSize: '14px', fontWeight: '600' }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: textColor, marginBottom: '8px' }}><Icon name="mapPin" size={14} color={E} /> Ville de départ *</label>
              <select value={villeDepart} onChange={(e) => setVilleDepart(e.target.value)} required style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: `1.5px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '14px', fontWeight: '500', outline: 'none', transition: 'border-color 0.2s' }} onFocus={(e) => e.currentTarget.style.borderColor = E} onBlur={(e) => e.currentTarget.style.borderColor = borderColor}>
                <option value="">Sélectionnez...</option>
                {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: textColor, marginBottom: '8px' }}><Icon name="mapPin" size={14} color={RD} /> Ville d'arrivée *</label>
              <select value={villeArrivee} onChange={(e) => setVilleArrivee(e.target.value)} required style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: `1.5px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '14px', fontWeight: '500', outline: 'none', transition: 'border-color 0.2s' }} onFocus={(e) => e.currentTarget.style.borderColor = E} onBlur={(e) => e.currentTarget.style.borderColor = borderColor}>
                <option value="">Sélectionnez...</option>
                {VILLES.filter(v => v !== villeDepart).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>

          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: textColor, marginBottom: '8px' }}>Quartier de départ</label>
              <select value={quartierDepart} onChange={(e) => setQuartierDepart(e.target.value)} disabled={!villeDepart} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: `1.5px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', opacity: !villeDepart ? 0.6 : 1 }} onFocus={(e) => e.currentTarget.style.borderColor = E} onBlur={(e) => e.currentTarget.style.borderColor = borderColor}>
                <option value="">{villeDepart ? 'Sélectionnez un quartier' : 'Choisissez d\'abord la ville'}</option>
                {villeDepart && VILLE_QUARTIERS[villeDepart]?.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: textColor, marginBottom: '8px' }}>Quartier d'arrivée</label>
              <select value={quartierArrivee} onChange={(e) => setQuartierArrivee(e.target.value)} disabled={!villeArrivee} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: `1.5px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', opacity: !villeArrivee ? 0.6 : 1 }} onFocus={(e) => e.currentTarget.style.borderColor = E} onBlur={(e) => e.currentTarget.style.borderColor = borderColor}>
                <option value="">{villeArrivee ? 'Sélectionnez un quartier' : 'Choisissez d\'abord la ville'}</option>
                {villeArrivee && VILLE_QUARTIERS[villeArrivee]?.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
          </div>

          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: textColor, marginBottom: '8px' }}><Icon name="calendar" size={14} color={E} /> Date de départ *</label>
              <input type="date" value={dateDepart} onChange={(e) => setDateDepart(e.target.value)} required min={new Date().toISOString().split('T')[0]} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: `1.5px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }} onFocus={(e) => e.currentTarget.style.borderColor = E} onBlur={(e) => e.currentTarget.style.borderColor = borderColor} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: textColor, marginBottom: '8px' }}><Icon name="clock" size={14} color={E} /> Heure (optionnel)</label>
              <input type="time" value={heureDepart} onChange={(e) => setHeureDepart(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: `1.5px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }} onFocus={(e) => e.currentTarget.style.borderColor = E} onBlur={(e) => e.currentTarget.style.borderColor = borderColor} />
            </div>
          </div>

          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: textColor, marginBottom: '8px' }}><Icon name="users" size={14} color={E} /> Nombre de places *</label>
              <select value={nbPlaces} onChange={(e) => setNbPlaces(parseInt(e.target.value))} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: `1.5px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '14px', fontWeight: '500', outline: 'none', transition: 'border-color 0.2s' }} onFocus={(e) => e.currentTarget.style.borderColor = E} onBlur={(e) => e.currentTarget.style.borderColor = borderColor}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (<option key={n} value={n}>{n} {n > 1 ? 'places' : 'place'}</option>))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: textColor, marginBottom: '8px' }}><Icon name="money" size={14} color="#16A34A" /> Budget max (FCFA) *</label>
              <input type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="Ex: 5000" required min="0" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: `1.5px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }} onFocus={(e) => e.currentTarget.style.borderColor = E} onBlur={(e) => e.currentTarget.style.borderColor = borderColor} />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: textColor, marginBottom: '8px' }}><Icon name="message" size={14} color={E} /> Description (optionnel)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Précisez vos besoins : bagages, animaux, préférences..." rows={3} maxLength={500} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: `1.5px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', transition: 'border-color 0.2s' }} onFocus={(e) => e.currentTarget.style.borderColor = E} onBlur={(e) => e.currentTarget.style.borderColor = borderColor} />
            <div style={{ fontSize: '11px', color: textSecondary, marginTop: '4px', textAlign: 'right' }}>{description.length}/500</div>
          </div>

          <div style={{ marginBottom: '24px', padding: '16px', background: darkMode ? '#2A2A2A' : EL, borderRadius: '12px', border: `1px solid ${darkMode ? '#3A3A3A' : '#BBF7D0'}` }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input type="checkbox" checked={estPrivee} onChange={(e) => setEstPrivee(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: E }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: textColor, display: 'flex', alignItems: 'center', gap: '6px' }}><Icon name="lock" size={14} color={E} /> Demande privée</div>
                <div style={{ fontSize: '12px', color: textSecondary, marginTop: '2px' }}>Envoyer cette demande à un conducteur spécifique uniquement</div>
              </div>
            </label>
            
            {estPrivee && (
              <div style={{ marginTop: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: textColor, marginBottom: '6px' }}><Icon name="mail" size={12} color={E} /> Sélectionner un conducteur *</label>
                {loadingConducteurs ? (
                  <div style={{ padding: '12px', textAlign: 'center', color: textSecondary, fontSize: '13px', background: inputBg, borderRadius: '8px', border: `1px solid ${borderColor}` }}>
                    Chargement des conducteurs...
                  </div>
                ) : (
                  <select
                    value={destinatairePriveEmail}
                    onChange={(e) => setDestinatairePriveEmail(e.target.value)}
                    required={estPrivee}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '13px', outline: 'none', transition: 'border-color 0.2s' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = E}
                    onBlur={(e) => e.currentTarget.style.borderColor = borderColor}
                  >
                    <option value="">Choisir un conducteur...</option>
                    {conducteurs.map(c => (
                      <option key={c.id} value={c.email}>
                        {c.prenom} {c.nom} {c.noteMoyenne ? `(${Number(c.noteMoyenne).toFixed(1)}★)` : ''} - {c.email}
                      </option>
                    ))}
                  </select>
                )}
                {conducteurs.length === 0 && !loadingConducteurs && (
                  <p style={{ fontSize: '11px', color: textSecondary, marginTop: '4px' }}>Aucun conducteur disponible pour le moment.</p>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="/passager/demandes" style={{ flex: 1, padding: '14px', borderRadius: '12px', border: `1.5px solid ${borderColor}`, background: 'transparent', color: textColor, fontSize: '15px', fontWeight: '600', textDecoration: 'none', textAlign: 'center', transition: 'all 0.2s' }}>Précédent</Link>
            <button type="submit" disabled={loading} style={{ flex: 2, padding: '14px', borderRadius: '12px', border: 'none', background: loading ? GR : `linear-gradient(135deg, ${E}, ${ED})`, color: '#FFFFFF', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: loading ? 'none' : `0 4px 15px rgba(13, 158, 126, 0.3)`, transition: 'all 0.2s' }}>
              {loading ? (
                <><div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Publication...</>
              ) : (
                <><Icon name="car" size={18} color="#FFF" />Publier ma demande</>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}