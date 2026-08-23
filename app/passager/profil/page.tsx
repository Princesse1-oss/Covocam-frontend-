'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/lib/ThemeContext';

const API_URL = '/api';

// Couleurs
const EMERALD = '#0D9E7E';
const EMERALD_LIGHT = '#E8F7F3';
const EMERALD_DARK = '#0A7B62';
const BLACK = '#0D0D0D';
const GRAY = '#6B7280';
const LIGHT_GRAY = '#F5F5F5';
const BORDER = '#EBEBEB';

// ─── SVG Icons inline ───
const Icon = ({ name, size = 20, color = EMERALD }: { name: string; size?: number; color?: string }) => {
  const s = { width: size, height: size, display: 'inline-block', verticalAlign: 'middle' } as React.CSSProperties;
  const icons: Record<string, React.ReactNode> = {
    image: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
      </svg>
    ),
    edit: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
    save: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
      </svg>
    ),
  };
  return <span style={{ lineHeight: 0, display: 'inline-flex' }}>{icons[name] || null}</span>;
};

// ✅ FONCTION INFAILLIBLE POUR LES URLS D'IMAGES
const getFullPhotoUrl = (photoPath: string | null | undefined) => {
  if (!photoPath || photoPath === 'null' || photoPath === 'undefined') return null;
  const cleanPath = photoPath.trim();
  
  if (cleanPath.startsWith('http')) return cleanPath;
  if (cleanPath.startsWith('/uploads/')) return `${cleanPath}`;
  return `/uploads/profils/${cleanPath}`;
};

