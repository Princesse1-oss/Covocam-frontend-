'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import AdminLayout from '@/components/admin/AdminLayout';
import SvgIcon from '@/components/SvgIcon';
import { useTheme } from '@/app/lib/ThemeContext';

const API_URL = '/api';

const AdminPositionsMap = dynamic(() => import('@/components/admin/AdminPositionsMap'), { ssr: false });

interface ConductorPosition {
  id: number;
  nom: string;
  prenom?: string;
  lat: number;
  lng: number;
  trajetId: number;
  statut: string;
  villeDepart: string;
  villeArrivee: string;
  photo?: string;
}

const POLL_INTERVAL = 15000;

const GREEN = '#0D9E7E';

export default function AdminPositionsPage() {
  const { darkMode } = useTheme();
  const [positions, setPositions] = useState<ConductorPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatut, setFilterStatut] = useState<string>('ALL');
  const [filterVille, setFilterVille] = useState<string>('ALL');
  const [showPanel, setShowPanel] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchPositions = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${API_URL}/admin/positions`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setPositions(Array.isArray(data) ? data : data.positions || data.data || []);
      } else {
        setPositions([]);
      }
    } catch {
      setPositions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPositions();
    intervalRef.current = setInterval(fetchPositions, POLL_INTERVAL);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchPositions]);

  const filteredPositions = positions.filter(p => {
    if (filterStatut !== 'ALL' && p.statut !== filterStatut) return false;
    if (filterVille !== 'ALL' && p.villeDepart !== filterVille) return false;
    return true;
  });

  const villes = [...new Set(positions.map(p => p.villeDepart))];
  const statuts = [...new Set(positions.map(p => p.statut))];

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: 'calc(100vh - 112px)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SvgIcon name="navigation" size={24} color={GREEN} />
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: darkMode ? '#fff' : '#0D0D0D', margin: 0 }}>
              Positions des conducteurs
            </h1>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '20px',
              background: darkMode ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.25)',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10B981',
                animation: 'pulse 2s infinite',
              }} />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#10B981' }}>En direct</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => { fetchPositions(); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                background: darkMode ? '#1e293b' : '#f1f5f9',
                color: darkMode ? '#e2e8f0' : '#475569',
                fontSize: '13px', fontWeight: '500',
              }}
            >
              <SvgIcon name="clock" size={16} /> Actualiser
            </button>
            <button
              onClick={() => setShowPanel(!showPanel)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                background: showPanel ? GREEN : (darkMode ? '#1e293b' : '#f1f5f9'),
                color: showPanel ? '#fff' : (darkMode ? '#e2e8f0' : '#475569'),
                fontSize: '13px', fontWeight: '500',
              }}
            >
              <SvgIcon name="map" size={16} /> Panneau
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0 }}>
          {/* Map */}
          <div style={{ flex: 1, minHeight: 0 }}>
            {loading ? (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100%', borderRadius: '16px',
                background: darkMode ? '#1e293b' : '#f8fafc',
                color: darkMode ? '#94a3b8' : '#64748b',
                fontSize: '14px',
              }}>
                Chargement de la carte...
              </div>
            ) : (
              <AdminPositionsMap positions={filteredPositions} darkMode={darkMode} />
            )}
          </div>

          {/* Side panel */}
          {showPanel && (
            <div style={{
              width: '300px',
              flexShrink: 0,
              borderRadius: '16px',
              background: darkMode ? '#1e293b' : '#ffffff',
              border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              {/* Filters */}
              <div>
                <h3 style={{ fontSize: '13px', fontWeight: '600', color: darkMode ? '#94a3b8' : '#64748b', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Filtres
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <select
                    value={filterStatut}
                    onChange={e => setFilterStatut(e.target.value)}
                    style={{
                      padding: '8px 12px', borderRadius: '8px', border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`,
                      background: darkMode ? '#0f172a' : '#f8fafc',
                      color: darkMode ? '#e2e8f0' : '#1e293b',
                      fontSize: '13px',
                    }}
                  >
                    <option value="ALL">Tous les statuts</option>
                    {statuts.map(s => (
                      <option key={s} value={s}>{s === 'EN_COURS' ? 'En cours' : s}</option>
                    ))}
                  </select>
                  <select
                    value={filterVille}
                    onChange={e => setFilterVille(e.target.value)}
                    style={{
                      padding: '8px 12px', borderRadius: '8px', border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`,
                      background: darkMode ? '#0f172a' : '#f8fafc',
                      color: darkMode ? '#e2e8f0' : '#1e293b',
                      fontSize: '13px',
                    }}
                  >
                    <option value="ALL">Toutes les villes</option>
                    {villes.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Stats */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px',
              }}>
                <div style={{
                  padding: '12px', borderRadius: '10px',
                  background: darkMode ? '#0f172a' : '#f8fafc',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: GREEN }}>{filteredPositions.length}</div>
                  <div style={{ fontSize: '11px', color: darkMode ? '#64748b' : '#94a3b8' }}>Conducteurs</div>
                </div>
                <div style={{
                  padding: '12px', borderRadius: '10px',
                  background: darkMode ? '#0f172a' : '#f8fafc',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#10B981' }}>
                    {filteredPositions.filter(p => p.statut === 'EN_COURS').length}
                  </div>
                  <div style={{ fontSize: '11px', color: darkMode ? '#64748b' : '#94a3b8' }}>En trajet</div>
                </div>
              </div>

              {/* Driver list */}
              <div>
                <h3 style={{ fontSize: '13px', fontWeight: '600', color: darkMode ? '#94a3b8' : '#64748b', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Conducteurs ({filteredPositions.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {filteredPositions.map(p => (
                    <div key={p.id} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px', borderRadius: '10px',
                      background: darkMode ? '#0f172a' : '#f8fafc',
                      border: `1px solid ${darkMode ? '#1e293b' : '#f1f5f9'}`,
                      transition: 'all 0.15s',
                    }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: `rgba(13,158,126,0.15)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <SvgIcon name="car" size={16} color={GREEN} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: darkMode ? '#e2e8f0' : '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.prenom ? `${p.prenom} ${p.nom}` : p.nom}
                        </div>
                        <div style={{ fontSize: '11px', color: darkMode ? '#64748b' : '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.villeDepart} → {p.villeArrivee}
                        </div>
                      </div>
                      <span style={{
                        width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                        background: p.statut === 'EN_COURS' ? '#10B981' : '#F59E0B',
                      }} />
                    </div>
                  ))}
                  {filteredPositions.length === 0 && (
                    <div style={{
                      textAlign: 'center', padding: '20px',
                      fontSize: '13px', color: darkMode ? '#475569' : '#94a3b8',
                    }}>
                      Aucun conducteur trouvé
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </AdminLayout>
  );
}
