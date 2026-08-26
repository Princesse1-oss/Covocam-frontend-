'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/admin/AdminLayout';

const API_URL = '/api';

interface Lieu {
  id: number;
  nom: string;
  type: string;
  adresse: string | null;
  latitude: number | null;
  longitude: number | null;
  codePostal: string | null;
  region: string | null;
  departement: string | null;
  pays: string;
  description: string | null;
  estActif: boolean;
  estPrincipal: boolean;
  lieuParent: { id: number; nom: string; type: string } | null;
  dateCreation: string | null;
}

export default function AdminLieuxPage() {
  const router = useRouter();
  const [lieux, setLieux] = useState<Lieu[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('tous');
  const [showForm, setShowForm] = useState(false);
  const [editingLieu, setEditingLieu] = useState<Lieu | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  const [form, setForm] = useState({
    nom: '', type: 'ville', adresse: '', codePostal: '', region: '', departement: '', pays: 'Cameroun', description: '', latitude: '', longitude: '',
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    fetchLieux();
  }, [router]);

  const fetchLieux = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/lieux?all=1`, { headers: { Authorization: `Bearer ${token.replace(/"/g, '').trim()}` } });
      if (res.ok) {
        const data = await res.json();
        setLieux(Array.isArray(data) ? data : []);
      }
    } catch {}
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ nom: '', type: 'ville', adresse: '', codePostal: '', region: '', departement: '', pays: 'Cameroun', description: '', latitude: '', longitude: '' });
    setEditingLieu(null);
    setShowForm(false);
  };

  const handleEdit = (lieu: Lieu) => {
    setEditingLieu(lieu);
    setForm({
      nom: lieu.nom, type: lieu.type, adresse: lieu.adresse || '',
      codePostal: lieu.codePostal || '', region: lieu.region || '', departement: lieu.departement || '',
      pays: lieu.pays, description: lieu.description || '',
      latitude: lieu.latitude?.toString() || '', longitude: lieu.longitude?.toString() || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;
    const cleanToken = token.replace(/"/g, '').trim();
    const payload: any = { nom: form.nom, type: form.type, pays: form.pays };
    if (form.adresse) payload.adresse = form.adresse;
    if (form.codePostal) payload.codePostal = form.codePostal;
    if (form.region) payload.region = form.region;
    if (form.departement) payload.departement = form.departement;
    if (form.description) payload.description = form.description;
    if (form.latitude) payload.latitude = parseFloat(form.latitude);
    if (form.longitude) payload.longitude = parseFloat(form.longitude);

    try {
      const isEdit = !!editingLieu;
      const res = await fetch(`${API_URL}/lieux${isEdit ? `/${editingLieu.id}` : ''}`, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cleanToken}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSuccess(isEdit ? 'Lieu modifié avec succès' : 'Lieu créé avec succès');
        setTimeout(() => setSuccess(''), 3000);
        resetForm();
        fetchLieux();
      } else {
        const data = await res.json();
        setError(data.errors?.join(', ') || data.error || 'Erreur');
        setTimeout(() => setError(''), 4000);
      }
    } catch {
      setError('Erreur serveur');
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleDelete = async (id: number, nom: string) => {
    if (!window.confirm(`Désactiver le lieu "${nom}" ?`)) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/lieux/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token.replace(/"/g, '').trim()}` },
      });
      if (res.ok) {
        setLieux(prev => prev.filter(l => l.id !== id));
        setSuccess('Lieu désactivé');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch {}
  };

  const filtered = lieux.filter(l => {
    const matchesSearch = l.nom.toLowerCase().includes(search.toLowerCase()) || (l.adresse || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'tous' || l.type === filterType;
    return matchesSearch && matchesType;
  });

  const types = ['tous', 'ville', 'quartier', 'adresse', 'point_interet'];
  const typeLabels: Record<string, string> = { tous: 'Tous', ville: 'Ville', quartier: 'Quartier', adresse: 'Adresse', point_interet: 'Point d\'intérêt' };

  if (loading) {
    return <AdminLayout><div style={{ padding: '60px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>Chargement...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}>
        {/* Header */}
        <div style={{ background: '#fff', padding: isMobile ? '12px 16px' : '0 24px', height: isMobile ? 'auto' : '56px', display: 'flex', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', flexShrink: 0, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '10px' : '0' }}>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>Gestion des lieux</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
            <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '7px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', width: isMobile ? '100%' : '200px', flex: isMobile ? 1 : 'none', boxSizing: 'border-box' }} />
            <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fff', color: '#374151' }}>
              {types.map(t => <option key={t} value={t}>{typeLabels[t]}</option>)}
            </select>
            <button onClick={() => { resetForm(); setShowForm(true); }} style={{ padding: '7px 16px', borderRadius: '8px', border: 'none', background: '#22c55e', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>+ Ajouter</button>
          </div>
        </div>

        <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '20px 24px', background: '#f8fafb' }}>
          {/* Messages */}
          {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
          {success && <div style={{ background: '#dcfce7', color: '#15803d', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>{success}</div>}

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
            {[
              { label: 'Total', value: lieux.length, color: '#0D9E7E', bg: '#E8F7F3' },
              { label: 'Villes', value: lieux.filter(l => l.type === 'ville').length, color: '#2563eb', bg: '#dbeafe' },
              { label: 'Quartiers', value: lieux.filter(l => l.type === 'quartier').length, color: '#9333ea', bg: '#f3e8ff' },
              { label: 'Points d\'intérêt', value: lieux.filter(l => l.type === 'point_interet').length, color: '#ea580c', bg: '#fff7ed' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '10px', padding: '16px', border: '1px solid #e5e7eb', borderLeft: `3px solid ${s.color}` }}>
                <div style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: '600' }}>{s.label}</div>
                <div style={{ fontSize: '22px', fontWeight: '700', color: s.color, marginTop: '4px' }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Form modal */}
          {showForm && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
              <div style={{ background: '#fff', borderRadius: '14px', padding: '28px', width: '100%', maxWidth: '520px', maxHeight: '85vh', overflowY: 'auto' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 20px' }}>{editingLieu ? 'Modifier le lieu' : 'Ajouter un lieu'}</h2>
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>Nom *</label>
                      <input required value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>Type *</label>
                      <select required value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}>
                        <option value="ville">Ville</option>
                        <option value="quartier">Quartier</option>
                        <option value="adresse">Adresse</option>
                        <option value="point_interet">Point d&apos;intérêt</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>Pays</label>
                      <input value={form.pays} onChange={e => setForm(p => ({ ...p, pays: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>Adresse</label>
                      <input value={form.adresse} onChange={e => setForm(p => ({ ...p, adresse: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>Latitude</label>
                      <input type="number" step="any" value={form.latitude} onChange={e => setForm(p => ({ ...p, latitude: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>Longitude</label>
                      <input type="number" step="any" value={form.longitude} onChange={e => setForm(p => ({ ...p, longitude: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>Code postal</label>
                      <input value={form.codePostal} onChange={e => setForm(p => ({ ...p, codePostal: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>Région</label>
                      <input value={form.region} onChange={e => setForm(p => ({ ...p, region: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>Description</label>
                      <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button type="button" onClick={resetForm} style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Annuler</button>
                    <button type="submit" style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#22c55e', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>{editingLieu ? 'Modifier' : 'Créer'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Table */}
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['#', 'Nom', 'Type', 'Pays', 'Région', 'GPS', 'Statut'].map(h => (
                      <th key={h} style={{ fontSize: '11px', color: '#c5c8cf', textAlign: 'left', padding: '10px 14px', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: '600', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>Aucun lieu trouvé</td></tr>
                  ) : filtered.map((lieu, i) => (
                    <tr key={lieu.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ padding: '12px 14px', fontSize: '12px', color: '#6b7280' }}>{lieu.id}</td>
                      <td style={{ padding: '12px 14px', fontSize: '13px', color: '#111827', fontWeight: '500' }}>
                        <div>{lieu.nom}</div>
                        {lieu.adresse && <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{lieu.adresse}</div>}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: lieu.type === 'ville' ? '#dbeafe' : lieu.type === 'quartier' ? '#f3e8ff' : lieu.type === 'point_interet' ? '#fff7ed' : '#f3f4f6', color: lieu.type === 'ville' ? '#1d4ed8' : lieu.type === 'quartier' ? '#7c3aed' : lieu.type === 'point_interet' ? '#ea580c' : '#6b7280' }}>
                          {typeLabels[lieu.type] || lieu.type}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '12px', color: '#6b7280' }}>{lieu.pays}</td>
                      <td style={{ padding: '12px 14px', fontSize: '12px', color: '#6b7280' }}>{lieu.region || '—'}</td>
                      <td style={{ padding: '12px 14px', fontSize: '12px', color: '#6b7280' }}>
                        {lieu.latitude && lieu.longitude ? `${lieu.latitude.toFixed(4)}, ${lieu.longitude.toFixed(4)}` : '—'}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: lieu.estActif ? '#dcfce7' : '#fee2e2', color: lieu.estActif ? '#15803d' : '#dc2626' }}>
                            {lieu.estActif ? 'Actif' : 'Inactif'}
                          </span>
                          <button onClick={() => handleEdit(lieu)} style={{ padding: '4px 10px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>Modifier</button>
                          <button onClick={() => handleDelete(lieu.id, lieu.nom)} style={{ padding: '4px 10px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>Désactiver</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </AdminLayout>
  );
}
