'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ConducteurLayout from '../../../components/conducteur/ConducteurLayout';
import { useTheme } from '@/app/lib/ThemeContext';

interface Vehicule {
  id: number;
  marque: string;
  modele: string;
  annee: number;
  couleur: string;
  immatriculation: string;
  nbPlaces: number;
  carburant?: string;
  boiteVitesse?: string;
  climatisation: boolean;
  gps: boolean;
  description?: string;
  photoAvant?: string;
  photoArriere?: string;
  estDefaut?: boolean;
}

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
    x: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    ),
    edit: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
    plus: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8V16M8 12H16"/>
      </svg>
    ),
    check: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    alert: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    snowflake: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="2" x2="12" y2="22"/><line x1="12" y1="2" x2="16" y2="6"/><line x1="12" y1="2" x2="8" y2="6"/><line x1="12" y1="22" x2="16" y2="18"/><line x1="12" y1="22" x2="8" y2="18"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="12" x2="6" y2="16"/><line x1="2" y1="12" x2="6" y2="8"/><line x1="22" y1="12" x2="18" y2="16"/><line x1="22" y1="12" x2="18" y2="8"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/><line x1="4.93" y1="4.93" x2="8" y2="8"/><line x1="4.93" y1="4.93" x2="6" y2="6"/><line x1="19.07" y1="19.07" x2="16" y2="16"/><line x1="19.07" y1="19.07" x2="18" y2="18"/><line x1="4.93" y1="19.07" x2="19.07" y2="4.93"/><line x1="4.93" y1="19.07" x2="8" y2="16"/><line x1="4.93" y1="19.07" x2="6" y2="18"/><line x1="19.07" y1="4.93" x2="16" y2="8"/><line x1="19.07" y1="4.93" x2="18" y2="6"/>
      </svg>
    ),
    mapPin: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    camera: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
      </svg>
    ),
    palette: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
      </svg>
    ),
    seat: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 10v6h2v-6H4z"/><path d="M18 10v6h2v-6h-2z"/><path d="M6 16v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2"/><path d="M5 10a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2H5v-2z"/>
      </svg>
    ),
    fuel: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 22v-8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v8"/><path d="M18 9V2h4"/><path d="M14 22v-4a2 2 0 0 1 2-2h4"/>
      </svg>
    ),
    settings: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
    trash: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      </svg>
    ),
    lightbulb: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-7 7c0 2 1 3.5 2 5a5 5 0 0 1 1 3v1h8v-1a5 5 0 0 1 1-3c1-1.5 2-3 2-5a7 7 0 0 0-7-7z"/>
      </svg>
    ),
  };
  return <span style={{ lineHeight: 0, display: 'inline-flex' }}>{icons[name] || null}</span>;
};

const MARQUES = ['Toyota', 'Peugeot', 'Mercedes-Benz', 'Hyundai', 'Kia', 'Renault', 'Nissan', 'Ford', 'Honda', 'Volkswagen', 'BMW', 'Suzuki', 'Mitsubishi', 'Autre'];
const COULEURS = ['Blanc', 'Noir', 'Gris', 'Rouge', 'Bleu', 'Argent', 'Beige', 'Vert', 'Autre'];
const ANNEES = Array.from({ length: 36 }, (_, i) => new Date().getFullYear() - i);

