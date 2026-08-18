'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ConducteurLayout from '../../../../../components/conducteur/ConducteurLayout';
import { useTheme } from '@/app/lib/ThemeContext';

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
    edit: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
    arrowLeft: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
    ),
    check: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
    ),
    alert: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  };
  return <span style={{ lineHeight: 0, display: 'inline-flex' }}>{icons[name] || null}</span>;
};

export default function ModifierTrajetPage() {
  const router = useRouter();
  const params = useParams();
  // ✅ CORRECTION : useTheme contient t() et darkMode
  const { t, darkMode } = useTheme();
  const id = params.id;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [form, setForm] = useState({
    villeDepart: '',
    quartierDepart: '',
    villeArrivee: '',
    quartierArrivee: '',
    dateDepart: '',
    heureDepart: '',
    heureArriveeEstimee: '',
    nbPlaces: 1,
    prixParPassager: 0,
    description: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const cleanToken = token.replace(/"/g, '').trim();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    fetch(`${API_URL}/trajets/${id}`, {
      headers: { Authorization: `Bearer ${cleanToken}` },
      signal: controller.signal,
    })
      .then(async (r) => {
        clearTimeout(timeoutId);
        
        if (r.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }
        
        const text = await r.text();
        if (!r.ok) throw new Error('Trajet non trouvé');
        return JSON.parse(text);
      })
      .then(data => {
        const dateObj = data.dateDepart ? new Date(data.dateDepart) : new Date();
        setForm({
          villeDepart: data.villeDepart || '',
          quartierDepart: data.quartierDepart || '',
          villeArrivee: data.villeArrivee || '',
          quartierArrivee: data.quartierArrivee || '',
          dateDepart: dateObj.toISOString().split('T')[0],
          heureDepart: data.heureDepart ? data.heureDepart.substring(0, 5) : (dateObj ? dateObj.toTimeString().split(' ')[0].substring(0, 5) : ''),
          heureArriveeEstimee: data.heureArriveeEstimee ? data.heureArriveeEstimee.substring(0, 5) : '',
          nbPlaces: data.placesDisponibles || 1,
          prixParPassager: data.prixParPlace || 0,
          description: data.description || '',
        });
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || t('loadError'));
        setLoading(false);
      });
  }, [id, router, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'nbPlaces' || name === 'prixParPassager' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const token = localStorage.getItem('token');

    const payload = {
      villeDepart: form.villeDepart,
      quartierDepart: form.quartierDepart,
      villeArrivee: form.villeArrivee,
      quartierArrivee: form.quartierArrivee,
      dateDepart: form.dateDepart,
      heureDepart: form.heureDepart,
      heureArriveeEstimee: form.heureArriveeEstimee,
      placesDisponibles: form.nbPlaces,
      prixParPlace: form.prixParPassager,
      description: form.description,
    };

    try {
      const response = await fetch(`${API_URL}/conducteur/trajets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errorMessage = t('unknownError');
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || JSON.stringify(errorData);
        } catch (e) {
          errorMessage = responseText;
        }
        setError(errorMessage);
        return;
      }

      setSuccess(t('tripUpdated'));
      setTimeout(() => router.push('/conducteur/trajets'), 1500);
      
    } catch (err) {
      setError(t('serverError'));
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px',
    background: darkMode ? '#2D2D2D' : '#fff',
    border: `1px solid ${darkMode ? '#2A2A2A' : '#e5e7eb'}`,
    borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    color: darkMode ? '#FFFFFF' : '#111827',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '12px', fontWeight: '700',
    color: darkMode ? '#9CA3AF' : '#374151',
    marginBottom: '6px',
  };

  if (loading) {
    return (
      <ConducteurLayout>
        <div style={{ textAlign: 'center', padding: '80px', color: darkMode ? '#9CA3AF' : '#6b7280' }}>
          <p>{t('loading')}</p>
        </div>
      </ConducteurLayout>
    );
  }

  return (
    <ConducteurLayout>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: darkMode ? '#FFFFFF' : '#111827', margin: '0 0 4px' }}>
          <Icon name="edit" size={24} /> {t('editTrip')}
        </h1>
        <p style={{ fontSize: '13px', color: darkMode ? '#9CA3AF' : '#6b7280' }}>{t('editTripDesc')}</p>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', color: '#dc2626', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon name="alert" size={16} color="#dc2626" /> {error}
        </div>
      )}

      {success && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', color: '#15803d', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon name="check" size={16} color="#15803d" /> {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ background: darkMode ? '#1A1A1A' : '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '28px', marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label style={labelStyle}><span style={{ color: '#22c55e' }}>&#9679;</span> {t('departureCity')} *</label>
              <input type="text" name="villeDepart" value={form.villeDepart} onChange={handleChange} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}><span style={{ color: '#3b82f6' }}>&#9679;</span> {t('departureLocation')} *</label>
              <input type="text" name="quartierDepart" value={form.quartierDepart} onChange={handleChange} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}><span style={{ color: '#ef4444' }}>&#9679;</span> {t('arrivalCity')} *</label>
              <input type="text" name="villeArrivee" value={form.villeArrivee} onChange={handleChange} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}><span style={{ color: '#3b82f6' }}>&#9679;</span> {t('arrivalLocation')} *</label>
              <input type="text" name="quartierArrivee" value={form.quartierArrivee} onChange={handleChange} required style={inputStyle} />
            </div>
          </div>
        </div>

        <div style={{ background: darkMode ? '#1A1A1A' : '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '28px', marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label style={labelStyle}>{t('departureDate')} *</label>
              <input type="date" name="dateDepart" value={form.dateDepart} onChange={handleChange} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t('departureTime')} *</label>
              <input type="time" name="heureDepart" value={form.heureDepart} onChange={handleChange} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t('estimatedArrival')} *</label>
              <input 
                type="time" 
                name="heureArriveeEstimee" 
                value={form.heureArriveeEstimee} 
                onChange={handleChange} 
                required 
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={labelStyle}>{t('seats')} *</label>
              <input type="number" name="nbPlaces" value={form.nbPlaces} onChange={handleChange} min={1} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t('pricePerPassenger')} (FCFA) *</label>
              <input type="number" name="prixParPassager" value={form.prixParPassager} onChange={handleChange} min={500} step={100} required style={inputStyle} />
            </div>
          </div>
        </div>

        <div style={{ background: darkMode ? '#1A1A1A' : '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '28px', marginBottom: '24px' }}>
          <label style={labelStyle}>{t('description')} ({t('optional')})</label>
          <textarea name="description" value={form.description} onChange={handleChange} style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} maxLength={500} />
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => router.push('/conducteur/trajets')} style={{ padding: '12px 24px', borderRadius: '10px', border: '1px solid #e5e7eb', background: darkMode ? '#1A1A1A' : '#fff', color: darkMode ? '#FFFFFF' : '#374151', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }} disabled={submitting}>
            {t('cancel')}
          </button>
          <button type="submit" disabled={submitting} style={{ padding: '12px 28px', borderRadius: '10px', border: 'none', background: submitting ? '#d1d5db' : '#0D9E7E', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: submitting ? 'not-allowed' : 'pointer' }}>
            {submitting ? t('saving') : t('saveChanges')}
          </button>
        </div>
      </form>
    </ConducteurLayout>
  );
}