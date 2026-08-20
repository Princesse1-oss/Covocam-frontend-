'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ConducteurLayout from '../../../components/conducteur/ConducteurLayout';
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
    settings: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
    car: (
      <svg style={s} viewBox="0 0 24 24" fill="none">
        <path d="M5 11L6.5 6.5C6.8 5.6 7.6 5 8.6 5H15.4C16.4 5 17.2 5.6 17.5 6.5L19 11" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <rect x="2" y="11" width="20" height="7" rx="2" stroke={color} strokeWidth="2" fill={EL}/>
        <circle cx="7" cy="18" r="2" stroke={color} strokeWidth="2" fill="white"/>
        <circle cx="17" cy="18" r="2" stroke={color} strokeWidth="2" fill="white"/>
      </svg>
    ),
    camera: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
      </svg>
    ),
    save: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
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
  };
  return <span style={{ lineHeight: 0, display: 'inline-flex' }}>{icons[name] || null}</span>;
};

const getFullPhotoUrl = (photoPath: string | null | undefined) => {
  if (!photoPath || photoPath === 'null' || photoPath === 'undefined') return null;
  const cleanPath = photoPath.trim();
  if (cleanPath.startsWith('http')) return cleanPath;
  if (cleanPath.startsWith('/uploads/')) return cleanPath;
  return `/uploads/profils/${cleanPath}`;
};