export default function MesVehicules() {
  const router = useRouter();
  const { t, darkMode } = useTheme();
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    marque: '', modele: '', annee: new Date().getFullYear(), couleur: '',
    immatriculation: '', nbPlaces: 4, carburant: 'Essence', boiteVitesse: 'Manuelle',
    climatisation: true, gps: false, description: ''
  });

  const [photoAvant, setPhotoAvant] = useState<File | null>(null);
  const [photoArriere, setPhotoArriere] = useState<File | null>(null);

  const [previewAvant, setPreviewAvant] = useState('');
  const [previewArriere, setPreviewArriere] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    
    const cleanToken = token.replace(/"/g, '').trim();
    fetchVehicules(cleanToken);
  }, [router]);

  const fetchVehicules = async (token: string, retryCount = 0) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch(`${API_URL}/conducteur/vehicule`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }

      if (!res.ok && retryCount < 2) {
        console.warn(`Retry ${retryCount + 1}/2 pour /api/conducteur/vehicule (status: ${res.status})`);
        setTimeout(() => fetchVehicules(token, retryCount + 1), 3000);
        return;
      }

      const data = await res.json();
      if (data.hasVehicule && data.vehicule) {
        setVehicules([{ ...data.vehicule, estDefaut: true }]);
      } else {
        setVehicules([]);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        if (retryCount < 2) {
          console.warn(`⏱️ Timeout, retry ${retryCount + 1}/2...`);
          fetchVehicules(token, retryCount + 1);
        } else {
          console.warn("⏱️ Timeout définitif après 3 tentatives.");
          setVehicules([]);
        }
      } else {
        console.error("Erreur réseau lors du chargement des véhicules:", err);
        if (retryCount < 2) {
          setTimeout(() => fetchVehicules(token, retryCount + 1), 3000);
        } else {
          setVehicules([]);
        }
      }
      setVehicules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'annee' || name === 'nbPlaces' ? Number(value) : value)
    }));
  };

  const handleFileChange = (file: File | null, setter: React.Dispatch<React.SetStateAction<File | null>>, previewSetter: React.Dispatch<React.SetStateAction<string>>) => {
    if (file) {
      setter(file);
      const reader = new FileReader();
      reader.onloadend = () => previewSetter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const validateImmatriculation = (immat: string) => /^[A-Z]{2}-\d{4}-[A-Z]{2}$/.test(immat.toUpperCase());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const immatUpper = formData.immatriculation.toUpperCase();
    if (!validateImmatriculation(immatUpper)) {
      setError(t('invalidLicensePlate'));
      return;
    }

    if (vehicules.length === 0 && (!photoAvant || !photoArriere)) {
      setError(t('photosRequired'));
      return;
    }

    const token = localStorage.getItem('token');
    setSubmitting(true);

    const payload = new FormData();
    payload.append('data', JSON.stringify({ ...formData, immatriculation: immatUpper }));
    
    if (photoAvant) payload.append('photoAvant', photoAvant);
    if (photoArriere) payload.append('photoArriere', photoArriere);

    try {
      const method = vehicules.length > 0 ? 'PUT' : 'POST';
      const res = await fetch(`${API_URL}/conducteur/vehicule`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });
      
      const data = await res.json();
      if (res.ok) {
        setSuccess(vehicules.length > 0 ? t('vehicleUpdated') : t('vehicleAdded'));
        setShowForm(false);
        setFormData({ marque: '', modele: '', annee: new Date().getFullYear(), couleur: '', immatriculation: '', nbPlaces: 4, carburant: 'Essence', boiteVitesse: 'Manuelle', climatisation: true, gps: false, description: '' });
        setPhotoAvant(null); setPhotoArriere(null);
        setPreviewAvant(''); setPreviewArriere('');
        fetchVehicules(token!);
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError(data.error || t('error'));
      }
    } catch {
      setError(t('serverError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirmDeleteId !== id) { setConfirmDeleteId(id); return; }
    setConfirmDeleteId(null);
    const token = localStorage.getItem('token');
    setDeletingId(id);
    try {
      await fetch(`${API_URL}/conducteur/vehicule/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicules([]);
      setSuccess(t('vehicleDeleted'));
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError(t('deleteError'));
      setTimeout(() => setError(''), 4000);
    } finally {
      setDeletingId(null);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px',
    background: darkMode ? '#2D2D2D' : '#fff',
    border: `1px solid ${darkMode ? '#2A2A2A' : '#e5e7eb'}`,
    borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    color: darkMode ? '#FFFFFF' : '#111827',
    transition: 'border-color .2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '12px', fontWeight: '700',
    color: darkMode ? '#9CA3AF' : '#374151',
    marginBottom: '6px', letterSpacing: '.3px',
  };

  if (loading) {
    return (
      <ConducteurLayout>
        <div style={{ textAlign: 'center', padding: '80px', color: darkMode ? '#9CA3AF' : '#6b7280' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}><Icon name="car" size={48} /></div>
          <p>{t('loading')}</p>
        </div>
      </ConducteurLayout>
    );
  }

  return (
    <ConducteurLayout>
      {error && (
        <div style={{ padding: '12px 16px', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626', fontSize: '13px', fontWeight: '600' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          {error}
        </div>
      )}
      {success && (
        <div style={{ padding: '12px 16px', background: '#DCFCE7', border: '1px solid #BBF7D0', borderRadius: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#15803D', fontSize: '13px', fontWeight: '600' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          {success}
        </div>
      )}
      {confirmDeleteId !== null && (
        <div style={{ marginBottom: '16px', padding: '16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#DC2626' }}>{t('confirmDelete')}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setConfirmDeleteId(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#FFF', color: '#374151', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>{t('cancel')}</button>
            <button onClick={() => handleDelete(confirmDeleteId)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#DC2626', color: '#FFF', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>{t('delete')}</button>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: darkMode ? '#FFFFFF' : '#111827', margin: '0 0 4px' }}>
            {t('myVehicle')} <Icon name="car" size={24} />
          </h1>
          <p style={{ fontSize: '13px', color: darkMode ? '#9CA3AF' : '#6b7280' }}>
            {t('vehicleDescription')}
          </p>
        </div>
        {!showForm && (
          <button onClick={() => { setShowForm(true); setError(''); }} style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', border: 'none',
            background: `linear-gradient(135deg, ${E}, ${ED})`, color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
            boxShadow: `0 4px 15px rgba(13,158,126,0.3)`,
          }}>
            <Icon name="plus" size={16} color="#fff" /> {t('addVehicle')}
          </button>
        )}
      </div>

      {!showForm && vehicules.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: darkMode ? '#1A1A1A' : '#fff', borderRadius: '16px', border: `1px dashed ${darkMode ? '#333' : '#d1d5db'}` }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: EL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Icon name="car" size={36} color={E} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: darkMode ? '#fff' : '#111827', margin: '0 0 8px' }}>
            {t('addVehicle')}
          </h3>
          <p style={{ fontSize: '13px', color: darkMode ? '#9CA3AF' : '#6b7280', margin: '0 0 24px', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.5' }}>
            {t('vehicleDescription')}
          </p>
          <button onClick={() => { setShowForm(true); setError(''); }} style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '12px', border: 'none',
            background: `linear-gradient(135deg, ${E}, ${ED})`, color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
            boxShadow: `0 4px 15px rgba(13,158,126,0.4)`,
          }}>
            <Icon name="plus" size={16} color="#fff" /> {t('addVehicle')}
          </button>
        </div>
      )}

      {success && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', color: '#15803d', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon name="check" size={16} color="#15803d" /> {success}
        </div>
      )}

      {showForm && (
        <div style={{ background: darkMode ? '#1A1A1A' : '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '28px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `linear-gradient(135deg, ${E}, ${ED})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}><Icon name="car" size={20} color="white" /></div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: darkMode ? '#FFFFFF' : '#111827', margin: 0 }}>{vehicules.length > 0 ? t('editVehicle') : t('addVehicle')}</h3>
              <p style={{ fontSize: '12px', color: darkMode ? '#9CA3AF' : '#6b7280', margin: 0 }}>{t('requiredFields')}</p>
            </div>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px', marginBottom: '20px', color: '#dc2626', fontSize: '13px' }}>
              <Icon name="alert" size={16} color="#dc2626" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>{t('brand')} *</label>
                <select name="marque" value={formData.marque} onChange={handleChange} required style={inputStyle}>
                  <option value="">{t('choose')}...</option>
                  {MARQUES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>{t('model')} *</label>
                <input type="text" name="modele" value={formData.modele} onChange={handleChange} required placeholder={t('modelPlaceholder')} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{t('year')} *</label>
                <select name="annee" value={formData.annee} onChange={handleChange} required style={inputStyle}>
                  {ANNEES.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>{t('color')} *</label>
                <select name="couleur" value={formData.couleur} onChange={handleChange} required style={inputStyle}>
                  <option value="">{t('choose')}...</option>
                  {COULEURS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>{t('licensePlate')} *</label>
                <input
                  type="text" name="immatriculation" value={formData.immatriculation} onChange={handleChange} required 
                  placeholder={t('licensePlatePlaceholder')} 
                  style={{ ...inputStyle, textTransform: 'uppercase', borderColor: formData.immatriculation && !validateImmatriculation(formData.immatriculation) ? '#ef4444' : '#e5e7eb' }}
                />
                <div style={{ fontSize: '10px', color: darkMode ? '#9CA3AF' : '#9ca3af', marginTop: '4px' }}>{t('licensePlateFormat')}</div>
              </div>
              <div>
                <label style={labelStyle}>{t('seats')} *</label>
                <select name="nbPlaces" value={formData.nbPlaces} onChange={handleChange} required style={inputStyle}>
                  {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} {t('places')}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>{t('fuelType')}</label>
                <select name="carburant" value={formData.carburant} onChange={handleChange} style={inputStyle}>
                  <option value="Essence">{t('gasoline')}</option>
                  <option value="Diesel">{t('diesel')}</option>
                  <option value="Hybride">{t('hybrid')}</option>
                  <option value="Électrique">{t('electric')}</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>{t('transmission')}</label>
                <select name="boiteVitesse" value={formData.boiteVitesse} onChange={handleChange} style={inputStyle}>
                  <option value="Manuelle">{t('manual')}</option>
                  <option value="Automatique">{t('automatic')}</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '24px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: darkMode ? '#FFFFFF' : '#374151' }}>
                <input type="checkbox" name="climatisation" checked={formData.climatisation} onChange={handleChange} style={{ width: '16px', height: '16px', accentColor: E }} />
                <Icon name="snowflake" size={14} /> {t('airConditioning')}
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: darkMode ? '#FFFFFF' : '#374151' }}>
                <input type="checkbox" name="gps" checked={formData.gps} onChange={handleChange} style={{ width: '16px', height: '16px', accentColor: E }} />
                <Icon name="mapPin" size={14} /> GPS
              </label>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>{t('description')} ({t('optional')})</label>
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder={t('descriptionPlaceholder')} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} maxLength={300} />
              <div style={{ fontSize: '10px', color: darkMode ? '#9CA3AF' : '#9ca3af', marginTop: '4px', textAlign: 'right' }}>{formData.description.length}/300</div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ ...labelStyle, marginBottom: '12px' }}><Icon name="camera" size={14} /> {t('vehiclePhotos')}</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[
                  { label: t('front') + ' *', file: photoAvant, setFile: setPhotoAvant, preview: previewAvant, setPreview: setPreviewAvant },
                  { label: t('rear') + ' *', file: photoArriere, setFile: setPhotoArriere, preview: previewArriere, setPreview: setPreviewArriere },
                ].map((photo, idx) => (
                  <div key={idx}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: darkMode ? '#9CA3AF' : '#374151', marginBottom: '6px', display: 'block' }}>{photo.label}</label>
                    <label style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      height: '180px', border: `2px dashed ${photo.preview ? E : '#d1d5db'}`,
                      borderRadius: '12px', cursor: 'pointer', background: photo.preview ? EL : (darkMode ? '#2D2D2D' : '#f9fafb'),
                      overflow: 'hidden', position: 'relative', transition: 'all 0.2s'
                    }}
                      onMouseEnter={e => { if (!photo.preview) e.currentTarget.style.borderColor = E; e.currentTarget.style.transform = 'scale(1.02)'; }}
                      onMouseLeave={e => { if (!photo.preview) e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                      {photo.preview ? (
                        <img src={photo.preview} alt={photo.label} style={{ width: '100%', height: '100%', objectFit: 'cover', imageRendering: 'auto' }} />
                      ) : (
                        <>
                          <span style={{ marginBottom: '8px' }}><Icon name="camera" size={32} color={GR} /></span>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: darkMode ? '#6B7280' : '#9ca3af' }}>{t('addPhoto')}</span>
                        </>
                      )}
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileChange(e.target.files?.[0] || null, photo.setFile, photo.setPreview)} />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
              <button type="button" onClick={() => {
                setShowForm(false);
                setPreviewAvant(''); setPreviewArriere('');
              }} style={{ padding: '10px 20px', background: darkMode ? '#2D2D2D' : '#f3f4f6', border: 'none', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', fontWeight: '600', color: darkMode ? '#9CA3AF' : '#374151' }}>
                {t('cancel')}
              </button>
              <button type="submit" disabled={submitting} style={{
                padding: '10px 24px', background: submitting ? '#d1d5db' : `linear-gradient(135deg, ${E}, ${ED})`,
                border: 'none', borderRadius: '10px', fontSize: '14px', cursor: submitting ? 'not-allowed' : 'pointer',
                fontWeight: '700', color: '#fff', boxShadow: `0 4px 15px rgba(13,158,126,0.3)`,
              }}>
                {submitting ? t('loading') : (vehicules.length > 0 ? <><Icon name="check" size={14} color="white" /> {t('update')}</> : <><Icon name="check" size={14} color="white" /> {t('addVehicle')}</>)}
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && vehicules.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: '16px' }}>
          {vehicules.map(v => (
            <div key={v.id} style={{
              background: darkMode ? '#1A1A1A' : '#fff',
              borderRadius: '16px', border: `2px solid ${E}`, overflow: 'hidden',
              boxShadow: `0 4px 20px rgba(13,158,126,0.15)`,
            }}>
              <div style={{ background: `linear-gradient(135deg, ${E}, ${ED})`, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '28px' }}><Icon name="car" size={28} color="white" /></span>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#fff' }}>{v.marque} {v.modele} ({v.annee})</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontFamily: 'monospace', fontWeight: '700' }}>{v.immatriculation}</div>
                  </div>
                </div>
                <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px' }}><Icon name="check" size={10} color="white" /> {t('default')}</span>
              </div>

              {(v.photoAvant || v.photoArriere) && (
                <div style={{ padding: '0' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: v.photoAvant && v.photoArriere ? '1fr 1fr' : '1fr',
                    gap: '3px',
                    borderRadius: '0',
                    overflow: 'hidden',
                    height: '240px',
                  }}>
                    {v.photoAvant && (
                      <div style={{ overflow: 'hidden', background: darkMode ? '#2D2D2D' : '#f3f4f6' }}>
                        <img src={v.photoAvant} alt={t('front')} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s', imageRendering: 'auto', backfaceVisibility: 'hidden' }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                      </div>
                    )}
                    {v.photoArriere && (
                      <div style={{ overflow: 'hidden', background: darkMode ? '#2D2D2D' : '#f3f4f6' }}>
                        <img src={v.photoArriere} alt={t('rear')} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s', imageRendering: 'auto', backfaceVisibility: 'hidden' }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                  {[
                    { label: t('color'), value: v.couleur, icon: <Icon name="palette" size={12} /> },
                    { label: t('seats'), value: `${v.nbPlaces} ${t('places')}`, icon: <Icon name="seat" size={12} /> },
                    { label: t('fuelType'), value: v.carburant || t('notAvailable'), icon: <Icon name="fuel" size={12} /> },
                    { label: t('transmission'), value: v.boiteVitesse || t('notAvailable'), icon: <Icon name="settings" size={12} /> },
                  ].map((item, i) => (
                    <div key={i} style={{ background: darkMode ? '#2D2D2D' : '#f9fafb', borderRadius: '8px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '11px', color: darkMode ? '#9CA3AF' : '#9ca3af', marginBottom: '3px' }}>{item.icon} {item.label}</div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: darkMode ? '#FFFFFF' : '#111827' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  {v.climatisation && <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '4px 8px', borderRadius: '6px', fontWeight: '600' }}><Icon name="snowflake" size={11} color="#15803d" /> {t('airConditioning')}</span>}
                  {v.gps && <span style={{ fontSize: '11px', background: '#dbeafe', color: '#1d4ed8', padding: '4px 8px', borderRadius: '6px', fontWeight: '600' }}><Icon name="mapPin" size={11} color="#1d4ed8" /> GPS</span>}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => { 
                    setFormData({ 
                      marque: v.marque, modele: v.modele, annee: v.annee, couleur: v.couleur, 
                      immatriculation: v.immatriculation, nbPlaces: v.nbPlaces, 
                      carburant: v.carburant || 'Essence', boiteVitesse: v.boiteVitesse || 'Manuelle', 
                      climatisation: v.climatisation, gps: v.gps, description: v.description || '' 
                    }); 
                    setPreviewAvant(v.photoAvant ? `${v.photoAvant}` : '');
                    setPreviewArriere(v.photoArriere ? `${v.photoArriere}` : '');
                    setShowForm(true); 
                  }} style={{
                    flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid rgba(13,158,126,0.3)`, background: 'rgba(13,158,126,0.05)', color: E, fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                  }}>
                    <Icon name="edit" size={13} /> {t('edit')}
                  </button>
                  <button onClick={() => handleDelete(v.id)} disabled={deletingId === v.id} style={{
                    padding: '10px 14px', borderRadius: '8px', border: '1px solid #fca5a5', background: '#fee2e2', color: '#dc2626', fontSize: '13px', fontWeight: '600', cursor: deletingId === v.id ? 'not-allowed' : 'pointer',
                  }}>
                    {deletingId === v.id ? '...' : <Icon name="trash" size={13} color="#dc2626" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!showForm && vehicules.length > 0 && (
        <div style={{ marginTop: '24px', padding: '16px 20px', background: EL, borderRadius: '12px', border: `1px solid rgba(13,158,126,0.2)`, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}><Icon name="lightbulb" size={20} color={E} /></span>
          <p style={{ fontSize: '13px', color: E, margin: 0, lineHeight: '1.5' }}>
            {t('vehicleInfo')}
          </p>
        </div>
      )}

    </ConducteurLayout>
  );
}