export default function PassagerProfil() {
  const router = useRouter();
  // ✅ CORRECTION : On récupère 'darkMode' au lieu de 'theme'
  const { darkMode } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ nom: '', prenom: '', telephone: '', biographie: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const token = localStorage.getItem('token');
    if (!token) { 
      router.push('/login'); 
      return; 
    }

    const userData = localStorage.getItem('user');
    
    if (userData && userData !== 'undefined' && userData !== 'null') {
      try {
        const parsed = JSON.parse(userData);
        const barePhoto = parsed.photo?.startsWith('/uploads/') ? parsed.photo.replace('/uploads/profils/', '') : parsed.photo;
        
        const userWithBarePhoto = { ...parsed, photo: barePhoto || null };
        setUser(userWithBarePhoto);
        
        setFormData({
          nom: parsed.nom || '', prenom: parsed.prenom || '',
          telephone: parsed.telephone || '', biographie: parsed.biographie || '',
        });
        
        if (barePhoto) setPreviewUrl(getFullPhotoUrl(barePhoto));
        setLoading(false);
        return; 
      } catch (error) {
        console.error("❌ Erreur de parsing, nettoyage du localStorage");
        localStorage.removeItem('user');
      }
    }

    fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Non autorisé');
        const data = await res.json();
        
        const userWithBarePhoto = { ...data, photo: data.photo || null };

        setUser(userWithBarePhoto);
        setFormData({
          nom: data.nom || '', prenom: data.prenom || '',
          telephone: data.telephone || '', biographie: data.biographie || '',
        });
        
        if (data.photo) setPreviewUrl(getFullPhotoUrl(data.photo));
        localStorage.setItem('user', JSON.stringify(userWithBarePhoto));
      })
      .catch((err) => {
        console.error(" Impossible de charger le profil:", err);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        router.push('/login');
      })
      .finally(() => setLoading(false));

    return () => window.removeEventListener('resize', checkMobile);
  }, [router]); 
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage('Le fichier est trop volumineux (max 5 Mo).');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setMessage('');
    }
  };

  const handleUploadPhoto = async () => {
    if (!selectedFile || !user) return;
    setUploading(true);
    setMessage('');
    const token = localStorage.getItem('token');
    const formDataUpload = new FormData();
    formDataUpload.append('photo', selectedFile);

    try {
      const res = await fetch(`${API_URL}/upload/profil`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload,
      });

      const responseText = await res.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        const jsonStart = responseText.indexOf('{');
        const jsonEnd = responseText.lastIndexOf('}') + 1;
        if (jsonStart !== -1 && jsonEnd !== 0) {
          data = JSON.parse(responseText.substring(jsonStart, jsonEnd));
        } else {
          throw new Error("Le serveur n'a pas renvoyé de JSON valide.");
        }
      }

      if (res.ok && data.filename) {
        const bareFilename = data.filename.trim();
        
        const updatedUser = { ...user, photo: bareFilename };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setMessage('Photo de profil mise à jour avec succès !');
        setSelectedFile(null);
        setPreviewUrl(getFullPhotoUrl(bareFilename));
        window.dispatchEvent(new Event('user-updated'));
      } else {
        setMessage((data.error || data.message || 'Erreur lors de l\'upload.'));
      }

    } catch (err: any) {
      console.error("💥 Erreur lors de l'upload :", err);
      setMessage('Erreur: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/utilisateurs/profil`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      
      const responseText = await res.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        const jsonStart = responseText.indexOf('{');
        const jsonEnd = responseText.lastIndexOf('}') + 1;
        if (jsonStart !== -1 && jsonEnd !== 0) {
          data = JSON.parse(responseText.substring(jsonStart, jsonEnd));
        } else {
          throw new Error("Réponse serveur invalide");
        }
      }

      if (res.ok) {
        const updatedUser = { ...user, ...formData, photo: user.photo };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setMessage('Profil mis a jour avec succes');
        setEditing(false);
        window.dispatchEvent(new Event('user-updated'));
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(' ' + (data.message || 'Erreur lors de la mise à jour'));
      }
    } catch (err: any) {
      console.error("Erreur save profil:", err);
      setMessage('Erreur de connexion: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        padding: isMobile ? '40px 20px' : '60px 40px', 
        textAlign: 'center', 
        color: GRAY 
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          border: `3px solid ${EMERALD_LIGHT}`, borderTopColor: EMERALD,
          animation: 'spin 0.8s linear infinite', margin: '0 auto 12px'
        }}/>
        <p>Chargement du profil...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
      </div>
    );
  }

  const initials = `${user?.prenom?.charAt(0) || ''}${user?.nom?.charAt(0) || ''}`;
  const displayPhoto = previewUrl || user?.photo;

  return (
    <div style={{ padding: isMobile ? '20px 16px' : '32px 24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: isMobile ? '20px' : '32px' }}>
        <h1 style={{ 
          fontSize: isMobile ? '22px' : '28px', 
          fontWeight: '800', 
          // ✅ CORRECTION : Utilisation de darkMode
          color: darkMode ? '#FFFFFF' : BLACK, 
          margin: '0 0 8px' 
        }}>
          <Icon name="edit" size={28} />
          Mon profil
        </h1>
        <p style={{ color: GRAY, fontSize: isMobile ? '13px' : '14px', margin: 0 }}>
          Gérez vos informations personnelles
        </p>
      </div>

      {/* Message */}
      {message && (
        <div style={{ 
          padding: isMobile ? '12px' : '14px 16px', 
          borderRadius: '12px', 
          marginBottom: isMobile ? '16px' : '24px', 
                            background: message.includes('succes') ? '#dcfce7' : '#fee2e2', 
          border: `1px solid ${message.includes('succes') ? '#86efac' : '#fca5a5'}` 
        }}>
          <p style={{ 
                                  color: message.includes('succes') ? '#15803d' : '#dc2626', 
            fontSize: isMobile ? '13px' : '14px', 
            margin: 0 
          }}>
            {message}
          </p>
        </div>
      )}

      {/* Card */}
      <div style={{ 
        // ✅ CORRECTION : Utilisation de darkMode
        background: darkMode ? '#1D1D1D' : '#FFFFFF', 
        borderRadius: '20px', 
        border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : BORDER}`, 
        padding: isMobile ? '24px 20px' : '36px 32px',
        boxShadow: darkMode ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.04)' 
      }}>
        
        {/* Avatar Section */}
        <div style={{ 
          display: 'flex', 
          alignItems: isMobile ? 'flex-start' : 'center', 
          gap: isMobile ? '16px' : '24px', 
          marginBottom: isMobile ? '24px' : '32px', 
          paddingBottom: isMobile ? '20px' : '28px', 
          borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : BORDER}`,
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          <div style={{ 
            width: isMobile ? '80px' : '96px', 
            height: isMobile ? '80px' : '96px', 
            borderRadius: '50%', 
            background: `linear-gradient(135deg, ${EMERALD}, ${EMERALD_DARK})`,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: isMobile ? '32px' : '40px', 
            fontWeight: '700', 
            color: '#FFFFFF', 
            flexShrink: 0, 
            boxShadow: `0 6px 20px rgba(13,158,126,0.3)`,
            position: 'relative',
            overflow: 'hidden'
          }}>
            {displayPhoto ? (
              <img 
                src={displayPhoto} 
                alt="Photo de profil" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover', 
                  borderRadius: '50%',
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  zIndex: 10 
                }}
                onError={(e) => { 
                  (e.currentTarget as HTMLImageElement).style.display = 'none'; 
                }}
              />
            ) : null}
            
            <span style={{ position: 'relative', zIndex: 1 }}>
              {initials.toUpperCase()}
            </span>
          </div>
          
          <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
            <div style={{ 
              fontSize: isMobile ? '18px' : '22px', 
              fontWeight: '700', 
              color: BLACK,
              marginBottom: '4px'
            }}>
              {user?.prenom} {user?.nom}
            </div>
            <div style={{ 
              color: GRAY, 
              fontSize: isMobile ? '13px' : '14px',
              marginBottom: '12px'
            }}>
              {user?.email}
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              justifyContent: isMobile ? 'center' : 'flex-start',
              flexWrap: 'wrap'
            }}>
              <label style={{ 
                display: 'inline-flex', 
                alignItems: 'center',
                gap: '6px',
                padding: isMobile ? '8px 14px' : '10px 18px', 
                background: EMERALD_LIGHT, 
                border: `1px solid #bbf7d0`, 
                borderRadius: '10px', 
                fontSize: isMobile ? '12px' : '13px', 
                fontWeight: '600', 
                color: EMERALD_DARK, 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#d1fae5';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = EMERALD_LIGHT;
              }}
              >
                <Icon name="image" size={16} />
                Changer la photo
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>
              
              {selectedFile && (
                <button 
                  onClick={handleUploadPhoto} 
                  disabled={uploading} 
                  style={{ 
                    padding: isMobile ? '8px 14px' : '10px 18px', 
                    background: uploading ? GRAY : EMERALD, 
                    color: '#FFFFFF', 
                    border: 'none', 
                    borderRadius: '10px', 
                    fontSize: isMobile ? '12px' : '13px', 
                    fontWeight: '600', 
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    if (!uploading) {
                      e.currentTarget.style.background = EMERALD_DARK;
                    }
                  }}
                  onMouseLeave={e => {
                    if (!uploading) {
                      e.currentTarget.style.background = EMERALD;
                    }
                  }}
                >
                  {uploading ? '...' : 'Sauvegarder'}
                </button>
              )}
            </div>
          </div>
        </div>

        {!editing ? (
          /* View Mode */
          <div>
            <div style={{ display: 'grid', gap: isMobile ? '20px' : '24px' }}>
              <div>
                <div style={{ 
                  fontSize: '12px', 
                  color: GRAY, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px',
                  marginBottom: '6px',
                  fontWeight: '600'
                }}>
                  Nom complet
                </div>
                <p style={{ 
                  fontSize: isMobile ? '15px' : '16px', 
                  fontWeight: '500', 
                  color: BLACK,
                  padding: isMobile ? '12px' : '14px 16px',
                  background: LIGHT_GRAY,
                  borderRadius: '10px',
                  margin: 0
                }}>
                  {user?.prenom} {user?.nom}
                </p>
              </div>
              
              <div>
                <div style={{ 
                  fontSize: '12px', 
                  color: GRAY, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px',
                  marginBottom: '6px',
                  fontWeight: '600'
                }}>
                  Téléphone
                </div>
                <p style={{ 
                  fontSize: isMobile ? '15px' : '16px', 
                  fontWeight: '500', 
                  color: BLACK,
                  padding: isMobile ? '12px' : '14px 16px',
                  background: LIGHT_GRAY,
                  borderRadius: '10px',
                  margin: 0
                }}>
                  {user?.telephone || 'Non renseigné'}
                </p>
              </div>
              
              <div>
                <div style={{ 
                  fontSize: '12px', 
                  color: GRAY, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px',
                  marginBottom: '6px',
                  fontWeight: '600'
                }}>
                  Biographie
                </div>
                <p style={{ 
                  fontSize: isMobile ? '15px' : '16px', 
                  fontWeight: '500', 
                  color: BLACK,
                  padding: isMobile ? '12px' : '14px 16px',
                  background: LIGHT_GRAY,
                  borderRadius: '10px',
                  margin: 0,
                  minHeight: '60px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {user?.biographie || 'Aucune biographie'}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setEditing(true)} 
              style={{ 
                marginTop: isMobile ? '24px' : '32px', 
                padding: isMobile ? '12px 24px' : '14px 32px', 
                background: `linear-gradient(135deg, ${EMERALD}, ${EMERALD_DARK})`, 
                color: '#FFFFFF', 
                border: 'none', 
                borderRadius: '12px', 
                fontSize: isMobile ? '14px' : '15px', 
                fontWeight: '700', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center',
                width: '100%',
                transition: 'all 0.2s',
                boxShadow: `0 4px 15px rgba(13,158,126,0.3)`
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 6px 20px rgba(13,158,126,0.4)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 4px 15px rgba(13,158,126,0.3)`;
              }}
            >
              <Icon name="edit" size={18} />
              Modifier le profil
            </button>
          </div>
        ) : (
          /* Edit Mode */
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: isMobile ? '16px' : '20px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  color: BLACK, 
                  marginBottom: '8px' 
                }}>
                  Prénom
                </label>
                <input 
                  type="text" 
                  name="prenom" 
                  value={formData.prenom} 
                  onChange={handleChange} 
                  style={{ 
                    width: '100%', 
                    padding: isMobile ? '12px' : '14px 16px', 
                    border: `1px solid ${BORDER}`, 
                    borderRadius: '12px', 
                    fontSize: '14px', 
                    outline: 'none', 
                    boxSizing: 'border-box',
                    transition: 'all 0.2s',
                    background: '#FFFFFF'
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = EMERALD;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${EMERALD_LIGHT}`;
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = BORDER;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  required 
                />
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  color: BLACK, 
                  marginBottom: '8px' 
                }}>
                  Nom
                </label>
                <input 
                  type="text" 
                  name="nom" 
                  value={formData.nom} 
                  onChange={handleChange} 
                  style={{ 
                    width: '100%', 
                    padding: isMobile ? '12px' : '14px 16px', 
                    border: `1px solid ${BORDER}`, 
                    borderRadius: '12px', 
                    fontSize: '14px', 
                    outline: 'none', 
                    boxSizing: 'border-box',
                    transition: 'all 0.2s',
                    background: '#FFFFFF'
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = EMERALD;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${EMERALD_LIGHT}`;
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = BORDER;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  required 
                />
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  color: BLACK, 
                  marginBottom: '8px' 
                }}>
                  Téléphone
                </label>
                <input 
                  type="text" 
                  name="telephone" 
                  value={formData.telephone} 
                  onChange={handleChange} 
                  style={{ 
                    width: '100%', 
                    padding: isMobile ? '12px' : '14px 16px', 
                    border: `1px solid ${BORDER}`, 
                    borderRadius: '12px', 
                    fontSize: '14px', 
                    outline: 'none', 
                    boxSizing: 'border-box',
                    transition: 'all 0.2s',
                    background: '#FFFFFF'
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = EMERALD;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${EMERALD_LIGHT}`;
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = BORDER;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  color: BLACK, 
                  marginBottom: '8px' 
                }}>
                  Biographie
                </label>
                <textarea 
                  name="biographie" 
                  value={formData.biographie} 
                  onChange={handleChange} 
                  style={{ 
                    width: '100%', 
                    padding: isMobile ? '12px' : '14px 16px', 
                    border: `1px solid ${BORDER}`, 
                    borderRadius: '12px', 
                    fontSize: '14px', 
                    outline: 'none', 
                    minHeight: isMobile ? '100px' : '120px', 
                    resize: 'vertical', 
                    boxSizing: 'border-box', 
                    fontFamily: 'inherit',
                    transition: 'all 0.2s',
                    background: '#FFFFFF'
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = EMERALD;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${EMERALD_LIGHT}`;
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = BORDER;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: isMobile ? '10px' : '12px', 
              marginTop: isMobile ? '24px' : '32px',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <button 
                type="submit" 
                disabled={saving} 
                style={{ 
                  flex: 1,
                  padding: isMobile ? '12px 24px' : '14px 32px', 
                  background: saving ? GRAY : `linear-gradient(135deg, ${EMERALD}, ${EMERALD_DARK})`, 
                  color: '#FFFFFF', 
                  border: 'none', 
                  borderRadius: '12px', 
                  fontSize: isMobile ? '14px' : '15px', 
                  fontWeight: '700', 
                  cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  boxShadow: saving ? 'none' : `0 4px 15px rgba(13,158,126,0.3)`
                }}
                onMouseEnter={e => {
                  if (!saving) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 6px 20px rgba(13,158,126,0.4)`;
                  }
                }}
                onMouseLeave={e => {
                  if (!saving) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 4px 15px rgba(13,158,126,0.3)`;
                  }
                }}
              >
                <Icon name="save" size={18} />
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              
              <button 
                type="button" 
                onClick={() => { setEditing(false); setMessage(''); }} 
                style={{ 
                  padding: isMobile ? '12px 24px' : '14px 32px', 
                  background: 'transparent', 
                  color: GRAY, 
                  border: `1px solid ${BORDER}`, 
                  borderRadius: '12px', 
                  fontSize: isMobile ? '14px' : '15px', 
                  fontWeight: '600', 
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  flex: isMobile ? 1 : 'auto'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = LIGHT_GRAY;
                  e.currentTarget.style.borderColor = GRAY;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = BORDER;
                }}
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}