export default function ConducteurProfilPage() {
  const router = useRouter();
  // ✅ CORRECTION : useTheme contient t() et darkMode
  const { t, darkMode } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    fetch(`${API_URL}/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          console.error("❌ ERREUR BRUTE DU BACKEND:", errorText);
          throw new Error(`Erreur serveur ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        const fullPhotoUrl = getFullPhotoUrl(data.photo);
        const userWithFullPhoto = { ...data, photo: fullPhotoUrl };
        setUser(userWithFullPhoto);
        if (fullPhotoUrl) setPreviewUrl(fullPhotoUrl);
        localStorage.setItem('user', JSON.stringify(userWithFullPhoto));
        setLoading(false);
      })
      .catch((err) => {
        console.error("💥 Échec du chargement du profil:", err);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        router.push('/login');
      });
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: t('fileTooLarge') });
        return;
      }
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: t('invalidImage') });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setMessage(null);
    }
  };

  const handleUploadPhoto = async () => {
    if (!selectedFile || !user) return;
    setUploading(true);
    setMessage(null);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('photo', selectedFile);

    try {
      const res = await fetch(`${API_URL}/upload/profil`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const responseText = await res.text();
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error("Réponse serveur invalide : " + responseText);
      }
      
      const data = JSON.parse(responseText.substring(jsonStart, jsonEnd));
      
      if (res.ok) {
        const fullPhotoUrl = getFullPhotoUrl(data.filename.trim());
        const updatedUser = { ...user, photo: fullPhotoUrl };
        setUser(updatedUser);
        setPreviewUrl(fullPhotoUrl);
        setSelectedFile(null);
        setMessage({ type: 'success', text: t('photoUpdated') });
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('user-updated'));
      } else {
        setMessage({ type: 'error', text: data.error || data.message || t('uploadError') });
      }
    } catch (err: any) {
      console.error("💥 Erreur upload:", err);
      setMessage({ type: 'error', text: err.message || t('serverError') });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage(null);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/utilisateurs/profil`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom: user.nom,
          prenom: user.prenom,
          telephone: user.telephone,
          biographie: user.biographie,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: t('profileUpdated') });
        const updatedUser = { ...user, ...data.user, photo: user.photo };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('user-updated'));
      } else {
        setMessage({ type: 'error', text: data.error || t('updateError') });
      }
    } catch {
      setMessage({ type: 'error', text: t('serverError') });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ConducteurLayout>
        <div style={{ textAlign: 'center', padding: '80px', color: darkMode ? '#9CA3AF' : '#6b7280' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}><Icon name="settings" size={48} /></div>
          <p>{t('loading')}</p>
        </div>
      </ConducteurLayout>
    );
  }

  const initials = `${user?.prenom?.charAt(0) || ''}${user?.nom?.charAt(0) || ''}`.toUpperCase();
  const displayPhoto = previewUrl || user?.photo;

  return (
    <ConducteurLayout>
      <style>{`
        @media (max-width: 768px) {
          .profile-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: darkMode ? '#FFFFFF' : '#111827', marginBottom: '24px' }}>
          {t('myProfile')} <Icon name="car" size={24} />
        </h1>

        {message && (
          <div style={{
            padding: '14px 18px', borderRadius: '10px', marginBottom: '24px',
            background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            color: message.type === 'success' ? '#15803d' : '#dc2626',
            fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            {message.type === 'success' ? <Icon name="check" size={16} color="#15803d" /> : <Icon name="alert" size={16} color="#dc2626" />} {message.text}
          </div>
        )}

        <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
          <div style={{ background: darkMode ? '#1A1A1A' : '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: darkMode ? '#FFFFFF' : '#111827', marginBottom: '20px' }}>{t('profilePhoto')}</h3>
            
            <div style={{
              width: '140px', height: '140px', borderRadius: '50%', margin: '0 auto 20px',
              border: '4px solid #fff', boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              background: `linear-gradient(135deg, ${E}, ${ED})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '48px', fontWeight: '700', color: '#fff',
              position: 'relative'
            }}>
              {displayPhoto ? (
                <img 
                  src={displayPhoto} 
                  alt="Aperçu photo" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 10 }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              ) : null}
              <span style={{ position: 'relative', zIndex: 1 }}>{initials}</span>
            </div>

            <label style={{
              display: 'block', padding: '10px 16px', background: darkMode ? '#2D2D2D' : '#f9fafb',
              border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px',
              fontWeight: '600', color: darkMode ? '#FFFFFF' : '#374151', cursor: 'pointer', marginBottom: '12px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = darkMode ? '#2D2D2D' : '#f3f4f6'}
            onMouseLeave={e => e.currentTarget.style.background = darkMode ? '#2D2D2D' : '#f9fafb'}
            >
              <Icon name="camera" size={14} /> {t('chooseImage')}
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>

            {selectedFile && (
              <button
                onClick={handleUploadPhoto}
                disabled={uploading}
                style={{
                  width: '100%', padding: '10px', borderRadius: '8px', border: 'none',
                  background: uploading ? '#d1d5db' : `linear-gradient(135deg, ${E}, ${ED})`,
                  color: '#fff', fontSize: '14px', fontWeight: '700', cursor: uploading ? 'not-allowed' : 'pointer',
                  boxShadow: `0 4px 10px rgba(13,158,126,0.3)`
                }}
              >
                {uploading ? t('uploading') : <><Icon name="save" size={14} color="white" /> {t('savePhoto')}</>}
              </button>
            )}
          </div>

          <div style={{ background: darkMode ? '#1A1A1A' : '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: darkMode ? '#FFFFFF' : '#111827', marginBottom: '24px' }}>{t('personalInfo')}</h3>
            <form onSubmit={handleSaveProfile}>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: darkMode ? '#9CA3AF' : '#374151', marginBottom: '6px' }}>{t('firstName')}</label>
                  <input type="text" value={user?.prenom || ''} onChange={e => setUser({ ...user, prenom: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: darkMode ? '#2D2D2D' : '#fff', color: darkMode ? '#FFFFFF' : '#111827' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: darkMode ? '#9CA3AF' : '#374151', marginBottom: '6px' }}>{t('lastName')}</label>
                  <input type="text" value={user?.nom || ''} onChange={e => setUser({ ...user, nom: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: darkMode ? '#2D2D2D' : '#fff', color: darkMode ? '#FFFFFF' : '#111827' }} required />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: darkMode ? '#9CA3AF' : '#374151', marginBottom: '6px' }}>{t('email')}</label>
                <input type="email" value={user?.email || ''} disabled style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', background: darkMode ? '#2D2D2D' : '#f9fafb', fontSize: '14px', color: darkMode ? '#6B7280' : '#6b7280', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: darkMode ? '#9CA3AF' : '#374151', marginBottom: '6px' }}>{t('phone')}</label>
                <input type="tel" value={user?.telephone || ''} onChange={e => setUser({ ...user, telephone: e.target.value })} placeholder={t('phonePlaceholder')} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: darkMode ? '#2D2D2D' : '#fff', color: darkMode ? '#FFFFFF' : '#111827' }} />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: darkMode ? '#9CA3AF' : '#374151', marginBottom: '6px' }}>{t('biography')}</label>
                <textarea value={user?.biographie || ''} onChange={e => setUser({ ...user, biographie: e.target.value })} placeholder={t('bioPlaceholder')} rows={4} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', background: darkMode ? '#2D2D2D' : '#fff', color: darkMode ? '#FFFFFF' : '#111827' }} />
              </div>

              <button type="submit" disabled={saving} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: saving ? '#d1d5db' : `linear-gradient(135deg, ${E}, ${ED})`, color: '#fff', fontSize: '15px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : `0 4px 15px rgba(13,158,126,0.4)` }}>
                {saving ? t('saving') : <><Icon name="save" size={14} color="white" /> {t('saveChanges')}</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </ConducteurLayout>
  );
}