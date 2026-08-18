'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

const BACKEND_URL = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000` : '';

const API_URL = '/api';

// ─── SVG Icons inline ───
const Icon = ({ name, size = 24, color = '#0D9E7E' }: { name: string; size?: number; color?: string }) => {
  const s = { width: size, height: size, display: 'inline-block', verticalAlign: 'middle' } as React.CSSProperties;
  const icons: Record<string, React.ReactNode> = {
    users: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    car: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h8l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2M5 17a2 2 0 100 4 2 2 0 000-4zm14 0a2 2 0 100 4 2 2 0 000-4z"/>
      </svg>
    ),
    route: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="18" r="3"/><path d="M19 18a2 2 0 0 0 .701-3.687l-6.5-10.526A2 2 0 0 0 11.799 3h-6.6a2 2 0 0 0-1.702.787l-6.5 10.526A2 2 0 0 0-2.399 18"/>
      </svg>
    ),
    clipboard: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
    ),
    creditCard: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  };
  return <span style={{ lineHeight: 0, display: 'inline-flex' }}>{icons[name] || null}</span>;
};

interface Stats {
  utilisateurs?: { total: number; conducteurs: number; passagers: number };
  trajets?: { total: number };
  reservations?: { total: number };
  paiements?: { total: number };
}

interface RecentUser {
  id: number;
  nom: string;
  prenom: string;
  typeUtilisateur: string;
  estActif: boolean;
  dateCreation: string;
  photo?: string | null;
}

interface RecentReservation {
  id: number;
  passager: string;
  villeDepart: string;
  villeArrivee: string;
  dateDepart: string;
  statut: string;
  dateReservation: string;
}

interface ReservationParMois {
  mois: number;
  count: number;
}

interface StatsPaiements {
  confirmes: number;
  en_attente: number;
  rembourses: number;
  total: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentReservations, setRecentReservations] = useState<RecentReservation[]>([]);
  const [reservationsParMois, setReservationsParMois] = useState<ReservationParMois[]>([]);
  const [statsPaiements, setStatsPaiements] = useState<StatsPaiements | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) { window.location.href = '/login'; return; }
    if (userData) {
      const parsed = JSON.parse(userData);
      if (!parsed.roles?.includes('ROLE_ADMIN')) { window.location.href = '/login'; return; }
      setUser(parsed);
    }

    fetch(`${API_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setStats({
          utilisateurs: {
            total: data?.utilisateurs?.total ?? 0,
            conducteurs: data?.utilisateurs?.conducteurs ?? 0,
            passagers: data?.utilisateurs?.passagers ?? 0,
          },
          trajets: { total: data?.trajets?.total ?? 0 },
          reservations: { total: data?.reservations?.total ?? 0 },
          paiements: { total: data?.paiements?.total ?? 0 },
        });
        setLoading(false);
      })
      .catch(() => {
        setStats({
          utilisateurs: { total: 0, conducteurs: 0, passagers: 0 },
          trajets: { total: 0 },
          reservations: { total: 0 },
          paiements: { total: 0 },
        });
        setLoading(false);
      });

    fetch(`${API_URL}/admin/recent-users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setRecentUsers(Array.isArray(data) ? data : []))
      .catch(() => setRecentUsers([]));

    fetch(`${API_URL}/admin/recent-reservations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setRecentReservations(Array.isArray(data) ? data : []))
      .catch(() => setRecentReservations([]));

    fetch(`${API_URL}/admin/reservations-par-mois`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setReservationsParMois(Array.isArray(data) ? data : []))
      .catch(() => setReservationsParMois([]));

    fetch(`${API_URL}/admin/stats-paiements`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setStatsPaiements(data))
      .catch(() => setStatsPaiements(null));
  }, []);

  const totalUsers = stats?.utilisateurs?.total ?? 0;
  const totalConducteurs = stats?.utilisateurs?.conducteurs ?? 0;
  const totalPassagers = stats?.utilisateurs?.passagers ?? 0;
  const totalTrajets = stats?.trajets?.total ?? 0;
  const totalReservations = stats?.reservations?.total ?? 0;
  const totalPaiements = stats?.paiements?.total ?? 0;

  const months = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

  const barData = reservationsParMois.length > 0
    ? reservationsParMois.map(r => r.count)
    : Array(12).fill(0);
  const maxBar = Math.max(...barData, 1);

  const statCards = [
    { label: 'Passagers',     value: totalPassagers,    color: '#22c55e', bg: '#dcfce7', icon: <Icon name="users" color="#15803d" /> },
    { label: 'Conducteurs',   value: totalConducteurs,  color: '#374151', bg: '#f3f4f6', icon: <Icon name="car" color="#374151" /> },
    { label: 'Trajets',       value: totalTrajets,      color: '#10b981', bg: '#d1fae5', icon: <Icon name="route" color="#15803d" /> },
    { label: 'Réservations',  value: totalReservations, color: '#84cc16', bg: '#ecfccb', icon: <Icon name="clipboard" color="#65a30d" /> },
    { label: 'Paiements',     value: totalPaiements,    color: '#14b8a6', bg: '#ccfbf1', icon: <Icon name="creditCard" color="#0d9488" /> },
  ];

  const hasData = totalUsers > 0 || totalTrajets > 0 || totalReservations > 0;

  const getTypeLabel = (type: string) => {
    if (type === 'conducteur') return 'Conducteur';
    if (type === 'passager') return 'Passager';
    return type;
  };

  const getStatutLabel = (estActif: boolean) => estActif ? 'Actif' : 'Suspendu';

  const getReservationStatutLabel = (statut: string) => {
    const labels: Record<string, string> = {
      'pending':   'En attente',
      'accepted':  'Confirmée',
      'refused':   'Refusée',
      'cancelled': 'Annulée',
    };
    return labels[statut] || statut;
  };

  const statutColor = (s: string) => {
    if (s === 'Actif' || s === 'Confirmée')  return { bg: '#dcfce7', color: '#15803d' };
    if (s === 'En attente')                   return { bg: '#fef3c7', color: '#d97706' };
    return { bg: '#fee2e2', color: '#dc2626' };
  };

  const getPaiementPercentages = () => {
    if (!statsPaiements || statsPaiements.total === 0)
      return { confirmes: 0, en_attente: 0, rembourses: 0 };
    const t = statsPaiements.total;
    return {
      confirmes:   Math.round((statsPaiements.confirmes   / t) * 100),
      en_attente:  Math.round((statsPaiements.en_attente  / t) * 100),
      rembourses:  Math.round((statsPaiements.rembourses  / t) * 100),
    };
  };

  const paiementPercentages = getPaiementPercentages();

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'calc(100vh - 64px)' }}>
          <p style={{ color:'#6b7280' }}>Chargement...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <style>{`
        @media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .charts-grid { grid-template-columns: 1fr !important; }
          .tables-grid { grid-template-columns: 1fr !important; }
          .stat-card-value { font-size: 20px !important; }
          .stat-card-icon { width: 30px !important; height: 30px !important; font-size: 14px !important; }
          .chart-container { height: 120px !important; }
          .table-cell { font-size: 11px !important; padding: 6px 8px !important; }
          .table-header { font-size: 9px !important; padding: 6px 8px !important; }
          .badge-text { font-size: 9px !important; padding: 2px 6px !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
          .stat-card { padding: 10px !important; }
          .stat-card-value { font-size: 18px !important; }
          .stat-card-label { font-size: 10px !important; }
          .chart-container { height: 100px !important; }
        }
      `}</style>

      <div style={{ fontFamily:"'Segoe UI', Arial, sans-serif" }}>

        <div style={{ marginBottom:'18px' }}>
          <h2 style={{ fontSize:'18px', fontWeight:'600', color:'#111827' }}>Tableau de bord</h2>
          <p style={{ fontSize:'12px', color:'#6b7280', marginTop:'2px' }}>
            {totalUsers === 0 && totalTrajets === 0
              ? 'Aucun résultat'
              : "Bienvenue sur votre espace d'administration CovoCam"}
          </p>
        </div>

        {/* Stat cards */}
        <div className="stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:'12px', marginBottom:'20px' }}>
          {statCards.map((card, i) => (
            <div key={i} className="stat-card" style={{ background:'#fff', borderRadius:'10px', padding:'14px', border:'1px solid #e5e7eb', borderTop:`3px solid ${card.color}` }}>
              <div className="stat-card-icon" style={{ width:'36px', height:'36px', borderRadius:'8px', background:card.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', marginBottom:'10px' }}>
                {card.icon}
              </div>
              <div className="stat-card-value" style={{ fontSize:'26px', fontWeight:'700', color:'#111827', lineHeight:1 }}>
                {card.value.toLocaleString()}
              </div>
              <div className="stat-card-label" style={{ fontSize:'11px', color:'#6b7280', marginTop:'4px' }}>{card.label}</div>
              {card.value > 0
                ? <div style={{ fontSize:'10px', color:'#22c55e', marginTop:'6px' }}>↑ ce mois</div>
                : <div style={{ fontSize:'10px', color:'#9ca3af', marginTop:'6px' }}>Aucun résultat</div>
              }
            </div>
          ))}
        </div>

        {/* Charts */}
        {hasData ? (
          <div className="charts-grid" style={{ display:'grid', gridTemplateColumns:'3fr 2fr', gap:'16px', marginBottom:'16px' }}>
            {/* Bar chart */}
            <div style={{ background:'#fff', borderRadius:'10px', padding:'18px', border:'1px solid #e5e7eb' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
                <div style={{ fontSize:'13px', fontWeight:'600', color:'#111827' }}>Réservations par mois</div>
                <button style={{ fontSize:'10px', padding:'3px 8px', borderRadius:'4px', border:'1px solid #e5e7eb', background:'#0a0a0a', color:'#22c55e', cursor:'pointer' }}>2026</button>
              </div>
              <div className="chart-container" style={{ display:'flex', gap:'4px', height:'160px', alignItems:'flex-end' }}>
                {barData.map((v, i) => {
                  const h = Math.round((v / maxBar) * 130);
                  const isCurrent = i === new Date().getMonth();
                  return (
                    <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', height:'100%', justifyContent:'flex-end' }}>
                      <div style={{ fontSize:'8px', color: isCurrent ? '#16a34a' : '#9ca3af', fontWeight: isCurrent ? 700 : 400 }}>{v}</div>
                      <div style={{ width:'100%', height:`${h}px`, background: isCurrent ? '#22c55e' : '#d1fae5', borderRadius:'4px 4px 0 0' }}/>
                      <div style={{ fontSize:'8px', color: isCurrent ? '#16a34a' : '#9ca3af', fontWeight: isCurrent ? 700 : 400 }}>{months[i]}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Donut chart */}
            <div style={{ background:'#fff', borderRadius:'10px', padding:'18px', border:'1px solid #e5e7eb' }}>
              <div style={{ fontSize:'13px', fontWeight:'600', color:'#111827', marginBottom:'16px' }}>Paiements</div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'14px' }}>
                <svg viewBox="0 0 120 120" width="120" height="120">
                  {(() => {
                    const slices = [
                      { v: paiementPercentages.confirmes  / 100, c: '#22c55e' },
                      { v: paiementPercentages.en_attente / 100, c: '#fbbf24' },
                      { v: paiementPercentages.rembourses / 100, c: '#f87171' },
                    ];
                    let angle = -Math.PI / 2;
                    return slices.map((s, i) => {
                      if (s.v === 0) return null;
                      const end = angle + s.v * 2 * Math.PI;
                      const x1 = 60 + 54 * Math.cos(angle), y1 = 60 + 54 * Math.sin(angle);
                      const x2 = 60 + 54 * Math.cos(end),   y2 = 60 + 54 * Math.sin(end);
                      const large = s.v > 0.5 ? 1 : 0;
                      const d = `M60,60 L${x1},${y1} A54,54,0,${large},1,${x2},${y2}Z`;
                      const result = <path key={i} d={d} fill={s.c}/>;
                      angle = end;
                      return result;
                    });
                  })()}
                  <circle cx="60" cy="60" r="32" fill="#fff"/>
                  <text x="60" y="56" textAnchor="middle" fontSize="14" fontWeight="700" fill="#111827">
                    {paiementPercentages.confirmes}%
                  </text>
                  <text x="60" y="70" textAnchor="middle" fontSize="9" fill="#6b7280">confirmés</text>
                </svg>
                <div style={{ width:'100%' }}>
                  {[
                    { label:'Confirmés',  pct:`${paiementPercentages.confirmes}%`,  color:'#22c55e' },
                    { label:'En attente', pct:`${paiementPercentages.en_attente}%`, color:'#fbbf24' },
                    { label:'Remboursés', pct:`${paiementPercentages.rembourses}%`, color:'#f87171' },
                  ].map((item, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid #f3f4f6', fontSize:'11px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'6px', color:'#374151' }}>
                        <div style={{ width:'10px', height:'10px', borderRadius:'50%', background:item.color }}/>
                        {item.label}
                      </div>
                      <span style={{ fontWeight:'600', color:'#111827' }}>{item.pct}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background:'#fff', borderRadius:'10px', padding:'30px', textAlign:'center', border:'1px dashed #e5e7eb', marginBottom:'16px' }}>
            <div style={{ marginBottom:'12px', display:'flex', justifyContent:'center' }}><Icon name="route" size={48} color="#9CA3AF" /></div>
            <h3 style={{ fontSize:'16px', fontWeight:'600', color:'#374151', marginBottom:'6px' }}>Aucune donnée disponible</h3>
            <p style={{ fontSize:'13px', color:'#9ca3af' }}>Les graphiques s'afficheront automatiquement dès que la plateforme aura des activités</p>
          </div>
        )}

        {/* Tables */}
        {hasData ? (
          <div className="tables-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>

            {/* Utilisateurs récents */}
            <div style={{ background:'#fff', borderRadius:'10px', padding:'18px', border:'1px solid #e5e7eb' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
                <span style={{ fontSize:'13px', fontWeight:'600', color:'#111827' }}>Utilisateurs</span>
                <a href="/admin/utilisateurs" style={{ fontSize:'11px', color:'#22c55e', textDecoration:'none' }}>Voir tout →</a>
              </div>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr>
                      {['Nom','Type','Statut'].map(h => (
                        <th key={h} className="table-header" style={{ fontSize:'10px', color:'#9ca3af', textAlign:'left', padding:'6px 8px', borderBottom:'1px solid #f3f4f6', textTransform:'uppercase', letterSpacing:'.5px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.length === 0 ? (
                      <tr><td colSpan={3} style={{ textAlign:'center', padding:'20px', color:'#9ca3af', fontSize:'12px' }}>Aucun résultat</td></tr>
                    ) : recentUsers.map(u => {
                      const statut = getStatutLabel(u.estActif);
                      const s = statutColor(statut);
                      return (
                        <tr key={u.id}>
                          <td className="table-cell" style={{ fontSize:'12px', color:'#374151', padding:'7px 8px', borderBottom:'1px solid #f9fafb' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ position: 'relative', width: '28px', height: '28px', flexShrink: 0 }}>
                                {u.photo && (
                                  <img src={u.photo.startsWith('http') ? u.photo : `${BACKEND_URL}/uploads/profils/${u.photo}`} alt="" onError={e => e.currentTarget.style.display = 'none'} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 10 }} />
                                )}
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#E8F7F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: '#0D9E7E', position: 'relative', zIndex: 1 }}>
                                  {u.prenom?.charAt(0)}{u.nom?.charAt(0)}
                                </div>
                              </div>
                              {u.prenom} {u.nom}
                            </div>
                          </td>
                          <td className="table-cell" style={{ fontSize:'12px', color:'#374151', padding:'7px 8px', borderBottom:'1px solid #f9fafb' }}>{getTypeLabel(u.typeUtilisateur)}</td>
                          <td style={{ padding:'7px 8px', borderBottom:'1px solid #f9fafb' }}>
                            <span className="badge-text" style={{ padding:'2px 8px', borderRadius:'20px', fontSize:'10px', fontWeight:'600', background:s.bg, color:s.color }}>{statut}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Réservations récentes */}
            <div style={{ background:'#fff', borderRadius:'10px', padding:'18px', border:'1px solid #e5e7eb' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
                <span style={{ fontSize:'13px', fontWeight:'600', color:'#111827' }}>Réservations</span>
                <a href="/admin/reservations" style={{ fontSize:'11px', color:'#22c55e', textDecoration:'none' }}>Voir tout →</a>
              </div>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr>
                      {['Passager','Trajet','Date','Statut'].map(h => (
                        <th key={h} className="table-header" style={{ fontSize:'10px', color:'#9ca3af', textAlign:'left', padding:'6px 8px', borderBottom:'1px solid #f3f4f6', textTransform:'uppercase', letterSpacing:'.5px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentReservations.length === 0 ? (
                      <tr><td colSpan={4} style={{ textAlign:'center', padding:'20px', color:'#9ca3af', fontSize:'12px' }}>Aucun résultat</td></tr>
                    ) : recentReservations.map(r => {
                      const statut = getReservationStatutLabel(r.statut);
                      const s = statutColor(statut);
                      return (
                        <tr key={r.id}>
                          <td className="table-cell" style={{ fontSize:'12px', color:'#374151', padding:'7px 8px', borderBottom:'1px solid #f9fafb' }}>{r.passager}</td>
                          <td className="table-cell" style={{ fontSize:'12px', color:'#374151', padding:'7px 8px', borderBottom:'1px solid #f9fafb' }}>{r.villeDepart} → {r.villeArrivee}</td>
                          <td className="table-cell" style={{ fontSize:'12px', color:'#374151', padding:'7px 8px', borderBottom:'1px solid #f9fafb' }}>{r.dateDepart}</td>
                          <td style={{ padding:'7px 8px', borderBottom:'1px solid #f9fafb' }}>
                            <span className="badge-text" style={{ padding:'2px 8px', borderRadius:'20px', fontSize:'10px', fontWeight:'600', background:s.bg, color:s.color }}>{statut}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="tables-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
            <div style={{ background:'#fff', borderRadius:'10px', padding:'30px', textAlign:'center', border:'1px dashed #e5e7eb' }}>
              <div style={{ marginBottom:'8px', display:'flex', justifyContent:'center' }}><Icon name="users" size={32} color="#9CA3AF" /></div>
              <p style={{ fontSize:'13px', color:'#9ca3af' }}>Aucun utilisateur récent</p>
            </div>
            <div style={{ background:'#fff', borderRadius:'10px', padding:'30px', textAlign:'center', border:'1px dashed #e5e7eb' }}>
              <div style={{ marginBottom:'8px', display:'flex', justifyContent:'center' }}><Icon name="clipboard" size={32} color="#9CA3AF" /></div>
              <p style={{ fontSize:'13px', color:'#9ca3af' }}>Aucune réservation récente</p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}