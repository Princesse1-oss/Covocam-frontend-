'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PassagerLayout from '../../../../components/passager/PassagerLayout';
import Link from 'next/link';

const BACKEND_URL = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000` : '';

interface Conducteur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  typeUtilisateur: string;
  photo: string | null;
  biographie: string | null;
  noteMoyenne: number | null;
  dateCreation: string;
}

// Palette de couleurs CovoCam
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
    info: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    ),
    arrowLeft: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
    ),
    check: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
    ),
    file: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    mail: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    phone: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
    calendar: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    message: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  };
  return <span style={{ lineHeight: 0, display: 'inline-flex' }}>{icons[name] || null}</span>;
};

export default function ConducteurProfile() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [conducteur, setConducteur] = useState<Conducteur | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    if (!id) return;

    fetch(`/api/utilisateurs/${id}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      },
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Erreur de chargement du profil');
        return data;
      })
      .then(data => { 
        setConducteur(data); 
        setLoading(false); 
      })
      .catch(err => {
        console.error("Erreur profil conducteur:", err);
        setError(err.message);
        setLoading(false);
      });

    return () => window.removeEventListener('resize', checkMobile);
  }, [id, router]);

  const stars = (note: number | null) => {
    if (!note) return '☆☆☆☆☆';
    return '★'.repeat(Math.round(note)) + '☆'.repeat(5 - Math.round(note));
  };

  if (loading) {
    return (
      <PassagerLayout>
        <div style={{ textAlign: 'center', padding: isMobile ? '60px 20px' : '80px', color: GRAY }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `3px solid ${EMERALD_LIGHT}`, borderTopColor: EMERALD, animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p>Chargement du profil du conducteur...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
        </div>
      </PassagerLayout>
    );
  }

  if (error || !conducteur) {
    return (
      <PassagerLayout>
        <div style={{ textAlign: 'center', padding: isMobile ? '60px 20px' : '80px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: LIGHT_GRAY, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Icon name="info" size={32} color={GRAY} />
          </div>
          <h3 style={{ color: BLACK, marginBottom: '8px' }}>Profil introuvable</h3>
          <p style={{ color: GRAY, marginBottom: '16px' }}>{error || "Ce conducteur n'existe pas ou n'est plus actif."}</p>
          <Link href="/passager/dashboard" style={{ color: EMERALD, textDecoration: 'none', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Icon name="arrowLeft" size={16} />
            Retour aux trajets
          </Link>
        </div>
      </PassagerLayout>
    );
  }

  return (
    <PassagerLayout>
      <div style={{ padding: isMobile ? '20px 16px' : '32px 24px', maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Link href="/passager/dashboard" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            color: EMERALD, textDecoration: 'none', fontSize: '14px',
            fontWeight: '600', transition: 'opacity .2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <Icon name="arrowLeft" size={16} />
            Retour aux trajets
          </Link>
        </div>

        <div style={{ background: '#fff', borderRadius: '20px', border: `1px solid ${BORDER}`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          
          {/* Header du profil */}
          <div style={{
            background: `linear-gradient(135deg, ${BLACK}, #1a2e1a)`,
            padding: isMobile ? '32px 20px' : '48px 32px',
            textAlign: 'center',
            borderBottom: `1px solid rgba(13,158,126,0.2)`,
          }}>
            <div style={{ position: 'relative', width: isMobile ? '80px' : '100px', height: isMobile ? '80px' : '100px', margin: '0 auto 16px' }}>
              {conducteur.photo && (
                <img
                  src={conducteur.photo.startsWith('http') ? conducteur.photo : `${BACKEND_URL}/uploads/profils/${conducteur.photo}`}
                  alt={`Photo de ${conducteur.prenom}`}
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                  style={{
                    width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover',
                    boxShadow: '0 4px 20px rgba(13,158,126,0.3)',
                    border: '3px solid rgba(255,255,255,0.1)',
                    position: 'absolute', top: 0, left: 0, zIndex: 10,
                  }}
                />
              )}
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%', position: 'relative', zIndex: 1,
                background: `linear-gradient(135deg, ${EMERALD}, ${EMERALD_DARK})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: isMobile ? '28px' : '36px',
                fontWeight: '700',
                color: 'white',
                boxShadow: '0 4px 20px rgba(13,158,126,0.3)',
                border: '3px solid rgba(255,255,255,0.1)',
              }}>
                {conducteur.prenom?.charAt(0)}{conducteur.nom?.charAt(0)}
              </div>
            </div>
            
            <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '800', color: 'white', margin: '0 0 8px' }}>
              {conducteur.prenom} {conducteur.nom}
            </h1>
            
            <div style={{ fontSize: '16px', color: '#F59E0B', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {stars(conducteur.noteMoyenne)}
              <span style={{ color: '#d1d5db', fontSize: '14px' }}>
                {conducteur.noteMoyenne ? `${conducteur.noteMoyenne.toFixed(1)}/5` : 'Nouveau conducteur'}
              </span>
            </div>

            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(13,158,126,0.2)',
              color: '#4ade80',
              fontSize: '12px', fontWeight: '700',
              padding: '6px 14px', borderRadius: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              <Icon name="check" size={14} />
              {conducteur.typeUtilisateur === 'conducteur' ? 'Conducteur Vérifié' : conducteur.typeUtilisateur}
            </span>
          </div>

          {/* Détails du profil */}
          <div style={{ padding: isMobile ? '24px 20px' : '32px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: BLACK, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="file" size={20} />
              Informations de contact
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              <div style={{ padding: '16px', background: LIGHT_GRAY, borderRadius: '12px', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: EMERALD_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="mail" size={20} color={EMERALD_DARK} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: GRAY, marginBottom: '2px' }}>Email</div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: BLACK }}>{conducteur.email}</div>
                </div>
              </div>
              
              <div style={{ padding: '16px', background: LIGHT_GRAY, borderRadius: '12px', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: EMERALD_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="phone" size={20} color={EMERALD_DARK} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: GRAY, marginBottom: '2px' }}>Téléphone</div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: BLACK }}>
                    {conducteur.telephone || 'Non renseigné'}
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px', background: LIGHT_GRAY, borderRadius: '12px', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: EMERALD_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="calendar" size={20} color={EMERALD_DARK} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: GRAY, marginBottom: '2px' }}>Membre depuis</div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: BLACK }}>
                    {new Date(conducteur.dateCreation).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}
                  </div>
                </div>
              </div>
            </div>

            {conducteur.biographie && (
              <>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: BLACK, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon name="message" size={20} />
                  À propos
                </h2>
                <div style={{ 
                  padding: '20px', background: EMERALD_LIGHT, borderRadius: '12px', 
                  border: `1px solid #bbf7d0`, color: '#374151', lineHeight: '1.6', fontSize: '14px'
                }}>
                  {conducteur.biographie}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PassagerLayout>
  );
}