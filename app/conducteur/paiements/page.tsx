'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ConducteurLayout from '../../../components/conducteur/ConducteurLayout';
import { useTheme } from '@/app/lib/ThemeContext';

const BACKEND_URL = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000` : '';

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
    money: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="14" rx="3"/><path d="M2 10H22"/><path d="M6 15H10"/><circle cx="17" cy="15" r="1.5" fill="currentColor"/>
      </svg>
    ),
    chart: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>
      </svg>
    ),
    clock: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    card: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
    search: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
    check: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    x: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    ),
    refresh: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
      </svg>
    ),
  };
  return <span style={{ lineHeight: 0, display: 'inline-flex' }}>{icons[name] || null}</span>;
};

interface Paiement {
  id: number;
  montantTotal: number;
  commission: number;
  montantNet: number;
  statut: string;
  date: string;
  campayReference: string;
  passager: { prenom: string; nom: string; photo?: string | null } | null;
  trajet: { villeDepart: string; villeArrivee: string; dateDepart: string | null } | null;
}

interface Stats {
  totalNet: number;
  totalCommission: number;
  totalEnAttente: number;
  nombreTransactions: number;
}

export default function ConducteurPaiements() {
  const router = useRouter();
  // ✅ CORRECTION : useTheme contient t() et darkMode
  const { t, darkMode } = useTheme();
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalNet: 0,
    totalCommission: 0,
    totalEnAttente: 0,
    nombreTransactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('tous');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    fetchGains();
  }, []);

  const fetchGains = async () => {
    try {
      const res = await fetch('/api/paiements/conducteur/mes-gains', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }

      const data = await res.json();

      if (data.error) {
        console.error("🚨 ERREUR DU BACKEND :", data.error);
        setLoading(false);
        return;
      }

      setStats(data.stats || { totalNet: 0, totalCommission: 0, totalEnAttente: 0, nombreTransactions: 0 });
      setPaiements(Array.isArray(data.paiements) ? data.paiements : []);
    } catch (err) {
      console.error("❌ Erreur réseau:", err);
    } finally {
      setLoading(false);
    }
  };

  const maintenant = new Date();
  const filtered = paiements.filter(p => {
    if (p.trajet?.dateDepart) {
      const dateLimite = new Date(p.trajet.dateDepart);
      dateLimite.setDate(dateLimite.getDate() + 7);
      if (dateLimite < maintenant) return false;
    }
    const searchStr = (
      (p.passager?.prenom || '') + ' ' + (p.passager?.nom || '') + ' ' +
      (p.trajet?.villeDepart || '') + ' ' + (p.trajet?.villeArrivee || '') + ' ' +
      (p.campayReference || '')
    ).toLowerCase();
    const matchSearch = searchStr.includes(search.toLowerCase());
    const matchStatut = filterStatut === 'tous' || p.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  const statutStyle = (s: string): React.CSSProperties => {
    if (s === 'REUSSI') return { background: '#dcfce7', color: '#15803d' };
    if (s === 'EN_ATTENTE') return { background: '#E8F7F3', color: '#0D9E7E' };
    if (s === 'REMBOURSE') return { background: '#fee2e2', color: '#dc2626' };
    return { background: '#f3f4f6', color: '#6b7280' };
  };

  const statutLabel = (s: string) => {
    if (s === 'REUSSI') return t('paid');
    if (s === 'EN_ATTENTE') return 'En attente' + ' ' + t('pending');
    if (s === 'REMBOURSE') return 'Rembourse';
    if (s === 'ECHEC') return t('failed');
    return s;
  };

  const formatDate = (d: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <ConducteurLayout>
        <div style={{ textAlign: 'center', padding: '80px', color: darkMode ? '#9CA3AF' : '#6b7280' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}><Icon name="money" size={48} /></div>
          <p>{t('loading')}</p>
        </div>
      </ConducteurLayout>
    );
  }

  return (
    <ConducteurLayout>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: darkMode ? '#FFFFFF' : '#111827', margin: '0 0 4px' }}>
          {t('myEarnings')} <Icon name="money" size={24} />
        </h1>
        <p style={{ fontSize: '13px', color: darkMode ? '#9CA3AF' : '#6b7280' }}>
          {t('earningsDesc')}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: t('totalNetEarned'), value: `${stats.totalNet.toLocaleString()} FCFA`, icon: <Icon name="money" size={20} color="#15803d" />, border: '#16a34a', bg: '#f0fdf4', color: '#15803d' },
          { label: t('platformCommission'), value: `${stats.totalCommission.toLocaleString()} FCFA`, icon: <Icon name="chart" size={20} color="#0D9E7E" />, border: '#0D9E7E', bg: '#E8F7F3', color: '#0D9E7E' },
          { label: t('pendingPayment'), value: `${stats.totalEnAttente.toLocaleString()} FCFA`, icon: <Icon name="clock" size={20} color="#0D9E7E" />, border: '#0D9E7E', bg: '#E8F7F3', color: '#0D9E7E' },
          { label: t('transactions'), value: stats.nombreTransactions, icon: <Icon name="card" size={20} color="#15803d" />, border: '#22c55e', bg: '#dcfce7', color: '#15803d' },
        ].map((card, i) => (
          <div key={i} style={{ background: darkMode ? '#1A1A1A' : '#fff', borderRadius: '12px', padding: '18px', border: '1px solid #e5e7eb', borderTop: `3px solid ${card.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{card.icon}</div>
            </div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: card.color, lineHeight: 1 }}>{card.value}</div>
            <div style={{ fontSize: '11px', color: darkMode ? '#9CA3AF' : '#6b7280', marginTop: '4px' }}>{card.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: darkMode ? '#1A1A1A' : '#fff', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e5e7eb', marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <input type="text" placeholder={t('searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: '200px', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', background: darkMode ? '#2D2D2D' : '#fff', color: darkMode ? '#FFFFFF' : '#111827' }} />
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} style={{ padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', background: darkMode ? '#2D2D2D' : '#fff', color: darkMode ? '#FFFFFF' : '#111827', cursor: 'pointer' }}>
          <option value="tous">{t('allStatus')}</option>
          <option value="REUSSI">{t('paid')}</option>
          <option value="EN_ATTENTE">{t('pending')}</option>
          <option value="REMBOURSE">{t('refunded')}</option>
        </select>
      </div>

      <div style={{ background: darkMode ? '#1A1A1A' : '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '10px', background: `linear-gradient(135deg, ${E}, ${ED})` }}>
          <span style={{ fontSize: '18px' }}><Icon name="money" size={18} color="white" /></span>
          <span style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>{t('paymentHistory')}</span>
          <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '800' }}>{filtered.length}</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: darkMode ? '#2D2D2D' : '#f9fafb' }}>
                {[t('date'), t('passenger'), t('trip'), t('amountPaid'), t('commission'), t('netReceived'), t('reference'), t('paymentStatus')].map(h => (
                  <th key={h} style={{ fontSize: '11px', color: darkMode ? '#9CA3AF' : '#6b7280', textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: '600', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '50px', textAlign: 'center', color: darkMode ? '#6B7280' : '#9ca3af', fontSize: '13px' }}>
                    <div style={{ fontSize: '36px', marginBottom: '10px' }}><Icon name="money" size={36} /></div>
                    {t('noPayments')}
                  </td>
                </tr>
              ) : filtered.map((p, i) => {
                const passagerPhoto = p.passager?.photo;
                const initials = `${p.passager?.prenom?.charAt(0) || ''}${p.passager?.nom?.charAt(0) || ''}`.toUpperCase();

                return (
                  <tr key={p.id} style={{ background: i % 2 === 0 ? (darkMode ? '#1A1A1A' : '#fff') : (darkMode ? '#252525' : '#fafafa'), borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = darkMode ? '#2D2D2D' : '#f0fdf4'}
                    onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? (darkMode ? '#1A1A1A' : '#fff') : (darkMode ? '#252525' : '#fafafa')}>
                    <td style={{ padding: '14px', fontSize: '12px', color: darkMode ? '#FFFFFF' : '#374151', whiteSpace: 'nowrap' }}>{formatDate(p.date)}</td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ position: 'relative', width: '32px', height: '32px', borderRadius: '50%', background: `linear-gradient(135deg, ${E}, ${ED})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#fff', fontWeight: '700', flexShrink: 0 }}>
                          {passagerPhoto && (
                            <img src={passagerPhoto.startsWith('http') ? passagerPhoto : `${BACKEND_URL}/uploads/profils/${passagerPhoto}`} alt="Photo passager" onError={(e) => (e.currentTarget.style.display = 'none')} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', position: 'absolute', top: 0, left: 0, zIndex: 10 }} />
                          )}
                          <span style={{ position: 'relative', zIndex: 1 }}>{initials}</span>
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: darkMode ? '#FFFFFF' : '#111827' }}>{p.passager?.prenom} {p.passager?.nom}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: darkMode ? '#FFFFFF' : '#111827' }}>{p.trajet?.villeDepart || 'N/A'}</span>
                        <span style={{ color: E }}>→</span>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: darkMode ? '#FFFFFF' : '#111827' }}>{p.trajet?.villeArrivee || 'N/A'}</span>
                      </div>
                      {p.trajet?.dateDepart && <div style={{ fontSize: '11px', color: darkMode ? '#9CA3AF' : '#9ca3af', marginTop: '2px' }}>{formatDate(p.trajet.dateDepart)}</div>}
                    </td>
                    <td style={{ padding: '14px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: darkMode ? '#FFFFFF' : '#111827' }}>{p.montantTotal?.toLocaleString()} FCFA</span>
                    </td>
                    <td style={{ padding: '14px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: '600' }}>- {p.commission?.toLocaleString()} FCFA</span>
                    </td>
                    <td style={{ padding: '14px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#16a34a', background: '#f0fdf4', padding: '4px 10px', borderRadius: '8px' }}>{p.montantNet?.toLocaleString()} FCFA</span>
                    </td>
                    <td style={{ padding: '14px', fontSize: '11px', color: darkMode ? '#9CA3AF' : '#6b7280', fontFamily: 'monospace' }}>{p.campayReference || '—'}</td>
                    <td style={{ padding: '14px' }}>
                      <span style={{ ...statutStyle(p.statut), padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap' }}>{statutLabel(p.statut)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: darkMode ? '#2D2D2D' : '#f9fafb', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: darkMode ? '#9CA3AF' : '#6b7280' }}>{filtered.length} {t('paymentsDisplayed')}</span>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: darkMode ? '#9CA3AF' : '#6b7280' }}>
                {t('totalNetDisplayed')} : <strong style={{ color: '#15803d', fontSize: '14px' }}>{filtered.filter(p => p.statut === 'REUSSI').reduce((acc, p) => acc + (p.montantNet || 0), 0).toLocaleString()} FCFA</strong>
              </span>
            </div>
          </div>
        )}
      </div>
    </ConducteurLayout>
  );
}