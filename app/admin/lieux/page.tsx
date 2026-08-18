'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

interface Lieu {
  id: number;
  nom: string;
  type: 'ville' | 'quartier';
  region: string | null;
  pays: string;
  estActif: boolean;
  estPrincipal: boolean;
  lieuParent: { id: number; nom: string } | null;
  dateCreation: string;
  latitude?: number;
  longitude?: number;
}

// Composant Carte Leaflet chargé dynamiquement
function LieuMap() {
  const [MapContainer, setMapContainer] = useState<any>(null);
  const [TileLayer, setTileLayer] = useState<any>(null);
  const [map, setMap] = useState<any>(null);

  useEffect(() => {
    // Charger les modules Leaflet et React Leaflet dynamiquement
    Promise.all([
      import('leaflet'),
      import('react-leaflet'),
    ]).then(([leafletModule, reactLeafletModule]) => {
      setMapContainer(reactLeafletModule.MapContainer);
      setTileLayer(reactLeafletModule.TileLayer);

      // Charger le CSS Leaflet
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    });
  }, []);

  // Appliquer les bounds une fois la carte chargée
  useEffect(() => {
    if (map) {
      // Bounds précis du Cameroun (excluant les pays voisins)
      const cameroonBounds = [
        [1.4, 8.4],   // Sud-Ouest (plus précis)
        [13.0, 16.2]  // Nord-Est (plus précis)
      ];
      map.fitBounds(cameroonBounds);
      map.setMaxBounds(cameroonBounds);
      map.setMinZoom(6);
      map.setMaxZoom(15);
      map.setView([7.3697, 12.3547], 7);
    }
  }, [map]);

  if (!MapContainer || !TileLayer) {
    return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>Chargement de la carte...</div>;
  }

  return (
    <MapContainer
      center={[7.3697, 12.3547]}
      zoom={6}
      style={{ height: '100%', width: '100%' }}
      ref={setMap}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  );
}

export default function AdminLieux() {
  const [lieux, setLieux] = useState<Lieu[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('tous');
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [editingLieu, setEditingLieu] = useState<Lieu | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    type: 'ville',
    region: '',
    pays: 'Cameroun',
    estActif: true,
    estPrincipal: false,
    lieuParentId: '',
    latitude: '',
    longitude: ''
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!token) { window.location.href = '/login'; return; }
    if (userData) {
      const parsed = JSON.parse(userData);
      if (!parsed.roles?.includes('ROLE_ADMIN')) { window.location.href = '/login'; return; }
      setUser(parsed);
    }
    fetchLieux();
  }, []);

  const fetchLieux = async () => {
    try {
      const res = await fetch('/api/lieux', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLieux(Array.isArray(data) ? data : data.lieux || []);
    } catch {
      setLieux([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        nom: formData.nom,
        type: formData.type,
        region: formData.region || null,
        pays: formData.pays,
        estActif: formData.estActif,
        estPrincipal: formData.estPrincipal,
        lieuParentId: formData.lieuParentId ? parseInt(formData.lieuParentId) : null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null
      };

      const url = editingLieu 
        ? `/api/lieux/${editingLieu.id}`
        : '/api/lieux';
      
      const method = editingLieu ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchLieux();
        setShowModal(false);
        setEditingLieu(null);
        setFormData({ nom: '', type: 'ville', region: '', pays: 'Cameroun', estActif: true, estPrincipal: false, lieuParentId: '', latitude: '', longitude: '' });
      } else {
        const error = await res.json();
        alert(error.message || 'Erreur lors de l\'enregistrement');
      }
    } catch {
      alert('Erreur de connexion');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer définitivement ce lieu ?')) return;
    try {
      await fetch(`/api/lieux/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLieux();
    } catch {
      alert('Erreur lors de la suppression');
    }
  };

  const openEditModal = (lieu: Lieu) => {
    setEditingLieu(lieu);
    setFormData({
      nom: lieu.nom,
      type: lieu.type,
      region: lieu.region || '',
      pays: lieu.pays,
      estActif: lieu.estActif,
      estPrincipal: lieu.estPrincipal,
      lieuParentId: lieu.lieuParent ? String(lieu.lieuParent.id) : '',
      latitude: lieu.latitude ? String(lieu.latitude) : '',
      longitude: lieu.longitude ? String(lieu.longitude) : ''
    });
    setShowModal(true);
  };

  const villes = lieux.filter(l => l.type === 'ville');
  const filtered = lieux.filter(l => {
    const matchSearch = l.nom.toLowerCase().includes(search.toLowerCase()) ||
      (l.region || '').toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'tous' || l.type === filterType;
    return matchSearch && matchType;
  });


  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)' }}>
          <p style={{ color: '#6b7280' }}>Chargement...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>

      <div style={{ width: '100%', height: 'calc(100vh - 64px)' }}>
        <LieuMap />
      </div>

      {/* Modal Ajout/Modification */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>
                {editingLieu ? 'Modifier le lieu' : 'Ajouter un lieu'}
              </h2>
              <button onClick={() => { setShowModal(false); setEditingLieu(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', padding: '4px' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Nom *</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={e => setFormData({ ...formData, nom: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Type *</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as 'ville' | 'quartier' })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#fff' }}
                >
                  <option value="ville">Ville</option>
                  <option value="quartier">Quartier</option>
                </select>
              </div>

              {formData.type === 'quartier' && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Ville parente</label>
                  <select
                    value={formData.lieuParentId}
                    onChange={e => setFormData({ ...formData, lieuParentId: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#fff' }}
                  >
                    <option value="">Aucune</option>
                    {villes.map(v => (
                      <option key={v.id} value={v.id}>{v.nom}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Région</label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={e => setFormData({ ...formData, region: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  placeholder="Ex: Centre, Littoral..."
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  placeholder="Ex: 3.8488"
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  placeholder="Ex: 11.5021"
                />
              </div>

              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.estActif}
                    onChange={e => setFormData({ ...formData, estActif: e.target.checked })}
                  />
                  Actif
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.estPrincipal}
                    onChange={e => setFormData({ ...formData, estPrincipal: e.target.checked })}
                  />
                  Principal
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  style={{ flex: 1, background: '#7C3AED', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                >
                  {editingLieu ? 'Mettre à jour' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingLieu(null); }}
                  style={{ padding: '10px 20px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}